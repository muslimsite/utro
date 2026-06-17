import type { Bot, Context } from "grammy";
import { checkIn, AlreadyCheckedInError, GoalNotSetError } from "../../services/checkinService.ts";
import { requireUser } from "./shared.ts";

async function performCheckIn(ctx: Context): Promise<void> {
  const user = await requireUser(ctx);
  if (!user) return;

  try {
    const result = await checkIn(user.id);
    const mark = result.onTime ? "✅ Вовремя!" : "⏱ Отмечено (после цели)";
    await ctx.reply(
      `${mark} Время: ${result.time}\n🔥 Стрик: ${result.streak} ${result.streak === 1 ? "день" : "дней"}`,
    );
  } catch (err) {
    if (err instanceof AlreadyCheckedInError) {
      await ctx.reply("Уже отмечено сегодня 👍");
      return;
    }
    if (err instanceof GoalNotSetError) {
      await ctx.reply("Сначала поставь цель: /goal 06:00");
      return;
    }
    throw err;
  }
}

export function registerCheckinHandlers(bot: Bot): void {
  bot.command("checkin", performCheckIn);
  bot.callbackQuery("checkin", async (ctx) => {
    await ctx.answerCallbackQuery();
    await performCheckIn(ctx);
  });
}
