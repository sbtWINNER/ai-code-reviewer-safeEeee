import { Request, Response, NextFunction } from "express";

export function rawBodySaver(req: Request, res: Response, buf: Buffer) {
  if (buf && buf.length > 0) {
    (req as any).rawBody = buf.toString("utf8");
  }
}
