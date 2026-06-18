import { schedule } from "node-cron";
import { InlineKeyboard } from "grammy";
import { bot } from "../bot/bot.ts";
import { prisma } from "../db/prisma.ts";
import { Prisma } from "../generated/prisma/client.ts";
import { env } from "../config/env.ts";
import { buildTariffsKeyboard, TARIFFS_TEXT } from "../bot/courseContent.ts";
import { localDateString, localTimeString, daysBetweenDateStrings } from "../utils/time.ts";

const SEND_AT = "10:00";

interface CourseDripStep {
  // Local calendar days since the user's createdAt date.
  dayOffset: number;
  text: string;
  // Simple URL button to the marketing landing page (env.COURSE_URL).
  button?: string;
  // Rich keyboard with the real buy/apply actions (see bot/courseContent.ts).
  tariffsKeyboard?: boolean;
}

// A warm-up sequence introducing the free "Утро" tracker's companion paid course
// ("Вставай на фаджр" by Солиха умм Муса). Written from the course brief: vision
// of what an early Fajr routine gives a Muslim woman, then value-first tips, then
// the author's authority, then the curriculum, then objections, then the offer.
const COURSE_DRIP_STEPS: readonly CourseDripStep[] = [
  {
    dayOffset: 1,
    text:
      "Ассаламу алейкум 🌅\n\n" +
      "Ты уже в «Утро» — а это уже шаг, на который решаются немногие.\n\n" +
      "Представь: ты одна, в тишине, перед рассветом. Зикр, дуа, страницы Корана — и никто не зовёт, не дёргает, не нужен. " +
      "А потом встаёшь — и день идёт за тобой, а не догоняет тебя с самого начала.\n\n" +
      "Трекер — это только первый шаг. В ближайшие дни расскажу, что помогает сделать его привычкой, которая остаётся " +
      "даже тогда, когда мотивация заканчивается.",
  },
  {
    dayOffset: 3,
    text:
      "Знакомо: решила лечь пораньше, а в 23:00 всё равно сидишь с телефоном в руках?\n\n" +
      "Дело не в силе воли, а в вечере. Попробуй простой приём: за 30 минут до сна убери телефон в другую комнату " +
      "и сделай короткое дуа перед сном вместо ленты. Каким будет утро — почти всегда решает именно вечер, а не будильник.\n\n" +
      "Это лишь один приём из многих — в курсе «Вставай на фаджр» вечернему ритуалу посвящён целый урок.",
  },
  {
    dayOffset: 5,
    text:
      "Расскажу немного о себе. Меня зовут Солиха умм Муса.\n\n" +
      "Я мама шестерых детей от 2 до 13 лет — учу их сама, дома, без садика, нянь и бабушек с дедушками. Встаю рано с 2014 года, " +
      "и именно ранний подъём — причина, по которой я успеваю и учиться, и работать, и быть рядом с детьми.\n\n" +
      "С 2018 года через мои курсы прошло около 5000 учениц. По опросу сестёр, около 70% считают меня тем человеком, кому можно " +
      "доверять именно в теме ранних подъёмов. Не потому что всё легко — а потому что я прошла этот путь сама, с маленькими детьми " +
      "и обычной усталостью, как у всех.",
  },
  {
    dayOffset: 7,
    text:
      "Самое частое, что мешает встать — не будильник, а лень и привычка откладывать.\n\n" +
      "Один приём из курса: не обещай себе «встану рано», обещай «встану и выпью воды у окна». Маленькое и конкретное действие " +
      "обмануть лень куда легче, чем абстрактную цель.\n\n" +
      "В полном курсе «Вставай на фаджр» 3 недели разбора: мотивация и вечерний ритуал → как закрепить привычку → режим дня " +
      "целиком (сон, питание, энергия). Плюс бонусы: режим в Рамадан, при беременности, с новорождённым, и что делать, если " +
      "дети встают вместе с тобой.",
    button: "Что внутри курса",
  },
  {
    dayOffset: 9,
    text:
      "«Мне не дано, я не жаворонок» — то, что сёстры говорят чаще всего перед курсом. Почти всегда дело не в природе, " +
      "а в привычке, которую можно менять постепенно.\n\n" +
      "Курс устроен так, чтобы вписаться в жизнь, а не наоборот: уроки в записи — смотри когда удобно, домашние задания в своём " +
      "темпе, общий чат «Ранние пташки» с другими сёстрами навсегда. На тарифе с куратором — отдельный чат до 30 человек, где " +
      "разбирают именно твою ситуацию, а не общую теорию.\n\n" +
      "Если у тебя дети, муж, учёба или работа — это нормальная часть программы, а не повод отложить.",
    button: "Как устроен курс",
  },
  {
    dayOffset: 11,
    text:
      "Если хочешь не просто отмечаться в трекере, а пройти весь путь под присмотром — вот тарифы курса «Вставай на фаджр»:\n\n" +
      TARIFFS_TEXT +
      "\n\n«Ранний подъём» открывается сразу после оплаты — кнопка ниже. На «Идеальное утро» и «Личные пташки» сейчас идёт " +
      "набор группы: оставь заявку, и я напишу, как только она наберётся.",
    tariffsKeyboard: true,
  },
  {
    dayOffset: 14,
    text:
      "Трекер «Утро» остаётся с тобой бесплатно — отмечайся и дальше, я рада, что ты здесь 🤍\n\n" +
      "Но если за эти две недели ты почувствовала, что одних отметок в приложении мало — что хочется системы, разбора именно " +
      "твоей ситуации и поддержки рядом — для этого и существует курс «Вставай на фаджр». Через него уже прошло около 5000 сестёр.\n\n" +
      "Если откликается — выбери ниже: «Ранний подъём» открывается сразу после оплаты, а на «Идеальное утро» и «Личные пташки» " +
      "можно оставить заявку.",
    tariffsKeyboard: true,
  },
];

// Uses the CourseDripLog unique constraint as the idempotency guard: the log row is
// written before sending, so an overlapping tick can never double-send a step.
async function sendStepOnce(userId: string, step: number, send: () => Promise<void>) {
  try {
    await prisma.courseDripLog.create({ data: { userId, step } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return;
    }
    console.error(`Failed to log course drip step ${step} for ${userId}:`, err);
    return;
  }

  try {
    await send();
  } catch (err) {
    console.error(`Failed to send course drip step ${step} to ${userId}:`, err);
  }
}

async function tick(): Promise<void> {
  const now = new Date();
  const users = await prisma.user.findMany();

  await Promise.all(
    users.map(async (user) => {
      const time = localTimeString(user.timezone, now);
      if (time !== SEND_AT) return;

      const signupDay = localDateString(user.timezone, user.createdAt);
      const today = localDateString(user.timezone, now);
      const daysSinceSignup = daysBetweenDateStrings(signupDay, today);

      const step = COURSE_DRIP_STEPS.findIndex((s) => s.dayOffset === daysSinceSignup);
      if (step === -1) return;

      const def = COURSE_DRIP_STEPS[step];
      await sendStepOnce(user.id, step, async () => {
        const reply_markup = def.tariffsKeyboard
          ? buildTariffsKeyboard()
          : def.button
            ? new InlineKeyboard().url(def.button, env.COURSE_URL)
            : undefined;
        await bot.api.sendMessage(user.telegramId, def.text, reply_markup ? { reply_markup } : {});
      });
    }),
  );
}

export function startCourseDripScheduler(): void {
  schedule(
    "* * * * *",
    () => {
      tick().catch((err) => console.error("Course drip scheduler tick failed:", err));
    },
    { timezone: "UTC" },
  );
}
