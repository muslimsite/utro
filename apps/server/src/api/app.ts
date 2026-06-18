import path from "node:path";
import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { env } from "../config/env.ts";
import { requireTelegramAuth } from "./middleware/telegramAuth.ts";
import { meRoutes } from "./routes/me.ts";
import { checkinRoutes } from "./routes/checkin.ts";
import { groupRoutes } from "./routes/group.ts";

// Built by `npm run build -w apps/web` (done in the Dockerfile during image build).
const WEB_DIST = path.join(import.meta.dirname, "../../../web/dist");

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

  await app.register(fastifyStatic, { root: WEB_DIST });

  return app;
}
