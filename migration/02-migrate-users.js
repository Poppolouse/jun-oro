/**
 * User Migration Script
 * Cloudflare API SQLite/D1 → PostgreSQL (Unified Schema)
 * 
 * Bu script kullanıcı verilerini SQLite'dan PostgreSQL'e taşır
 * Sessions, user mapping ve validation işlemlerini içerir
 */

import { PrismaClient } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";
import bcrypt from "bcryptjs";

import {
  createDatabaseConnection,
  closeDatabaseConnection,
  processBatch,
  logMigrationStep,
  logMigrationStart,
  logMigrationEnd,
  handleMigrationError,
  validateEnvironmentVariable,
} from "./utils/migrationHelpers.js";

// =============================================================================
// CONSTANTS
// =============================================================================

const BATCH_SIZE_USERS = 50;
const BATCH_SIZE_SESSIONS = 100;
const DEFAULT_USER_ROLE = "user";
const MIGRATION_NAME = "Users Migration";

// =============================================================================
// DATA TRANSFORMATION HELPERS
// =============================================================================

/**
 * SQLite user verisini PostgreSQL user'ına dönüştürür
 * @param {Object} sqliteUser - SQLite kullanıcı verisi
 * @returns {Object} PostgreSQL uyumlu kullanıcı verisi
 */
function transformUser(sqliteUser) {
  if (!sqliteUser) {
    throw new Error("SQLite user verisi boş olamaz");
  }

  return {
    id: createId(),
    name: sqliteUser.username,
    username: sqliteUser.username,
    email: sqliteUser.email,
    password: sqliteUser.password_hash,
    role: sqliteUser.role || DEFAULT_USER_ROLE,
    status: sqliteUser.is_active ? "active" : "suspended",
    bio: sqliteUser.bio || null,
    isActive: sqliteUser.is_active,
    createdAt: new Date(sqliteUser.created_at),
    updatedAt: new Date(sqliteUser.updated_at),
    lastActive: sqliteUser.last_login
      ? new Date(sqliteUser.last_login)
      : new Date(),
    lastLogin: sqliteUser.last_login ? new Date(sqliteUser.last_login) : null,
  };
}

/**
 * SQLite session verisini PostgreSQL session'ına dönüştürür
 * @param {Object} sqliteSession - SQLite session verisi
 * @param {Map} userIdMapping - Eski ID → yeni ID mapping
 * @returns {Object} PostgreSQL uyumlu session verisi
 */
function transformSession(sqliteSession, userIdMapping) {
  if (!sqliteSession) {
    throw new Error("SQLite session verisi boş olamaz");
  }

  const newUserId = userIdMapping.get(sqliteSession.user_id);
  if (!newUserId) {
    throw new Error(`User ID mapping bulunamadı: ${sqliteSession.user_id}`);
  }

  return {
    id: createId(),
    userId: newUserId,
    expiresAt: new Date(sqliteSession.expires_at),
    createdAt: new Date(sqliteSession.created_at),
    ipAddress: sqliteSession.ip_address || null,
    userAgent: sqliteSession.user_agent || null,
    isActive: sqliteSession.is_active,
  };
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

/**
 * Source database'den kullanıcıları çeker
 * @param {Object} sourceDB - SQLite database connection
 * @returns {Promise<Array>} Kullanıcı listesi
 */
async function fetchUsersFromSource(sourceDB) {
  try {
    logMigrationStep("FETCH_USERS", "Source database'den kullanıcılar çekiliyor");
    const result = await sourceDB.prepare("SELECT * FROM users").all();
    
    if (!result.results || result.results.length === 0) {
      logMigrationStep("FETCH_USERS", "Hiç kullanıcı bulunamadı", "warn");
      return [];
    }

    logMigrationStep("FETCH_USERS", `${result.results.length} kullanıcı bulundu`, "success");
    return result.results;
  } catch (error) {
    handleMigrationError(error, "FETCH_USERS");
    throw error;
  }
}

/**
 * Source database'den session'ları çeker
 * @param {Object} sourceDB - SQLite database connection
 * @returns {Promise<Array>} Session listesi
 */
async function fetchSessionsFromSource(sourceDB) {
  try {
    logMigrationStep("FETCH_SESSIONS", "Source database'den session'lar çekiliyor");
    const result = await sourceDB.prepare("SELECT * FROM sessions").all();
    
    if (!result.results || result.results.length === 0) {
      logMigrationStep("FETCH_SESSIONS", "Hiç session bulunamadı", "warn");
      return [];
    }

    logMigrationStep("FETCH_SESSIONS", `${result.results.length} session bulundu`, "success");
    return result.results;
  } catch (error) {
    handleMigrationError(error, "FETCH_SESSIONS");
    throw error;
  }
}

/**
 * Transform edilmiş kullanıcıları batch halinde PostgreSQL'e yazar
 * @param {Object} targetDB - PostgreSQL connection
 * @param {Array} transformedUsers - Transform edilmiş kullanıcılar
 * @returns {Promise<void>}
 */
async function writeUsersToTarget(targetDB, transformedUsers) {
  try {
    await targetDB.user.createMany({
      data: transformedUsers,
      skipDuplicates: true,
    });
  } catch (error) {
    handleMigrationError(error, "WRITE_USERS");
    throw error;
  }
}

/**
 * Transform edilmiş session'ları batch halinde PostgreSQL'e yazar
 * @param {Object} targetDB - PostgreSQL connection
 * @param {Array} transformedSessions - Transform edilmiş session'lar
 * @returns {Promise<void>}
 */
async function writeSessionsToTarget(targetDB, transformedSessions) {
  try {
    await targetDB.session.createMany({
      data: transformedSessions,
      skipDuplicates: true,
    });
  } catch (error) {
    handleMigrationError(error, "WRITE_SESSIONS");
    throw error;
  }
}

// =============================================================================
// MIGRATION FUNCTIONS
// =============================================================================

/**
 * Users migration işlemini yönetir
 * @param {Object} sourceDB - SQLite database connection
 * @param {Object} targetDB - PostgreSQL connection
 * @returns {Promise<Map>} User ID mapping (eski ID → yeni ID)
 */
async function migrateUsers(sourceDB, targetDB) {
  logMigrationStep("USERS_MIGRATION", "Users migration başlatılıyor...");

  try {
    const sqliteUsers = await fetchUsersFromSource(sourceDB);
    
    if (sqliteUsers.length === 0) {
      logMigrationStep("USERS_MIGRATION", "Migrate edilecek kullanıcı yok", "warn");
      return new Map();
    }

    const userIdMapping = new Map();

    const processUserBatch = async (batch, currentBatch, totalBatches) => {
      const transformedUsers = batch.map((user) => {
        const transformed = transformUser(user);
        userIdMapping.set(user.id, transformed.id);
        return transformed;
      });

      await writeUsersToTarget(targetDB, transformedUsers);
      
      return transformedUsers;
    };

    await processBatch(
      sqliteUsers,
      BATCH_SIZE_USERS,
      processUserBatch,
      "kullanıcı"
    );

    logMigrationStep(
      "USERS_MIGRATION",
      `${sqliteUsers.length} kullanıcı başarıyla migrate edildi`,
      "success"
    );
    
    return userIdMapping;
  } catch (error) {
    handleMigrationError(error, "USERS_MIGRATION");
    throw error;
  }
}

/**
 * Sessions migration işlemini yönetir
 * @param {Object} sourceDB - SQLite database connection
 * @param {Object} targetDB - PostgreSQL connection
 * @param {Map} userIdMapping - User ID mapping
 * @returns {Promise<void>}
 */
async function migrateSessions(sourceDB, targetDB, userIdMapping) {
  logMigrationStep("SESSIONS_MIGRATION", "Sessions migration başlatılıyor...");

  try {
    const sqliteSessions = await fetchSessionsFromSource(sourceDB);
    
    if (sqliteSessions.length === 0) {
      logMigrationStep("SESSIONS_MIGRATION", "Migrate edilecek session yok", "warn");
      return;
    }

    const processSessionBatch = async (batch, currentBatch, totalBatches) => {
      const transformedSessions = batch.map((session) =>
        transformSession(session, userIdMapping)
      );

      await writeSessionsToTarget(targetDB, transformedSessions);
      
      return transformedSessions;
    };

    await processBatch(
      sqliteSessions,
      BATCH_SIZE_SESSIONS,
      processSessionBatch,
      "session"
    );

    logMigrationStep(
      "SESSIONS_MIGRATION",
      `${sqliteSessions.length} session başarıyla migrate edildi`,
      "success"
    );
  } catch (error) {
    handleMigrationError(error, "SESSIONS_MIGRATION");
    throw error;
  }
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * User migration validation işlemlerini yönetir
 * @param {Object} sourceDB - SQLite database connection
 * @param {Object} targetDB - PostgreSQL connection
 * @param {Map} userIdMapping - User ID mapping
 * @returns {Promise<boolean>} Validation başarılı mı?
 */
async function validateUsers(sourceDB, targetDB, userIdMapping) {
  logMigrationStep("VALIDATION", "User validation başlatılıyor...");

  try {
    // Source count kontrolü
    const sourceResult = await sourceDB
      .prepare("SELECT COUNT(*) as count FROM users")
      .first();
    const sourceCount = sourceResult?.count || 0;

    // Target count kontrolü
    const targetCount = await targetDB.user.count();

    logMigrationStep("VALIDATION", `Source users: ${sourceCount}`);
    logMigrationStep("VALIDATION", `Target users: ${targetCount}`);

    if (sourceCount !== targetCount) {
      const errorMsg = `User count mismatch: source=${sourceCount}, target=${targetCount}`;
      logMigrationStep("VALIDATION", errorMsg, "error");
      throw new Error(errorMsg);
    }

    // Orphaned sessions kontrolü
    const orphanedSessions = await targetDB.session.findMany({
      where: {
        userId: {
          notIn: Array.from(userIdMapping.values()),
        },
      },
    });

    if (orphanedSessions.length > 0) {
      logMigrationStep(
        "VALIDATION",
        `${orphanedSessions.length} orphaned session bulundu`,
        "warn"
      );
    }

    logMigrationStep("VALIDATION", "User validation başarılı", "success");
    return true;
  } catch (error) {
    handleMigrationError(error, "VALIDATION");
    throw error;
  }
}

// =============================================================================
// MAIN MIGRATION FUNCTION
// =============================================================================

/**
 * Complete user migration sürecini yönetir
 * @param {Object} sourceDB - SQLite database connection
 * @param {Object} targetDB - PostgreSQL connection
 * @returns {Promise<Object>} Migration özeti
 */
async function migrateAllUsers(sourceDB, targetDB) {
  const startTime = Date.now();
  logMigrationStart(MIGRATION_NAME);

  try {
    // Users migration
    const userIdMapping = await migrateUsers(sourceDB, targetDB);

    // Sessions migration
    await migrateSessions(sourceDB, targetDB, userIdMapping);

    // Validation
    await validateUsers(sourceDB, targetDB, userIdMapping);

    // Migration özeti
    const sourceCountResult = await sourceDB.prepare("SELECT COUNT(*) as count FROM users").first();
    const migrationSummary = {
      timestamp: new Date().toISOString(),
      type: "users",
      sourceCount: sourceCountResult?.count || 0,
      targetCount: await targetDB.user.count(),
      status: "completed",
      userIdMapping: Object.fromEntries(userIdMapping),
    };

    logMigrationEnd(MIGRATION_NAME, startTime, migrationSummary);
    return migrationSummary;
  } catch (error) {
    handleMigrationError(error, "COMPLETE_MIGRATION");
    throw error;
  }
}

// =============================================================================
// SCRIPT EXECUTION
// =============================================================================

// This script is designed to be called by an orchestrator, not run directly.
// The direct execution logic has been removed to enforce modularity.

// Export functions
export {
  transformUser,
  transformSession,
  migrateUsers,
  migrateSessions,
  validateUsers,
  migrateAllUsers,
};
