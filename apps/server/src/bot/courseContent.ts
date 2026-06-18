import { InlineKeyboard } from "grammy";
import { env } from "../config/env.ts";

// Shared between the course warm-up drip (scheduler/courseDrip.ts) and the
// /course command so pricing copy isn't duplicated across call sites.
export const TARIFFS_TEXT =
  "🌙 «Ранний подъём» — 14 дней, 10+ уроков, доступ сразу после оплаты — 5 900 ₽\n" +
  "🌙 «Идеальное утро» — 21 день, 15+ уроков, поддержка куратора 21 день, вебинар с Солихой, модуль от нутрициолога — по заявке, группа стартует от 30 участниц\n" +
  "🌙 «Личные пташки Солихи» — закрытая мини-группа до 15 сестёр с личной обратной связью от Солихи — по заявке, группа стартует от 15 участниц";

export function buildTariffsKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .url("Оплатить «Ранний подъём»", env.COURSE_PAYMENT_URL)
    .row()
    .text("Заявка: «Идеальное утро»", "apply_ideal_morning")
    .row()
    .text("Заявка: «Личные пташки»", "apply_personal_birds");
}
