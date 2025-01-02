import { Router } from "express";
import mongoose from "mongoose";
import { logger } from "../logger";
import { verifyToken } from "../middlewares/authMiddleware";
import Url from "../models/Url";
import { IGetUserAuthInfoRequest } from "../types/expressTypes";

const router = Router();

router.get("/topic/:topic", verifyToken, async (req, res) => {
  logger.info("/analytics/topic/:topic GET");
  try {
    const result = await Url.aggregate([
      // Step 1: Match URLs by the specified topic
      { $match: { topic: req.params.topic } },

      // Step 2: Unwind clickByDates array for processing clicks by date
      {
        $unwind: { path: "$clickByDates", preserveNullAndEmptyArrays: true },
      },

      // Step 3: Group data by date for clicksByDate calculation
      {
        $group: {
          _id: {
            day: "$clickByDates.date.day",
            month: "$clickByDates.date.month",
            year: "$clickByDates.date.year",
          },
          totalClicksByDate: { $sum: "$clickByDates.clicks" },
        },
      },

      // Step 4: Reformat the grouped data for clicksByDate
      {
        $group: {
          _id: null,
          clicksByDate: {
            $push: {
              clicks: "$totalClicksByDate",
              date: {
                day: "$_id.day",
                month: "$_id.month",
                year: "$_id.year",
              },
            },
          },
        },
      },

      // Step 5: Add totalClicks and uniqueClicks for the topic
      {
        $lookup: {
          as: "topicStats",
          from: "urls",
          pipeline: [
            { $match: { topic: req.params.topic } },
            {
              $group: {
                _id: null,
                totalClicks: { $sum: "$clicks" },
                uniqueClicks: { $sum: "$uniqueClicks" },
              },
            },
          ],
        },
      },

      // Step 6: Add URL-specific data (shortUrl, totalClicks, uniqueClicks)
      {
        $lookup: {
          as: "urls",
          from: "urls",
          pipeline: [
            { $match: { topic: req.params.topic } },
            {
              $project: {
                _id: 0,
                shortUrl: {
                  $concat: ["http://localhost:3000/api/v1/shorten/", "$alias"],
                },
                totalClicks: "$clicks",
                uniqueClicks: "$uniqueClicks",
              },
            },
          ],
        },
      },

      // Step 7: Combine topicStats, clicksByDate, and URL data into a single document
      {
        $project: {
          _id: 0,
          clicksByDate: "$clicksByDate",
          totalClicks: { $arrayElemAt: ["$topicStats.totalClicks", 0] },
          uniqueClicks: { $arrayElemAt: ["$topicStats.uniqueClicks", 0] },
          urls: 1,
        },
      },
    ]);

    if (result.length === 0) {
      logger.error(`No record found`);
      res.status(404).json({
        description: "",
        message: "Data Not found",
      });
      return;
    }
    res.json({
      ...result[0],
    });
  } catch (error) {
    logger.error(`Internal Server Error: ${error.message}`);
    res.status(500).json({
      description: error.message,
      message: "Server Error",
    });
  }
});

router.get(
  "/overall",
  verifyToken,
  async (req: IGetUserAuthInfoRequest, res) => {
    logger.info("/analytics/overall GET");
    try {
      const user = req.user as any;

      const result = await Url.aggregate([
        // Step 1: Match URLs created by the user
        { $match: { userId: new mongoose.Types.ObjectId(user.id) } },

        // Step 2: Calculate totalUrls
        {
          $group: {
            _id: null,
            totalClicks: { $sum: "$clicks" },
            totalUrls: { $sum: 1 },
            uniqueClicks: { $sum: "$uniqueClicks" },
          },
        },

        // Step 3: Get clicksByDate by grouping clickByDates array
        {
          $lookup: {
            as: "clicksByDate",
            from: "urls",
            pipeline: [
              { $match: { userId: new mongoose.Types.ObjectId(user.id) } },
              {
                $unwind: {
                  path: "$clickByDates",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $group: {
                  _id: {
                    day: "$clickByDates.date.day",
                    month: "$clickByDates.date.month",
                    year: "$clickByDates.date.year",
                  },
                  totalClicks: { $sum: "$clickByDates.clicks" },
                },
              },
              {
                $project: {
                  _id: 0,
                  clicks: "$totalClicks",
                  date: "$_id",
                },
              },
            ],
          },
        },

        // Step 4: Aggregate osType data
        {
          $lookup: {
            as: "osType",
            from: "urls",
            pipeline: [
              { $match: { userId: new mongoose.Types.ObjectId(user.id) } },
              {
                $unwind: { path: "$osType", preserveNullAndEmptyArrays: true },
              },
              {
                $group: {
                  _id: "$osType.name",
                  uniqueClicks: { $sum: "$osType.uniqueClicks" },
                  uniqueUsers: { $sum: "$osType.uniqueUser" },
                },
              },
              {
                $project: {
                  _id: 0,
                  osName: "$_id",
                  uniqueClicks: 1,
                  uniqueUsers: 1,
                },
              },
            ],
          },
        },

        // Step 5: Aggregate deviceType data
        {
          $lookup: {
            as: "deviceType",
            from: "urls",
            pipeline: [
              { $match: { userId: new mongoose.Types.ObjectId(user.id) } },
              {
                $unwind: {
                  path: "$deviceType",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $group: {
                  _id: "$deviceType.name",
                  uniqueClicks: { $sum: "$deviceType.uniqueClicks" },
                  uniqueUsers: { $sum: "$deviceType.uniqueUser" },
                },
              },
              {
                $project: {
                  _id: 0,
                  deviceName: "$_id",
                  uniqueClicks: 1,
                  uniqueUsers: 1,
                },
              },
            ],
          },
        },

        // Step 6: Combine all data into a single document
        {
          $project: {
            _id: 0,
            clicksByDate: 1,
            deviceType: 1,
            osType: 1,
            totalClicks: 1,
            totalUrls: 1,
            uniqueClicks: 1,
          },
        },
      ]);

      if (result.length === 0) {
        logger.error("Record not found");
        res.status(404).json({
          description: "",
          message: "Data Not found",
        });
        return;
      }

      res.json({ ...result[0] });
    } catch (error) {
      logger.error(`Internal Server Error: ${error.message}`);
      res.status(500).json({
        description: error.message,
        message: "Server Error",
      });
    }
  }
);

router.get("/:alias", verifyToken, async (req, res) => {
  logger.info("/analytics/:alias GET");
  try {
    const url = await Url.findOne({ alias: req.params.alias }).select("-id");
    if (!url) {
      logger.error("Record not found");
      res.status(404).json({
        description: "",
        message: "URL data not found",
      });
      return;
    }
    res.json({ aliasData: url });
  } catch (error) {
    logger.error(`Internal Server Error: ${error.message}`);
    res.status(500).json({
      description: error.message,
      message: "Server Error",
      status: 500,
    });
  }
});

export default router;
