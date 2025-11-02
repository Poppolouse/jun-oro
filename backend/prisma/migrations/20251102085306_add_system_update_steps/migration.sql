/*
  Warnings:

  - You are about to drop the column `subtasks` on the `system_updates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "system_updates" DROP COLUMN "subtasks";

-- CreateTable
CREATE TABLE "system_update_steps" (
    "id" TEXT NOT NULL,
    "updateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "system_update_steps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "system_update_steps" ADD CONSTRAINT "system_update_steps_updateId_fkey" FOREIGN KEY ("updateId") REFERENCES "system_updates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
