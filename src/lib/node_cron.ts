import nodeCron from "node-cron";
import { logger } from "../logger";
import Url from "../models/Url";

export async function startCron() {
  nodeCron.schedule("0 0 * * *", async () => {
    logger.info("Running cron job: Deleting old records");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      const result = await Url.deleteMany({
        createdAt: { $lt: sevenDaysAgo },
      });
      logger.info(`Deleted ${result.deletedCount} records.`);
    } catch (error) {
      logger.error("Error deleting records:", error);
    }
  });
}
