import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { config } from "../../config/env";

export function verifySlackSignature(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const slackSignature = req.headers["x-slack-signature"] as string;
    const slackTimestamp = req.headers["x-slack-request-timestamp"] as string;

    if (!slackSignature || !slackTimestamp) {
      return res.status(400).send("Missing Slack signature");
    }

    const time = Math.floor(Date.now() / 1000);
    if (Math.abs(time - Number(slackTimestamp)) > 300) {
      return res.status(400).send("Slack request too old");
    }

    // ВАЖНО: rawBody уже строка
    const sigBaseString = `v0:${slackTimestamp}:${req.rawBody || ""}`;

    const mySignature =
      "v0=" +
      crypto
        .createHmac("sha256", config.SLACK_SIGNING_SECRET)
        .update(sigBaseString)
        .digest("hex");

    if (mySignature !== slackSignature) {
      return res.status(400).send("Invalid Slack signature");
    }

    return next();
  } catch (e) {
    return res.status(400).send("Slack signature error");
  }
}
