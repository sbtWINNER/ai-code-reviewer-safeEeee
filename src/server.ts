import express from 'express';
import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'; // <-- используем адаптер
import { ExpressAdapter } from '@bull-board/express';
import { sendTelegramMessage } from './utils/telegram.ts';

const app = express();
app.use(express.json());

// Подключение очереди к Redis
const reviewQueue = new Queue('review', {
  connection: {
    host: 'redis-14897.c10.us-east-1-4.ec2.cloud.redislabs.com',
    port: 14897,
    password: 'jwgE6Phi9zadXBYfIT0CXplrkSnMrFmo',
  },
});

// Настройка BullBoard
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(reviewQueue)], // <-- оборачиваем в BullMQAdapter
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

// Эндпоинт для отправки кода
app.post('/review', async (req, res) => {
  const { code, repo, pr_number } = req.body;

  // Добавляем задачу в очередь
  await reviewQueue.add('review-job', { code, repo, pr_number });

  // Отправка Telegram уведомления
  await sendTelegramMessage(`Новый код на проверку!\nRepo: ${repo}\nPR: ${pr_number}\nCode: ${code}`);

  res.send({ status: 'ok', message: 'Код отправлен в очередь и Telegram' });
});

app.listen(process.env.PORT || 4000, async () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 4000}`);
  await sendTelegramMessage('Сервер запущен и готов принимать задания!');
});
