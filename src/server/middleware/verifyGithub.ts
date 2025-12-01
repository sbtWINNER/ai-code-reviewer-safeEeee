import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { config } from "../../config/env.ts";

export function verifyGithubSignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers["x-hub-signature-256"] as string;
  const raw = req.rawBody || "";

  if (!signature) {
    return res.status(401).send("Missing GitHub signature");
  }

  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", config.GITHUB_WEBHOOK_SECRET)
      .update(raw)
      .digest("hex");

  if (expected !== signature) {
    return res.status(401).send("Invalid GitHub signature");
  }

  next();
}
