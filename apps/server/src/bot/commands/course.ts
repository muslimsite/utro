import type { Bot, Context } from "grammy";
import { requireUser } from "./shared.ts";
import { applyForCourse, TARIFF_LABELS, type Tariff } from "../../services/courseApplicationService.ts";
import { buildTariffsKeyboard, TARIFFS_TEXT } from "../courseContent.ts";
import { env } from "../../config/env.ts";
import { prisma } from "../../db/prisma.ts";

async function showTariffs(ctx: Context): Promise<void> {
  await ctx.reply(`Тарифы курса «Вставай на фаджр»:\n\n${TARIFFS_TEXT}`, {
    reply_markup: buildTariffsKeyboard(),
  });
}

// Notifies everyone else in a just-filled cohort (the applicant who triggered the
// fill gets their own reply from the handler below instead, to avoid a double message).
async function notifyFilledCohort(bot: Bot, tariff: Tariff, otherUserIds: string[]): Promise<void> {
  const label = TARIFF_LABELS[tariff];
  await Promise.all(
    otherUserIds.map(async (userId) => {
      const member = await prisma.user.findUnique({ where: { id: userId } });
      if (!member) return;
      await bot.api
        .sendMessage(member.telegramId, `Группа ${label} набралась — мы скоро напишем с деталями старта! 🤍`)
        .catch((err: unknown) => {
          console.error(`Failed to notify ${member.telegramId} about filled group:`, err);
        });
    }),
  );

  if (env.ADMIN_TELEGRAM_ID) {
    await bot.api
      .sendMessage(env.ADMIN_TELEGRAM_ID, `Группа ${label} набрана полностью (${otherUserIds.length + 1} чел) — можно запускать.`)
      .catch((err: unknown) => {
        console.error("Failed to notify admin about filled group:", err);
      });
  }
}

function buildApplyHandler(bot: Bot, tariff: Tariff) {
  return async (ctx: Context): Promise<void> => {
    await ctx.answerCallbackQuery();
    const user = await requireUser(ctx);
    if (!user) return;

    const label = TARIFF_LABELS[tariff];
    const result = await applyForCourse(user.id, tariff);

    if (result.alreadyApplied) {
      await ctx.reply(
        result.position >= result.threshold
          ? `Ты уже в группе ${label} — она в наборе, скоро напишу с деталями старта 🤍`
          : `Заявка на ${label} уже принята. Сейчас в очереди: ${result.position} из ${result.threshold}.`,
      );
      return;
    }

    if (result.filledUserIds) {
      await ctx.reply(`Группа ${label} набралась — ты в ней! Скоро напишу с деталями старта 🤍`);
      const others = result.filledUserIds.filter((id) => id !== user.id);
      await notifyFilledCohort(bot, tariff, others);
      return;
    }

    await ctx.reply(
      `Заявка на ${label} принята! Сейчас в очереди: ${result.position} из ${result.threshold}. Как наберётся группа — сразу напишу.`,
    );
  };
}

export function registerCourseCommand(bot: Bot): void {
  bot.command("course", showTariffs);
  bot.callbackQuery("apply_ideal_morning", buildApplyHandler(bot, "ideal_morning"));
  bot.callbackQuery("apply_personal_birds", buildApplyHandler(bot, "personal_birds"));
}
