export class Telegram {
  sendMessage(message: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const botId = process.env.TELEGRAM_BOTID;
        const chatId = process.env.TELEGRAM_CHATID;

        if (!botId || !chatId) {
          reject(
            `'TELEGRAM_BOTID' and 'TELEGRAM_CHATID' env vars are not configured`
          );

          return;
        }

        const text = encodeURIComponent(message);

        const res = await fetch(
          `https://api.telegram.org/bot${botId}/sendMessage?chat_id=${chatId}&text=${text}`
        );

        resolve(res);
      } catch (error) {
        reject(error);
      }
    });
  }
}
