"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../logger");
function verifyToken(req, res, next) {
    logger_1.logger.info("Token Verification ...");
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        logger_1.logger.error("No token provided");
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-secret-key");
        req.user = decoded;
        next();
    }
    catch (error) {
        logger_1.logger.error(`Invalid token -> System message:${error.message}`);
        res.status(401).json({ error: "Invalid token" });
    }
}
//# sourceMappingURL=authMiddleware.js.map