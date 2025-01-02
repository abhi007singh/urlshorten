"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const path_1 = __importDefault(require("path"));
const winston_1 = require("winston");
const env = process.env.NODE_ENV;
exports.logger = (0, winston_1.createLogger)({
    format: winston_1.format.combine(winston_1.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.format.printf(({ level, message, timestamp, }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)),
    level: "info",
    transports: [
        new winston_1.transports.File({
            filename: path_1.default.join(__dirname, "logs", "errors.log"),
            level: "error",
        }),
        new winston_1.transports.File({
            filename: path_1.default.join(__dirname, "logs", "operations.log"),
        }),
        new winston_1.transports.File({
            filename: path_1.default.join(__dirname, "logs", "process.log"),
        }),
    ],
});
if (env === "development") {
    exports.logger.add(new winston_1.transports.Console({
        format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.printf(({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)),
    }));
}
//# sourceMappingURL=logger.js.map