import type { Bot } from "grammy";
import { getUserGroup } from "../../services/groupService.ts";
import { getPersonalStreak, getGroupStreak } from "../../services/streakService.ts";
import { requireUser } from "./shared.ts";

export function registerStreakCommand(bot: Bot): void {
  bot.command("streak", async (ctx) => {
    const user = await requireUser(ctx);
    if (!user) return;

    const personal = await getPersonalStreak(user.id, user.timezone);
    let text = `🔥 Твой стрик: ${personal} ${personal === 1 ? "день" : "дней"}`;

    const group = await getUserGroup(user.id);
    if (group) {
      const groupStreak = await getGroupStreak(group.id);
      text += `\n👥 Стрик группы «${group.name}»: ${groupStreak} ${groupStreak === 1 ? "день" : "дней"}`;
    }

    await ctx.reply(text);
  });
}
