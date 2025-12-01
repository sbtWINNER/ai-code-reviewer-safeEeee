import { Router } from "express";
import { verifyGithubSignature } from "../middleware/verifyGithub";
import { GithubWebhookController } from "../controllers/github.controller";

export const githubWebhookRouter = Router();

githubWebhookRouter.post("/", verifyGithubSignature, GithubWebhookController.handle);
