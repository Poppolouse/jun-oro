import express from 'express';
import { prisma } from '../lib/prisma.js';
import { idParamSchema } from '../lib/validation.js';

const router = express.Router();

// GET /api/stats/:userId - Get user stats
router.get('/:userId', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });

    const stats = await prisma.userStats.findUnique({
      where: { userId }
    });

    if (!stats) {
      // Create default stats if they don't exist
      const defaultStats = await prisma.userStats.create({
        data: { userId }
      });
      
      return res.json({
        success: true,
        data: defaultStats
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/stats/:userId/dashboard - Get dashboard stats
router.get('/:userId/dashboard', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });

    // Get user library entries
    const libraryEntries = await prisma.libraryEntry.findMany({
      where: { userId },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            cover: true,
            genres: true,
            platforms: true
          }
        }
      }
    });

    // Get user stats
    const userStats = await prisma.userStats.findUnique({
      where: { userId }
    });

    // Get recent sessions
    const recentSessions = await prisma.session_history.findMany({
      where: { userId },
      take: 5,
      orderBy: { endTime: 'desc' },
      include: {
        games: {
          select: {
            id: true,
            name: true,
            cover: true
          }
        }
      }
    });

    // Calculate stats
    const totalGames = libraryEntries.length || 0;
    const totalPlayTime = userStats?.totalPlayTime || 0;
    const totalSessions = userStats?.totalSessions || 0;

    // Category distribution
    const categoryStats = {};
    libraryEntries.forEach(entry => {
      const category = entry.category || 'Uncategorized';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    // Genre distribution
    const genreStats = {};
    libraryEntries.forEach(entry => {
      entry.game.genres?.forEach(genre => {
        genreStats[genre] = (genreStats[genre] || 0) + 1;
      });
    });

    // Platform distribution
    const platformStats = {};
    libraryEntries.forEach(entry => {
      entry.game.platforms?.forEach(platform => {
        platformStats[platform] = (platformStats[platform] || 0) + 1;
      });
    });

    // Most played games
    const mostPlayedGames = libraryEntries
      .filter(entry => entry.playtime > 0)
      .sort((a, b) => b.playtime - a.playtime)
      .slice(0, 5)
      .map(entry => ({
        game: entry.game,
        playtime: entry.playtime,
        lastPlayed: entry.lastPlayed
      }));

    // Recently added games
    const recentlyAdded = libraryEntries
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      .slice(0, 5)
      .map(entry => ({
        game: entry.game,
        addedAt: entry.addedAt,
        category: entry.category
      }));

    res.json({
      success: true,
      data: {
        overview: {
          totalGames,
          totalPlayTime,
          totalSessions,
          averageSessionTime: totalSessions > 0 ? Math.round(totalPlayTime / totalSessions) : 0
        },
        distributions: {
          categories: categoryStats,
          genres: genreStats,
          platforms: platformStats
        },
        mostPlayedGames,
        recentlyAdded,
        recentSessions,
        lastPlayedGame: userStats?.lastPlayedGameData || null,
        lastPlayedAt: userStats?.lastPlayedAt || null
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/stats/:userId/playtime - Get playtime analytics
router.get('/:userId/playtime', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { period = '30d' } = req.query;

    let dateFilter = new Date();
    switch (period) {
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case '90d':
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
      case '1y':
        dateFilter.setFullYear(dateFilter.getFullYear() - 1);
        break;
      default:
        dateFilter.setDate(dateFilter.getDate() - 30);
    }

    const sessions = await prisma.session_history.findMany({
      where: {
        userId,
        endTime: {
          gte: dateFilter
        }
      },
      orderBy: { endTime: 'asc' },
      include: {
        game: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Group by date
    const dailyPlaytime = {};
    sessions.forEach(session => {
      const date = session.endTime.toISOString().split('T')[0];
      dailyPlaytime[date] = (dailyPlaytime[date] || 0) + session.playtime;
    });

    // Group by game
    const gamePlaytime = {};
    sessions.forEach(session => {
      const gameId = session.gameId;
      if (!gamePlaytime[gameId]) {
        gamePlaytime[gameId] = {
          game: session.game,
          totalPlaytime: 0,
          sessionCount: 0
        };
      }
      gamePlaytime[gameId].totalPlaytime += session.playtime;
      gamePlaytime[gameId].sessionCount += 1;
    });

    const topGames = Object.values(gamePlaytime)
      .sort((a, b) => b.totalPlaytime - a.totalPlaytime)
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        period,
        dailyPlaytime,
        topGames,
        totalSessions: sessions.length,
        totalPlaytime: sessions.reduce((sum, session) => sum + session.playtime, 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/stats/:userId/recalculate - Recalculate user stats
router.post('/:userId/recalculate', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });

    // Get all session history
    const sessions = await prisma.session_history.findMany({
      where: { userId }
    });

    // Get library entries
    const libraryEntries = await prisma.libraryEntry.findMany({
      where: { userId }
    });

    // Calculate totals
    const totalPlayTime = sessions.reduce((sum, session) => sum + session.playtime, 0);
    const totalSessions = sessions.length;
    
    // Find last played game
    const lastSession = sessions
      .sort((a, b) => new Date(b.endTime) - new Date(a.endTime))[0];

    const stats = await prisma.userStats.upsert({
      where: { userId },
      update: {
        totalPlayTime,
        totalSessions,
        totalGames: libraryEntries.length || 0,
        lastPlayedGame: lastSession?.gameId || null,
        lastPlayedAt: lastSession?.endTime || null
      },
      create: {
        userId,
        totalPlayTime,
        totalSessions,
        totalGames: libraryEntries.length || 0,
        lastPlayedGame: lastSession?.gameId || null,
        lastPlayedAt: lastSession?.endTime || null
      }
    });

    res.json({
      success: true,
      data: stats,
      message: 'Stats recalculated successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;