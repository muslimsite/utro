import { bot } from "./bot.ts";
import { appEvents } from "../events.ts";
import { getUserGroup } from "../services/groupService.ts";
import { getGroupStreak } from "../services/streakService.ts";
import { prisma } from "../db/prisma.ts";

// Tells the rest of the group when a member checks in, so the social/accountability
// loop doesn't require everyone to poll the Mini App.
export function registerGroupNotifications(): void {
  appEvents.onCheckIn(async ({ userId, time, onTime }) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.notifyGroup) return;

      const group = await getUserGroup(userId);
      if (!group) return;

      const others = group.members.filter((m) => m.userId !== userId);
      if (others.length === 0) return;

      const groupStreak = await getGroupStreak(group.id);
      const name = user.firstName ?? user.username ?? "Друг";
      const mark = onTime ? "✅" : "⏱";
      const text =
        `${mark} ${name} отметился(ась) в ${time}\n` +
        `Стрик группы «${group.name}»: ${groupStreak} ${groupStreak === 1 ? "день" : "дней"}`;

      await Promise.all(
        others.map((member) =>
          bot.api.sendMessage(member.user.telegramId, text).catch((err: unknown) => {
            console.error(`Failed to notify ${member.user.telegramId}:`, err);
          }),
        ),
      );
    } catch (err) {
      console.error("Group notification handler failed:", err);
    }
  });
}
