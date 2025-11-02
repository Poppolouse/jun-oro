import express from 'express';
import { prisma } from '../lib/prisma.js';
import { createSessionSchema, updateSessionSchema, endSessionSchema, idParamSchema } from '../lib/validation.js';

const router = express.Router();

// GET /api/sessions/:userId - Get user's sessions
router.get('/:userId', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { active } = req.query;

    const where = { userId };
    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const sessions = await prisma.gameSession.findMany({
      where,
      include: {
        game: {
          select: {
            id: true,
            name: true,
            cover: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/sessions/:userId - Create new session
router.post('/:userId', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const validatedData = createSessionSchema.parse(req.body);

    // End any existing active sessions for this user
    await prisma.gameSession.updateMany({
      where: {
        userId,
        isActive: true
      },
      data: {
        isActive: false,
        endTime: new Date()
      }
    });

    const session = await prisma.gameSession.create({
      data: {
        ...validatedData,
        userId,
        startTime: validatedData.startTime ? new Date(validatedData.startTime) : new Date()
      },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            cover: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: session,
      message: 'Session started successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/sessions/:sessionId - Update session
router.put('/:sessionId', async (req, res, next) => {
  try {
    const { id: sessionId } = idParamSchema.parse({ id: req.params.sessionId });
    const validatedData = updateSessionSchema.parse(req.body);

    const session = await prisma.gameSession.update({
      where: { id: sessionId },
      data: validatedData,
      include: {
        game: {
          select: {
            id: true,
            name: true,
            cover: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: session,
      message: 'Session updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/sessions/:sessionId/end - End session
router.post('/:sessionId/end', async (req, res, next) => {
  try {
    const { id: sessionId } = idParamSchema.parse({ id: req.params.sessionId });
    const { endTime, playtime: providedPlaytime } = endSessionSchema.parse(req.body);

    // Get current session to calculate playtime if not provided
    const currentSession = await prisma.gameSession.findUnique({
      where: { id: sessionId }
    });

    if (!currentSession) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Calculate playtime if not provided
    const endDateTime = new Date(endTime);
    const calculatedPlaytime = Math.floor((endDateTime - currentSession.startTime) / 1000 / 60); // minutes
    const finalPlaytime = providedPlaytime ?? calculatedPlaytime;

    const session = await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        endTime: endDateTime,
        playtime: finalPlaytime,
        isActive: false
      },
      include: {
        game: true,
        user: true
      }
    });

    // Create session history entry
    await prisma.session_history.create({
      data: {
        id: `sh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: session.userId,
        gameId: session.gameId,
        gameName: session.gameName,
        startTime: session.startTime,
        endTime: session.endTime,
        playtime: session.playtime,
        campaigns: session.campaigns,
        platform: session.platform,
        status: 'COMPLETED'
      }
    });

    // Update user stats
    await prisma.userStats.upsert({
      where: { userId: session.userId },
      update: {
        totalPlayTime: { increment: finalPlaytime },
        totalSessions: { increment: 1 },
        lastPlayedGame: session.gameId,
        lastPlayedAt: endDateTime
      },
      create: {
        userId: session.userId,
        totalPlayTime: finalPlaytime,
        totalSessions: 1,
        lastPlayedGame: session.gameId,
        lastPlayedAt: new Date(endTime)
      }
    });

    // Update library entry playtime
    const library = await prisma.user_libraries.findUnique({
      where: { userId: session.userId }
    });

    if (library) {
      await prisma.libraryEntry.updateMany({
        where: {
          libraryId: library.id,
          gameId: session.gameId
        },
        data: {
          playtime: { increment: finalPlaytime },
          lastPlayed: new Date(endTime)
        }
      });
    }

    res.json({
      success: true,
      data: session,
      message: 'Session ended successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/sessions/:userId/history - Get session history
router.get('/:userId/history', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      prisma.sessionHistory.findMany({
        where: { userId },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { endTime: 'desc' },
        include: {
          game: {
            select: {
              id: true,
              name: true,
              cover: true
            }
          }
        }
      }),
      prisma.sessionHistory.count({ where: { userId } })
    ]);

    res.json({
      success: true,
      data: history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/sessions/:sessionId - Delete session
router.delete('/:sessionId', async (req, res, next) => {
  try {
    const { id: sessionId } = idParamSchema.parse({ id: req.params.sessionId });

    await prisma.gameSession.delete({
      where: { id: sessionId }
    });

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;