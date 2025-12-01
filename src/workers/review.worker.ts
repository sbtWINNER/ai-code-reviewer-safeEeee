import { getNextTask } from '../simpleQueue';
import { sendTelegramMessage } from '../utils/telegram.ts';

export const processTask = async () => {
  const task = getNextTask();
  if (!task) return;

  // эмуляция проверки кода через AI
  const review = `Код проверен. Замечания для PR #${task.pr_number} в ${task.repo}: Всё ок.`;

  // отправляем в Telegram
  await sendTelegramMessage(review);
};
