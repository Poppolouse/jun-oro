/**
 * User library routes
 */

import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "../utils/response.js";
import {
  validateGameLibraryEntry,
  validatePagination,
} from "../utils/validation.js";
import { authMiddleware } from "../middleware/auth.js";

export async function handleGetUserLibrary(request, env) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request, env);
    if (authResult) return authResult;

    const url = new URL(request.url);
    const { page, limit, offset } = validatePagination(url.searchParams);
    const status = url.searchParams.get("status");
    const sortBy = url.searchParams.get("sort") || "added_at";
    const sortOrder = url.searchParams.get("order") === "desc" ? "DESC" : "ASC";

    // Build query
    let query = `
      SELECT 
        ugl.*,
        g.title, g.description, g.genre, g.platforms, g.release_date,
        g.developer, g.publisher, g.image_url, g.steam_url, g.epic_url, g.gog_url
      FROM user_game_library ugl
      JOIN games g ON ugl.game_id = g.id
      WHERE ugl.user_id = ?
    `;
    const params = [request.user.id];

    if (status) {
      query += " AND ugl.status = ?";
      params.push(status);
    }

    // Add sorting
    const allowedSortFields = [
      "added_at",
      "rating",
      "play_time_hours",
      "title",
    ];
    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy === "title"
        ? "g.title"
        : `ugl.${sortBy}`
      : "ugl.added_at";
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // Add pagination
    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const libraryEntries = await env.DB.prepare(query)
      .bind(...params)
      .all();

    // Get total count
    let countQuery =
      "SELECT COUNT(*) as total FROM user_game_library WHERE user_id = ?";
    const countParams = [request.user.id];

    if (status) {
      countQuery += " AND status = ?";
      countParams.push(status);
    }

    const totalResult = await env.DB.prepare(countQuery)
      .bind(...countParams)
      .first();
    const total = totalResult.total;

    return successResponse("Library retrieved successfully", {
      library: libraryEntries.results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get user library error:", error);
    return serverErrorResponse("Failed to retrieve library");
  }
}

export async function handleAddToLibrary(request, env) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request, env);
    if (authResult) return authResult;

    const entryData = await request.json();

    // Validate input
    const validationErrors = validateGameLibraryEntry(entryData);
    if (validationErrors.length > 0) {
      return errorResponse("Validation failed", 400, {
        errors: validationErrors,
      });
    }

    // Check if game exists
    const game = await env.DB.prepare("SELECT id FROM games WHERE id = ?")
      .bind(entryData.game_id)
      .first();

    if (!game) {
      return errorResponse("Game not found", 404);
    }

    // Check if already in library
    const existingEntry = await env.DB.prepare(
      "SELECT id FROM user_game_library WHERE user_id = ? AND game_id = ?",
    )
      .bind(request.user.id, entryData.game_id)
      .first();

    if (existingEntry) {
      return errorResponse("Game already in library", 409);
    }

    // Add to library
    const entryId = crypto.randomUUID();
    await env.DB.prepare(
      `
      INSERT INTO user_game_library (
        id, user_id, game_id, status, rating, notes, 
        play_time_hours, added_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))
    `,
    )
      .bind(
        entryId,
        request.user.id,
        entryData.game_id,
        entryData.status || "want_to_play",
        entryData.rating || null,
        entryData.notes || null,
        entryData.play_time_hours || 0,
      )
      .run();

    // Get the created entry with game details
    const createdEntry = await env.DB.prepare(
      `
      SELECT 
        ugl.*,
        g.title, g.description, g.genre, g.platforms, g.release_date,
        g.developer, g.publisher, g.image_url
      FROM user_game_library ugl
      JOIN games g ON ugl.game_id = g.id
      WHERE ugl.id = ?
    `,
    )
      .bind(entryId)
      .first();

    return successResponse(
      "Game added to library",
      { entry: createdEntry },
      201,
    );
  } catch (error) {
    console.error("Add to library error:", error);
    return serverErrorResponse("Failed to add game to library");
  }
}

export async function handleUpdateLibraryEntry(request, env) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request, env);
    if (authResult) return authResult;

    const url = new URL(request.url);
    const entryId = url.pathname.split("/").pop();
    const entryData = await request.json();

    if (!entryId) {
      return errorResponse("Entry ID is required", 400);
    }

    // Check if entry exists and belongs to user
    const existingEntry = await env.DB.prepare(
      "SELECT id FROM user_game_library WHERE id = ? AND user_id = ?",
    )
      .bind(entryId, request.user.id)
      .first();

    if (!existingEntry) {
      return errorResponse("Library entry not found", 404);
    }

    // Validate input (partial validation for updates)
    const validationErrors = [];

    if (
      entryData.status &&
      !["playing", "completed", "want_to_play", "dropped"].includes(
        entryData.status,
      )
    ) {
      validationErrors.push("Invalid status");
    }

    if (entryData.rating !== undefined && entryData.rating !== null) {
      const rating = parseFloat(entryData.rating);
      if (isNaN(rating) || rating < 0 || rating > 10) {
        validationErrors.push("Rating must be between 0 and 10");
      }
    }

    if (validationErrors.length > 0) {
      return errorResponse("Validation failed", 400, {
        errors: validationErrors,
      });
    }

    // Build update query
    const updateFields = [];
    const params = [];

    if (entryData.status !== undefined) {
      updateFields.push("status = ?");
      params.push(entryData.status);
    }

    if (entryData.rating !== undefined) {
      updateFields.push("rating = ?");
      params.push(entryData.rating);
    }

    if (entryData.notes !== undefined) {
      updateFields.push("notes = ?");
      params.push(entryData.notes);
    }

    if (entryData.play_time_hours !== undefined) {
      updateFields.push("play_time_hours = ?");
      params.push(entryData.play_time_hours);
    }

    if (updateFields.length === 0) {
      return errorResponse("No fields to update", 400);
    }

    updateFields.push('updated_at = datetime("now")');
    params.push(entryId);

    await env.DB.prepare(
      `UPDATE user_game_library SET ${updateFields.join(", ")} WHERE id = ?`,
    )
      .bind(...params)
      .run();

    // Get updated entry with game details
    const updatedEntry = await env.DB.prepare(
      `
      SELECT 
        ugl.*,
        g.title, g.description, g.genre, g.platforms, g.release_date,
        g.developer, g.publisher, g.image_url
      FROM user_game_library ugl
      JOIN games g ON ugl.game_id = g.id
      WHERE ugl.id = ?
    `,
    )
      .bind(entryId)
      .first();

    return successResponse("Library entry updated", { entry: updatedEntry });
  } catch (error) {
    console.error("Update library entry error:", error);
    return serverErrorResponse("Failed to update library entry");
  }
}

export async function handleRemoveFromLibrary(request, env) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request, env);
    if (authResult) return authResult;

    const url = new URL(request.url);
    const entryId = url.pathname.split("/").pop();

    if (!entryId) {
      return errorResponse("Entry ID is required", 400);
    }

    // Check if entry exists and belongs to user
    const existingEntry = await env.DB.prepare(
      "SELECT id FROM user_game_library WHERE id = ? AND user_id = ?",
    )
      .bind(entryId, request.user.id)
      .first();

    if (!existingEntry) {
      return errorResponse("Library entry not found", 404);
    }

    // Remove from library
    await env.DB.prepare("DELETE FROM user_game_library WHERE id = ?")
      .bind(entryId)
      .run();

    return successResponse("Game removed from library");
  } catch (error) {
    console.error("Remove from library error:", error);
    return serverErrorResponse("Failed to remove game from library");
  }
}

export async function handleGetLibraryStats(request, env) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request, env);
    if (authResult) return authResult;

    // Get library statistics
    const stats = await env.DB.prepare(
      `
      SELECT 
        COUNT(*) as total_games,
        COUNT(CASE WHEN status = 'playing' THEN 1 END) as currently_playing,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'want_to_play' THEN 1 END) as want_to_play,
        COUNT(CASE WHEN status = 'dropped' THEN 1 END) as dropped,
        SUM(play_time_hours) as total_play_time,
        AVG(CASE WHEN rating IS NOT NULL THEN rating END) as average_rating
      FROM user_game_library 
      WHERE user_id = ?
    `,
    )
      .bind(request.user.id)
      .first();

    return successResponse("Library statistics retrieved", { stats });
  } catch (error) {
    console.error("Get library stats error:", error);
    return serverErrorResponse("Failed to retrieve library statistics");
  }
}
