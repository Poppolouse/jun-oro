/**
 * @fileoverview Database integration tests
 * @description Tests database operations and transactions
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
import { prisma } from "../../backend/src/lib/prisma.js";

describe("Database Integration Tests", () => {
  let testUser;
  let testGame;
  let testLibraryEntry;

  beforeAll(async () => {
    // Setup test data
    testUser = await prisma.user.create({
      data: {
        username: "testuser",
        email: "test@example.com",
        password: "$2a$10$testpassword",
        role: "user",
        status: "active",
      },
    });

    testGame = await prisma.game.create({
      data: {
        name: "Test Game",
        summary: "A test game for database testing",
        genres: [{ name: "Action" }],
        platforms: [{ name: "PC" }],
        rating: 75,
        category: 0,
      },
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.libraryEntry.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    await prisma.game.delete({
      where: { id: testGame.id },
    });
  });

  beforeEach(async () => {
    // Reset database state before each test
    await prisma.libraryEntry.deleteMany({
      where: { userId: testUser.id },
    });
  });

  afterEach(async () => {
    // Cleanup after each test
    await prisma.libraryEntry.deleteMany({
      where: { userId: testUser.id },
    });
  });

  describe("User Operations", () => {
    it("should create user with preferences and stats", async () => {
      // Arrange
      const userData = {
        username: "newuser",
        email: "newuser@example.com",
        password: "$2a$10$newpassword",
        role: "user",
        status: "active",
      };

      // Act
      const createdUser = await prisma.user.create({
        data: {
          ...userData,
          preferences: { create: {} },
          userStats: { create: {} },
        },
        include: {
          preferences: true,
          userStats: true,
        },
      });

      // Assert
      expect(createdUser.username).toBe(userData.username);
      expect(createdUser.email).toBe(userData.email);
      expect(createdUser.preferences).toBeDefined();
      expect(createdUser.userStats).toBeDefined();

      // Cleanup
      await prisma.user.delete({
        where: { id: createdUser.id },
      });
    });

    it("should update user activity", async () => {
      // Act
      const updatedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: {
          lastActive: new Date(),
          lastLogin: new Date(),
        },
      });

      // Assert
      expect(updatedUser.lastActive).toBeInstanceOf(Date);
      expect(updatedUser.lastLogin).toBeInstanceOf(Date);
    });

    it("should handle user deletion cascade", async () => {
      // Arrange
      const tempUser = await prisma.user.create({
        data: {
          username: "tempuser",
          email: "temp@example.com",
          password: "$2a$10$temppassword",
          role: "user",
          status: "active",
        },
      });

      await prisma.libraryEntry.create({
        data: {
          userId: tempUser.id,
          gameId: testGame.id,
          status: "playing",
        },
      });

      // Act
      await prisma.user.delete({
        where: { id: tempUser.id },
      });

      // Assert
      const deletedUser = await prisma.user.findUnique({
        where: { id: tempUser.id },
      });
      const libraryEntry = await prisma.libraryEntry.findFirst({
        where: { userId: tempUser.id },
      });

      expect(deletedUser).toBeNull();
      expect(libraryEntry).toBeNull();
    });
  });

  describe("Game Operations", () => {
    it("should create game with nested data", async () => {
      // Arrange
      const gameData = {
        name: "Complex Game",
        summary: "A game with complex data",
        genres: [{ name: "RPG" }, { name: "Adventure" }],
        platforms: [{ name: "PC" }, { name: "PlayStation" }],
        rating: 85,
        category: 1,
        steamData: { appId: "12345" },
        igdbData: { id: "67890" },
      };

      // Act
      const createdGame = await prisma.game.create({
        data: gameData,
      });

      // Assert
      expect(createdGame.name).toBe(gameData.name);
      expect(createdGame.genres).toEqual(gameData.genres);
      expect(createdGame.platforms).toEqual(gameData.platforms);
      expect(createdGame.steamData).toEqual(gameData.steamData);
      expect(createdGame.igdbData).toEqual(gameData.igdbData);

      // Cleanup
      await prisma.game.delete({
        where: { id: createdGame.id },
      });
    });

    it("should update game access statistics", async () => {
      // Act
      const updatedGame = await prisma.game.update({
        where: { id: testGame.id },
        data: {
          accessCount: { increment: 1 },
          lastAccessed: new Date(),
        },
      });

      // Assert
      expect(updatedGame.accessCount).toBe(1);
      expect(updatedGame.lastAccessed).toBeInstanceOf(Date);
    });

    it("should handle game search with filters", async () => {
      // Arrange
      await prisma.game.create({
        data: {
          name: "Action Game",
          summary: "An action-packed game",
          genres: [{ name: "Action" }],
          platforms: [{ name: "PC" }],
          rating: 90,
          category: 0,
        },
      });

      // Act
      const games = await prisma.game.findMany({
        where: {
          OR: [
            { name: { contains: "Action", mode: "insensitive" } },
            { summary: { contains: "action", mode: "insensitive" } },
          ],
        },
      });

      // Assert
      expect(games.length).toBeGreaterThan(0);
      expect(games.some((game) => game.name.includes("Action"))).toBe(true);
    });
  });

  describe("Library Entry Operations", () => {
    it("should create library entry", async () => {
      // Arrange
      const libraryData = {
        userId: testUser.id,
        gameId: testGame.id,
        status: "playing",
        rating: 80,
        playtime: 120,
      };

      // Act
      const createdEntry = await prisma.libraryEntry.create({
        data: libraryData,
        include: {
          game: true,
          user: true,
        },
      });

      // Assert
      expect(createdEntry.userId).toBe(testUser.id);
      expect(createdEntry.gameId).toBe(testGame.id);
      expect(createdEntry.status).toBe(libraryData.status);
      expect(createdEntry.rating).toBe(libraryData.rating);
      expect(createdEntry.playtime).toBe(libraryData.playtime);
      expect(createdEntry.game).toBeDefined();
      expect(createdEntry.user).toBeDefined();

      testLibraryEntry = createdEntry;
    });

    it("should update library entry", async () => {
      // Arrange
      const entry = await prisma.libraryEntry.create({
        data: {
          userId: testUser.id,
          gameId: testGame.id,
          status: "playing",
        },
      });

      const updateData = {
        status: "completed",
        rating: 90,
        playtime: 200,
        completedAt: new Date(),
      };

      // Act
      const updatedEntry = await prisma.libraryEntry.update({
        where: {
          userId_gameId: {
            userId: testUser.id,
            gameId: testGame.id,
          },
        },
        data: updateData,
      });

      // Assert
      expect(updatedEntry.status).toBe(updateData.status);
      expect(updatedEntry.rating).toBe(updateData.rating);
      expect(updatedEntry.playtime).toBe(updateData.playtime);
      expect(updatedEntry.completedAt).toBeInstanceOf(Date);
    });

    it("should handle unique constraint for library entries", async () => {
      // Arrange
      await prisma.libraryEntry.create({
        data: {
          userId: testUser.id,
          gameId: testGame.id,
          status: "playing",
        },
      });

      // Act & Assert
      await expect(
        prisma.libraryEntry.create({
          data: {
            userId: testUser.id,
            gameId: testGame.id,
            status: "completed",
          },
        }),
      ).rejects.toThrow();
    });

    it("should get library with game data", async () => {
      // Arrange
      await prisma.libraryEntry.create({
        data: {
          userId: testUser.id,
          gameId: testGame.id,
          status: "playing",
          rating: 85,
        },
      });

      // Act
      const libraryEntries = await prisma.libraryEntry.findMany({
        where: { userId: testUser.id },
        include: {
          game: {
            select: {
              id: true,
              name: true,
              cover: true,
              rating: true,
              developer: true,
            },
          },
        },
      });

      // Assert
      expect(libraryEntries.length).toBe(1);
      expect(libraryEntries[0].game).toBeDefined();
      expect(libraryEntries[0].game.name).toBe(testGame.name);
    });
  });

  describe("Transaction Operations", () => {
    it("should handle successful transaction", async () => {
      // Act
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: testUser.id },
          data: { lastActive: new Date() },
        });

        const libraryEntry = await tx.libraryEntry.create({
          data: {
            userId: testUser.id,
            gameId: testGame.id,
            status: "playing",
          },
        });

        return { user, libraryEntry };
      });

      // Assert
      expect(result.user).toBeDefined();
      expect(result.libraryEntry).toBeDefined();
      expect(result.libraryEntry.userId).toBe(testUser.id);
    });

    it("should handle transaction rollback on error", async () => {
      // Arrange
      const initialUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      // Act & Assert
      await expect(
        prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: testUser.id },
            data: { lastActive: new Date() },
          });

          // This should fail and rollback the transaction
          await tx.libraryEntry.create({
            data: {
              userId: "invalid-user-id",
              gameId: testGame.id,
              status: "playing",
            },
          });
        }),
      ).rejects.toThrow();

      // Verify rollback
      const finalUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(finalUser.lastActive).toEqual(initialUser.lastActive);
    });

    it("should handle batch operations", async () => {
      // Arrange
      const games = Array(5)
        .fill()
        .map((_, index) => ({
          name: `Batch Game ${index}`,
          summary: `Game ${index} for batch testing`,
          category: 0,
        }));

      // Act
      const createdGames = await prisma.$transaction(
        games.map((game) => prisma.game.create({ data: game })),
      );

      // Assert
      expect(createdGames.length).toBe(5);
      createdGames.forEach((game, index) => {
        expect(game.name).toBe(`Batch Game ${index}`);
      });

      // Cleanup
      await prisma.game.deleteMany({
        where: {
          name: { startsWith: "Batch Game" },
        },
      });
    });
  });

  describe("Aggregation Operations", () => {
    it("should calculate library statistics", async () => {
      // Arrange
      await prisma.libraryEntry.createMany({
        data: [
          {
            userId: testUser.id,
            gameId: testGame.id,
            status: "playing",
            rating: 80,
            playtime: 100,
          },
          {
            userId: testUser.id,
            gameId: testGame.id,
            status: "completed",
            rating: 90,
            playtime: 200,
          },
        ],
      });

      // Act
      const [totalEntries, totalPlaytime, averageRating] = await Promise.all([
        prisma.libraryEntry.count({
          where: { userId: testUser.id },
        }),
        prisma.libraryEntry.aggregate({
          where: { userId: testUser.id },
          _sum: { playtime: true },
        }),
        prisma.libraryEntry.aggregate({
          where: {
            userId: testUser.id,
            rating: { not: null },
          },
          _avg: { rating: true },
        }),
      ]);

      // Assert
      expect(totalEntries).toBe(2);
      expect(totalPlaytime._sum.playtime).toBe(300);
      expect(averageRating._avg.rating).toBe(85);
    });

    it("should group by category", async () => {
      // Arrange
      await prisma.libraryEntry.createMany({
        data: [
          {
            userId: testUser.id,
            gameId: testGame.id,
            status: "playing",
          },
          {
            userId: testUser.id,
            gameId: testGame.id,
            status: "completed",
          },
          {
            userId: testUser.id,
            gameId: testGame.id,
            status: "backlog",
          },
        ],
      });

      // Act
      const categoryStats = await prisma.libraryEntry.groupBy({
        by: ["status"],
        where: { userId: testUser.id },
        _count: { status: true },
      });

      // Assert
      expect(categoryStats.length).toBe(3);
      expect(categoryStats.some((stat) => stat.status === "playing")).toBe(
        true,
      );
      expect(categoryStats.some((stat) => stat.status === "completed")).toBe(
        true,
      );
      expect(categoryStats.some((stat) => stat.status === "backlog")).toBe(
        true,
      );
    });
  });

  describe("Performance Tests", () => {
    it("should handle large dataset efficiently", async () => {
      // Arrange
      const gamePromises = Array(100)
        .fill()
        .map((_, index) =>
          prisma.game.create({
            data: {
              name: `Performance Game ${index}`,
              summary: `Game ${index} for performance testing`,
              category: 0,
            },
          }),
        );

      const startTime = Date.now();
      await Promise.all(gamePromises);
      const createTime = Date.now() - startTime;

      // Act
      const queryStartTime = Date.now();
      const games = await prisma.game.findMany({
        where: {
          name: { startsWith: "Performance Game" },
        },
        take: 50,
      });
      const queryTime = Date.now() - queryStartTime;

      // Assert
      expect(games.length).toBe(50);
      expect(createTime).toBeLessThan(10000); // Should create in under 10 seconds
      expect(queryTime).toBeLessThan(1000); // Should query in under 1 second

      // Cleanup
      await prisma.game.deleteMany({
        where: {
          name: { startsWith: "Performance Game" },
        },
      });
    });

    it("should handle concurrent operations", async () => {
      // Act
      const promises = Array(10)
        .fill()
        .map((_, index) =>
          prisma.libraryEntry.create({
            data: {
              userId: testUser.id,
              gameId: testGame.id,
              status: "playing",
              playtime: index * 10,
            },
          }),
        );

      const results = await Promise.allSettled(promises);

      // Assert
      const successful = results.filter((r) => r.status === "fulfilled");
      const failed = results.filter((r) => r.status === "rejected");

      // Should fail due to unique constraint
      expect(successful.length).toBe(1);
      expect(failed.length).toBe(9);
    });
  });

  describe("Data Integrity", () => {
    it("should enforce foreign key constraints", async () => {
      // Act & Assert
      await expect(
        prisma.libraryEntry.create({
          data: {
            userId: "invalid-user-id",
            gameId: testGame.id,
            status: "playing",
          },
        }),
      ).rejects.toThrow();

      await expect(
        prisma.libraryEntry.create({
          data: {
            userId: testUser.id,
            gameId: "invalid-game-id",
            status: "playing",
          },
        }),
      ).rejects.toThrow();
    });

    it("should handle null values correctly", async () => {
      // Act
      const entry = await prisma.libraryEntry.create({
        data: {
          userId: testUser.id,
          gameId: testGame.id,
          status: "playing",
          // rating and playtime should be null by default
        },
      });

      // Assert
      expect(entry.rating).toBeNull();
      expect(entry.playtime).toBe(0); // Default value
    });
  });
});
