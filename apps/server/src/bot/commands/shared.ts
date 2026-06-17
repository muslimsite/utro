import type { Context } from "grammy";
import { getUserByTelegramId } from "../../services/userService.ts";

// Looks up the DB user for the sender, replying with onboarding instructions
// (and returning null) if they haven't run /start yet.
export async function requireUser(ctx: Context) {
  if (!ctx.from) return null;
  const user = await getUserByTelegramId(String(ctx.from.id));
  if (!user) {
    await ctx.reply("Сначала напиши /start");
    return null;
  }
  return user;
}
