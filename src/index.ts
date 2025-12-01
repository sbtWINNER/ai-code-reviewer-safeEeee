import 'dotenv/config';
import express from 'express';
import { sendTelegramMessage } from './utils/telegram.ts'; // твоя функция уведомлений

const app = express();
app.use(express.json());

// API для отправки кода на проверку (тест)
app.post('/review', async (req: express.Request, res: express.Response) => {
  const { code, repo, pr_number } = req.body;

  // прямо тут отправляем уведомление в Telegram
  await sendTelegramMessage(
    `Новая проверка кода!\nRepo: ${repo}\nPR: ${pr_number}\nCode:\n${code}`
  );

  res.send({ status: 'ok', message: 'Код отправлен на проверку' });
});

app.listen(4000, () => console.log('Server running on http://localhost:4000'));
//  src/server/webhook.ts