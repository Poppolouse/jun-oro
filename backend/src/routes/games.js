import express from 'express';
import { prisma } from '../lib/prisma.js';
import { createGameSchema, updateGameSchema, idParamSchema, paginationSchema } from '../lib/validation.js';

const router = express.Router();

// GET /api/games - Get all games with pagination and search
router.get('/', async (req, res, next) => {
  try {
    const { page, limit, sortBy = 'lastAccessed', sortOrder } = paginationSchema.parse(req.query);
    const { search, genre, platform } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { developer: { contains: search, mode: 'insensitive' } },
        { publisher: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (genre) {
      where.genres = {
        path: '$',
        array_contains: genre
      };
    }
    
    if (platform) {
      where.platforms = {
        path: '$',
        array_contains: platform
      };
    }

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              libraryEntries: true,
              sessions: true
            }
          }
        }
      }),
      prisma.game.count({ where })
    ]);

    res.json({
      success: true,
      data: games,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/games/:id - Get game by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        campaigns: {
          orderBy: { createdAt: 'desc' }
        },
        libraryEntries: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        _count: {
          select: {
            libraryEntries: true,
            sessions: true,
            campaigns: true
          }
        }
      }
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    // Update access count and last accessed
    await prisma.game.update({
      where: { id },
      data: {
        accessCount: { increment: 1 },
        lastAccessed: new Date()
      }
    });

    res.json({
      success: true,
      data: game
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/games - Create or update game (upsert)
router.post('/', async (req, res, next) => {
  try {
    const validatedData = createGameSchema.parse(req.body);

    const game = await prisma.game.upsert({
      where: { id: validatedData.id },
      update: {
        ...validatedData,
        lastAccessed: new Date(),
        accessCount: { increment: 1 }
      },
      create: {
        ...validatedData,
        cachedAt: new Date(),
        lastAccessed: new Date()
      },
      include: {
        campaigns: true,
        _count: {
          select: {
            libraryEntries: true,
            sessions: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: game,
      message: 'Game saved successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/games/:id - Update game
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const validatedData = updateGameSchema.parse(req.body);

    const game = await prisma.game.update({
      where: { id },
      data: {
        ...validatedData,
        lastAccessed: new Date()
      },
      include: {
        campaigns: true,
        _count: {
          select: {
            libraryEntries: true,
            sessions: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: game,
      message: 'Game updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/games/:id - Delete game
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    await prisma.game.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Game deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/games/:id/stats - Get game statistics
router.get('/:id/stats', async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const game = await prisma.game.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        accessCount: true,
        lastAccessed: true,
        cachedAt: true
      }
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found'
      });
    }

    // Get additional stats
    const [
      totalInLibraries,
      totalPlaytime,
      averageRating,
      statusDistribution
    ] = await Promise.all([
      prisma.libraryEntry.count({
        where: { gameId: id }
      }),
      prisma.libraryEntry.aggregate({
        where: { gameId: id },
        _sum: { playtime: true }
      }),
      prisma.libraryEntry.aggregate({
        where: { 
          gameId: id,
          rating: { not: null }
        },
        _avg: { rating: true }
      }),
      prisma.libraryEntry.groupBy({
        by: ['category'],
        where: { gameId: id },
        _count: { category: true }
      })
    ]);

    const stats = {
      ...game,
      totalInLibraries,
      totalPlaytime: totalPlaytime._sum.playtime || 0,
      averageRating: averageRating._avg.rating || null,
      statusDistribution: statusDistribution.reduce((acc, item) => {
        acc[item.category] = item._count.category;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/games/batch - Batch create/update games
router.post('/batch', async (req, res, next) => {
  try {
    const { games } = req.body;
    
    if (!Array.isArray(games) || games.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Games array is required'
      });
    }

    const validatedGames = games.map(game => createGameSchema.parse(game));
    
    const results = await Promise.allSettled(
      validatedGames.map(gameData =>
        prisma.game.upsert({
          where: { id: gameData.id },
          update: {
            ...gameData,
            lastAccessed: new Date(),
            accessCount: { increment: 1 }
          },
          create: {
            ...gameData,
            cachedAt: new Date(),
            lastAccessed: new Date()
          }
        })
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: true,
      data: {
        total: games.length,
        successful,
        failed,
        results: results.map((result, index) => ({
          gameId: validatedGames[index].id,
          status: result.status,
          error: result.status === 'rejected' ? result.reason.message : null
        }))
      },
      message: `Batch operation completed: ${successful} successful, ${failed} failed`
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/games/search/suggestions - Get search suggestions
router.get('/search/suggestions', async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const suggestions = await prisma.game.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { developer: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        cover: true,
        developer: true
      },
      take: 10,
      orderBy: { accessCount: 'desc' }
    });

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
});

export default router;