import { Bot } from "grammy";
import { env } from "../config/env.ts";
import { registerStart } from "./commands/start.ts";
import { registerSettingsCommands } from "./commands/settings.ts";
import { registerGroupCommands } from "./commands/group.ts";
import { registerStreakCommand } from "./commands/streak.ts";
import { registerCheckinHandlers } from "./commands/checkin.ts";
import { registerHelpCommand } from "./commands/help.ts";
import { registerCourseCommand } from "./commands/course.ts";

export const bot = new Bot(env.BOT_TOKEN);

registerStart(bot);
registerSettingsCommands(bot);
registerGroupCommands(bot);
registerStreakCommand(bot);
registerCheckinHandlers(bot);
registerHelpCommand(bot);
registerCourseCommand(bot);

bot.catch((err) => {
  console.error(`Bot error while handling update ${err.ctx.update.update_id}:`, err.error);
});

export async function configureBotMenu(): Promise<void> {
  // No visible command list: everything happens in the Mini App, the bot only
  // greets (/start) and sends proactive warm-up/course messages.
  await bot.api.setMyCommands([]);

  if (env.WEB_APP_URL) {
    await bot.api.setChatMenuButton({
      menu_button: { type: "web_app", text: "Утро", web_app: { url: env.WEB_APP_URL } },
    });
  }
}
