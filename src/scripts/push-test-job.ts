// scripts/push-test-job.ts
import { Queue } from "bullmq";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const redisHost = process.env.REDIS_HOST || "127.0.0.1";
  const redisPort = Number(process.env.REDIS_PORT || 6379);

  const queue = new Queue("review-queue", {
    connection: { host: redisHost, port: redisPort }
  });

  const repo = process.argv[2] || "owner/repo";
  const pr = Number(process.argv[3] || 1);

  await queue.add("review", { repo, pr_number: pr });
  console.log(`✅ Added test job to review-queue -> ${repo}#${pr}`);
  await queue.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
