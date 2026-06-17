import type { FastifyInstance } from "fastify";
import { z } from "zod";
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
import { Prisma } from "../../generated/prisma/client.ts";

type GroupWithMembers = Prisma.GroupGetPayload<{ include: { members: { include: { user: true } } } }>;

async function serializeGroup(group: GroupWithMembers) {
  const streak = await getGroupStreak(group.id);
  const members = await Promise.all(
    group.members.map(async (member) => ({
      id: member.user.id,
      name: member.user.firstName ?? member.user.username ?? "Без имени",
      isOwner: member.userId === group.ownerId,
      today: await getTodayStatus(member.userId),
    })),
  );
  return { id: group.id, name: group.name, inviteCode: group.inviteCode, streak, members };
}

export async function groupRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/group", async (request) => {
    const group = await getUserGroup(request.dbUser.id);
    return group ? await serializeGroup(group) : null;
  });

  app.post("/api/group", async (request, reply) => {
    const parsed = z.object({ name: z.string().trim().min(1).max(50) }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid name" });

    try {
      const group = await createGroup(request.dbUser.id, parsed.data.name);
      return await serializeGroup(group);
    } catch (err) {
      if (err instanceof AlreadyInGroupError) return reply.code(409).send({ error: "already_in_group" });
      throw err;
    }
  });

  app.post("/api/group/join", async (request, reply) => {
    const parsed = z.object({ inviteCode: z.string().trim().min(1).max(20) }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Invalid invite code" });

    try {
      const group = await joinGroupByCode(request.dbUser.id, parsed.data.inviteCode);
      return await serializeGroup(group!);
    } catch (err) {
      if (err instanceof AlreadyInGroupError) return reply.code(409).send({ error: "already_in_group" });
      if (err instanceof GroupNotFoundError) return reply.code(404).send({ error: "group_not_found" });
      throw err;
    }
  });

  app.post("/api/group/leave", async (request, reply) => {
    try {
      await leaveGroup(request.dbUser.id);
      return { ok: true };
    } catch (err) {
      if (err instanceof NotInGroupError) return reply.code(409).send({ error: "not_in_group" });
      throw err;
    }
  });
}
