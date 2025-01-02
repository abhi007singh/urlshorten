import path from "path";
import { createLogger, format, transports } from "winston";

const env = process.env.NODE_ENV;

export const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(
      ({
        level,
        message,
        timestamp,
      }: {
        level: string;
        message: string;
        timestamp: Date;
      }) => `${timestamp} [${level.toUpperCase()}]: ${message}`
    )
  ),
  level: "info",
  transports: [
    new transports.File({
      filename: path.join(__dirname, "logs", "errors.log"),
      level: "error",
    }),

    new transports.File({
      filename: path.join(__dirname, "logs", "operations.log"),
    }),

    new transports.File({
      filename: path.join(__dirname, "logs", "process.log"),
    }),
  ],
});

if (env === "development") {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          ({ level, message, timestamp }) =>
            `${timestamp} [${level.toUpperCase()}]: ${message}`
        )
      ),
    })
  );
}
