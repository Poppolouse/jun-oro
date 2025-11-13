/**
 * @fileoverview Mock server configuration
 * @description MSW server setup for API mocking
 */

import { setupServer } from "msw/node";
import { rest } from "msw";
import { testUtils } from "../setup.js";

// Mock data
const mockUsers = [
  testUtils.createMockUser({
    id: "user-1",
    username: "testuser",
    email: "test@example.com",
  }),
  testUtils.createMockUser({
    id: "user-2",
    username: "admin",
    email: "admin@example.com",
    role: "admin",
  }),
];

const mockGames = [
  testUtils.createMockGame({
    id: "game-1",
    name: "Test Game 1",
    rating: 85,
  }),
  testUtils.createMockGame({
    id: "game-2",
    name: "Test Game 2",
    rating: 75,
  }),
  testUtils.createMockGame({
    id: "game-3",
    name: "Test Game 3",
    rating: 90,
  }),
];

const mockLibraryEntries = [
  testUtils.createMockLibraryEntry({
    id: "entry-1",
    userId: "user-1",
    gameId: "game-1",
    status: "playing",
    rating: null,
  }),
  testUtils.createMockLibraryEntry({
    id: "entry-2",
    userId: "user-1",
    gameId: "game-2",
    status: "completed",
    rating: 80,
  }),
];

// API handlers
export const handlers = [
  // Authentication endpoints
  rest.post("/api/users/login", (req, res, ctx) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: "Kullanıcı adı ve şifre gerekli",
        }),
      );
    }

    const user = mockUsers.find((u) => u.username === username);
    if (!user || password !== "testpassword") {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: "Geçersiz kullanıcı adı veya şifre",
        }),
      );
    }

    const { password: pwd, ...userWithoutPassword } = user;

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          ...userWithoutPassword,
          token: "mock-jwt-token",
          sessionId: "mock-session-id",
          expiresIn: "24h",
        },
        message: "Giriş başarılı",
      }),
    );
  }),

  rest.post("/api/users/register", (req, res, ctx) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: "Tüm alanlar gerekli",
        }),
      );
    }

    if (password.length < 6) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: "Şifre en az 6 karakter olmalıdır",
        }),
      );
    }

    const existingUser = mockUsers.find(
      (u) => u.username === username || u.email === email,
    );
    if (existingUser) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error:
            existingUser.username === username
              ? "Bu kullanıcı adı zaten kullanılıyor"
              : "Bu email adresi zaten kullanılıyor",
        }),
      );
    }

    const newUser = testUtils.createMockUser({
      username,
      email,
      status: "pending",
    });

    mockUsers.push(newUser);

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: newUser,
        message: "Kayıt başarılı! Hesabınız admin onayı bekliyor.",
      }),
    );
  }),

  rest.post("/api/users/logout", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: "Çıkış başarılı",
      }),
    );
  }),

  // User endpoints
  rest.get("/api/users/:id", (req, res, ctx) => {
    const { id } = req.params;
    const user = mockUsers.find((u) => u.id === id);

    if (!user) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: "Kullanıcı bulunamadı",
        }),
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: user,
      }),
    );
  }),

  rest.put("/api/users/:id", (req, res, ctx) => {
    const { id } = req.params;
    const userIndex = mockUsers.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: "Kullanıcı bulunamadı",
        }),
      );
    }

    const updatedUser = { ...mockUsers[userIndex], ...req.body };
    mockUsers[userIndex] = updatedUser;

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: updatedUser,
        message: "Kullanıcı güncellendi",
      }),
    );
  }),

  // Game endpoints
  rest.get("/api/games", (req, res, ctx) => {
    const { page = 1, limit = 10, search, genre, platform } = req.query;

    let filteredGames = [...mockGames];

    if (search) {
      filteredGames = filteredGames.filter(
        (game) =>
          game.name.toLowerCase().includes(search.toLowerCase()) ||
          game.summary.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (genre) {
      filteredGames = filteredGames.filter((game) =>
        game.genres.some((g) => g.name === genre),
      );
    }

    if (platform) {
      filteredGames = filteredGames.filter((game) =>
        game.platforms.some((p) => p.name === platform),
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedGames = filteredGames.slice(startIndex, endIndex);

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: paginatedGames,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredGames.length,
          pages: Math.ceil(filteredGames.length / limit),
        },
      }),
    );
  }),

  rest.get("/api/games/:id", (req, res, ctx) => {
    const { id } = req.params;
    const game = mockGames.find((g) => g.id === id);

    if (!game) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: "Oyun bulunamadı",
        }),
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: game,
      }),
    );
  }),

  rest.post("/api/games", (req, res, ctx) => {
    const gameData = req.body;

    if (!gameData.name || !gameData.summary) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: "Oyun adı ve açıklaması gerekli",
        }),
      );
    }

    const newGame = testUtils.createMockGame({
      ...gameData,
      id: `game-${mockGames.length + 1}`,
    });

    mockGames.push(newGame);

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: newGame,
        message: "Oyun oluşturuldu",
      }),
    );
  }),

  rest.get("/api/games/search/suggestions", (req, res, ctx) => {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: [],
        }),
      );
    }

    const suggestions = mockGames
      .filter(
        (game) =>
          game.name.toLowerCase().includes(q.toLowerCase()) ||
          game.developer.toLowerCase().includes(q.toLowerCase()),
      )
      .slice(0, 10);

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: suggestions,
      }),
    );
  }),

  // Library endpoints
  rest.get("/api/library/:userId", (req, res, ctx) => {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    let filteredEntries = mockLibraryEntries.filter(
      (entry) => entry.userId === userId,
    );

    if (status) {
      filteredEntries = filteredEntries.filter(
        (entry) => entry.status === status,
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

    // Add game data to entries
    const entriesWithGames = paginatedEntries.map((entry) => ({
      ...entry,
      game: mockGames.find((g) => g.id === entry.gameId),
    }));

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          entries: entriesWithGames,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredEntries.length,
            totalPages: Math.ceil(filteredEntries.length / limit),
          },
          stats: {
            totalGames: filteredEntries.length,
            totalPlaytime: filteredEntries.reduce(
              (sum, entry) => sum + entry.playtime,
              0,
            ),
            lastUpdated: new Date().toISOString(),
          },
        },
      }),
    );
  }),

  rest.post("/api/library/:userId/games", (req, res, ctx) => {
    const { userId } = req.params;
    const { gameId, status = "playing" } = req.body;

    if (!gameId) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: "Oyun ID gerekli",
        }),
      );
    }

    const game = mockGames.find((g) => g.id === gameId);
    if (!game) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: "Oyun bulunamadı",
        }),
      );
    }

    const existingEntry = mockLibraryEntries.find(
      (entry) => entry.userId === userId && entry.gameId === gameId,
    );

    if (existingEntry) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: "Oyun zaten kütüphanede",
        }),
      );
    }

    const newEntry = testUtils.createMockLibraryEntry({
      userId,
      gameId,
      status,
      addedAt: new Date().toISOString(),
    });

    mockLibraryEntries.push(newEntry);

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: { ...newEntry, game },
        message: "Oyun kütüphaneye eklendi",
      }),
    );
  }),

  rest.put("/api/library/:userId/games/:gameId", (req, res, ctx) => {
    const { userId, gameId } = req.params;
    const entryIndex = mockLibraryEntries.findIndex(
      (entry) => entry.userId === userId && entry.gameId === gameId,
    );

    if (entryIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: "Kütüphane kaydı bulunamadı",
        }),
      );
    }

    const updatedEntry = { ...mockLibraryEntries[entryIndex], ...req.body };
    mockLibraryEntries[entryIndex] = updatedEntry;

    const game = mockGames.find((g) => g.id === gameId);

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: { ...updatedEntry, game },
        message: "Kütüphane kaydı güncellendi",
      }),
    );
  }),

  rest.delete("/api/library/:userId/games/:gameId", (req, res, ctx) => {
    const { userId, gameId } = req.params;
    const entryIndex = mockLibraryEntries.findIndex(
      (entry) => entry.userId === userId && entry.gameId === gameId,
    );

    if (entryIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: "Kütüphane kaydı bulunamadı",
        }),
      );
    }

    mockLibraryEntries.splice(entryIndex, 1);

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: "Oyun kütüphaneden kaldırıldı",
      }),
    );
  }),

  // Statistics endpoint
  rest.get("/api/library/:userId/stats", (req, res, ctx) => {
    const { userId } = req.params;
    const userEntries = mockLibraryEntries.filter(
      (entry) => entry.userId === userId,
    );

    const totalGames = userEntries.length;
    const totalPlaytime = userEntries.reduce(
      (sum, entry) => sum + entry.playtime,
      0,
    );
    const completedGames = userEntries.filter(
      (entry) => entry.status === "completed",
    );
    const averageRating =
      completedGames.length > 0
        ? completedGames.reduce((sum, entry) => sum + (entry.rating || 0), 0) /
          completedGames.length
        : 0;

    const categoryDistribution = userEntries.reduce((acc, entry) => {
      acc[entry.status] = (acc[entry.status] || 0) + 1;
      return acc;
    }, {});

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          totalGames,
          totalPlaytime,
          averageRating,
          categoryDistribution,
          recentlyAdded: userEntries
            .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
            .slice(0, 5)
            .map((entry) => ({
              gameId: entry.gameId,
              gameName: mockGames.find((g) => g.id === entry.gameId)?.name,
              addedAt: entry.addedAt,
            })),
          recentlyPlayed: userEntries
            .filter((entry) => entry.lastPlayed)
            .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed))
            .slice(0, 5)
            .map((entry) => ({
              gameId: entry.gameId,
              gameName: mockGames.find((g) => g.id === entry.gameId)?.name,
              lastPlayed: entry.lastPlayed,
              playtime: entry.playtime,
            })),
        },
      }),
    );
  }),

  // Error simulation handlers
  rest.get("/api/error/network", (req, res, ctx) => {
    return res.networkError("Network error");
  }),

  rest.get("/api/error/server", (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        error: "Internal server error",
      }),
    );
  }),

  rest.get("/api/error/unauthorized", (req, res, ctx) => {
    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        error: "Unauthorized",
      }),
    );
  }),
];

// Create and export server
export const server = setupServer(...handlers);

// Export utilities for test usage
export { mockUsers, mockGames, mockLibraryEntries };
