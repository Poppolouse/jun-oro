/**
 * @fileoverview Search utilities unit tests
 * @description Tests search relevance scoring and string similarity functions
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateRelevanceScore,
  sortGamesByRelevance,
  formatRelevanceScore,
} from "../searchUtils.js";

describe("Search Utilities", () => {
  const mockGame = {
    id: 1,
    name: "Test Game",
    summary: "A great test game for testing purposes",
    genres: [{ name: "Action" }, { name: "Adventure" }],
    platforms: [{ name: "PC" }, { name: "PlayStation" }],
    rating: 85,
    rating_count: 1500,
    category: 0, // Main game
  };

  const mockDLC = {
    id: 2,
    name: "Test Game DLC",
    summary: "Expansion content for test game",
    genres: [{ name: "Action" }],
    platforms: [{ name: "PC" }],
    rating: 80,
    rating_count: 500,
    category: 1, // DLC
    parent_game: 1,
  };

  describe("calculateRelevanceScore", () => {
    it("should return 0 for invalid inputs", () => {
      expect(calculateRelevanceScore(null, "test")).toBe(0);
      expect(calculateRelevanceScore(mockGame, null)).toBe(0);
      expect(calculateRelevanceScore(null, null)).toBe(0);
    });

    it("should give high score for exact name match", () => {
      const score = calculateRelevanceScore(mockGame, "Test Game");
      expect(score).toBeGreaterThan(80);
    });

    it("should give moderate score for partial name match", () => {
      const score = calculateRelevanceScore(mockGame, "Test");
      expect(score).toBeGreaterThan(20);
      expect(score).toBeLessThan(40);
    });

    it("should give score for summary match", () => {
      const score = calculateRelevanceScore(mockGame, "great");
      expect(score).toBeGreaterThan(10);
      expect(score).toBeLessThan(30);
    });

    it("should give score for genre match", () => {
      const score = calculateRelevanceScore(mockGame, "Action");
      expect(score).toBeGreaterThan(15);
      expect(score).toBeLessThan(25);
    });

    it("should give score for platform match", () => {
      const score = calculateRelevanceScore(mockGame, "PC");
      expect(score).toBeGreaterThan(5);
      expect(score).toBeLessThan(15);
    });

    it("should penalize DLC games", () => {
      const mainGameScore = calculateRelevanceScore(mockGame, "Test Game");
      const dlcScore = calculateRelevanceScore(mockDLC, "Test Game DLC");

      expect(dlcScore).toBeLessThan(mainGameScore);
    });

    it("should give popularity bonus", () => {
      const popularGame = {
        ...mockGame,
        rating: 90,
        rating_count: 2000,
      };

      const unpopularGame = {
        ...mockGame,
        rating: 60,
        rating_count: 100,
      };

      const popularScore = calculateRelevanceScore(popularGame, "Test Game");
      const unpopularScore = calculateRelevanceScore(
        unpopularGame,
        "Test Game",
      );

      expect(popularScore).toBeGreaterThan(unpopularScore);
    });

    it("should handle case insensitive search", () => {
      const score1 = calculateRelevanceScore(mockGame, "test game");
      const score2 = calculateRelevanceScore(mockGame, "TEST GAME");
      const score3 = calculateRelevanceScore(mockGame, "Test Game");

      expect(score1).toBe(score2);
      expect(score2).toBe(score3);
    });

    it("should handle whitespace in search", () => {
      const score1 = calculateRelevanceScore(mockGame, "  test game  ");
      const score2 = calculateRelevanceScore(mockGame, "test game");

      expect(score1).toBe(score2);
    });

    it("should return score between 0 and 100", () => {
      const score = calculateRelevanceScore(mockGame, "Test Game");
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe("sortGamesByRelevance", () => {
    const games = [mockGame, mockDLC];

    it("should return original array for invalid inputs", () => {
      expect(sortGamesByRelevance(null, "test")).toBe(null);
      expect(sortGamesByRelevance(games, null)).toEqual(games);
    });

    it("should sort games by relevance score", () => {
      const sorted = sortGamesByRelevance(games, "Test Game");

      expect(sorted).toHaveLength(2);
      expect(sorted[0].relevanceScore).toBeGreaterThan(
        sorted[1].relevanceScore,
      );
    });

    it("should filter out zero score games", () => {
      const unrelatedGame = {
        ...mockGame,
        name: "Completely Different Game",
      };

      const allGames = [mockGame, unrelatedGame];
      const sorted = sortGamesByRelevance(allGames, "Test Game");

      expect(sorted).toHaveLength(1);
      expect(sorted[0].name).toBe("Test Game");
    });

    it("should preserve original game properties", () => {
      const sorted = sortGamesByRelevance(games, "Test Game");

      expect(sorted[0]).toHaveProperty("id");
      expect(sorted[0]).toHaveProperty("name");
      expect(sorted[0]).toHaveProperty("summary");
      expect(sorted[0]).toHaveProperty("genres");
      expect(sorted[0]).toHaveProperty("platforms");
    });
  });

  describe("formatRelevanceScore", () => {
    it("should return excellent match for high scores", () => {
      const result = formatRelevanceScore(85);

      expect(result.percentage).toBe(85);
      expect(result.label).toBe("Mükemmel Eşleşme");
      expect(result.color).toBe("text-green-600");
    });

    it("should return good match for medium-high scores", () => {
      const result = formatRelevanceScore(70);

      expect(result.percentage).toBe(70);
      expect(result.label).toBe("İyi Eşleşme");
      expect(result.color).toBe("text-blue-600");
    });

    it("should return medium match for medium scores", () => {
      const result = formatRelevanceScore(50);

      expect(result.percentage).toBe(50);
      expect(result.label).toBe("Orta Eşleşme");
      expect(result.color).toBe("text-yellow-600");
    });

    it("should return weak match for low scores", () => {
      const result = formatRelevanceScore(30);

      expect(result.percentage).toBe(30);
      expect(result.label).toBe("Zayıf Eşleşme");
      expect(result.color).toBe("text-orange-600");
    });

    it("should return poor match for very low scores", () => {
      const result = formatRelevanceScore(10);

      expect(result.percentage).toBe(10);
      expect(result.label).toBe("Düşük Eşleşme");
      expect(result.color).toBe("text-red-600");
    });

    it("should handle boundary values", () => {
      const excellent = formatRelevanceScore(80);
      const good = formatRelevanceScore(60);
      const medium = formatRelevanceScore(40);
      const weak = formatRelevanceScore(20);

      expect(excellent.label).toBe("Mükemmel Eşleşme");
      expect(good.label).toBe("İyi Eşleşme");
      expect(medium.label).toBe("Orta Eşleşme");
      expect(weak.label).toBe("Zayıf Eşleşme");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty search term", () => {
      const score = calculateRelevanceScore(mockGame, "");
      expect(score).toBe(0);
    });

    it("should handle whitespace-only search term", () => {
      const score = calculateRelevanceScore(mockGame, "   ");
      expect(score).toBe(0);
    });

    it("should handle special characters in search", () => {
      const score = calculateRelevanceScore(mockGame, "Test@Game#123");
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it("should handle very long search terms", () => {
      const longTerm = "a".repeat(1000);
      const score = calculateRelevanceScore(mockGame, longTerm);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should handle game with missing properties", () => {
      const incompleteGame = {
        id: 1,
        name: "Test Game",
        // Missing summary, genres, platforms, rating
      };

      const score = calculateRelevanceScore(incompleteGame, "Test Game");
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should handle game with null properties", () => {
      const gameWithNulls = {
        id: 1,
        name: "Test Game",
        summary: null,
        genres: null,
        platforms: null,
        rating: null,
        rating_count: null,
      };

      const score = calculateRelevanceScore(gameWithNulls, "Test Game");
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe("Performance", () => {
    it("should handle large arrays efficiently", () => {
      const largeGames = Array(1000)
        .fill()
        .map((_, index) => ({
          id: index,
          name: `Game ${index}`,
          summary: `Description for game ${index}`,
          genres: [{ name: "Action" }],
          platforms: [{ name: "PC" }],
          rating: 75,
          rating_count: 100,
        }));

      const startTime = performance.now();
      const sorted = sortGamesByRelevance(largeGames, "Game 1");
      const endTime = performance.now();

      expect(sorted).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not modify input array", () => {
      const originalGames = [mockGame, mockDLC];
      const gamesCopy = [...originalGames];

      sortGamesByRelevance(originalGames, "Test Game");

      expect(originalGames).toEqual(gamesCopy);
    });
  });

  describe("Integration", () => {
    it("should work end-to-end with realistic data", () => {
      const realisticGames = [
        {
          id: 1,
          name: "The Legend of Zelda: Breath of the Wild",
          summary: "An open-world adventure game",
          genres: [{ name: "Adventure" }, { name: "Action" }],
          platforms: [{ name: "Nintendo Switch" }],
          rating: 97,
          rating_count: 15000,
          category: 0,
        },
        {
          id: 2,
          name: "Zelda DLC: Expansion Pass",
          summary: "Additional content for Zelda",
          genres: [{ name: "Adventure" }],
          platforms: [{ name: "Nintendo Switch" }],
          rating: 85,
          rating_count: 2000,
          category: 1,
          parent_game: 1,
        },
      ];

      const sorted = sortGamesByRelevance(realisticGames, "Zelda");

      expect(sorted).toHaveLength(2);
      expect(sorted[0].name).toBe("The Legend of Zelda: Breath of the Wild");
      expect(sorted[0].relevanceScore).toBeGreaterThan(
        sorted[1].relevanceScore,
      );
    });
  });
});
