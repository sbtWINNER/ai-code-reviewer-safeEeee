declare namespace NodeJS {
  interface ProcessEnv {
    GITHUB_TOKEN: string;
    GITHUB_WEBHOOK_SECRET: string;

    SLACK_BOT_TOKEN: string;
    SLACK_SIGNING_SECRET: string;
    SLACK_CHANNEL_ID: string;

    DATABASE_URL: string;
    REDIS_HOST: string;
    REDIS_PORT: string;
  }
}
