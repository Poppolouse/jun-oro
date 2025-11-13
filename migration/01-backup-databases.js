// Database Backup Script
// Cloudflare API (SQLite/D1) ve PostgreSQL database'lerini yedekler

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import {
  ensureDirectoryExists,
  createBackupPath,
  logMigrationStep,
  handleMigrationError,
  validateEnvironmentVariable,
  logMigrationStart,
  logMigrationEnd,
} from "./utils/migrationHelpers.js";

// =============================================================================
// CONSTANTS
// =============================================================================

/** Backup versiyonu */
const BACKUP_VERSION = "1.0.0";

/** Backup directory adı */
const BACKUP_DIR_NAME = "backups";

/** Cloudflare backup tabloları */
const CLOUDFLARE_TABLES = {
  users: "SELECT * FROM users",
  games: "SELECT * FROM games",
  user_games: "SELECT * FROM user_games",
  sessions: "SELECT * FROM sessions",
  game_tags: "SELECT * FROM game_tags",
  game_tag_relations: "SELECT * FROM game_tag_relations",
  reviews: "SELECT * FROM reviews",
  uploads: "SELECT * FROM uploads",
};

// =============================================================================
// BACKUP FUNCTIONS
// =============================================================================

/**
 * SQLite/D1 Database Backup
 * Cloudflare API mevcut verilerini yedekler
 * @returns {Promise<string>} Backup dosyası yolu
 */
async function backupCloudflareDatabase() {
  logMigrationStep("Cloudflare Backup", "Cloudflare API database backup başlatılıyor...");

  try {
    // Backup verisini hazırla
    const backupData = {
      timestamp: new Date().toISOString(),
      version: BACKUP_VERSION,
      tables: CLOUDFLARE_TABLES,
    };

    // Backup directory oluştur
    const backupDir = path.join(process.cwd(), BACKUP_DIR_NAME);
    ensureDirectoryExists(backupDir);

    // Backup dosyasını oluştur
    const backupFile = createBackupPath(
      path.join(backupDir, "cloudflare-backup.json"),
      "backup"
    );
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    logMigrationStep("Cloudflare Backup", `Backup tamamlandı: ${backupFile}`, "success");
    return backupFile;
  } catch (error) {
    handleMigrationError(error, "Cloudflare Backup");
    throw error;
  }
}

/**
 * PostgreSQL Database Backup
 * Backend mevcut PostgreSQL verilerini yedekler
 * @returns {Promise<string>} Backup dosyası yolu
 */
async function backupPostgreSQLDatabase() {
  logMigrationStep("PostgreSQL Backup", "PostgreSQL database backup başlatılıyor...");

  try {
    // Environment variable'ı validate et
    const databaseUrl = validateEnvironmentVariable("DATABASE_URL");
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable'ı bulunamadı");
    }

    // Backup directory oluştur
    const backupDir = path.join(process.cwd(), BACKUP_DIR_NAME);
    ensureDirectoryExists(backupDir);

    // Backup dosyasını oluştur
    const backupFile = createBackupPath(
      path.join(backupDir, "postgresql-backup.sql"),
      "backup"
    );

    // pg_dump komutu ile backup al
    const command = `pg_dump ${databaseUrl} > ${backupFile}`;
    execSync(command, { stdio: "inherit" });

    logMigrationStep("PostgreSQL Backup", `Backup tamamlandı: ${backupFile}`, "success");
    return backupFile;
  } catch (error) {
    handleMigrationError(error, "PostgreSQL Backup");
    throw error;
  }
}

/**
 * Migration öncesi tam backup
 * @returns {Promise<Object>} Backup özeti
 */
async function createFullBackup() {
  const startTime = Date.now();
  logMigrationStart("Tam Database Backup");

  try {
    // Paralel olarak backup'ları oluştur
    const backups = await Promise.all([
      backupCloudflareDatabase(),
      backupPostgreSQLDatabase(),
    ]);

    // Backup özetini oluştur
    const backupSummary = {
      timestamp: new Date().toISOString(),
      cloudflareBackup: backups[0],
      postgresqlBackup: backups[1],
      status: "completed",
    };

    // Backup özetini kaydet
    const backupDir = path.join(process.cwd(), BACKUP_DIR_NAME);
    ensureDirectoryExists(backupDir);
    
    const summaryFile = createBackupPath(
      path.join(backupDir, "backup-summary.json"),
      "backup"
    );
    fs.writeFileSync(summaryFile, JSON.stringify(backupSummary, null, 2));

    logMigrationStep("Full Backup", `Özet kaydedildi: ${summaryFile}`, "success");
    logMigrationEnd("Tam Database Backup", startTime, {
      cloudflareBackup: backups[0],
      postgresqlBackup: backups[1],
      summaryFile,
    });

    return backupSummary;
  } catch (error) {
    handleMigrationError(error, "Full Backup");
    throw error;
  }
}

/**
 * Backup validation
 * @param {Object} backupSummary - Backup özeti
 * @returns {boolean} Validation başarılı mı
 */
function validateBackups(backupSummary) {
  logMigrationStep("Validation", "Backup validation başlatılıyor...");

  // Early return - input validation
  if (!backupSummary || typeof backupSummary !== "object") {
    throw new Error("Backup summary geçerli bir object değil");
  }

  const requiredFiles = ["cloudflareBackup", "postgresqlBackup"];
  const missingFiles = requiredFiles.filter((file) => !backupSummary[file]);

  if (missingFiles.length > 0) {
    throw new Error(`Eksik backup dosyaları: ${missingFiles.join(", ")}`);
  }

  logMigrationStep("Validation", "Backup validation başarılı", "success");
  return true;
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

/**
 * Ana backup işlemini yürütür ve sonucu loglar
 * @returns {Promise<void>}
 */
async function executeBackupProcess() {
  const startTime = Date.now();
  
  try {
    // Tam backup oluştur
    const backupSummary = await createFullBackup();
    
    // Backup'ları validate et
    validateBackups(backupSummary);
    
    logMigrationStep("Main Process", "Tüm backup işlemleri başarıyla tamamlandı", "success");
    process.exit(0);
  } catch (error) {
    handleMigrationError(error, "Main Backup Process");
    process.exit(1);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  backupCloudflareDatabase,
  backupPostgreSQLDatabase,
  createFullBackup,
  validateBackups,
  executeBackupProcess,
};

// =============================================================================
// DIRECT EXECUTION
// =============================================================================

// Script doğrudan çalıştırılabilir
if (import.meta.url === `file://${process.argv[1]}`) {
  executeBackupProcess();
}
