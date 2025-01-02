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
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../logger");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Url_1 = __importDefault(require("../models/Url"));
const router = (0, express_1.Router)();
router.get("/topic/:topic", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.info("/analytics/topic/:topic GET");
    try {
        const result = yield Url_1.default.aggregate([
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
            logger_1.logger.error(`No record found`);
            res.status(404).json({
                description: "",
                message: "Data Not found",
            });
            return;
        }
        res.json(Object.assign({}, result[0]));
    }
    catch (error) {
        logger_1.logger.error(`Internal Server Error: ${error.message}`);
        res.status(500).json({
            description: error.message,
            message: "Server Error",
        });
    }
}));
router.get("/overall", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.info("/analytics/overall GET");
    try {
        const user = req.user;
        const result = yield Url_1.default.aggregate([
            // Step 1: Match URLs created by the user
            { $match: { userId: new mongoose_1.default.Types.ObjectId(user.id) } },
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
                        { $match: { userId: new mongoose_1.default.Types.ObjectId(user.id) } },
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
                        { $match: { userId: new mongoose_1.default.Types.ObjectId(user.id) } },
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
                        { $match: { userId: new mongoose_1.default.Types.ObjectId(user.id) } },
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
            logger_1.logger.error("Record not found");
            res.status(404).json({
                description: "",
                message: "Data Not found",
            });
            return;
        }
        res.json(Object.assign({}, result[0]));
    }
    catch (error) {
        logger_1.logger.error(`Internal Server Error: ${error.message}`);
        res.status(500).json({
            description: error.message,
            message: "Server Error",
        });
    }
}));
router.get("/:alias", authMiddleware_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.info("/analytics/:alias GET");
    try {
        const url = yield Url_1.default.findOne({ alias: req.params.alias }).select("-id");
        if (!url) {
            logger_1.logger.error("Record not found");
            res.status(404).json({
                description: "",
                message: "URL data not found",
            });
            return;
        }
        res.json({ aliasData: url });
    }
    catch (error) {
        logger_1.logger.error(`Internal Server Error: ${error.message}`);
        res.status(500).json({
            description: error.message,
            message: "Server Error",
            status: 500,
        });
    }
}));
exports.default = router;
//# sourceMappingURL=analytics.js.map