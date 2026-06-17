import { prisma } from "../db/prisma.ts";

export interface TelegramProfile {
  telegramId: string;
  username?: string;
  firstName?: string;
}

export async function getOrCreateUser(profile: TelegramProfile) {
  return prisma.user.upsert({
    where: { telegramId: profile.telegramId },
    update: {
      username: profile.username,
      firstName: profile.firstName,
    },
    create: {
      telegramId: profile.telegramId,
      username: profile.username,
      firstName: profile.firstName,
    },
  });
}

export async function getUserByTelegramId(telegramId: string) {
  return prisma.user.findUnique({ where: { telegramId } });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export interface UpdateSettingsInput {
  timezone?: string;
  goalTime?: string | null;
  graceMinutes?: number;
  notifyGroup?: boolean;
}

export async function updateSettings(userId: string, input: UpdateSettingsInput) {
  return prisma.user.update({ where: { id: userId }, data: input });
}
