import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { config } from "../../config/env";

export function verifyGithubSignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers["x-hub-signature-256"] as string;

  if (!signature) {
    return res.status(400).send("No GitHub signature provided");
  }

  const secret = config.GITHUB_WEBHOOK_SECRET;
  const body = JSON.stringify(req.body);

  const computed = 
    "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");

  if (signature !== computed) {
    return res.status(401).send("Invalid GitHub signature");
  }

  next();
}
