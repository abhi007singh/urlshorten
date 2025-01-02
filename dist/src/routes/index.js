"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = __importDefault(require("express"));
const analytics_1 = __importDefault(require("./analytics"));
const auth_1 = __importDefault(require("./auth"));
const url_1 = __importDefault(require("./url"));
exports.routes = express_1.default.Router();
exports.routes.use("/api/shorten", url_1.default);
exports.routes.use("/api/auth", auth_1.default);
exports.routes.use("/api/analytics", analytics_1.default);
//# sourceMappingURL=index.js.map