import { app } from "./app";
import { connectToDatabase } from "./lib/db";
import { startCron } from "./lib/node_cron";
import { connectToRedis } from "./lib/redis";
import { logger } from "./logger";

const port = process.env.SERVER_PORT || 3000;

connectToDatabase(process.env.NODE_ENV);
// connectToRedis();
startCron();

const signInButton =
  "<!DOCTYPE html><html lang='en'><head>  <meta charset='UTF-8'>  <meta name='viewport' content='width=device-width, initial-scale=1.0'>  <title>Google Sign-In</title></head><body>  <button> <a style='padding: 10px 20px; background-color: #4285F4; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;' href='/api/auth/google'> Sign in with Google </a></button></body></html>";

app.get("/", (_, res) => {
  res.send(signInButton);
});

app.listen(port, () => {
  logger.info("Server Started");
});
