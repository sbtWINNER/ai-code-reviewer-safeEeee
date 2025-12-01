import TelegramBot from 'node-telegram-bot-api';

const token = '8075879087:AAEQgyA44-SSYLN3muH9jbw0LxTRKxad_c0'; // вставь сюда токен бота
export const chatId = '6400118613';     // ID чата, куда отправлять уведомления

export const bot = new TelegramBot(token, { polling: false });

export function sendTelegramMessage(message: string) {
  bot.sendMessage(chatId, message)
     .then(() => console.log('Сообщение отправлено в Telegram'))
     .catch(err => console.error('Ошибка отправки в Telegram:', err));
}
