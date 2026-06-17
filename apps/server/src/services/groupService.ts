import { prisma } from "../db/prisma.ts";
import { generateInviteCode } from "../utils/inviteCode.ts";

export class AlreadyInGroupError extends Error {}
export class GroupNotFoundError extends Error {}
export class NotInGroupError extends Error {}

export async function getUserGroup(userId: string) {
  const membership = await prisma.groupMember.findFirst({
    where: { userId },
    include: { group: { include: { members: { include: { user: true } } } } },
  });
  return membership?.group ?? null;
}

export async function createGroup(userId: string, name: string) {
  const existing = await getUserGroup(userId);
  if (existing) throw new AlreadyInGroupError("Ты уже состоишь в группе");

  let inviteCode = generateInviteCode();
  while (await prisma.group.findUnique({ where: { inviteCode } })) {
    inviteCode = generateInviteCode();
  }

  return prisma.group.create({
    data: {
      name,
      inviteCode,
      ownerId: userId,
      members: { create: { userId } },
    },
    include: { members: { include: { user: true } } },
  });
}

export async function joinGroupByCode(userId: string, rawCode: string) {
  const existing = await getUserGroup(userId);
  if (existing) throw new AlreadyInGroupError("Ты уже состоишь в группе");

  const inviteCode = rawCode.trim().toUpperCase();
  const group = await prisma.group.findUnique({ where: { inviteCode } });
  if (!group) throw new GroupNotFoundError("Группа с таким кодом не найдена");

  await prisma.groupMember.create({ data: { groupId: group.id, userId } });
  return getUserGroup(userId);
}

export async function leaveGroup(userId: string) {
  const membership = await prisma.groupMember.findFirst({ where: { userId } });
  if (!membership) throw new NotInGroupError("Ты не состоишь в группе");

  await prisma.groupMember.delete({ where: { id: membership.id } });

  const remaining = await prisma.groupMember.count({ where: { groupId: membership.groupId } });
  if (remaining === 0) {
    await prisma.group.delete({ where: { id: membership.groupId } });
  }
}
