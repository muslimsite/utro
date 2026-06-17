import { createHmac } from "node:crypto";
import type { FastifyRequest, FastifyReply } from "fastify";
import { env } from "../../config/env.ts";
import { getOrCreateUser } from "../../services/userService.ts";
import type { User } from "../../generated/prisma/client.ts";

interface TelegramAuthUser {
  id: number;
  username?: string;
  first_name?: string;
}

function parseInitData(initData: string): { valid: boolean; user?: TelegramAuthUser } {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { valid: false };
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(env.BOT_TOKEN).digest();
  const computedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  if (computedHash !== hash) return { valid: false };

  const userRaw = params.get("user");
  if (!userRaw) return { valid: false };

  try {
    return { valid: true, user: JSON.parse(userRaw) as TelegramAuthUser };
  } catch {
    return { valid: false };
  }
}

declare module "fastify" {
  interface FastifyRequest {
    dbUser: User;
  }
}

// Validates the Telegram WebApp `initData` per Telegram's documented signature
// scheme: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
export async function requireTelegramAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (env.ALLOW_DEV_AUTH) {
    const devId = request.headers["x-dev-telegram-id"];
    if (typeof devId === "string" && devId.length > 0) {
      request.dbUser = await getOrCreateUser({ telegramId: devId, firstName: "Dev" });
      return;
    }
  }

  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("tma ")) {
    await reply.code(401).send({ error: "Missing Telegram authorization header" });
    return;
  }

  const result = parseInitData(authHeader.slice(4));
  if (!result.valid || !result.user) {
    await reply.code(401).send({ error: "Invalid Telegram signature" });
    return;
  }

  request.dbUser = await getOrCreateUser({
    telegramId: String(result.user.id),
    username: result.user.username,
    firstName: result.user.first_name,
  });
}
