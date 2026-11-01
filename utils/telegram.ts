export class Telegram {
  async sendMessage(message: string): Promise<void> {
    const botId = process.env.TELEGRAM_BOTID;
    const chatId = process.env.TELEGRAM_CHATID;

    if (!botId || !chatId) {
      throw new Error("Telegram credentials are not configured");
    }

    const text = encodeURIComponent(message);
    const response = await fetch(
      `https://api.telegram.org/bot${botId}/sendMessage?chat_id=${chatId}&text=${text}`,
    );

    if (!response.ok) {
      throw new Error("Telegram rejected the message");
    }

    const result: unknown = await response.json();
    if (
      typeof result !== "object" ||
      result === null ||
      !("ok" in result) ||
      result.ok !== true
    ) {
      throw new Error("Telegram did not confirm delivery");
    }
  }
}
