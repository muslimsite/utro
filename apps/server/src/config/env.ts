import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  BOT_TOKEN: z.string().min(1),
  DATABASE_URL: z.string().min(1).default("file:./dev.db"),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default("*"),
  WEB_APP_URL: z.string().optional(),
  COURSE_URL: z.string().default("https://fajr-sestram.ru"),
  // Direct checkout link for the "Ранний подъём" tariff (instant automatic access).
  COURSE_PAYMENT_URL: z.string().default("https://monecle.com/buy/96317"),
  // Telegram numeric ID to notify when a cohort (Идеальное утро / Личные пташки) fills up.
  ADMIN_TELEGRAM_ID: z.string().optional(),
  ALLOW_DEV_AUTH: z
    .string()
    .optional()
    .transform((value) => value === "true"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  console.error(`Invalid environment configuration:\n${details}`);
  process.exit(1);
}

export const env = parsed.data;
