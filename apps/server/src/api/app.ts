import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { env } from "../config/env.ts";
import { requireTelegramAuth } from "./middleware/telegramAuth.ts";
import { meRoutes } from "./routes/me.ts";
import { checkinRoutes } from "./routes/checkin.ts";
import { groupRoutes } from "./routes/group.ts";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: env.CORS_ORIGIN, methods: ["GET", "POST", "PATCH"] });

  app.get("/health", async () => ({ ok: true }));

  await app.register(async (api) => {
    api.addHook("preHandler", requireTelegramAuth);
    await api.register(meRoutes);
    await api.register(checkinRoutes);
    await api.register(groupRoutes);
  });

  return app;
}
