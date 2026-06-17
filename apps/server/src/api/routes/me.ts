import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { updateSettings } from "../../services/userService.ts";
import { getPersonalStreak, getGroupStreak } from "../../services/streakService.ts";
import { getUserGroup } from "../../services/groupService.ts";
import { getTodayStatus } from "../../services/checkinService.ts";
import { isValidHHMM, isValidTimezone } from "../../utils/time.ts";

const updateMeSchema = z.object({
  timezone: z.string().optional(),
  goalTime: z.string().nullable().optional(),
  graceMinutes: z.number().int().min(5).max(180).optional(),
  notifyGroup: z.boolean().optional(),
});

export async function meRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/me", async (request) => {
    const user = request.dbUser;
    const [streak, today, group] = await Promise.all([
      getPersonalStreak(user.id, user.timezone),
      getTodayStatus(user.id),
      getUserGroup(user.id),
    ]);

    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      timezone: user.timezone,
      goalTime: user.goalTime,
      graceMinutes: user.graceMinutes,
      notifyGroup: user.notifyGroup,
      streak,
      today,
      hasGroup: !!group,
    };
  });

  app.patch("/api/me", async (request, reply) => {
    const parsed = updateMeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid payload", issues: parsed.error.issues });
    }
    const { timezone, goalTime, graceMinutes, notifyGroup } = parsed.data;

    if (timezone !== undefined && !isValidTimezone(timezone)) {
      return reply.code(400).send({ error: "Invalid timezone" });
    }
    if (goalTime != null && !isValidHHMM(goalTime)) {
      return reply.code(400).send({ error: "Invalid goalTime, expected HH:MM" });
    }

    const updated = await updateSettings(request.dbUser.id, {
      timezone,
      goalTime,
      graceMinutes,
      notifyGroup,
    });

    return {
      timezone: updated.timezone,
      goalTime: updated.goalTime,
      graceMinutes: updated.graceMinutes,
      notifyGroup: updated.notifyGroup,
    };
  });
}
