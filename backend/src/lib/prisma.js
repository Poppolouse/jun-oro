import { PrismaClient } from "@prisma/client";

// --- Configuration Constants ---

// Default database connection settings
const DEFAULT_CONNECTION_LIMIT = 20;
const DEFAULT_CONNECT_TIMEOUT_MS = 10000;
const DEFAULT_QUERY_TIMEOUT_MS = 30000;

// Default settings for transaction retry logic
const DEFAULT_MAX_RETRIES = 3;
const EXPONENTIAL_BACKOFF_BASE_MS = 1000;

// Error codes and messages that indicate a query might succeed on retry
const RETRYABLE_ERROR_CODES = ["P1001", "P1002", "P1008"];
const RETRYABLE_ERROR_MESSAGES = ["connection", "timeout", "deadlock"];


// --- Prisma Client Singleton ---

// This is a workaround to ensure that in a development environment with hot-reloading,
// we don't end up with multiple instances of PrismaClient, which would exhaust the
// database connection pool.
// In production, a single instance is created.
const globalForPrisma = globalThis;

/**
 * Creates a new PrismaClient instance with optimized settings.
 * This function centralizes the client configuration.
 * @returns {PrismaClient}
 */
const createPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    // NOTE: The __internal property is used for fine-tuning engine behavior.
    // This may not be part of the public API and could change in future versions.
    __internal: {
      engine: {
        connectionLimit: parseInt(
          process.env.DB_CONNECTION_LIMIT || DEFAULT_CONNECTION_LIMIT.toString(),
        ),
        connectTimeout: parseInt(
          process.env.DB_CONNECT_TIMEOUT || DEFAULT_CONNECT_TIMEOUT_MS.toString(),
        ),
        batchQueries: true, // Automatically batches multiple queries in one tick
        queryTimeout: parseInt(
          process.env.DB_QUERY_TIMEOUT || DEFAULT_QUERY_TIMEOUT_MS.toString(),
        ),
      },
    },
  });
};

/**
 * The singleton instance of the Prisma Client for all database interactions.
 * It is configured with connection pooling, retry logic, and performance optimizations.
 * @type {PrismaClient}
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}


// --- Graceful Shutdown ---

/**
 * Gracefully disconnects from the database.
 * This function is registered to run on process exit signals.
 * @returns {Promise<void>}
 */
async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.info("Database disconnected successfully.");
  } catch (error) {
    console.error("Error disconnecting from database:", error);
  }
}

// Register shutdown hooks
process.on("beforeExit", disconnectDatabase);
process.on("SIGINT", async () => {
  await disconnectDatabase();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await disconnectDatabase();
  process.exit(0);
});


// --- Database Utility Functions ---

/**
 * Determines if a Prisma error is retryable based on its code or message.
 * @param {Error} error - The error to check.
 * @returns {boolean} - True if the error is retryable.
 */
function isRetryableError(error) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const hasRetryableCode = error.code && RETRYABLE_ERROR_CODES.includes(error.code);
  const hasRetryableMessage =
    error.message &&
    RETRYABLE_ERROR_MESSAGES.some((msg) =>
      error.message.toLowerCase().includes(msg)
    );

  return hasRetryableCode || hasRetryableMessage;
}

/**
 * Executes multiple Prisma queries in parallel using `Promise.all`.
 * Provides consolidated error handling.
 * @param {Array<Promise<any>>} queries - An array of Prisma query promises.
 * @returns {Promise<Array<any>>} - An array containing the results of all queries.
 * @throws {Error} - Throws if any of the queries fail.
 */
export async function executeParallelQueries(queries) {
  if (!Array.isArray(queries) || queries.length === 0) {
    throw new Error("Input must be a non-empty array of query promises.");
  }

  try {
    return await Promise.all(queries);
  } catch (error) {
    console.error("Parallel query execution failed:", {
      errorMessage: error.message,
      stack: error.stack,
      queryCount: queries.length,
    });
    throw error; // Re-throw the original error
  }
}

/**
 * Executes a set of Prisma operations within a transaction with robust retry logic.
 * Implements exponential backoff with jitter to handle transient database errors.
 * @param {(prisma: PrismaClient) => Promise<any>} queryFn - A function that receives the Prisma transaction client and returns a promise.
 * @param {number} [maxRetries=DEFAULT_MAX_RETRIES] - The maximum number of retry attempts.
 * @returns {Promise<any>} - The result of the query function.
 * @throws {Error} - Throws if the transaction fails after all retry attempts.
 */
export async function executeWithTransaction(queryFn, maxRetries = DEFAULT_MAX_RETRIES) {
  if (typeof queryFn !== "function") {
    throw new Error("queryFn must be a function.");
  }
  if (typeof maxRetries !== "number" || maxRetries < 0) {
    throw new Error("maxRetries must be a non-negative number.");
  }

  let lastError;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await prisma.$transaction(queryFn);
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt > maxRetries) {
        console.error(`Transaction failed on final attempt (${attempt}):`, {
          errorMessage: error.message,
          errorCode: error.code,
        });
        throw error;
      }

      // Exponential backoff with jitter
      const delay = Math.pow(2, attempt - 1) * EXPONENTIAL_BACKOFF_BASE_MS + Math.random() * 200;
      
      console.warn(
        `Transaction attempt ${attempt} failed. Retrying in ${Math.round(delay)}ms...`,
        { errorMessage: error.message, errorCode: error.code }
      );
      
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This line should not be reachable, but it satisfies TypeScript's control flow analysis.
  throw lastError;
}
