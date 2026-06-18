import { InlineKeyboard } from "grammy";
import { bot } from "./bot.ts";
import { appEvents } from "../events.ts";
import { getUserGroup } from "../services/groupService.ts";
import { getGroupStreak } from "../services/streakService.ts";
import { prisma } from "../db/prisma.ts";
import { env } from "../config/env.ts";

const PROMO_STREAK_DAYS = 7;
const PROMO_CODE = "ФАДЖР";

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

// Rewards a 7-day on-time streak with a one-time discount code for the "Ранний
// подъём" tariff, so the free tracker funnels naturally into the paid course.
export function registerStreakRewardNotifications(): void {
  appEvents.onCheckIn(async ({ userId, streak }) => {
    if (streak < PROMO_STREAK_DAYS) return;

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.promoUnlockedAt) return;

      await prisma.user.update({ where: { id: userId }, data: { promoUnlockedAt: new Date() } });

      const text =
        `Машаллах, ${PROMO_STREAK_DAYS} дней подряд вовремя 🎉\n\n` +
        "Ты встаёшь раньше будильника уже неделю — это не случайность, а характер. В награду — промокод на «Ранний подъём» (курс «Вставай на фаджр»):\n\n" +
        `Промокод: ${PROMO_CODE}\n` +
        "Скидка 2 000 ₽ — вместо 5 900 ₽ будет 3 900 ₽.\n\n" +
        "Доступ откроется сразу после оплаты.";
      const reply_markup = new InlineKeyboard().url("Оплатить со скидкой", env.COURSE_PAYMENT_URL);

      await bot.api.sendMessage(user.telegramId, text, { reply_markup });
    } catch (err) {
      console.error(`Streak reward notification failed for ${userId}:`, err);
    }
  });
}
