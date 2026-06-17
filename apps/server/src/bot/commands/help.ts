import type { Bot } from "grammy";

const HELP_TEXT =
  "Команды:\n" +
  "/goal ЧЧ:ММ — поставить цель подъёма\n" +
  "/timezone ±N — указать часовой пояс (смещение от UTC)\n" +
  "/checkin — отметиться, что встал\n" +
  "/streak — твой стрик и стрик группы\n" +
  "/creategroup Название — создать группу\n" +
  "/join КОД — вступить в группу\n" +
  "/mygroup — информация о группе\n" +
  "/leavegroup — выйти из группы";

export function registerHelpCommand(bot: Bot): void {
  bot.command("help", async (ctx) => {
    await ctx.reply(HELP_TEXT);
  });
}
