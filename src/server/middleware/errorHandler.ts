import { Request, Response, NextFunction } from "express";
import { logger } from "../../config/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error("Unhandled error:", err);

  return res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
}
