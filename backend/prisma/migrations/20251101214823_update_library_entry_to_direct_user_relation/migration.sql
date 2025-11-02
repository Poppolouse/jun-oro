/*
  Warnings:

  - You are about to drop the column `libraryId` on the `library_entries` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,gameId]` on the table `library_entries` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `library_entries` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."library_entries" DROP CONSTRAINT "library_entries_libraryId_fkey";

-- DropIndex
DROP INDEX "public"."library_entries_libraryId_gameId_key";

-- AlterTable
ALTER TABLE "library_entries" DROP COLUMN "libraryId",
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN     "tags" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "library_entries_userId_gameId_key" ON "library_entries"("userId", "gameId");

-- AddForeignKey
ALTER TABLE "library_entries" ADD CONSTRAINT "library_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
