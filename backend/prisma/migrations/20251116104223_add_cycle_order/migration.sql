-- AlterTable
ALTER TABLE "cycles" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing cycles with a deterministic order per user
WITH ordered_cycles AS (
	SELECT
		"id",
		ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt") - 1 AS new_order
	FROM "cycles"
)
UPDATE "cycles" AS c
SET "order" = oc.new_order
FROM ordered_cycles AS oc
WHERE c."id" = oc."id";
