-- AlterTable
ALTER TABLE "changelogs" ADD COLUMN     "releaseDate" TIMESTAMP(3),
ALTER COLUMN "publishedAt" DROP NOT NULL;
