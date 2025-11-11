import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateLibraryData() {
  try {
    console.log("Starting library data migration...");

    // Get all user libraries
    const userLibraries = await prisma.userLibrary.findMany({
      include: {
        entries: true,
      },
    });

    console.log(`Found ${userLibraries.length} user libraries to migrate`);

    for (const userLibrary of userLibraries) {
      console.log(`Migrating library for user ${userLibrary.userId}...`);

      for (const entry of userLibrary.entries) {
        // Check if entry already exists in new structure
        const existingEntry = await prisma.libraryEntry.findFirst({
          where: {
            userId: userLibrary.userId,
            gameId: entry.gameId,
          },
        });

        if (!existingEntry) {
          // Create new library entry with direct user relation
          await prisma.libraryEntry.create({
            data: {
              userId: userLibrary.userId,
              gameId: entry.gameId,
              category: entry.category || "WISHLIST",
              playtime: entry.playtime || 0,
              rating: entry.rating,
              notes: entry.notes,
              progress: entry.progress || 0,
              priority: 3, // Default priority
              isPublic: true, // Default to public
              tags: [], // Empty tags array
              lastPlayed: entry.lastPlayed,
              addedAt: entry.addedAt || new Date(),
              updatedAt: new Date(),
            },
          });
          console.log(`  Migrated entry for game ${entry.gameId}`);
        } else {
          console.log(
            `  Entry for game ${entry.gameId} already exists, skipping`,
          );
        }
      }
    }

    console.log("Library data migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateLibraryData().catch((error) => {
  console.error("Migration script failed:", error);
  process.exit(1);
});
