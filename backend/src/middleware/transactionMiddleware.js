// Transaction Middleware
// Kritik işlemler için transaction management

import { prisma } from "../lib/prisma.js";

/**
 * Transaction wrapper for critical operations
 * @param {Function} operationFn - Operation to execute in transaction
 * @returns {Promise<any>} - Operation result
 */
export async function withTransaction(operationFn) {
  try {
    return await prisma.$transaction(async (tx) => {
      return await operationFn(tx);
    });
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}

/**
 * Library transaction with validation
 * @param {string} userId - User ID
 * @param {string} gameId - Game ID
 * @param {object} data - Library entry data
 * @returns {Promise<object>} - Updated library entry
 */
export async function createLibraryEntryWithTransaction(userId, gameId, data) {
  return await withTransaction(async (tx) => {
    // Check if entry already exists
    const existingEntry = await tx.libraryEntry.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
    });

    if (existingEntry) {
      throw new Error("Game already exists in library");
    }

    // Create library entry
    const libraryEntry = await tx.libraryEntry.create({
      data: {
        userId,
        gameId,
        ...data,
        addedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Update user stats
    await tx.userStats.update({
      where: { userId },
      data: {
        totalGames: {
          increment: 1,
        },
      },
    });

    return libraryEntry;
  });
}

/**
 * Game update transaction with version control
 * @param {string} gameId - Game ID
 * @param {object} data - Game update data
 * @returns {Promise<object>} - Updated game
 */
export async function updateGameWithTransaction(gameId, data) {
  return await withTransaction(async (tx) => {
    // Get current game for version check
    const currentGame = await tx.game.findUnique({
      where: { id: gameId },
      select: { accessCount: true },
    });

    if (!currentGame) {
      throw new Error("Game not found");
    }

    // Update game with version increment
    const updatedGame = await tx.game.update({
      where: { id: gameId },
      data: {
        ...data,
        lastAccessed: new Date(),
        accessCount: currentGame.accessCount + 1,
        updatedAt: new Date(),
      },
    });

    return updatedGame;
  });
}

/**
 * User creation transaction with profile setup
 * @param {object} userData - User data
 * @returns {Promise<object>} - Created user with profile
 */
export async function createUserWithTransaction(userData) {
  return await withTransaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActive: new Date(),
      },
    });

    // Create user preferences
    await tx.userPreferences.create({
      data: {
        userId: user.id,
        preferredStatus: "Oynamak İstiyorum",
        autoLoadHLTB: true,
        autoLoadMetacritic: true,
        autoGenerateCampaigns: true,
      },
    });

    // Create user stats
    await tx.userStats.create({
      data: {
        userId: user.id,
        totalPlayTime: 0,
        totalSessions: 0,
        gamesPlayed: 0,
        gamesCompleted: 0,
      },
    });

    return user;
  });
}

/**
 * Batch operation with error handling
 * @param {Array} operations - Array of operations to execute
 * @param {number} batchSize - Batch size for processing
 * @returns {Promise<Array>} - Results of all operations
 */
export async function executeBatchOperations(operations, batchSize = 50) {
  const results = [];

  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);

    try {
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);

      console.log(
        `✅ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(operations.length / batchSize)} completed (${batch.length} operations)`,
      );
    } catch (error) {
      console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error);

      // Add failed operations to results with error info
      const failedOps = batch.map((op, index) => ({
        ...op,
        error: error.message,
        batchIndex: Math.floor(i / batchSize) + 1,
        indexInBatch: index,
      }));

      results.push(...failedOps);
    }
  }

  return results;
}

/**
 * Transaction retry mechanism
 * @param {Function} operationFn - Operation to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise<any>} - Operation result
 */
export async function executeWithRetry(
  operationFn,
  maxRetries = 3,
  delay = 1000,
) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operationFn();

      if (attempt > 1) {
        console.log(
          `✅ Retry ${attempt} succeeded after ${attempt - 1} failures`,
        );
      }

      return result;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Retry ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

/**
 * Data consistency validator
 * @param {string} entityType - Entity type to validate
 * @param {object} data - Data to validate
 * @returns {Promise<boolean>} - Validation result
 */
export async function validateDataConsistency(entityType, data) {
  console.log(`🔍 Validating ${entityType} data consistency...`);

  try {
    switch (entityType) {
      case "library_entry":
        if (!data.userId || !data.gameId) {
          throw new Error("Library entry requires userId and gameId");
        }
        if (data.rating && (data.rating < 0 || data.rating > 10)) {
          throw new Error("Rating must be between 0 and 10");
        }
        break;

      case "game":
        if (!data.name || data.name.trim().length === 0) {
          throw new Error("Game name is required");
        }
        if (data.rating && (data.rating < 0 || data.rating > 10)) {
          throw new Error("Game rating must be between 0 and 10");
        }
        break;

      case "user":
        if (!data.username || data.username.trim().length === 0) {
          throw new Error("Username is required");
        }
        if (data.email && !data.email.includes("@")) {
          throw new Error("Invalid email format");
        }
        break;

      default:
        return true;
    }

    console.log(`✅ ${entityType} data consistency validated`);
    return true;
  } catch (error) {
    console.error(`❌ ${entityType} validation error:`, error);
    throw error;
  }
}

/**
 * Performance monitor for transactions
 * @param {string} operation - Operation type
 * @param {number} duration - Operation duration in ms
 */
export function logTransactionPerformance(operation, duration) {
  const performanceLog = {
    operation,
    duration,
    timestamp: new Date().toISOString(),
    performance: duration > 1000 ? "slow" : "normal", // Slow if > 1 second
  };

  if (duration > 1000) {
    console.warn(`🐌 Slow transaction detected:`, performanceLog);
  } else {
    console.log(`⚡ Transaction performance:`, performanceLog);
  }

  // Store performance log in database (optional)
  try {
    prisma.performanceLog
      .create({
        data: performanceLog,
      })
      .catch((error) => {
        console.error("Failed to log performance:", error);
      });
  } catch (error) {
    console.error("Failed to log performance:", error);
  }
}
