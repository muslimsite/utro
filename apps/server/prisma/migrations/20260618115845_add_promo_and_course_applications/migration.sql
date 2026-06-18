-- AlterTable
ALTER TABLE "User" ADD COLUMN "promoUnlockedAt" DATETIME;

-- CreateTable
CREATE TABLE "CourseApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tariff" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupFilledAt" DATETIME,
    CONSTRAINT "CourseApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseApplication_userId_tariff_key" ON "CourseApplication"("userId", "tariff");
