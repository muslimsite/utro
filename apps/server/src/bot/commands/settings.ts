import type { Bot } from "grammy";
import { updateSettings } from "../../services/userService.ts";
import { isValidHHMM } from "../../utils/time.ts";
import { requireUser } from "./shared.ts";

export function registerSettingsCommands(bot: Bot): void {
  bot.command("goal", async (ctx) => {
    const arg = ctx.match.trim();
    if (!arg || !isValidHHMM(arg)) {
      await ctx.reply("Укажи время в формате ЧЧ:ММ, например:\n/goal 05:30");
      return;
    }

    const user = await requireUser(ctx);
    if (!user) return;

    await updateSettings(user.id, { goalTime: arg });
    await ctx.reply(
      `Готово! Цель подъёма: ${arg} (${user.timezone}).\n` +
        `Отметка засчитается, если придёт не позже чем через ${user.graceMinutes} минут после цели.\n\n` +
        "Если часовой пояс указан неверно — напиши /timezone, например /timezone +3.",
    );
  });

  bot.command("timezone", async (ctx) => {
    const arg = ctx.match.trim();
    const match = arg.match(/^([+-]?\d{1,2})$/);
    if (!match) {
      await ctx.reply("Укажи смещение от UTC, например:\n/timezone +3");
      return;
    }

    const offset = parseInt(match[1], 10);
    if (offset < -12 || offset > 14) {
      await ctx.reply("Смещение должно быть от -12 до +14");
      return;
    }

    const user = await requireUser(ctx);
    if (!user) return;

    const timezone = offset === 0 ? "UTC" : `Etc/GMT${offset > 0 ? "-" : "+"}${Math.abs(offset)}`;
    await updateSettings(user.id, { timezone });
    await ctx.reply(`Часовой пояс обновлён: UTC${offset >= 0 ? "+" : ""}${offset}`);
  });
}
