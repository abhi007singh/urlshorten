import { Router } from "express";
import { UAParser } from "ua-parser-js";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { logger } from "../logger";
import { verifyToken } from "../middlewares/authMiddleware";
import Url from "../models/Url";
import UserUrl from "../models/UserUrl";
import refTable from "../refTable";
import { IGetUserAuthInfoRequest } from "../types/expressTypes";

const router = Router();

router.post("/", verifyToken, async (req: IGetUserAuthInfoRequest, res) => {
  try {
    let url;
    logger.info("/shorten POST");
    const user = req.user;
    const { success, data, error } = urlValidator.safeParse(req.body);

    if (!success) {
      logger.error(`Validation Error: ${error.message}`);
      res.status(403).json({
        description: JSON.parse(error.message),
        message: "Validation Error",
      });
      return;
    }

    url = await Url.findOneAndUpdate(
      { longUrl: data.longUrl },
      {
        alias: data.alias || uuidGen(),
        topic: data.topic,
        userId: user.id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await UserUrl.findOneAndUpdate(
      { userId: user.id },
      {
        $addToSet: { userUrls: url },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      createdAt: url.createdAt,
      shortUrl: `http://localhost:3000/api/shorten/${url.alias}`,
    });
  } catch (error) {
    logger.error(`Internal Server Error: ${error.message}`);
    res.status(500).json({
      description: error.message,
      message: "Server Error",
    });
  }
});

router.get("/:alias", async (req, res) => {
  try {
    const alias = req.params.alias;
    logger.info("/shorten/:alias GET");
    const ua = new UAParser(req.headers["user-agent"]);
    const os = ua.getOS().name || "Unknown OS";
    const device = ua.getDevice().type || "Unknown Device";

    const cookieName = `shorturl_${alias}`;
    let isUnique = false;

    if (!req.cookies[cookieName]) {
      isUnique = true;
      res.cookie(cookieName, uuidv4(), {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      }); // 30 days
    }

    const urlData = await Url.findOneAndUpdate(
      { alias },
      {
        $inc: { clicks: 1, ...(isUnique ? { uniqueClicks: 1 } : {}) },
      }
    );

    if (!urlData) {
      res.status(404).json({
        message: "Alias not found"
      });
      return;
    }

    const today = {
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    };

    const updatedClickByDates = [...urlData.clickByDates];
    const todayIndex = updatedClickByDates.findIndex(
      (entry) =>
        entry.date.year === today.year &&
        entry.date.month === today.month &&
        entry.date.day === today.day
    );

    if (todayIndex !== -1) {
      updatedClickByDates[todayIndex].clicks += 1;
    } else {
      updatedClickByDates.push({ clicks: 1, date: today });

      if (updatedClickByDates.length > 7) {
        updatedClickByDates.shift();
      }
    }

    urlData.clickByDates = updatedClickByDates;
    urlData.osType = updateClicks(urlData.osType, os, isUnique);
    urlData.deviceType = updateClicks(urlData.deviceType, device, isUnique);

    await urlData.save();

    res.json({ url: urlData.longUrl });
  } catch (error) {
    logger.error(`Internal Server Error: ${error.message}`);
    res.status(500).json({
      description: error.message,
      message: "Server Error",
    });
  }
});

export default router;

// Helper functions
const urlValidator = z.object({
  alias: z.string().regex(/^$|^[a-zA-Z0-9]+$/, {
    message:
      "Custom alias must contain only alphanumeric characters, hyphens, or underscores",
  }),
  longUrl: z.string().url({ message: "Invalid URL format" }),
  topic: z
    .string()
    .refine((val) => ["acquisition", "activation", "retention"].includes(val), {
      message:
        "Invalid topic. Must be one of: acquisition, activation, retention",
    }),
});

function uuidGen() {
  // Step-1: Generate a unique ID for the new URL entry
  const uuid = uuidv4();
  let numericID = 1;
  for (const ch of uuid) {
    const val = ch.charCodeAt(0);
    if (val >= 48 && val <= 57) {
      numericID += val - 48;
    } else if (val >= 65 && val <= 90) {
      numericID += val - 65 + 11;
    } else if (val >= 97 && val <= 122) {
      numericID += val - 97 + 73;
    }
  }
  const salt = Math.ceil(Math.random() * 100) * 23 * 7;
  numericID = numericID * salt;

  // Step - 2: Base 62 conversion
  let genHashVal = "";
  let dummyId = numericID;

  while (dummyId > 0) {
    const rem = dummyId % 62;
    genHashVal += refTable[rem];
    dummyId = Math.floor(dummyId / 62);
  }
  // we have generated the short hashValue
  return genHashVal;
}

function updateClicks(statArray: any[], name: string, isUnique: boolean) {
  const index = statArray.findIndex((entry) => entry.name === name);

  if (index !== -1) {
    statArray[index].clicks += 1;
    statArray[index].uniqueClicks += 1;
    if (isUnique) {
      statArray[index].uniqueUser += 1;
    }
  } else {
    statArray.push({
      name,
      uniqueClicks: 1,
      uniqueUser: 1,
    });
  }

  return statArray;
}
