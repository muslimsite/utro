import { schedule } from "node-cron";
import { InlineKeyboard } from "grammy";
import { bot } from "../bot/bot.ts";
import { prisma } from "../db/prisma.ts";
import { Prisma } from "../generated/prisma/client.ts";
import { localDateString, localTimeString, addMinutes } from "../utils/time.ts";

type ReminderType = "morning" | "lastcall";

// Uses the ReminderLog unique constraint as the idempotency guard: the log row is
// written before sending, so an overlapping tick can never double-send a reminder.
async function sendOnce(userId: string, date: string, type: ReminderType, send: () => Promise<void>) {
  try {
    await prisma.reminderLog.create({ data: { userId, date, type } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return;
    }
    console.error(`Failed to log ${type} reminder for ${userId}:`, err);
    return;
  }

  try {
    await send();
  } catch (err) {
    console.error(`Failed to send ${type} reminder to ${userId}:`, err);
  }
}

async function tick(): Promise<void> {
  const now = new Date();
  const users = await prisma.user.findMany({ where: { goalTime: { not: null } } });

  await Promise.all(
    users.map(async (user) => {
      const goalTime = user.goalTime;
      if (!goalTime) return;

      const date = localDateString(user.timezone, now);
      const time = localTimeString(user.timezone, now);
      const deadline = addMinutes(goalTime, user.graceMinutes);
      const lastCallAt = addMinutes(deadline, -15);

      if (time === goalTime) {
        await sendOnce(user.id, date, "morning", async () => {
          const keyboard = new InlineKeyboard().text("✅ Я встал", "checkin");
          await bot.api.sendMessage(
            user.telegramId,
            "🌅 Доброе утро! Время вставать. Отметься, чтобы не разорвать стрик.",
            { reply_markup: keyboard },
          );
        });
      }

      if (time === lastCallAt && lastCallAt !== goalTime) {
        const existing = await prisma.checkIn.findUnique({
          where: { userId_date: { userId: user.id, date } },
        });
        if (!existing) {
          await sendOnce(user.id, date, "lastcall", async () => {
            const keyboard = new InlineKeyboard().text("✅ Я встал", "checkin");
            await bot.api.sendMessage(
              user.telegramId,
              `⏰ Осталось 15 минут до конца окна (до ${deadline}). Не теряй стрик!`,
              { reply_markup: keyboard },
            );
          });
        }
      }
    }),
  );
}

export function startScheduler(): void {
  schedule(
    "* * * * *",
    () => {
      tick().catch((err) => console.error("Scheduler tick failed:", err));
    },
    { timezone: "UTC" },
  );
}
