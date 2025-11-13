import express from "express";
import { prisma } from "../lib/prisma.js";
import {
  addToLibrarySchema,
  updateLibraryEntrySchema,
  idParamSchema,
  paginationSchema,
} from "../lib/validation.js";
import {
  createLibraryEntryWithTransaction,
  updateGameWithTransaction,
} from "../middleware/transactionMiddleware.js";

const router = express.Router();

// GET /api/library/:userId - Get user's library
router.get("/:userId", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const {
      page,
      limit,
      sortBy = "addedAt",
      sortOrder,
    } = paginationSchema.parse(req.query);
    const { category, search } = req.query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = buildLibraryWhereClause(userId, category, search);

    const [entries, total] = await Promise.all([
      prisma.libraryEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          game: {
            select: {
              id: true,
              name: true,
              cover: true,
              rating: true,
              developer: true,
              genres: true,
              platforms: true,
              firstReleaseDate: true,
            },
          },
        },
      }),
      prisma.libraryEntry.count({ where }),
    ]);

    // Calculate stats from entries
    const stats = calculateLibraryStats(entries, total);

    res.json({
      success: true,
      data: {
        entries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Builds where clause for library queries
 * @param {string} userId - User ID
 * @param {string} category - Category filter (optional)
 * @param {string} search - Search term (optional)
 * @returns {object} - Where clause object
 */
function buildLibraryWhereClause(userId, category, search) {
  const where = { userId };

  if (category) {
    where.category = category;
  }

  if (search) {
    where.game = {
      name: { contains: search, mode: "insensitive" },
    };
  }

  return where;
}

/**
 * Calculates library statistics
 * @param {Array} entries - Library entries
 * @param {number} total - Total count
 * @returns {object} - Library statistics
 */
function calculateLibraryStats(entries, total) {
  const totalGames = total;
  const totalPlaytime = entries.reduce(
    (sum, entry) => sum + (entry.playtime || 0),
    0,
  );

  return {
    totalGames,
    totalPlaytime,
    lastUpdated: new Date(),
  };
}

// POST /api/library/:userId/games - Add game to library (with transaction)
router.post("/:userId/games", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const validatedData = addToLibrarySchema.parse(req.body);

    // Add game to library with transaction
    const entry = await createLibraryEntryWithTransaction(
      userId,
      validatedData,
    );

    res.status(201).json({
      success: true,
      data: entry,
      message: "Game added to library successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Finds existing library entry
 * @param {string} userId - User ID
 * @param {string} gameId - Game ID
 * @returns {Promise<object|null>} - Existing entry or null
 */
async function findExistingLibraryEntry(userId, gameId) {
  return await prisma.libraryEntry.findUnique({
    where: {
      userId_gameId: {
        userId,
        gameId,
      },
    },
  });
}

/**
 * Creates a new library entry
 * @param {string} userId - User ID
 * @param {object} validatedData - Validated data
 * @returns {Promise<object>} - Created entry
 */
async function createLibraryEntry(userId, validatedData) {
  return await prisma.libraryEntry.create({
    data: {
      ...validatedData,
      userId,
    },
    include: {
      game: {
        select: {
          id: true,
          name: true,
          cover: true,
          rating: true,
          developer: true,
        },
      },
    },
  });
}

// PUT /api/library/:userId/games/:gameId - Update library entry (with transaction)
router.put("/:userId/games/:gameId", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { id: gameId } = idParamSchema.parse({ id: req.params.gameId });
    const validatedData = updateLibraryEntrySchema.parse(req.body);

    // Update library entry with transaction
    const entry = await updateLibraryEntry(userId, gameId, validatedData);

    res.json({
      success: true,
      data: entry,
      message: "Library entry updated successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Updates a library entry
 * @param {string} userId - User ID
 * @param {string} gameId - Game ID
 * @param {object} validatedData - Validated data
 * @returns {Promise<object>} - Updated entry
 */
async function updateLibraryEntry(userId, gameId, validatedData) {
  return await prisma.libraryEntry.update({
    where: {
      userId_gameId: {
        userId,
        gameId,
      },
    },
    data: validatedData,
    include: {
      game: {
        select: {
          id: true,
          name: true,
          cover: true,
          rating: true,
          developer: true,
        },
      },
    },
  });
}

// DELETE /api/library/:userId/games/:gameId - Remove game from library
router.delete("/:userId/games/:gameId", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { id: gameId } = idParamSchema.parse({ id: req.params.gameId });

    await deleteLibraryEntry(userId, gameId);

    res.json({
      success: true,
      message: "Game removed from library successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Deletes a library entry
 * @param {string} userId - User ID
 * @param {string} gameId - Game ID
 * @returns {Promise<object>} - Delete result
 */
async function deleteLibraryEntry(userId, gameId) {
  return await prisma.libraryEntry.delete({
    where: {
      userId_gameId: {
        userId,
        gameId,
      },
    },
  });
}

// GET /api/library/:userId/games/:gameId - Get specific library entry
router.get("/:userId/games/:gameId", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { id: gameId } = idParamSchema.parse({ id: req.params.gameId });

    const entry = await findLibraryEntryById(userId, gameId);
    if (!entry) {
      return res.status(404).json({
        success: false,
        error: "Game not found in library",
      });
    }

    res.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Finds library entry by user and game ID
 * @param {string} userId - User ID
 * @param {string} gameId - Game ID
 * @returns {Promise<object|null>} - Library entry or null
 */
async function findLibraryEntryById(userId, gameId) {
  return await prisma.libraryEntry.findUnique({
    where: {
      userId_gameId: {
        userId,
        gameId,
      },
    },
    include: {
      game: true,
    },
  });
}

// GET /api/library/:userId/stats - Get library statistics
router.get("/:userId/stats", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });

    // Optimized query with aggregation instead of fetching all entries
    const [totalEntries, totalPlaytime, categoryStats, entriesWithGames] =
      await Promise.all([
        prisma.libraryEntry.count({
          where: { userId },
        }),
        prisma.libraryEntry.aggregate({
          where: { userId },
          _sum: { playtime: true },
        }),
        prisma.libraryEntry.groupBy({
          by: ["category"],
          where: { userId },
          _count: { category: true },
        }),
        prisma.libraryEntry.findMany({
          where: { userId },
          select: {
            rating: true,
            lastPlayed: true,
            addedAt: true,
            playtime: true,
            game: {
              select: {
                name: true,
                genres: true,
                platforms: true,
                rating: true,
              },
            },
          },
          orderBy: { addedAt: "desc" },
          take: 10, // Only fetch recent entries for detailed stats
        }),
      ]);

    // Calculate statistics efficiently
    const stats = calculateOptimizedLibraryStats(
      totalEntries,
      totalPlaytime._sum.playtime || 0,
      categoryStats,
      entriesWithGames,
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Calculates optimized library statistics using aggregated data
 * @param {number} totalEntries - Total number of entries
 * @param {number} totalPlaytime - Total playtime from aggregation
 * @param {Array} categoryStats - Category statistics from groupBy
 * @param {Array} recentEntries - Recent entries with game data
 * @returns {object} - Optimized library statistics
 */
function calculateOptimizedLibraryStats(
  totalEntries,
  totalPlaytime,
  categoryStats,
  recentEntries,
) {
  // Calculate category distribution from grouped data
  const categoryDistribution = categoryStats.reduce((acc, stat) => {
    acc[stat.category] = stat._count.category;
    return acc;
  }, {});

  // Calculate genre and platform distribution from recent entries only
  const genreDistribution = recentEntries.reduce((acc, entry) => {
    if (entry.game.genres) {
      entry.game.genres.forEach((genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
      });
    }
    return acc;
  }, {});

  const platformDistribution = recentEntries.reduce((acc, entry) => {
    if (entry.game.platforms) {
      entry.game.platforms.forEach((platform) => {
        acc[platform] = (acc[platform] || 0) + 1;
      });
    }
    return acc;
  }, {});

  // Calculate average rating from recent entries
  const entriesWithRating = recentEntries.filter((entry) => entry.rating);
  const averageRating =
    entriesWithRating.length > 0
      ? entriesWithRating.reduce((sum, entry) => sum + entry.rating, 0) /
        entriesWithRating.length
      : 0;

  // Get recently added (already sorted by addedAt desc)
  const recentlyAdded = recentEntries.slice(0, 5).map((entry) => ({
    gameId: entry.gameId,
    gameName: entry.game.name,
    addedAt: entry.addedAt,
  }));

  // Get recently played
  const recentlyPlayed = recentEntries
    .filter((entry) => entry.lastPlayed)
    .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
    .slice(0, 5)
    .map((entry) => ({
      gameId: entry.gameId,
      gameName: entry.game.name,
      lastPlayed: entry.lastPlayed,
      playtime: entry.playtime,
    }));

  return {
    totalGames: totalEntries,
    totalPlaytime,
    averageRating,
    categoryDistribution,
    genreDistribution,
    platformDistribution,
    recentlyAdded,
    recentlyPlayed,
  };
}

// POST /api/library/:userId/import - Import library data
router.post("/:userId/import", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { entries } = req.body;

    if (!Array.isArray(entries)) {
      return res.status(400).json({
        success: false,
        error: "Entries array is required",
      });
    }

    const importResults = await processLibraryImport(userId, entries);

    res.json({
      success: true,
      data: importResults,
      message: `Import completed: ${importResults.successful} successful, ${importResults.failed} failed`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Processes library import data
 * @param {string} userId - User ID
 * @param {Array} entries - Entries to import
 * @returns {Promise<object>} - Import results
 */
async function processLibraryImport(userId, entries) {
  // Batch process in chunks to avoid overwhelming the database
  const BATCH_SIZE = 50;
  const results = [];

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map((entryData) => {
        const validatedData = addToLibrarySchema.parse(entryData);
        return prisma.libraryEntry.upsert({
          where: {
            userId_gameId: {
              userId,
              gameId: validatedData.gameId,
            },
          },
          update: validatedData,
          create: {
            ...validatedData,
            userId,
          },
        });
      }),
    );
    results.push(...batchResults);
  }

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return {
    total: entries.length,
    successful,
    failed,
  };
}

export default router;
