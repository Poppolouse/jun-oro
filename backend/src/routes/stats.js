import express from "express";
import { prisma } from "../lib/prisma.js";
import { idParamSchema } from "../lib/validation.js";

const router = express.Router();

// GET /api/stats/:userId - Get user stats
router.get("/:userId", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });

    const stats = await prisma.userStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      // Create default stats if they don't exist
      const defaultStats = await prisma.userStats.create({
        data: { userId },
      });

      return res.json({
        success: true,
        data: defaultStats,
      });
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/stats/:userId/dashboard - Get dashboard stats
router.get("/:userId/dashboard", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });

    // Get required data
    const [libraryEntries, userStats, recentSessions] =
      await getDashboardData(userId);

    // Calculate overview stats
    const overview = calculateOverviewStats(libraryEntries, userStats);

    // Calculate distributions
    const distributions = calculateDistributions(libraryEntries);

    // Get most played games
    const mostPlayedGames = getMostPlayedGames(libraryEntries);

    // Get recently added games
    const recentlyAdded = getRecentlyAddedGames(libraryEntries);

    res.json({
      success: true,
      data: {
        overview,
        distributions,
        mostPlayedGames,
        recentlyAdded,
        recentSessions,
        lastPlayedGame: userStats?.lastPlayedGameData || null,
        lastPlayedAt: userStats?.lastPlayedAt || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Gets dashboard data from database
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array containing library entries, user stats, and recent sessions
 */
async function getDashboardData(userId) {
  return await Promise.all([
    // Get user library entries
    prisma.libraryEntry.findMany({
      where: { userId },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            cover: true,
            genres: true,
            platforms: true,
          },
        },
      },
    }),
    // Get user stats
    prisma.userStats.findUnique({
      where: { userId },
    }),
    // Get recent sessions from GameSession (completed sessions)
    prisma.gameSession.findMany({
      where: {
        userId,
        isActive: false,
        endTime: { not: null },
      },
      take: 5,
      orderBy: { endTime: "desc" },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            cover: true,
          },
        },
      },
    }),
  ]);
}

/**
 * Calculates overview statistics for dashboard
 * @param {Array} libraryEntries - User's library entries
 * @param {object} userStats - User statistics
 * @returns {object} - Overview statistics
 */
function calculateOverviewStats(libraryEntries, userStats) {
  const totalGames = libraryEntries.length || 0;
  const totalPlayTime = userStats?.totalPlayTime || 0;
  const totalSessions = userStats?.totalSessions || 0;

  return {
    totalGames,
    totalPlayTime,
    totalSessions,
    averageSessionTime:
      totalSessions > 0 ? Math.round(totalPlayTime / totalSessions) : 0,
  };
}

/**
 * Calculates category, genre, and platform distributions
 * @param {Array} libraryEntries - User's library entries
 * @returns {object} - Distribution statistics
 */
function calculateDistributions(libraryEntries) {
  // Category distribution
  const categoryStats = {};
  libraryEntries.forEach((entry) => {
    const category = entry.category || "Uncategorized";
    categoryStats[category] = (categoryStats[category] || 0) + 1;
  });

  // Genre distribution
  const genreStats = {};
  libraryEntries.forEach((entry) => {
    entry.game.genres?.forEach((genre) => {
      genreStats[genre] = (genreStats[genre] || 0) + 1;
    });
  });

  // Platform distribution
  const platformStats = {};
  libraryEntries.forEach((entry) => {
    entry.game.platforms?.forEach((platform) => {
      platformStats[platform] = (platformStats[platform] || 0) + 1;
    });
  });

  return {
    categories: categoryStats,
    genres: genreStats,
    platforms: platformStats,
  };
}

/**
 * Gets most played games from library entries
 * @param {Array} libraryEntries - User's library entries
 * @returns {Array} - Most played games array
 */
function getMostPlayedGames(libraryEntries) {
  return libraryEntries
    .filter((entry) => entry.playtime > 0)
    .sort((a, b) => b.playtime - a.playtime)
    .slice(0, 5)
    .map((entry) => ({
      game: entry.game,
      playtime: entry.playtime,
      lastPlayed: entry.lastPlayed,
    }));
}

/**
 * Gets recently added games from library entries
 * @param {Array} libraryEntries - User's library entries
 * @returns {Array} - Recently added games array
 */
function getRecentlyAddedGames(libraryEntries) {
  return libraryEntries
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    .slice(0, 5)
    .map((entry) => ({
      game: entry.game,
      addedAt: entry.addedAt,
      category: entry.category,
    }));
}

// GET /api/stats/:userId/playtime - Get playtime analytics
router.get("/:userId/playtime", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { period = "30d" } = req.query;

    // Calculate date filter based on period
    const dateFilter = calculateDateFilter(period);

    // Get sessions within the period
    const sessions = await prisma.gameSession.findMany({
      where: {
        userId,
        endTime: {
          gte: dateFilter,
        },
        isActive: false,
      },
      orderBy: { endTime: "asc" },
      include: {
        game: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate playtime analytics
    const analytics = calculatePlaytimeAnalytics(sessions);

    res.json({
      success: true,
      data: {
        period,
        ...analytics,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Calculates date filter based on period string
 * @param {string} period - Period string (7d, 30d, 90d, 1y)
 * @returns {Date} - Date filter
 */
function calculateDateFilter(period) {
  const dateFilter = new Date();

  switch (period) {
    case "7d":
      dateFilter.setDate(dateFilter.getDate() - 7);
      break;
    case "30d":
      dateFilter.setDate(dateFilter.getDate() - 30);
      break;
    case "90d":
      dateFilter.setDate(dateFilter.getDate() - 90);
      break;
    case "1y":
      dateFilter.setFullYear(dateFilter.getFullYear() - 1);
      break;
    default:
      dateFilter.setDate(dateFilter.getDate() - 30);
  }

  return dateFilter;
}

/**
 * Calculates playtime analytics from sessions
 * @param {Array} sessions - Game sessions
 * @returns {object} - Playtime analytics
 */
function calculatePlaytimeAnalytics(sessions) {
  // Group by date
  const dailyPlaytime = {};
  sessions.forEach((session) => {
    const date = session.endTime.toISOString().split("T")[0];
    dailyPlaytime[date] = (dailyPlaytime[date] || 0) + session.playtime;
  });

  // Group by game
  const gamePlaytime = {};
  sessions.forEach((session) => {
    const gameId = session.gameId;
    if (!gamePlaytime[gameId]) {
      gamePlaytime[gameId] = {
        game: session.game,
        totalPlaytime: 0,
        sessionCount: 0,
      };
    }
    gamePlaytime[gameId].totalPlaytime += session.playtime;
    gamePlaytime[gameId].sessionCount += 1;
  });

  const topGames = Object.values(gamePlaytime)
    .sort((a, b) => b.totalPlaytime - a.totalPlaytime)
    .slice(0, 10);

  return {
    dailyPlaytime,
    topGames,
    totalSessions: sessions.length,
    totalPlaytime: sessions.reduce((sum, session) => sum + session.playtime, 0),
  };
}

// POST /api/stats/:userId/recalculate - Recalculate user stats
router.post("/:userId/recalculate", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });

    // Get required data for recalculation
    const [sessions, libraryEntries] = await getRecalculationData(userId);

    // Calculate new stats
    const calculatedStats = calculateRecalculatedStats(
      sessions,
      libraryEntries,
    );

    // Update user stats
    const stats = await prisma.userStats.upsert({
      where: { userId },
      update: calculatedStats,
      create: { userId, ...calculatedStats },
    });

    res.json({
      success: true,
      data: stats,
      message: "Stats recalculated successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Gets data needed for stats recalculation
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array containing sessions and library entries
 */
async function getRecalculationData(userId) {
  return await Promise.all([
    // Get all completed sessions from GameSession
    prisma.gameSession.findMany({
      where: {
        userId,
        isActive: false,
        endTime: { not: null },
      },
    }),
    // Get library entries
    prisma.libraryEntry.findMany({
      where: { userId },
    }),
  ]);
}

/**
 * Calculates recalculated statistics
 * @param {Array} sessions - User's game sessions
 * @param {Array} libraryEntries - User's library entries
 * @returns {object} - Calculated statistics
 */
function calculateRecalculatedStats(sessions, libraryEntries) {
  // Calculate totals
  const totalPlayTime = sessions.reduce(
    (sum, session) => sum + session.playtime,
    0,
  );
  const totalSessions = sessions.length;

  // Find last played game
  const lastSession = sessions.sort(
    (a, b) => new Date(b.endTime) - new Date(a.endTime),
  )[0];

  return {
    totalPlayTime,
    totalSessions,
    totalGames: libraryEntries.length || 0,
    lastPlayedGame: lastSession?.gameId || null,
    lastPlayedAt: lastSession?.endTime || null,
  };
}

export default router;
