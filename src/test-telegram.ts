import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, { polling: false });
const chatId = process.env.TELEGRAM_CHAT_ID as string;

async function testTelegram() {
  try {
    await bot.sendMessage(chatId, 'Тестовое уведомление от бота ✅');
    console.log('Сообщение отправлено!');
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
  }
}

testTelegram();
