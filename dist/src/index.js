"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./lib/db");
const node_cron_1 = require("./lib/node_cron");
const redis_1 = require("./lib/redis");
const logger_1 = require("./logger");
const port = process.env.SERVER_PORT || 3000;
(0, db_1.connectToDatabase)(process.env.NODE_ENV);
(0, redis_1.connectToRedis)();
(0, node_cron_1.startCron)();
const signInButton = "<!DOCTYPE html><html lang='en'><head>  <meta charset='UTF-8'>  <meta name='viewport' content='width=device-width, initial-scale=1.0'>  <title>Google Sign-In</title></head><body>  <button> <a style='padding: 10px 20px; background-color: #4285F4; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;' href='/api/auth/google'> Sign in with Google </a></button></body></html>";
app_1.app.get("/", (_, res) => {
    res.send(signInButton);
});
app_1.app.listen(port, () => {
    logger_1.logger.info("Server Started");
});
//# sourceMappingURL=index.js.map