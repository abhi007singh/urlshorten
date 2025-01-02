import express from "express";
import analyticsRouter from "./analytics";
import authRouter from "./auth";
import urlRouter from "./url";

export const routes = express.Router();

routes.use("/api/shorten", urlRouter);
routes.use("/api/auth", authRouter);
routes.use("/api/analytics", analyticsRouter);
