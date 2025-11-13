/**
 * @fileoverview API integration tests
 * @description Tests API endpoints with real database interactions
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
import request from "supertest";
import { prisma } from "../../backend/src/lib/prisma.js";

// Test app
const app = require("../../backend/src/index.js");

describe("API Integration Tests", () => {
  let testUser;
  let testGame;
  let authToken;

  beforeAll(async () => {
    // Setup test data
    testUser = {
      username: "testuser",
      email: "test@example.com",
      password: "testpassword123",
      role: "user",
    };

    testGame = {
      name: "Test Game",
      summary: "A test game for integration testing",
      genres: [{ name: "Action" }],
      platforms: [{ name: "PC" }],
      rating: 75,
      category: 0,
    };

    // Create test user
    const createdUser = await prisma.user.create({
      data: {
        ...testUser,
        password: "$2a$10$testpassword", // bcrypt hash
        status: "active",
      },
    });

    // Create test game
    await prisma.game.create({
      data: testGame,
    });

    // Login and get token
    const loginResponse = await request(app).post("/api/users/login").send({
      username: testUser.username,
      password: "testpassword123",
    });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.user.deleteMany({
      where: { username: "testuser" },
    });
    await prisma.game.deleteMany({
      where: { name: "Test Game" },
    });
  });

  beforeEach(() => {
    // Reset database state before each test
    prisma.libraryEntry.deleteMany();
  });

  afterEach(() => {
    // Cleanup after each test
    prisma.libraryEntry.deleteMany();
  });

  describe("Authentication", () => {
    it("should authenticate user and return token", async () => {
      // Act
      const response = await request(app).post("/api/users/login").send({
        username: testUser.username,
        password: "testpassword123",
      });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.sessionId).toBeDefined();
    });

    it("should reject invalid credentials", async () => {
      // Act
      const response = await request(app).post("/api/users/login").send({
        username: testUser.username,
        password: "wrongpassword",
      });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it("should require username and password", async () => {
      // Act
      const response = await request(app).post("/api/users/login").send({
        username: testUser.username,
      });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Games API", () => {
    it("should create a new game", async () => {
      // Arrange
      const gameData = {
        name: "New Test Game",
        summary: "A new game for testing",
        genres: [{ name: "RPG" }],
        platforms: [{ name: "PC" }],
        rating: 80,
        category: 0,
      };

      // Act
      const response = await request(app)
        .post("/api/games")
        .set("Authorization", `Bearer ${authToken}`)
        .send(gameData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(gameData.name);
      expect(response.body.data.id).toBeDefined();
    });

    it("should get games list", async () => {
      // Act
      const response = await request(app)
        .get("/api/games")
        .set("Authorization", `Bearer ${authToken}`)
        .send();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should get game by ID", async () => {
      // Arrange
      const games = await prisma.game.findMany();
      const game = games[0];

      // Act
      const response = await request(app)
        .get(`/api/games/${game.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(game.id);
      expect(response.body.data.name).toBe(game.name);
    });

    it("should update game", async () => {
      // Arrange
      const games = await prisma.game.findMany();
      const game = games[0];
      const updateData = {
        name: "Updated Test Game",
        summary: "Updated summary",
      };

      // Act
      const response = await request(app)
        .put(`/api/games/${game.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });

    it("should delete game", async () => {
      // Arrange
      const games = await prisma.game.findMany();
      const game = games[0];

      // Act
      const response = await request(app)
        .delete(`/api/games/${game.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("deleted successfully");
    });

    it("should handle unauthorized access", async () => {
      // Act
      const response = await request(app).get("/api/games").send();

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Library API", () => {
    it("should add game to library", async () => {
      // Arrange
      const games = await prisma.game.findMany();
      const game = games[0];
      const libraryData = {
        gameId: game.id,
        status: "playing",
        rating: 85,
      };

      // Act
      const response = await request(app)
        .post(`/api/library/${testUser.id}/games`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(libraryData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.gameId).toBe(game.id);
    });

    it("should get user library", async () => {
      // Act
      const response = await request(app)
        .get(`/api/library/${testUser.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.entries).toBeDefined();
      expect(Array.isArray(response.body.data.entries)).toBe(true);
    });

    it("should update library entry", async () => {
      // Arrange
      const games = await prisma.game.findMany();
      const game = games[0];

      // First add to library
      await prisma.libraryEntry.create({
        data: {
          userId: testUser.id,
          gameId: game.id,
          status: "playing",
        },
      });

      const updateData = {
        status: "completed",
        rating: 90,
      };

      // Act
      const response = await request(app)
        .put(`/api/library/${testUser.id}/games/${game.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it("should remove game from library", async () => {
      // Arrange
      const games = await prisma.game.findMany();
      const game = games[0];

      // First add to library
      await prisma.libraryEntry.create({
        data: {
          userId: testUser.id,
          gameId: game.id,
          status: "playing",
        },
      });

      // Act
      const response = await request(app)
        .delete(`/api/library/${testUser.id}/games/${game.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("removed successfully");
    });
  });

  describe("Users API", () => {
    it("should get user profile", async () => {
      // Act
      const response = await request(app)
        .get(`/api/users/${testUser.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(testUser.username);
      expect(response.body.data.email).toBe(testUser.email);
    });

    it("should update user profile", async () => {
      // Arrange
      const updateData = {
        name: "Updated Name",
        firstName: "Updated First",
      };

      // Act
      const response = await request(app)
        .put(`/api/users/${testUser.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });

    it("should get user statistics", async () => {
      // Act
      const response = await request(app)
        .get(`/api/users/${testUser.id}/stats`)
        .set("Authorization", `Bearer ${authToken}`)
        .send();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
    });
  });

  describe("Search API", () => {
    it("should search games", async () => {
      // Act
      const response = await request(app)
        .get("/api/games/search/suggestions?q=test")
        .set("Authorization", `Bearer ${authToken}`)
        .send();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should handle empty search query", async () => {
      // Act
      const response = await request(app)
        .get("/api/games/search/suggestions?q=")
        .set("Authorization", `Bearer ${authToken}`)
        .send();

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid game data", async () => {
      // Act
      const response = await request(app)
        .post("/api/games")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "", // Invalid: empty name
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it("should handle non-existent game ID", async () => {
      // Act
      const response = await request(app)
        .get("/api/games/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .send();

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("not found");
    });

    it("should handle invalid library data", async () => {
      // Act
      const response = await request(app)
        .post(`/api/library/${testUser.id}/games`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          status: "invalid_status", // Invalid status
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Performance", () => {
    it("should handle concurrent requests", async () => {
      // Arrange
      const games = await prisma.game.findMany();
      const game = games[0];

      // Act - Make multiple concurrent requests
      const promises = Array(10)
        .fill()
        .map(() =>
          request(app)
            .get(`/api/games/${game.id}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send(),
        );

      const responses = await Promise.all(promises);

      // Assert
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    it("should handle large dataset efficiently", async () => {
      // Arrange - Create many test games
      const gamePromises = Array(100)
        .fill()
        .map((_, index) =>
          prisma.game.create({
            data: {
              name: `Performance Test Game ${index}`,
              summary: `Test game ${index} for performance testing`,
              category: 0,
            },
          }),
        );

      await Promise.all(gamePromises);

      const startTime = Date.now();

      // Act
      const response = await request(app)
        .get("/api/games")
        .set("Authorization", `Bearer ${authToken}`)
        .send();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(100);
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds

      // Cleanup
      await prisma.game.deleteMany({
        where: {
          name: { startsWith: "Performance Test Game" },
        },
      });
    });
  });
});
