"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ua_parser_js_1 = require("ua-parser-js");
const uuid_1 = require("uuid");
const zod_1 = require("zod");
const logger_1 = require("../logger");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Url_1 = __importDefault(require("../models/Url"));
const UserUrl_1 = __importDefault(require("../models/UserUrl"));
const refTable_1 = __importDefault(require("../refTable"));
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let url;
        logger_1.logger.info("/shorten POST");
        const user = req.user;
        const { success, data, error } = urlValidator.safeParse(req.body);
        if (!success) {
            logger_1.logger.error(`Validation Error: ${error.message}`);
            res.status(403).json({
                description: JSON.parse(error.message),
                message: "Validation Error",
            });
            return;
        }
        url = yield Url_1.default.findOneAndUpdate({ longUrl: data.longUrl }, {
            alias: data.alias || uuidGen(),
            topic: data.topic,
            userId: user.id,
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
        yield UserUrl_1.default.findOneAndUpdate({ userId: user.id }, {
            $addToSet: { userUrls: url },
        }, { upsert: true, new: true });
        res.status(201).json({
            createdAt: url.createdAt,
            shortUrl: `http://localhost:3000/api/shorten/${url.alias}`,
        });
    }
    catch (error) {
        logger_1.logger.error(`Internal Server Error: ${error.message}`);
        res.status(500).json({
            description: error.message,
            message: "Server Error",
        });
    }
}));
router.get("/:alias", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const alias = req.params.alias;
        logger_1.logger.info("/shorten/:alias GET");
        const ua = new ua_parser_js_1.UAParser(req.headers["user-agent"]);
        const os = ua.getOS().name || "Unknown OS";
        const device = ua.getDevice().type || "Unknown Device";
        const cookieName = `shorturl_${alias}`;
        let isUnique = false;
        if (!req.cookies[cookieName]) {
            isUnique = true;
            res.cookie(cookieName, (0, uuid_1.v4)(), {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
            }); // 30 days
        }
        const urlData = yield Url_1.default.findOneAndUpdate({ alias }, {
            $inc: Object.assign({ clicks: 1 }, (isUnique ? { uniqueClicks: 1 } : {})),
        });
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
        const todayIndex = updatedClickByDates.findIndex((entry) => entry.date.year === today.year &&
            entry.date.month === today.month &&
            entry.date.day === today.day);
        if (todayIndex !== -1) {
            updatedClickByDates[todayIndex].clicks += 1;
        }
        else {
            updatedClickByDates.push({ clicks: 1, date: today });
            if (updatedClickByDates.length > 7) {
                updatedClickByDates.shift();
            }
        }
        urlData.clickByDates = updatedClickByDates;
        urlData.osType = updateClicks(urlData.osType, os, isUnique);
        urlData.deviceType = updateClicks(urlData.deviceType, device, isUnique);
        yield urlData.save();
        res.json({ url: urlData.longUrl });
    }
    catch (error) {
        logger_1.logger.error(`Internal Server Error: ${error.message}`);
        res.status(500).json({
            description: error.message,
            message: "Server Error",
        });
    }
}));
exports.default = router;
// Helper functions
const urlValidator = zod_1.z.object({
    alias: zod_1.z.string().regex(/^$|^[a-zA-Z0-9]+$/, {
        message: "Custom alias must contain only alphanumeric characters, hyphens, or underscores",
    }),
    longUrl: zod_1.z.string().url({ message: "Invalid URL format" }),
    topic: zod_1.z
        .string()
        .refine((val) => ["acquisition", "activation", "retention"].includes(val), {
        message: "Invalid topic. Must be one of: acquisition, activation, retention",
    }),
});
function uuidGen() {
    // Step-1: Generate a unique ID for the new URL entry
    const uuid = (0, uuid_1.v4)();
    let numericID = 1;
    for (const ch of uuid) {
        const val = ch.charCodeAt(0);
        if (val >= 48 && val <= 57) {
            numericID += val - 48;
        }
        else if (val >= 65 && val <= 90) {
            numericID += val - 65 + 11;
        }
        else if (val >= 97 && val <= 122) {
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
        genHashVal += refTable_1.default[rem];
        dummyId = Math.floor(dummyId / 62);
    }
    // we have generated the short hashValue
    return genHashVal;
}
function updateClicks(statArray, name, isUnique) {
    const index = statArray.findIndex((entry) => entry.name === name);
    if (index !== -1) {
        statArray[index].clicks += 1;
        statArray[index].uniqueClicks += 1;
        if (isUnique) {
            statArray[index].uniqueUser += 1;
        }
    }
    else {
        statArray.push({
            name,
            uniqueClicks: 1,
            uniqueUser: 1,
        });
    }
    return statArray;
}
//# sourceMappingURL=url.js.map