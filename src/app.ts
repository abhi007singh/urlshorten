import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import swaggerUi from "swagger-ui-express";

dotenv.config();
export const app = express();

import { routes } from "./routes";
import swaggerDocument from "./swagger-output.json";

// Ensure log files and directories exist
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
["errors.log", "operations.log", "process.log"].forEach((file) => {
  const filePath = path.join(logDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "", "utf8");
  }
});

const operationsStream = fs.createWriteStream(
  path.join(__dirname, "logs", "operations.log"),
  { flags: "a" }
);

app.use(morgan("combined", { stream: operationsStream }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  origin: "http://localhost:3000",
};

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "connect-src": ["'self'", "https://*"],
        "default-src": ["'self'", "*"],
      },
    },
  })
);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/api-docs", express.static(path.join(__dirname, "public")));

app.use("/", routes);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customJs: "/api-docs/swagger-custom.js",
  })
);
