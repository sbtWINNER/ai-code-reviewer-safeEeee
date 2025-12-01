import { Router } from "express";
import { verifyGithubSignature } from "../middleware/verifyGithub.ts";
import { GithubWebhookController } from "../controllers/github.controller.ts";

export const githubWebhookRouter = Router();

githubWebhookRouter.post("/", verifyGithubSignature, GithubWebhookController.handle);
