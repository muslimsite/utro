import type { Bot, Context } from "grammy";
import {
  createGroup,
  joinGroupByCode,
  leaveGroup,
  getUserGroup,
  AlreadyInGroupError,
  GroupNotFoundError,
  NotInGroupError,
} from "../../services/groupService.ts";
import { getGroupStreak } from "../../services/streakService.ts";
import { getTodayStatus } from "../../services/checkinService.ts";
import { requireUser } from "./shared.ts";

export async function replyGroupInfo(ctx: Context): Promise<void> {
  const user = await requireUser(ctx);
  if (!user) return;

  const group = await getUserGroup(user.id);
  if (!group) {
    await ctx.reply(
      "Ты пока не в группе.\n\n" +
        "Создать новую: /creategroup Название\n" +
        "Вступить по коду: /join КОД",
    );
    return;
  }

  const streak = await getGroupStreak(group.id);
  const lines = await Promise.all(
    group.members.map(async (member) => {
      const status = await getTodayStatus(member.userId);
      const mark = status.checkedIn ? (status.onTime ? "✅" : "⏱") : "⏳";
      const name = member.user.firstName ?? member.user.username ?? "Без имени";
      return `${mark} ${name}`;
    }),
  );

  await ctx.reply(
    `Группа «${group.name}»\n` +
      `Код приглашения: ${group.inviteCode}\n` +
      `Общий стрик: ${streak} ${streak === 1 ? "день" : "дней"}\n\n` +
      `Сегодня:\n${lines.join("\n")}`,
  );
}

export function registerGroupCommands(bot: Bot): void {
  bot.command("creategroup", async (ctx) => {
    const user = await requireUser(ctx);
    if (!user) return;

    const name = ctx.match.trim();
    if (!name) {
      await ctx.reply("Укажи название группы:\n/creategroup Утренние пташки");
      return;
    }

    try {
      const group = await createGroup(user.id, name);
      await ctx.reply(
        `Группа «${group.name}» создана!\nКод для друзей: ${group.inviteCode}\n\n` +
          `Они могут вступить командой:\n/join ${group.inviteCode}`,
      );
    } catch (err) {
      if (err instanceof AlreadyInGroupError) {
        await ctx.reply("Ты уже состоишь в группе. Сначала выйди: /leavegroup");
        return;
      }
      throw err;
    }
  });

  bot.command("join", async (ctx) => {
    const user = await requireUser(ctx);
    if (!user) return;

    const code = ctx.match.trim();
    if (!code) {
      await ctx.reply("Укажи код группы:\n/join ABC123");
      return;
    }

    try {
      const group = await joinGroupByCode(user.id, code);
      await ctx.reply(`Ты вступил в группу «${group?.name}» 🎉`);
    } catch (err) {
      if (err instanceof AlreadyInGroupError) {
        await ctx.reply("Ты уже состоишь в группе. Сначала выйди: /leavegroup");
        return;
      }
      if (err instanceof GroupNotFoundError) {
        await ctx.reply("Группа с таким кодом не найдена");
        return;
      }
      throw err;
    }
  });

  bot.command("mygroup", replyGroupInfo);

  bot.command("leavegroup", async (ctx) => {
    const user = await requireUser(ctx);
    if (!user) return;

    try {
      await leaveGroup(user.id);
      await ctx.reply("Ты вышел из группы");
    } catch (err) {
      if (err instanceof NotInGroupError) {
        await ctx.reply("Ты не состоишь в группе");
        return;
      }
      throw err;
    }
  });
}
