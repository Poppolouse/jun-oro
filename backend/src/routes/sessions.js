import express from "express";
import { prisma } from "../lib/prisma.js";
import {
  createSessionSchema,
  updateSessionSchema,
  endSessionSchema,
  idParamSchema,
} from "../lib/validation.js";

const router = express.Router();

// GET /api/sessions/:userId - Get user's sessions
router.get("/:userId", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { active } = req.query;

    const where = { userId };
    if (active !== undefined) {
      where.isActive = active === "true";
    }

    const sessions = await prisma.gameSession.findMany({
      where,
      include: {
        game: {
          select: {
            id: true,
            name: true,
            cover: true,
          },
        },
      },
      orderBy: { startTime: "desc" },
    });

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/sessions/:userId - Create new session
router.post("/:userId", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const validatedData = createSessionSchema.parse(req.body);

    // End any existing active sessions for this user
    await endExistingActiveSessions(userId);

    // Create new session
    const session = await createNewSession(userId, validatedData);

    res.status(201).json({
      success: true,
      data: session,
      message: "Session started successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Ends existing active sessions for a user
 * @param {string} userId - User ID
 * @returns {Promise<object>} - Result of update operation
 */
async function endExistingActiveSessions(userId) {
  return await prisma.gameSession.updateMany({
    where: {
      userId,
      isActive: true,
    },
    data: {
      isActive: false,
      endTime: new Date(),
    },
  });
}

/**
 * Creates a new game session
 * @param {string} userId - User ID
 * @param {object} validatedData - Validated session data
 * @returns {Promise<object>} - Created session
 */
async function createNewSession(userId, validatedData) {
  return await prisma.gameSession.create({
    data: {
      ...validatedData,
      userId,
      startTime: validatedData.startTime
        ? new Date(validatedData.startTime)
        : new Date(),
    },
    include: {
      game: {
        select: {
          id: true,
          name: true,
          cover: true,
        },
      },
    },
  });
}

// PUT /api/sessions/:sessionId - Update session
router.put("/:sessionId", async (req, res, next) => {
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
            cover: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: session,
      message: "Session updated successfully",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/sessions/:sessionId/end - End session
router.post("/:sessionId/end", async (req, res, next) => {
  try {
    const { id: sessionId } = idParamSchema.parse({ id: req.params.sessionId });
    const { endTime, playtime: providedPlaytime } = endSessionSchema.parse(
      req.body,
    );

    // Get current session to calculate playtime if not provided
    const currentSession = await findSessionById(sessionId);
    if (!currentSession) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    // Calculate final playtime
    const { endDateTime, finalPlaytime } = calculateFinalPlaytime(
      currentSession,
      endTime,
      providedPlaytime,
    );

    // End the session
    const session = await endSession(sessionId, endDateTime, finalPlaytime);

    // Update related data
    await updateSessionRelatedData(session, endDateTime, finalPlaytime);

    res.json({
      success: true,
      data: session,
      message: "Session ended successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Finds session by ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<object|null>} - Session data or null
 */
async function findSessionById(sessionId) {
  return await prisma.gameSession.findUnique({
    where: { id: sessionId },
  });
}

/**
 * Calculates final playtime for a session
 * @param {object} currentSession - Current session data
 * @param {string} endTime - End time
 * @param {number} providedPlaytime - Provided playtime (optional)
 * @returns {object} - Calculated end time and playtime
 */
function calculateFinalPlaytime(currentSession, endTime, providedPlaytime) {
  const endDateTime = new Date(endTime);
  const calculatedPlaytime = Math.floor(
    (endDateTime - currentSession.startTime) / 1000 / 60,
  ); // minutes
  const finalPlaytime = providedPlaytime ?? calculatedPlaytime;

  return { endDateTime, finalPlaytime };
}

/**
 * Ends a session with calculated data
 * @param {string} sessionId - Session ID
 * @param {Date} endDateTime - End datetime
 * @param {number} finalPlaytime - Final playtime in minutes
 * @returns {Promise<object>} - Updated session
 */
async function endSession(sessionId, endDateTime, finalPlaytime) {
  return await prisma.gameSession.update({
    where: { id: sessionId },
    data: {
      endTime: endDateTime,
      playtime: finalPlaytime,
      isActive: false,
    },
    include: {
      game: true,
      user: true,
    },
  });
}

/**
 * Updates user stats and library entry after session ends
 * @param {object} session - Session data
 * @param {Date} endDateTime - End datetime
 * @param {number} finalPlaytime - Final playtime in minutes
 * @returns {Promise<void>}
 */
async function updateSessionRelatedData(session, endDateTime, finalPlaytime) {
  await Promise.all([
    // Update user stats
    prisma.userStats.upsert({
      where: { userId: session.userId },
      update: {
        totalPlayTime: { increment: finalPlaytime },
        totalSessions: { increment: 1 },
        lastPlayedGame: session.gameId,
        lastPlayedAt: endDateTime,
      },
      create: {
        userId: session.userId,
        totalPlayTime: finalPlaytime,
        totalSessions: 1,
        lastPlayedGame: session.gameId,
        lastPlayedAt: new Date(endDateTime),
      },
    }),
    // Update library entry playtime directly
    prisma.libraryEntry.updateMany({
      where: {
        userId: session.userId,
        gameId: session.gameId,
      },
      data: {
        playtime: { increment: finalPlaytime },
        lastPlayed: new Date(endDateTime),
      },
    }),
  ]);
}

// GET /api/sessions/:userId/history - Get session history
router.get("/:userId/history", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [history, total] = await getSessionHistory(userId, skip, limit);

    res.json({
      success: true,
      data: history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Gets session history with pagination
 * @param {string} userId - User ID
 * @param {number} skip - Number of records to skip
 * @param {number} limit - Number of records to take
 * @returns {Promise<Array>} - Array containing history and total count
 */
async function getSessionHistory(userId, skip, limit) {
  const historyWhere = {
    userId,
    isActive: false,
    endTime: { not: null },
  };

  return await Promise.all([
    prisma.gameSession.findMany({
      where: historyWhere,
      skip: parseInt(skip),
      take: parseInt(limit),
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
    prisma.gameSession.count({ where: historyWhere }),
  ]);
}

// DELETE /api/sessions/:sessionId - Delete session
router.delete("/:sessionId", async (req, res, next) => {
  try {
    const { id: sessionId } = idParamSchema.parse({ id: req.params.sessionId });

    await prisma.gameSession.delete({
      where: { id: sessionId },
    });

    res.json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
