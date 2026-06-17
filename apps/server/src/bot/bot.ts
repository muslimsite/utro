import { Bot } from "grammy";
import { env } from "../config/env.ts";
import { registerStart } from "./commands/start.ts";
import { registerSettingsCommands } from "./commands/settings.ts";
import { registerGroupCommands } from "./commands/group.ts";
import { registerStreakCommand } from "./commands/streak.ts";
import { registerCheckinHandlers } from "./commands/checkin.ts";
import { registerHelpCommand } from "./commands/help.ts";

export const bot = new Bot(env.BOT_TOKEN);

registerStart(bot);
registerSettingsCommands(bot);
registerGroupCommands(bot);
registerStreakCommand(bot);
registerCheckinHandlers(bot);
registerHelpCommand(bot);

bot.catch((err) => {
  console.error(`Bot error while handling update ${err.ctx.update.update_id}:`, err.error);
});

export async function configureBotMenu(): Promise<void> {
  await bot.api.setMyCommands([
    { command: "checkin", description: "Отметиться, что встал" },
    { command: "streak", description: "Мой стрик и стрик группы" },
    { command: "goal", description: "Поставить цель подъёма" },
    { command: "timezone", description: "Указать часовой пояс" },
    { command: "mygroup", description: "Моя группа" },
    { command: "creategroup", description: "Создать группу" },
    { command: "join", description: "Вступить в группу" },
    { command: "leavegroup", description: "Выйти из группы" },
    { command: "help", description: "Список команд" },
  ]);

  if (env.WEB_APP_URL) {
    await bot.api.setChatMenuButton({
      menu_button: { type: "web_app", text: "Утро", web_app: { url: env.WEB_APP_URL } },
    });
  }
}
