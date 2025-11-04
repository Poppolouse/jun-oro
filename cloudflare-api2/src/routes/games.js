/**
 * Games routes
 */

import { successResponse, errorResponse, serverErrorResponse } from '../utils/response.js';
import { validateGameData, validatePagination, sanitizeString } from '../utils/validation.js';
import { authMiddleware, adminMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';

export async function handleGetGames(request, env) {
  try {
    const url = new URL(request.url);
    const { page, limit, offset } = validatePagination(url.searchParams);
    const search = sanitizeString(url.searchParams.get('search') || '');
    const genre = sanitizeString(url.searchParams.get('genre') || '');
    const platform = sanitizeString(url.searchParams.get('platform') || '');
    const sortBy = url.searchParams.get('sort') || 'title';
    const sortOrder = url.searchParams.get('order') === 'desc' ? 'DESC' : 'ASC';

    // Build query
    let query = 'SELECT * FROM games WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (genre) {
      query += ' AND genre LIKE ?';
      params.push(`%${genre}%`);
    }

    if (platform) {
      query += ' AND platforms LIKE ?';
      params.push(`%${platform}%`);
    }

    // Add sorting
    const allowedSortFields = ['title', 'release_date', 'rating', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'title';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const games = await env.DB.prepare(query).bind(...params).all();

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM games WHERE 1=1';
    const countParams = [];

    if (search) {
      countQuery += ' AND (title LIKE ? OR description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (genre) {
      countQuery += ' AND genre LIKE ?';
      countParams.push(`%${genre}%`);
    }

    if (platform) {
      countQuery += ' AND platforms LIKE ?';
      countParams.push(`%${platform}%`);
    }

    const totalResult = await env.DB.prepare(countQuery).bind(...countParams).first();
    const total = totalResult.total;

    return successResponse('Games retrieved successfully', {
      games: games.results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get games error:', error);
    return serverErrorResponse('Failed to retrieve games');
  }
}

export async function handleGetGame(request, env) {
  try {
    const url = new URL(request.url);
    const gameId = url.pathname.split('/').pop();

    if (!gameId) {
      return errorResponse('Game ID is required', 400);
    }

    const game = await env.DB.prepare(
      'SELECT * FROM games WHERE id = ?'
    ).bind(gameId).first();

    if (!game) {
      return errorResponse('Game not found', 404);
    }

    // Get game tags
    const tags = await env.DB.prepare(
      'SELECT gt.name FROM game_tags gt JOIN games_game_tags ggt ON gt.id = ggt.tag_id WHERE ggt.game_id = ?'
    ).bind(gameId).all();

    game.tags = tags.results?.map(tag => tag.name) || [];

    return successResponse('Game retrieved successfully', { game });

  } catch (error) {
    console.error('Get game error:', error);
    return serverErrorResponse('Failed to retrieve game');
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
      return errorResponse('Validation failed', 400, { errors: validationErrors });
    }

    // Create game
    const gameId = crypto.randomUUID();
    await env.DB.prepare(`
      INSERT INTO games (
        id, title, description, genre, platforms, release_date, 
        developer, publisher, rating, image_url, trailer_url, 
        steam_url, epic_url, gog_url, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))
    `).bind(
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
      gameData.gog_url || null
    ).run();

    // Handle tags if provided
    if (gameData.tags && Array.isArray(gameData.tags)) {
      for (const tagName of gameData.tags) {
        // Get or create tag
        let tag = await env.DB.prepare(
          'SELECT id FROM game_tags WHERE name = ?'
        ).bind(tagName).first();

        if (!tag) {
          const tagId = crypto.randomUUID();
          await env.DB.prepare(
            'INSERT INTO game_tags (id, name, created_at) VALUES (?, ?, datetime("now"))'
          ).bind(tagId, tagName).run();
          tag = { id: tagId };
        }

        // Link game to tag
        await env.DB.prepare(
          'INSERT INTO games_game_tags (game_id, tag_id) VALUES (?, ?)'
        ).bind(gameId, tag.id).run();
      }
    }

    const createdGame = await env.DB.prepare(
      'SELECT * FROM games WHERE id = ?'
    ).bind(gameId).first();

    return successResponse('Game created successfully', { game: createdGame }, 201);

  } catch (error) {
    console.error('Create game error:', error);
    return serverErrorResponse('Failed to create game');
  }
}

export async function handleUpdateGame(request, env) {
  try {
    // Check admin authentication
    const authResult = await adminMiddleware(request, env);
    if (authResult) return authResult;

    const url = new URL(request.url);
    const gameId = url.pathname.split('/').pop();
    const gameData = await request.json();

    if (!gameId) {
      return errorResponse('Game ID is required', 400);
    }

    // Check if game exists
    const existingGame = await env.DB.prepare(
      'SELECT id FROM games WHERE id = ?'
    ).bind(gameId).first();

    if (!existingGame) {
      return errorResponse('Game not found', 404);
    }

    // Validate input
    const validationErrors = validateGameData(gameData);
    if (validationErrors.length > 0) {
      return errorResponse('Validation failed', 400, { errors: validationErrors });
    }

    // Update game
    await env.DB.prepare(`
      UPDATE games SET 
        title = ?, description = ?, genre = ?, platforms = ?, 
        release_date = ?, developer = ?, publisher = ?, rating = ?, 
        image_url = ?, trailer_url = ?, steam_url = ?, epic_url = ?, 
        gog_url = ?, updated_at = datetime("now")
      WHERE id = ?
    `).bind(
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
      gameId
    ).run();

    const updatedGame = await env.DB.prepare(
      'SELECT * FROM games WHERE id = ?'
    ).bind(gameId).first();

    return successResponse('Game updated successfully', { game: updatedGame });

  } catch (error) {
    console.error('Update game error:', error);
    return serverErrorResponse('Failed to update game');
  }
}

export async function handleDeleteGame(request, env) {
  try {
    // Check admin authentication
    const authResult = await adminMiddleware(request, env);
    if (authResult) return authResult;

    const url = new URL(request.url);
    const gameId = url.pathname.split('/').pop();

    if (!gameId) {
      return errorResponse('Game ID is required', 400);
    }

    // Check if game exists
    const existingGame = await env.DB.prepare(
      'SELECT id FROM games WHERE id = ?'
    ).bind(gameId).first();

    if (!existingGame) {
      return errorResponse('Game not found', 404);
    }

    // Delete game (cascade will handle related records)
    await env.DB.prepare('DELETE FROM games WHERE id = ?').bind(gameId).run();

    return successResponse('Game deleted successfully');

  } catch (error) {
    console.error('Delete game error:', error);
    return serverErrorResponse('Failed to delete game');
  }
}