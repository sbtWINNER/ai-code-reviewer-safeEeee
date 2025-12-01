import express from "express";
import { Queue } from "bullmq";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

const app = express();

// Подключаем Redis через имя контейнера
const reviewQueue = new Queue("review-queue", {
  connection: {
    host: process.env.REDIS_HOST || "reviewer-redis",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  },
});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(reviewQueue)],
  serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Bull Board running at http://localhost:${PORT}/admin/queues`);
});
