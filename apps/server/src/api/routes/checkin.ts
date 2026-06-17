import type { FastifyInstance } from "fastify";
import { checkIn, AlreadyCheckedInError, GoalNotSetError } from "../../services/checkinService.ts";

export async function checkinRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/checkin", async (request, reply) => {
    try {
      const result = await checkIn(request.dbUser.id);
      return { ok: true, ...result };
    } catch (err) {
      if (err instanceof AlreadyCheckedInError) {
        return reply.code(409).send({ error: "already_checked_in" });
      }
      if (err instanceof GoalNotSetError) {
        return reply.code(400).send({ error: "goal_not_set" });
      }
      throw err;
    }
  });
}
