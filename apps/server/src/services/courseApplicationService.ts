import { prisma } from "../db/prisma.ts";

export type Tariff = "ideal_morning" | "personal_birds";

// "Ранний подъём" has instant automatic access (see COURSE_PAYMENT_URL) and
// isn't gated by a cohort, so it has no entry here.
export const TARIFF_THRESHOLDS: Record<Tariff, number> = {
  ideal_morning: 30,
  personal_birds: 15,
};

export const TARIFF_LABELS: Record<Tariff, string> = {
  ideal_morning: "«Идеальное утро»",
  personal_birds: "«Личные пташки Солихи»",
};

export interface ApplyResult {
  alreadyApplied: boolean;
  position: number;
  threshold: number;
  // Set to the userIds of everyone in the batch when this application just filled
  // the cohort, so the caller can notify all of them in one go.
  filledUserIds: string[] | null;
}

// Counts only still-open applications (groupFilledAt: null), so once a batch is
// marked filled the count naturally resets to zero for the next cohort.
export async function applyForCourse(userId: string, tariff: Tariff): Promise<ApplyResult> {
  const threshold = TARIFF_THRESHOLDS[tariff];
  const existing = await prisma.courseApplication.findUnique({
    where: { userId_tariff: { userId, tariff } },
  });

  if (existing) {
    const position = existing.groupFilledAt
      ? threshold
      : await prisma.courseApplication.count({
          where: { tariff, groupFilledAt: null, createdAt: { lte: existing.createdAt } },
        });
    return { alreadyApplied: true, position, threshold, filledUserIds: null };
  }

  await prisma.courseApplication.create({ data: { userId, tariff } });
  const open = await prisma.courseApplication.findMany({
    where: { tariff, groupFilledAt: null },
    orderBy: { createdAt: "asc" },
    select: { userId: true },
  });

  if (open.length < threshold) {
    return { alreadyApplied: false, position: open.length, threshold, filledUserIds: null };
  }

  await prisma.courseApplication.updateMany({
    where: { tariff, groupFilledAt: null },
    data: { groupFilledAt: new Date() },
  });

  return {
    alreadyApplied: false,
    position: open.length,
    threshold,
    filledUserIds: open.map((o) => o.userId),
  };
}
