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
exports.startCron = startCron;
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("../logger");
const Url_1 = __importDefault(require("../models/Url"));
function startCron() {
    return __awaiter(this, void 0, void 0, function* () {
        node_cron_1.default.schedule("0 0 * * *", () => __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info("Running cron job: Deleting old records");
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            try {
                const result = yield Url_1.default.deleteMany({
                    createdAt: { $lt: sevenDaysAgo },
                });
                logger_1.logger.info(`Deleted ${result.deletedCount} records.`);
            }
            catch (error) {
                logger_1.logger.error("Error deleting records:", error);
            }
        }));
    });
}
//# sourceMappingURL=node_cron.js.map