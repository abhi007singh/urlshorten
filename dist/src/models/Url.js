"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlSchema = void 0;
const mongoose_1 = require("mongoose");
exports.urlSchema = new mongoose_1.Schema({
    alias: {
        require: true,
        type: String,
        unique: true,
    },
    clickByDates: {
        default: [],
        type: [
            {
                clicks: Number,
                date: {
                    day: {
                        max: 31,
                        min: 1,
                        type: Number,
                    },
                    month: {
                        max: 12,
                        min: 1,
                        type: Number,
                    },
                    year: {
                        max: 2050,
                        min: 1970,
                        type: Number,
                    },
                },
            },
        ],
    },
    clicks: {
        default: 0,
        type: Number,
    },
    deviceType: {
        default: [],
        type: [
            {
                name: String,
                uniqueClicks: Number,
                uniqueUser: Number,
            },
        ],
    },
    longUrl: {
        require: true,
        type: String,
        unique: true,
    },
    osType: {
        default: [],
        type: [
            {
                name: String,
                uniqueClicks: Number,
                uniqueUser: Number,
            },
        ],
    },
    topic: {
        default: "acquisition",
        enum: ["acquisition", "activation", "retention"],
        type: String,
    },
    uniqueClicks: {
        default: 0,
        type: Number,
    },
    userId: {
        ref: "User",
        type: mongoose_1.Schema.Types.ObjectId,
    },
}, {
    timestamps: true,
});
const Url = (0, mongoose_1.model)("Url", exports.urlSchema);
exports.default = Url;
//# sourceMappingURL=Url.js.map