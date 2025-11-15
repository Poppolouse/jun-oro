/*
  Warnings:

  - You are about to drop the column `progress` on the `library_entries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "library_entries" DROP COLUMN "progress",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'backlog';

-- CreateTable
CREATE TABLE "cycles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gameIds" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'planned',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "cycles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cycles" ADD CONSTRAINT "cycles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
