import { Router } from "express";
import { verifySlackSignature } from "../middleware/verifySlack";
import { SlackController } from "../controllers/slack.controller";

export const slackInteractionsRouter = Router();

slackInteractionsRouter.post(
  "/interact",
  verifySlackSignature,
  SlackController.handleInteraction
);
