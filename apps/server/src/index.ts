import { env } from "./config/env.ts";
import { buildApp } from "./api/app.ts";
import { bot, configureBotMenu } from "./bot/bot.ts";
import { registerGroupNotifications, registerStreakRewardNotifications } from "./bot/notifications.ts";
import { startScheduler } from "./scheduler/reminders.ts";
import { startCourseDripScheduler } from "./scheduler/courseDrip.ts";

async function main(): Promise<void> {
  registerGroupNotifications();
  registerStreakRewardNotifications();

  const app = await buildApp();
  await app.listen({ port: env.PORT, host: "0.0.0.0" });

  startScheduler();
  startCourseDripScheduler();

  configureBotMenu().catch((err) => console.error("Failed to configure bot menu:", err));
  bot.start().catch((err) => console.error("Bot polling stopped unexpectedly:", err));
}

main().catch((err) => {
  console.error("Failed to start application:", err);
  process.exit(1);
});
