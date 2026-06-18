import { InlineKeyboard, type Bot } from "grammy";
import { getOrCreateUser } from "../../services/userService.ts";
import { env } from "../../config/env.ts";

const WELCOME_TEXT =
  "Ассаламу алейкум! 🌅\n\n" +
  "«Утро» — вызов раннего подъёма вместе с друзьями.\n\n" +
  "Открывай приложение кнопкой ниже: там ставишь цель подъёма, отмечаешься каждый день и сразу видишь свой стрик и стрик группы.";

export function registerStart(bot: Bot): void {
  bot.command("start", async (ctx) => {
    if (!ctx.from) return;

    await getOrCreateUser({
      telegramId: String(ctx.from.id),
      username: ctx.from.username,
      firstName: ctx.from.first_name,
    });

    const reply_markup = env.WEB_APP_URL
      ? new InlineKeyboard().webApp("📱 Открыть Утро", env.WEB_APP_URL)
      : undefined;

    await ctx.reply(WELCOME_TEXT, reply_markup ? { reply_markup } : undefined);
  });
}
