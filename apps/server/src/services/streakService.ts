import { prisma } from "../db/prisma.ts";
import { localDateString, offsetDateString } from "../utils/time.ts";

// Walks consecutive days backwards from "today". If today hasn't happened yet
// (the day isn't over), a missing today does not break a streak still in progress.
function walkStreak(has: (date: string) => boolean, today: string): number {
  let streak = 0;
  let cursor = has(today) ? today : offsetDateString(today, -1);
  while (has(cursor)) {
    streak += 1;
    cursor = offsetDateString(cursor, -1);
  }
  return streak;
}

export async function getPersonalStreak(userId: string, timezone: string): Promise<number> {
  const checkIns = await prisma.checkIn.findMany({
    where: { userId, onTime: true },
    select: { date: true },
  });
  const dates = new Set(checkIns.map((c) => c.date));
  return walkStreak((date) => dates.has(date), localDateString(timezone));
}

export async function getGroupStreak(groupId: string): Promise<number> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: { include: { user: true } } },
  });
  if (!group || group.members.length === 0) return 0;

  const memberDateSets = await Promise.all(
    group.members.map(async (member) => {
      const checkIns = await prisma.checkIn.findMany({
        where: { userId: member.userId, onTime: true },
        select: { date: true },
      });
      return new Set(checkIns.map((c) => c.date));
    }),
  );

  const owner = group.members.find((m) => m.userId === group.ownerId) ?? group.members[0];
  const today = localDateString(owner.user.timezone);
  const allHave = (date: string) => memberDateSets.every((dates) => dates.has(date));

  return walkStreak(allHave, today);
}
