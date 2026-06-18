import type { Bot } from "grammy";

const HELP_TEXT =
  "Всё происходит в приложении «Утро» — открывай его кнопкой рядом с полем ввода (или напиши /start).\n\n" +
  "Там: ежедневная отметка, цель подъёма и часовой пояс, группа с друзьями и стрики.";

export function registerHelpCommand(bot: Bot): void {
  bot.command("help", async (ctx) => {
    await ctx.reply(HELP_TEXT);
  });
}
