// import { Queue } from "bullmq";
// import { config } from "./config/env.ts";

// const queue = new Queue("review-queue", {
//   connection: {
//     host: config.REDIS_HOST,
//     port: config.REDIS_PORT,
//   },
// });

// (async () => {
//   await queue.add("test-job", {
//     repo: "test/test-repo",
//     pr_number: 1,
//   });

//   console.log("✅ Test job added to queue");
//   process.exit(0);
// })();

