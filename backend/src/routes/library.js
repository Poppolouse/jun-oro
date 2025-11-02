import express from 'express';
import { prisma } from '../lib/prisma.js';
import { addToLibrarySchema, updateLibraryEntrySchema, idParamSchema, paginationSchema } from '../lib/validation.js';

const router = express.Router();

// GET /api/library/:userId - Get user's library
router.get('/:userId', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { page, limit, sortBy = 'addedAt', sortOrder } = paginationSchema.parse(req.query);
    const { category, search } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {
      userId
    };
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.game = {
        name: { contains: search, mode: 'insensitive' }
      };
    }

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
              firstReleaseDate: true
            }
          }
        }
      }),
      prisma.libraryEntry.count({ where })
    ]);

    // Calculate stats from entries
    const totalGames = total;
    const totalPlaytime = entries.reduce((sum, entry) => sum + (entry.playtime || 0), 0);

    res.json({
      success: true,
      data: {
        entries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats: {
          totalGames,
          totalPlaytime,
          lastUpdated: new Date()
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/library/:userId/games - Add game to library
router.post('/:userId/games', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const validatedData = addToLibrarySchema.parse(req.body);

    // Check if game already exists in library
    const existingEntry = await prisma.libraryEntry.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId: validatedData.gameId
        }
      }
    });

    if (existingEntry) {
      return res.status(409).json({
        success: false,
        error: 'Game already exists in library'
      });
    }

    // Add game to library
    const entry = await prisma.libraryEntry.create({
      data: {
        ...validatedData,
        userId
      },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            cover: true,
            rating: true,
            developer: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: entry,
      message: 'Game added to library successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/library/:userId/games/:gameId - Update library entry
router.put('/:userId/games/:gameId', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { id: gameId } = idParamSchema.parse({ id: req.params.gameId });
    const validatedData = updateLibraryEntrySchema.parse(req.body);

    const entry = await prisma.libraryEntry.update({
      where: {
        userId_gameId: {
          userId,
          gameId
        }
      },
      data: validatedData,
      include: {
        game: {
          select: {
            id: true,
            name: true,
            cover: true,
            rating: true,
            developer: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: entry,
      message: 'Library entry updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/library/:userId/games/:gameId - Remove game from library
router.delete('/:userId/games/:gameId', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { id: gameId } = idParamSchema.parse({ id: req.params.gameId });

    await prisma.libraryEntry.delete({
      where: {
        userId_gameId: {
          userId,
          gameId
        }
      }
    });

    res.json({
      success: true,
      message: 'Game removed from library successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/library/:userId/games/:gameId - Get specific library entry
router.get('/:userId/games/:gameId', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { id: gameId } = idParamSchema.parse({ id: req.params.gameId });

    const entry = await prisma.libraryEntry.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId
        }
      },
      include: {
        game: true
      }
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Game not found in library'
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/library/:userId/stats - Get library statistics
router.get('/:userId/stats', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });

    const entries = await prisma.libraryEntry.findMany({
      where: { userId },
      include: {
        game: {
          select: {
            name: true,
            genres: true,
            platforms: true,
            rating: true
          }
        }
      }
    });

    // Calculate statistics
    const stats = {
      totalGames: entries.length,
      totalPlaytime: entries.reduce((sum, entry) => sum + entry.playtime, 0),
      averageRating: entries
        .filter(entry => entry.rating)
        .reduce((sum, entry, _, arr) => sum + entry.rating / arr.length, 0) || 0,
      categoryDistribution: entries.reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + 1;
        return acc;
      }, {}),
      genreDistribution: entries.reduce((acc, entry) => {
        if (entry.game.genres) {
          entry.game.genres.forEach(genre => {
            acc[genre] = (acc[genre] || 0) + 1;
          });
        }
        return acc;
      }, {}),
      platformDistribution: entries.reduce((acc, entry) => {
        if (entry.game.platforms) {
          entry.game.platforms.forEach(platform => {
            acc[platform] = (acc[platform] || 0) + 1;
          });
        }
        return acc;
      }, {}),
      recentlyAdded: entries
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        .slice(0, 5)
        .map(entry => ({
          gameId: entry.gameId,
          gameName: entry.game.name,
          addedAt: entry.addedAt
        })),
      recentlyPlayed: entries
        .filter(entry => entry.lastPlayed)
        .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
        .slice(0, 5)
        .map(entry => ({
          gameId: entry.gameId,
          gameName: entry.game.name,
          lastPlayed: entry.lastPlayed,
          playtime: entry.playtime
        }))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/library/:userId/import - Import library data
router.post('/:userId/import', async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { entries } = req.body;

    if (!Array.isArray(entries)) {
      return res.status(400).json({
        success: false,
        error: 'Entries array is required'
      });
    }

    const results = await Promise.allSettled(
      entries.map(entryData => {
        const validatedData = addToLibrarySchema.parse(entryData);
        return prisma.libraryEntry.upsert({
          where: {
            userId_gameId: {
              userId,
              gameId: validatedData.gameId
            }
          },
          update: validatedData,
          create: {
            ...validatedData,
            userId
          }
        });
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: true,
      data: {
        total: entries.length,
        successful,
        failed
      },
      message: `Import completed: ${successful} successful, ${failed} failed`
    });
  } catch (error) {
    next(error);
  }
});

export default router;