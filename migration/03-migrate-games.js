/**
 * Games Migration Script
 * Cloudflare API SQLite/D1 → PostgreSQL (Unified Schema)
 * 
 * Bu script SQLite games tablosunu PostgreSQL'e taşır
 */

import { PrismaClient } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";
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

/** Batch processing boyutları */
const BATCH_SIZES = {
  GAMES: 25, // Games daha büyük olduğu için küçük batch
  TAGS: 50,
  RELATIONS: 100,
  USER_GAMES: 50,
};

/** Default değerler */
const DEFAULT_VALUES = {
  ACCESS_COUNT: 1,
  GAME_STATUS: "active",
  USER_GAME_STATUS: "want_to_play",
  PLAY_TIME_HOURS: 0,
};

// =============================================================================
// DATA TRANSFORMATION HELPERS
// =============================================================================

/**
 * SQLite game verisini PostgreSQL game'ına dönüştürür
 * @param {Object} sqliteGame - SQLite game objesi
 * @returns {Object} PostgreSQL game objesi
 */
function transformGame(sqliteGame) {
  if (!sqliteGame) {
    throw new Error("SQLite game objesi null veya undefined");
  }

  return {
    id: createId(),
    name: sqliteGame.title,
    cover: sqliteGame.image_url || null,
    coverKey: null, // R2 key daha sonra belirlenecek
    firstReleaseDate: sqliteGame.release_date
      ? new Date(sqliteGame.release_date)
      : null,
    genres: sqliteGame.genre ? [sqliteGame.genre] : [],
    platforms: sqliteGame.platform ? [sqliteGame.platform] : [],
    summary: sqliteGame.description || null,
    description: sqliteGame.description || null,
    rating: sqliteGame.rating || null,
    developer: sqliteGame.developer || null,
    publisher: sqliteGame.publisher || null,

    // Cloudflare API uyumlu alanlar
    imageUrl: sqliteGame.image_url || null,
    trailerUrl: sqliteGame.trailer_url || null,
    steamUrl: sqliteGame.steam_url || null,
    epicUrl: sqliteGame.epic_url || null,
    gogUrl: sqliteGame.gog_url || null,
    status: sqliteGame.status || DEFAULT_VALUES.GAME_STATUS,
    createdBy: sqliteGame.created_by ? createId() : null,
    metadata: sqliteGame.metadata ? JSON.parse(sqliteGame.metadata) : null,

    cachedAt: new Date(sqliteGame.created_at),
    lastAccessed: new Date(sqliteGame.created_at),
    accessCount: DEFAULT_VALUES.ACCESS_COUNT,
    createdAt: new Date(sqliteGame.created_at),
    updatedAt: new Date(sqliteGame.updated_at),
  };
}

/**
 * SQLite game tag verisini PostgreSQL gameTag'ına dönüştürür
 * @param {Object} sqliteTag - SQLite tag objesi
 * @returns {Object} PostgreSQL gameTag objesi
 */
function transformGameTag(sqliteTag) {
  if (!sqliteTag) {
    throw new Error("SQLite tag objesi null veya undefined");
  }

  return {
    id: createId(),
    name: sqliteTag.name,
    description: sqliteTag.description || null,
    color: sqliteTag.color || null,
    createdAt: new Date(sqliteTag.created_at),
  };
}

/**
 * SQLite game tag relation verisini PostgreSQL'e dönüştürür
 * @param {Object} sqliteRelation - SQLite relation objesi
 * @param {Map} gameIdMapping - Eski → yeni ID mapping
 * @param {Map} tagMapping - Tag name → ID mapping
 * @returns {Object|null} PostgreSQL relation objesi
 */
function transformGameTagRelation(sqliteRelation, gameIdMapping, tagMapping) {
  if (!sqliteRelation || !gameIdMapping || !tagMapping) {
    return null;
  }

  const newGameId = gameIdMapping.get(sqliteRelation.game_id);
  const newTagId = tagMapping.get(sqliteRelation.tag_id);

  if (!newGameId || !newTagId) {
    return null;
  }

  return {
    gameId: newGameId,
    tagId: newTagId,
  };
}

/**
 * SQLite user game verisini PostgreSQL'e dönüştürür
 * @param {Object} sqliteUserGame - SQLite user game objesi
 * @param {Map} userIdMapping - Eski → yeni user ID mapping
 * @param {Map} gameIdMapping - Eski → yeni game ID mapping
 * @returns {Object|null} PostgreSQL userGame objesi
 */
function transformUserGame(sqliteUserGame, userIdMapping, gameIdMapping) {
  if (!sqliteUserGame || !userIdMapping || !gameIdMapping) {
    return null;
  }

  const newUserId = userIdMapping.get(sqliteUserGame.user_id);
  const newGameId = gameIdMapping.get(sqliteUserGame.game_id);

  if (!newUserId || !newGameId) {
    return null;
  }

  return {
    id: sqliteUserGame.id, // Integer ID korunur (legacy)
    userId: newUserId,
    gameId: newGameId,
    status: sqliteUserGame.status || DEFAULT_VALUES.USER_GAME_STATUS,
    rating: sqliteUserGame.rating || null,
    review: sqliteUserGame.review || null,
    playTimeHours: sqliteUserGame.play_time_hours || DEFAULT_VALUES.PLAY_TIME_HOURS,
    addedAt: new Date(sqliteUserGame.added_at),
    updatedAt: new Date(sqliteUserGame.updated_at),
  };
}

// =============================================================================
// BATCH PROCESSING FUNCTIONS
// =============================================================================

/**
 * Games batch'ini PostgreSQL'e yazar
 * @param {Array} batch - Game batch'i
 * @param {number} batchNumber - Batch numarası
 * @param {number} totalBatches - Toplam batch sayısı
 * @param {Object} targetDB - PostgreSQL client
 * @returns {Promise<Array>} İşlenmiş oyunlar
 */
async function processGamesBatch(batch, batchNumber, totalBatches, targetDB) {
  const transformedGames = batch.map((game) => transformGame(game));

  await targetDB.game.createMany({
    data: transformedGames,
    skipDuplicates: true,
  });

  return transformedGames;
}

/**
 * Tags batch'ini PostgreSQL'e yazar
 * @param {Array} batch - Tag batch'i
 * @param {number} batchNumber - Batch numarası
 * @param {number} totalBatches - Toplam batch sayısı
 * @param {Object} targetDB - PostgreSQL client
 * @returns {Promise<Array>} İşlenmiş tag'ler
 */
async function processTagsBatch(batch, batchNumber, totalBatches, targetDB) {
  const transformedTags = batch.map((tag) => transformGameTag(tag));

  await targetDB.gameTag.createMany({
    data: transformedTags,
    skipDuplicates: true,
  });

  return transformedTags;
}

/**
 * Relations batch'ini PostgreSQL'e yazar
 * @param {Array} batch - Relation batch'i
 * @param {number} batchNumber - Batch numarası
 * @param {number} totalBatches - Toplam batch sayısı
 * @param {Object} targetDB - PostgreSQL client
 * @param {Map} gameIdMapping - Game ID mapping
 * @param {Map} tagMapping - Tag ID mapping
 * @returns {Promise<Array>} İşlenmiş ilişkiler
 */
async function processRelationsBatch(batch, batchNumber, totalBatches, targetDB, gameIdMapping, tagMapping) {
  const transformedRelations = batch
    .map((relation) => transformGameTagRelation(relation, gameIdMapping, tagMapping))
    .filter(Boolean); // null değerleri filtrele

  if (transformedRelations.length === 0) {
    return [];
  }

  await targetDB.gameTagRelation.createMany({
    data: transformedRelations,
    skipDuplicates: true,
  });

  return transformedRelations;
}

/**
 * User games batch'ini PostgreSQL'e yazar
 * @param {Array} batch - User game batch'i
 * @param {number} batchNumber - Batch numarası
 * @param {number} totalBatches - Toplam batch sayısı
 * @param {Object} targetDB - PostgreSQL client
 * @param {Map} userIdMapping - User ID mapping
 * @param {Map} gameIdMapping - Game ID mapping
 * @returns {Promise<Array>} İşlenmiş kullanıcı oyunları
 */
async function processUserGamesBatch(batch, batchNumber, totalBatches, targetDB, userIdMapping, gameIdMapping) {
  const transformedUserGames = batch
    .map((userGame) => transformUserGame(userGame, userIdMapping, gameIdMapping))
    .filter(Boolean); // null değerleri filtrele

  if (transformedUserGames.length === 0) {
    return [];
  }

  await targetDB.userGame.createMany({
    data: transformedUserGames,
    skipDuplicates: true,
  });

  return transformedUserGames;
}

// =============================================================================
// MIGRATION FUNCTIONS
// =============================================================================

/**
 * Games migration
 * SQLite games tablosunu PostgreSQL'e taşır
 * @param {Object} sourceDB - SQLite database connection
 * @param {Object} targetDB - PostgreSQL client
 * @returns {Promise<Map>} Game ID mapping (eski → yeni)
 */
async function migrateGames(sourceDB, targetDB) {
  logMigrationStep("Games", "Migration başlatılıyor", "info");

  try {
    const sqliteGames = await sourceDB.prepare("SELECT * FROM games").all();
    logMigrationStep("Games", `${sqliteGames.results.length} oyun bulundu`, "info");

    const gameIdMapping = new Map();

    const processedGames = await processBatch(
      sqliteGames.results,
      BATCH_SIZES.GAMES,
      processGamesBatch,
      "oyun",
      targetDB,
    );

    // ID mapping oluştur
    processedGames.forEach((game, index) => {
      const originalId = sqliteGames.results[index].id;
      gameIdMapping.set(originalId, game.id);
    });

    logMigrationStep("Games", `${processedGames.length} oyun başarıyla migrate edildi`, "success");
    return gameIdMapping;
  } catch (error) {
    const errorInfo = handleMigrationError(error, "Games Migration");
    throw error;
  }
}

/**
 * Game tags migration
 * SQLite game_tags tablosunu PostgreSQL'e taşır
 * @param {Object} sourceDB - SQLite database connection
 * @param {Object} targetDB - PostgreSQL client
 * @returns {Promise<Array>} Transform edilmiş tag'ler
 */
async function migrateGameTags(sourceDB, targetDB) {
  logMigrationStep("Game Tags", "Migration başlatılıyor", "info");

  try {
    const sqliteTags = await sourceDB.prepare("SELECT * FROM game_tags").all();
    logMigrationStep("Game Tags", `${sqliteTags.results.length} tag bulundu`, "info");

    const transformedTags = await processBatch(
      sqliteTags.results,
      BATCH_SIZES.TAGS,
      processTagsBatch,
      "tag",
      targetDB,
    );

    logMigrationStep("Game Tags", `${transformedTags.length} tag başarıyla migrate edildi`, "success");
    return transformedTags;
  } catch (error) {
    const errorInfo = handleMigrationError(error, "Game Tags Migration");
    throw error;
  }
}

/**
 * Game tag relations migration
 * SQLite game_tag_relations tablosunu PostgreSQL'e taşır
 * @param {Object} sourceDB - SQLite database connection
 * @param {Object} targetDB - PostgreSQL client
 * @param {Map} gameIdMapping - Game ID mapping
 * @param {Map} tagMapping - Tag mapping
 */
async function migrateGameTagRelations(sourceDB, targetDB, gameIdMapping, tagMapping) {
  logMigrationStep("Game Tag Relations", "Migration başlatılıyor", "info");

  try {
    const sqliteRelations = await sourceDB
      .prepare("SELECT * FROM game_tag_relations")
      .all();
    logMigrationStep("Game Tag Relations", `${sqliteRelations.results.length} ilişki bulundu`, "info");

    await processBatch(
      sqliteRelations.results,
      BATCH_SIZES.RELATIONS,
      (batch, batchNumber, totalBatches) => 
        processRelationsBatch(batch, batchNumber, totalBatches, targetDB, gameIdMapping, tagMapping),
      "ilişki",
    );

    logMigrationStep("Game Tag Relations", "İlişkiler başarıyla migrate edildi", "success");
  } catch (error) {
    const errorInfo = handleMigrationError(error, "Game Tag Relations Migration");
    throw error;
  }
}

/**
 * User games migration
 * SQLite user_games tablosunu PostgreSQL'e taşır
 * @param {Object} sourceDB - SQLite database connection
 * @param {Object} targetDB - PostgreSQL client
 * @param {Map} userIdMapping - User ID mapping
 * @param {Map} gameIdMapping - Game ID mapping
 */
async function migrateUserGames(sourceDB, targetDB, userIdMapping, gameIdMapping) {
  logMigrationStep("User Games", "Migration başlatılıyor", "info");

  try {
    const sqliteUserGames = await sourceDB.prepare("SELECT * FROM user_games").all();
    logMigrationStep("User Games", `${sqliteUserGames.results.length} kullanıcı oyunu bulundu`, "info");

    await processBatch(
      sqliteUserGames.results,
      BATCH_SIZES.USER_GAMES,
      (batch, batchNumber, totalBatches) => 
        processUserGamesBatch(batch, batchNumber, totalBatches, targetDB, userIdMapping, gameIdMapping),
      "kullanıcı oyunu",
    );

    logMigrationStep("User Games", "Kullanıcı oyunları başarıyla migrate edildi", "success");
  } catch (error) {
    const errorInfo = handleMigrationError(error, "User Games Migration");
    throw error;
  }
}

/**
 * Games validation
 * Migrated oyunları doğrular
 * @param {Object} sourceDB - SQLite database connection
 * @param {Object} targetDB - PostgreSQL client
 * @param {Map} gameIdMapping - Game ID mapping
 * @returns {Promise<boolean>} Validation başarılı mı
 */
async function validateGames(sourceDB, targetDB, gameIdMapping) {
  logMigrationStep("Games Validation", "Doğrulama başlatılıyor", "info");

  try {
    const sourceCounts = await getSourceCounts(sourceDB);
    const targetCounts = await getTargetCounts(targetDB);

    logMigrationStep("Games Validation", "Source vs Target karşılaştırması", "info");
    Object.keys(sourceCounts).forEach((key) => {
      logMigrationStep(
        "Games Validation",
        `${key}: ${sourceCounts[key]} → ${targetCounts[key]}`,
        "info",
      );
    });

    const mismatches = validateCounts(sourceCounts, targetCounts);

    if (mismatches.length > 0) {
      throw new Error(`Game count mismatches: ${mismatches.join(", ")}`);
    }

    logMigrationStep("Games Validation", "Validation başarılı", "success");
    return true;
  } catch (error) {
    const errorInfo = handleMigrationError(error, "Games Validation");
    throw error;
  }
}

/**
 * Source database count'larını alır
 * @param {Object} sourceDB - SQLite database connection
 * @returns {Promise<Object>} Count'lar
 */
async function getSourceCounts(sourceDB) {
  const queries = {
    games: "SELECT COUNT(*) as count FROM games",
    tags: "SELECT COUNT(*) as count FROM game_tags",
    relations: "SELECT COUNT(*) as count FROM game_tag_relations",
    userGames: "SELECT COUNT(*) as count FROM user_games",
  };

  const counts = {};
  for (const [key, query] of Object.entries(queries)) {
    const result = await sourceDB.prepare(query).first();
    counts[key] = result.count;
  }

  return counts;
}

/**
 * Target database count'larını alır
 * @param {Object} targetDB - PostgreSQL client
 * @returns {Promise<Object>} Count'lar
 */
async function getTargetCounts(targetDB) {
  return {
    games: await targetDB.game.count(),
    tags: await targetDB.gameTag.count(),
    relations: await targetDB.gameTagRelation.count(),
    userGames: await targetDB.userGame.count(),
  };
}

/**
 * Source ve target count'larını karşılaştırır
 * @param {Object} sourceCounts - Source count'lar
 * @param {Object} targetCounts - Target count'lar
 * @returns {Array} Uyuşmazlıklar
 */
function validateCounts(sourceCounts, targetCounts) {
  const mismatches = [];

  Object.keys(sourceCounts).forEach((key) => {
    if (sourceCounts[key] !== targetCounts[key]) {
      mismatches.push(
        `${key}: ${sourceCounts[key]} → ${targetCounts[key]}`,
      );
    }
  });

  return mismatches;
}

// =============================================================================
// MAIN MIGRATION FUNCTION
// =============================================================================

/**
 * Complete games migration
 * Tüm game migration sürecini yönetir
 * @param {Object} sourceDB - SQLite database connection
 * @param {Object} targetDB - PostgreSQL client
 * @param {Map} userIdMapping - User ID mapping
 * @returns {Promise<Object>} Migration özeti
 */
async function migrateAllGames(sourceDB, targetDB, userIdMapping) {
  const startTime = Date.now();
  logMigrationStart("Games Migration");

  try {
    // Games migration
    const gameIdMapping = await migrateGames(sourceDB, targetDB);

    // Game tags migration
    const transformedTags = await migrateGameTags(sourceDB, targetDB);
    const tagMapping = new Map();
    transformedTags.forEach((tag) => {
      // SQLite'deki ID'yi takip etmek için mock mapping
      tagMapping.set(tag.name, tag.id);
    });

    // Game tag relations migration
    await migrateGameTagRelations(
      sourceDB,
      targetDB,
      gameIdMapping,
      tagMapping,
    );

    // User games migration
    await migrateUserGames(sourceDB, targetDB, userIdMapping, gameIdMapping);

    // Validation
    await validateGames(sourceDB, targetDB, gameIdMapping);

    // Migration özetini oluştur
    const migrationSummary = await createMigrationSummary(
      sourceDB,
      targetDB,
      gameIdMapping,
    );

    logMigrationEnd("Games Migration", startTime, migrationSummary);
    return migrationSummary;
  } catch (error) {
    const errorInfo = handleMigrationError(error, "Complete Games Migration");
    throw error;
  }
}

/**
 * Migration özeti oluşturur
 * @param {Object} sourceDB - SQLite database connection
 * @param {Object} targetDB - PostgreSQL client
 * @param {Map} gameIdMapping - Game ID mapping
 * @returns {Promise<Object>} Migration özeti
 */
async function createMigrationSummary(sourceDB, targetDB, gameIdMapping) {
  const sourceCounts = await getSourceCounts(sourceDB);
  const targetCounts = await getTargetCounts(targetDB);

  return {
    timestamp: new Date().toISOString(),
    type: "games",
    sourceCounts,
    targetCounts,
    status: "completed",
    gameIdMapping: Object.fromEntries(gameIdMapping),
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  transformGame,
  transformGameTag,
  transformGameTagRelation,
  transformUserGame,
  migrateGames,
  migrateGameTags,
  migrateGameTagRelations,
  migrateUserGames,
  validateGames,
  migrateAllGames,
};

// =============================================================================
// SCRIPT EXECUTION
// =============================================================================

// This script is designed to be called by an orchestrator, not run directly.
// The direct execution logic has been removed to enforce modularity.
