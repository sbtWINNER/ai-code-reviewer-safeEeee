import { Queue } from "bullmq";
import { config } from "../config/env";

export const reviewQueue = new Queue("review-queue", {
  connection: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT
  }
});
