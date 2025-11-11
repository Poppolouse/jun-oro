import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

/**
 * Optimized Prisma client configuration with connection pooling and performance settings
 * @type {PrismaClient}
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    // Connection pooling optimization
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Query optimization settings
    __internal: {
      engine: {
        // Enable connection pooling
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "20"),
        // Set connection timeout
        connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || "10000"),
        // Enable query batching
        batchQueries: true,
        // Set query timeout
        queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || "30000"),
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown with connection cleanup
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

/**
 * Executes multiple queries in parallel with error handling
 * @param {Array<Function>} queries - Array of query functions
 * @returns {Promise<Array>} - Results of all queries
 */
export async function executeParallelQueries(queries) {
  try {
    return await Promise.all(queries);
  } catch (error) {
    console.error("Parallel query execution failed:", error);
    throw error;
  }
}

/**
 * Executes queries with transaction and retry logic
 * @param {Function} queryFn - Function containing Prisma queries
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<any>} - Query result
 */
export async function executeWithTransaction(queryFn, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(queryFn);
    } catch (error) {
      lastError = error;
      
      // Retry on connection errors
      if (attempt < maxRetries && isRetryableError(error)) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.warn(`Transaction attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Determines if an error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean} - Whether error is retryable
 */
function isRetryableError(error) {
  const retryableCodes = ['P1001', 'P1002', 'P1008']; // Connection timeouts
  const retryableMessages = ['connection', 'timeout', 'deadlock'];
  
  return retryableCodes.some(code => error.code === code) ||
         retryableMessages.some(msg => error.message.toLowerCase().includes(msg));
}
