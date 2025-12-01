import { Router } from "express";
import { verifySlackSignature } from "../middleware/verifySlack.ts";
import { SlackController } from "../controllers/slack.controller.ts";

export const slackInteractionsRouter = Router();

slackInteractionsRouter.post(
  "/interact",
  verifySlackSignature,
  SlackController.handleInteraction
);
