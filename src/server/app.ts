import express from "express";
import { rawBodySaver } from "./middleware/rawBody.ts";
import { githubWebhookRouter } from "./routes/github.webhook.ts";
import { slackInteractionsRouter } from "./routes/slack.interactions.ts";

const app = express();

// Критично: сохраняем сырое тело для Slack и GitHub
app.use(
  express.json({
    verify: rawBodySaver
  })
);

// GitHub Webhooks (RAW required)
app.use("/webhook/github", githubWebhookRouter);

// Slack interactions (RAW required)
app.use("/slack", slackInteractionsRouter);

export default app;
