import { InlineKeyboard, type Bot } from "grammy";
import { getOrCreateUser } from "../../services/userService.ts";
import { env } from "../../config/env.ts";

const WELCOME_TEXT =
  "Ассаламу алейкум! 🌅\n\n" +
  "«Утро» — вызов раннего подъёма вместе с друзьями.\n" +
  "Поставь личную цель — во сколько хочешь вставать — и отмечайся каждый день.\n\n" +
  "Команды:\n" +
  "/goal ЧЧ:ММ — поставить или изменить цель\n" +
  "/creategroup Название — создать группу\n" +
  "/join КОД — вступить в группу по коду\n" +
  "/streak — твой стрик и стрик группы\n" +
  "/help — все команды";

export function registerStart(bot: Bot): void {
  bot.command("start", async (ctx) => {
    if (!ctx.from) return;

    await getOrCreateUser({
      telegramId: String(ctx.from.id),
      username: ctx.from.username,
      firstName: ctx.from.first_name,
    });

    const keyboard = new InlineKeyboard();
    if (env.WEB_APP_URL) {
      keyboard.webApp("📱 Открыть Утро", env.WEB_APP_URL).row();
    }
    keyboard.text("👥 Моя группа", "show_group");

    await ctx.reply(WELCOME_TEXT, { reply_markup: keyboard });
  });
}
