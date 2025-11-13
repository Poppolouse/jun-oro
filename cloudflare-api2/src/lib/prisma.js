// Cloudflare API Prisma Client
// PostgreSQL backend ile uyumlu database bağlantısı

import { PrismaClient } from "@prisma/client";

// Global Prisma instance for Cloudflare Workers
let prisma;

/**
 * Initialize Prisma client for Cloudflare Workers environment
 * @param {object} env - Cloudflare Workers environment variables
 * @returns {PrismaClient} Prisma client instance
 */
export function getPrismaClient(env) {
  if (prisma) {
    return prisma;
  }

  // Create Prisma client with PostgreSQL connection
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  return prisma;
}

/**
 * Graceful shutdown for Prisma client
 */
export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

/**
 * Database health check
 * @param {object} env - Cloudflare Workers environment variables
 * @returns {Promise<boolean>} Database connection status
 */
export async function checkDatabaseHealth(env) {
  try {
    const client = getPrismaClient(env);
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

/**
 * Transaction wrapper for Cloudflare Workers
 * @param {object} env - Cloudflare Workers environment variables
 * @param {Function} callback - Transaction callback
 * @returns {Promise<any>} Transaction result
 */
export async function withTransaction(env, callback) {
  const client = getPrismaClient(env);

  try {
    return await client.$transaction(callback);
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}

// Export default client for backward compatibility
export { getPrismaClient as prisma };
