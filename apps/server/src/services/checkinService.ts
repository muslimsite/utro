import { prisma } from "../db/prisma.ts";
import { localDateString, localTimeString, isOnTime } from "../utils/time.ts";
import { getPersonalStreak } from "./streakService.ts";
import { appEvents } from "../events.ts";

export class AlreadyCheckedInError extends Error {}
export class GoalNotSetError extends Error {}

export interface CheckInResult {
  date: string;
  time: string;
  onTime: boolean;
  streak: number;
}

export async function checkIn(userId: string): Promise<CheckInResult> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.goalTime) throw new GoalNotSetError("Сначала укажи цель подъёма");

  const date = localDateString(user.timezone);
  const existing = await prisma.checkIn.findUnique({
    where: { userId_date: { userId, date } },
  });
  if (existing) throw new AlreadyCheckedInError("Уже отмечено на сегодня");

  const time = localTimeString(user.timezone);
  const onTime = isOnTime(time, user.goalTime, user.graceMinutes);

  await prisma.checkIn.create({ data: { userId, date, onTime } });
  const streak = await getPersonalStreak(userId, user.timezone);

  const result: CheckInResult = { date, time, onTime, streak };
  appEvents.emitCheckIn({ userId, ...result });
  return result;
}

export interface TodayStatus {
  checkedIn: boolean;
  onTime: boolean | null;
  checkedAt: Date | null;
}

export async function getTodayStatus(userId: string): Promise<TodayStatus> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const date = localDateString(user.timezone);
  const checkInRow = await prisma.checkIn.findUnique({
    where: { userId_date: { userId, date } },
  });
  return {
    checkedIn: !!checkInRow,
    onTime: checkInRow?.onTime ?? null,
    checkedAt: checkInRow?.checkedAt ?? null,
  };
}
