import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: Number(process.env.PORT) || 3000,

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,

  // Telegram
  TELEGRAM_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "8075879087:AAEQgyA44-SSYLN3muH9jbw0LxTRKxad_c0",
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || "6400118613",

  // GitHub
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || "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",
  GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET || "mysupersecret123",

  // Slack
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN || "",
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET || "",
  SLACK_CHANNEL_ID: process.env.SLACK_CHANNEL_ID || "",

  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "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",

  // DB
  DATABASE_URL: process.env.DATABASE_URL || ""
};
