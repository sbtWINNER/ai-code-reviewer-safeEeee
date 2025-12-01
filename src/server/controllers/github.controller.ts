import { Request, Response } from "express";
import { reviewQueue } from "../../jobs/queue";
import { logger } from "../../config/logger";

export class GithubWebhookController {
  static async handle(req: Request, res: Response) {
    const event = req.headers["x-github-event"];
    const raw = req.rawBody;

    if (!event) {
      return res.status(400).send("Missing x-github-event header");
    }

    // GitHub всегда отправляет JSON, мы его парсим вручную
    if (!raw || typeof raw !== 'string') {
      return res.status(400).send("Missing or invalid raw body");
    }

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch (e) {
      return res.status(400).send("Invalid JSON payload");
    }

    // Нас интересует только pull_request
    if (event !== "pull_request") {
      return res.status(200).send("Ignored (not PR event)");
    }

    const action = payload.action;

    if (!["opened", "reopened", "synchronize"].includes(action)) {
      return res.status(200).send("Ignored (action not relevant)");
    }

    const repo = payload.repository.full_name;
    const pr_number = payload.pull_request.number;
    const head_sha = payload.pull_request.head.sha;

    logger.info(`Webhook: PR #${pr_number} (${action}) — queued for review`);

    await reviewQueue.add("review", {
      repo,
      pr_number,
      head_sha
    });

    return res.status(200).send({ ok: true });
  }
}
