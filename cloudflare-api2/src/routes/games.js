/**
 * Games routes
 */

import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "../utils/response.js";
import {
  validateGameData,
  validatePagination,
  sanitizeString,
} from "../utils/validation.js";
import { adminMiddleware } from "../middleware/auth.js";
import { getPrismaClient, withTransaction } from "../lib/prisma.js";

export async function handleGetGames(request, env) {
  try {
    const url = new URL(request.url);
    const { page, limit, offset } = validatePagination(url.searchParams);
    const search = sanitizeString(url.searchParams.get("search") || "");
    const genre = sanitizeString(url.searchParams.get("genre") || "");
    const platform = sanitizeString(url.searchParams.get("platform") || "");
    const sortBy = url.searchParams.get("sort") || "name";
    const sortOrder = url.searchParams.get("order") === "desc" ? "desc" : "asc";

    const prisma = getPrismaClient(env);

    // Build where clause
    const where = {
      status: "active",
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    if (genre) {
      where.genres = { contains: genre };
    }

    if (platform) {
      where.platforms = { contains: platform };
    }

    // Add sorting
    const allowedSortFields = ["name", "firstReleaseDate", "rating", "createdAt"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "name";

    // Get games with pagination
    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          gameTags: {
            include: {
              tag: true
            }
          }
        }
      }),
      prisma.game.count({ where })
    ]);

    // Transform data for backward compatibility
    const transformedGames = games.map(game => ({
      ...game,
      title: game.name,
      genre: game.genres?.[0] || null,
      platforms: game.platforms?.[0] || null,
      image_url: game.cover,
      tags: game.gameTags?.map(gt => gt.tag.name) || []
    }));

    return successResponse("Games retrieved successfully", {
      games: transformedGames,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get games error:", error);
    return serverErrorResponse("Failed to retrieve games");
  }
}

export async function handleGetGame(request, env) {
  try {
    const url = new URL(request.url);
    const gameId = url.pathname.split("/").pop();

    if (!gameId) {
      return errorResponse("Game ID is required", 400);
    }

    const prisma = getPrismaClient(env);

    const game = await prisma.game.findUnique({
      where: {
        id: gameId,
      },
      include: {
        gameTags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!game) {
      return errorResponse("Game not found", 404);
    }

    // Transform data for backward compatibility
    const transformedGame = {
      ...game,
      title: game.name,
      genre: game.genres?.[0] || null,
      platforms: game.platforms?.[0] || null,
      image_url: game.cover,
      tags: game.gameTags?.map(gt => gt.tag.name) || []
    };

    return successResponse("Game retrieved successfully", { game: transformedGame });
  } catch (error) {
    console.error("Get game error:", error);
    return serverErrorResponse("Failed to retrieve game");
  }
}

export async function handleCreateGame(request, env) {
  try {
    // Check admin authentication
    const authResult = await adminMiddleware(request, env);
    if (authResult) return authResult;

    const gameData = await request.json();

    // Validate input
    const validationErrors = validateGameData(gameData);
    if (validationErrors.length > 0) {
      return errorResponse("Validation failed", 400, {
        errors: validationErrors,
      });
    }

    // Create game
    const gameId = crypto.randomUUID();
    await env.DB.prepare(
      `
      INSERT INTO games (
        id, title, description, genre, platforms, release_date, 
        developer, publisher, rating, image_url, trailer_url, 
        steam_url, epic_url, gog_url, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))
    `,
    )
      .bind(
        gameId,
        gameData.title,
        gameData.description || null,
        gameData.genre || null,
        gameData.platforms || null,
        gameData.release_date || null,
        gameData.developer || null,
        gameData.publisher || null,
        gameData.rating || null,
        gameData.image_url || null,
        gameData.trailer_url || null,
        gameData.steam_url || null,
        gameData.epic_url || null,
        gameData.gog_url || null,
      )
      .run();

    // Handle tags if provided
    if (gameData.tags && Array.isArray(gameData.tags)) {
      for (const tagName of gameData.tags) {
        // Get or create tag
        let tag = await env.DB.prepare(
          "SELECT id FROM game_tags WHERE name = ?",
        )
          .bind(tagName)
          .first();

        if (!tag) {
          const tagId = crypto.randomUUID();
          await env.DB.prepare(
            'INSERT INTO game_tags (id, name, created_at) VALUES (?, ?, datetime("now"))',
          )
            .bind(tagId, tagName)
            .run();
          tag = { id: tagId };
        }

        // Link game to tag
        await env.DB.prepare(
          "INSERT INTO games_game_tags (game_id, tag_id) VALUES (?, ?)",
        )
          .bind(gameId, tag.id)
          .run();
      }
    }

    const createdGame = await env.DB.prepare("SELECT * FROM games WHERE id = ?")
      .bind(gameId)
      .first();

    return successResponse(
      "Game created successfully",
      { game: createdGame },
      201,
    );
  } catch (error) {
    console.error("Create game error:", error);
    return serverErrorResponse("Failed to create game");
  }
}

export async function handleUpdateGame(request, env) {
  try {
    // Check admin authentication
    const authResult = await adminMiddleware(request, env);
    if (authResult) return authResult;

    const url = new URL(request.url);
    const gameId = url.pathname.split("/").pop();
    const gameData = await request.json();

    if (!gameId) {
      return errorResponse("Game ID is required", 400);
    }

    const prisma = getPrismaClient(env);

    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: {
        id: gameId,
      },
      select: { id: true }
    });

    if (!existingGame) {
      return errorResponse("Game not found", 404);
    }

    // Validate input
    const validationErrors = validateGameData(gameData);
    if (validationErrors.length > 0) {
      return errorResponse("Validation failed", 400, {
        errors: validationErrors,
      });
    }

    // Update game with transaction
    const result = await withTransaction(env, async (tx) => {
      // Update game
      const updatedGame = await tx.game.update({
        where: {
          id: gameId,
        },
        data: {
          name: gameData.title,
          description: gameData.description,
          genres: gameData.genre ? [gameData.genre] : [],
          platforms: gameData.platforms ? [gameData.platforms] : [],
          firstReleaseDate: gameData.release_date ? new Date(gameData.release_date) : undefined,
          developer: gameData.developer,
          publisher: gameData.publisher,
          rating: gameData.rating,
          cover: gameData.image_url,
          trailerUrl: gameData.trailer_url,
          steamUrl: gameData.steam_url,
          epicUrl: gameData.epic_url,
          gogUrl: gameData.gog_url,
          updatedAt: new Date(),
        },
      });

      // Handle tags if provided
      if (gameData.tags && Array.isArray(gameData.tags)) {
        // Remove existing tag relations
        await tx.gameTagRelation.deleteMany({
          where: { gameId }
        });

        for (const tagName of gameData.tags) {
          // Get or create tag
          let tag = await tx.gameTag.findUnique({
            where: { name: tagName }
          });

          if (!tag) {
            tag = await tx.gameTag.create({
              data: {
                id: crypto.randomUUID(),
                name: tagName,
              }
            });
          }

          // Link game to tag
          await tx.gameTagRelation.create({
            data: {
              gameId,
              tagId: tag.id,
            }
          });
        }
      }

      return updatedGame;
    });

    // Get updated game with tags
    const updatedGameWithTags = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        gameTags: {
          include: {
            tag: true
          }
        }
      }
    });

    // Transform for backward compatibility
    const transformedGame = {
      ...updatedGameWithTags,
      title: updatedGameWithTags.name,
      genre: updatedGameWithTags.genres?.[0] || null,
      platforms: updatedGameWithTags.platforms?.[0] || null,
      image_url: updatedGameWithTags.cover,
      tags: updatedGameWithTags.gameTags?.map(gt => gt.tag.name) || []
    };

    return successResponse("Game updated successfully", { game: transformedGame });
  } catch (error) {
    console.error("Update game error:", error);
    return serverErrorResponse("Failed to update game");
  }
}

export async function handleDeleteGame(request, env) {
  try {
    // Check admin authentication
    const authResult = await adminMiddleware(request, env);
    if (authResult) return authResult;

    const url = new URL(request.url);
    const gameId = url.pathname.split("/").pop();

    if (!gameId) {
      return errorResponse("Game ID is required", 400);
    }

    const prisma = getPrismaClient(env);

    // Check if game exists
    const existingGame = await prisma.game.findUnique({
      where: {
        id: gameId,
      },
      select: { id: true }
    });

    if (!existingGame) {
      return errorResponse("Game not found", 404);
    }

    // Delete game with transaction (cascade will handle related records)
    await withTransaction(env, async (tx) => {
      await tx.game.delete({
        where: {
          id: gameId,
        },
      });
    });

    return successResponse("Game deleted successfully");
  } catch (error) {
    console.error("Delete game error:", error);
    return serverErrorResponse("Failed to delete game");
  }
}
