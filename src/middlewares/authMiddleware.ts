import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../logger";
import { IGetUserAuthInfoRequest } from "../types/expressTypes";

interface IUser {
  id: string;
  email: string;
}

export function verifyToken(
  req: IGetUserAuthInfoRequest,
  res: Response,
  next: NextFunction
) {
  logger.info("Token Verification ...");
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    logger.error("No token provided");
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    req.user = decoded as IUser;
    next();
  } catch (error) {
    logger.error(`Invalid token -> System message:${error.message}`);
    res.status(401).json({ error: "Invalid token" });
  }
}
