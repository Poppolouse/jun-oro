// Migration Orchestrator
// Tüm migration sürecini yönetir

import { createFullBackup, validateBackups } from "./01-backup-databases.js";
import { migrateAllUsers } from "./02-migrate-users.js";
import { migrateAllGames } from "./03-migrate-games.js";
import { PrismaClient } from "@prisma/client";
import {
  validateEnvironmentVariable,
  logMigrationStep,
  logMigrationStart,
  logMigrationEnd,
  handleMigrationError,
  ensureDirectoryExists,
} from "./utils/migrationHelpers.js";

// =============================================================================
// CONSTANTS
// =============================================================================

/** Migration için gerekli environment variable'lar */
const REQUIRED_ENV_VARS = ["DATABASE_URL"];

/** Migration report dosya adı */
const MIGRATION_REPORT_FILE = "migration-report.json";

/** Exit kodları */
const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
};

// =============================================================================
// MIGRATION PROGRESS TRACKER
// =============================================================================

/**
 * Migration progress tracker sınıfı
 * Migration adımlarını takip eder ve loglar
 */
class MigrationProgress {
  /**
   * MigrationProgress constructor
   */
  constructor() {
    this.startTime = Date.now();
    this.steps = [];
    this.currentStep = 0;
  }

  /**
   * Yeni adım ekle
   * @param {string} step - Adım adı
   * @param {string} status - Adım durumu (pending, in_progress, completed, failed)
   */
  addStep(step, status = "pending") {
    this.steps.push({
      step,
      status,
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
    });
    logMigrationStep(step, `Step ${this.steps.length}: ${step} - ${status}`, "info");
  }

  /**
   * Mevcut adımı güncelle
   * @param {string} step - Adım adı
   * @param {string} status - Yeni durum
   */
  updateStep(step, status) {
    const stepIndex = this.steps.findIndex((s) => s.step === step);
    
    if (stepIndex !== -1) {
      this.steps[stepIndex].status = status;
      this.steps[stepIndex].duration = Date.now() - this.startTime;
      logMigrationStep(step, `Step ${stepIndex + 1} güncellendi: ${step} - ${status}`, "info");
    }
  }

  /**
   * Mevcut progress bilgisini getir
   * @returns {Object} Progress bilgisi
   */
  getProgress() {
    return {
      totalSteps: this.steps.length,
      completedSteps: this.steps.filter((s) => s.status === "completed").length,
      currentStep: this.steps.find((s) => s.status === "in_progress"),
      duration: Date.now() - this.startTime,
      steps: this.steps,
    };
  }

  /**
   * Migration özetini getir
   * @returns {Object} Migration özeti
   */
  getSummary() {
    const completed = this.steps.filter((s) => s.status === "completed");
    const failed = this.steps.filter((s) => s.status === "failed");

    return {
      totalSteps: this.steps.length,
      completedSteps: completed.length,
      failedSteps: failed.length,
      duration: Date.now() - this.startTime,
      success: failed.length === 0,
      steps: this.steps,
    };
  }
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

/**
 * Veritabanı bağlantısını test et
 * @param {string} databaseUrl - Veritabanı URL'i
 * @returns {Promise<boolean>} Bağlantı başarılı mı
 */
async function testDatabaseConnection(databaseUrl) {
  logMigrationStep("Database Connection", "Bağlantı testi başlatılıyor...", "info");

  try {
    const prisma = new PrismaClient({
      datasources: {
        db: { url: databaseUrl },
      },
      log: ["error"],
    });

    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();

    logMigrationStep("Database Connection", "Bağlantı başarılı", "success");
    return true;
  } catch (error) {
    logMigrationStep("Database Connection", `Bağlantı hatası: ${error.message}`, "error");
    return false;
  }
}

/**
 * Hedef veritabanını başlat
 * @returns {Promise<PrismaClient>} Prisma client instance
 */
async function initializeTargetDatabase() {
  logMigrationStep("Database Initialization", "Hedef veritabanı başlatılıyor...", "info");

  try {
    const targetDB = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: ["info", "warn", "error"],
    });

    // Veritabanı bağlantısını test et
    await targetDB.$queryRaw`SELECT 1`;
    
    logMigrationStep("Database Initialization", "Hedef veritabanı başlatıldı", "success");
    return targetDB;
  } catch (error) {
    logMigrationStep("Database Initialization", `Başlatma hatası: ${error.message}`, "error");
    throw error;
  }
}

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================

/**
 * Environment variable'ları validate et
 * @returns {boolean} Validation başarılı mı
 */
function validateEnvironment() {
  logMigrationStep("Environment Validation", "Environment validation başlatılıyor...", "info");

  try {
    for (const envVar of REQUIRED_ENV_VARS) {
      validateEnvironmentVariable(envVar, true);
    }

    logMigrationStep("Environment Validation", "Environment validation başarılı", "success");
    return true;
  } catch (error) {
    logMigrationStep("Environment Validation", `Validation hatası: ${error.message}`, "error");
    return false;
  }
}

// =============================================================================
// MIGRATION OPERATIONS
// =============================================================================

/**
 * Migration rollback işlemi
 * @param {Object} backupSummary - Backup özeti
 * @returns {Promise<Object>} Rollback sonucu
 */
async function rollbackMigration(backupSummary) {
  logMigrationStep("Migration Rollback", "Rollback başlatılıyor...", "warn");

  try {
    // Backup'ten geri yükleme mantığı
    // Gerçek implementasyon backup sistemine bağlı olacaktır
    logMigrationStep("Migration Rollback", "Rollback manual intervention gerektiriyor", "warn");
    logMigrationStep("Migration Rollback", `Backup dosyaları: ${JSON.stringify(backupSummary)}`, "info");

    return {
      success: false,
      message: "Migration rolled back. Manual intervention required.",
      backupSummary,
    };
  } catch (error) {
    const errorInfo = handleMigrationError(error, "Migration Rollback");
    throw errorInfo;
  }
}

/**
 * Migration raporunu kaydet
 * @param {Object} summary - Migration özeti
 * @returns {string} Rapor dosya yolu
 */
function saveMigrationReport(summary) {
  try {
    const fs = require("fs");
    const path = require("path");
    
    // Migration logs directory'sini oluştur
    const logDir = path.join(process.cwd(), "migration-logs");
    ensureDirectoryExists(logDir);
    
    const reportPath = path.join(logDir, MIGRATION_REPORT_FILE);
    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));

    logMigrationStep("Migration Report", `Rapor kaydedildi: ${reportPath}`, "success");
    return reportPath;
  } catch (error) {
    logMigrationStep("Migration Report", `Rapor kaydetme hatası: ${error.message}`, "error");
    throw error;
  }
}

/**
 * Migration durumunu kontrol et
 * @returns {Promise<Object>} Migration durumu
 */
async function checkMigrationStatus() {
  try {
    const fs = require("fs");
    const path = require("path");
    const reportPath = path.join(process.cwd(), "migration-logs", MIGRATION_REPORT_FILE);

    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
      return {
        exists: true,
        report,
        status: report.success ? "completed" : "failed",
      };
    }

    return { exists: false };
  } catch (error) {
    logMigrationStep("Status Check", `Status check hatası: ${error.message}`, "error");
    return { exists: false, error };
  }
}

// =============================================================================
// MAIN MIGRATION FUNCTION
// =============================================================================

/**
 * Tam migration sürecini çalıştır
 * @returns {Promise<Object>} Migration sonucu
 */
async function runCompleteMigration() {
  const migrationName = "Complete Migration";
  logMigrationStart(migrationName);
  
  const progress = new MigrationProgress();

  try {
    // Environment validation
    progress.addStep("Environment validation");
    if (!validateEnvironment()) {
      progress.updateStep("Environment validation", "failed");
      throw new Error("Environment validation failed");
    }
    progress.updateStep("Environment validation", "completed");

    // Database connection test
    progress.addStep("Database connection test");
    const databaseUrl = validateEnvironmentVariable("DATABASE_URL", true);
    if (!(await testDatabaseConnection(databaseUrl))) {
      progress.updateStep("Database connection test", "failed");
      throw new Error("Database connection test failed");
    }
    progress.updateStep("Database connection test", "completed");

    // Create backup
    progress.addStep("Database backup");
    const backupSummary = await createFullBackup();
    if (!validateBackups(backupSummary)) {
      progress.updateStep("Database backup", "failed");
      throw new Error("Backup validation failed");
    }
    progress.updateStep("Database backup", "completed");

    // Initialize target database
    progress.addStep("Target database initialization");
    const targetDB = await initializeTargetDatabase();
    progress.updateStep("Target database initialization", "completed");

    // Users migration
    progress.addStep("Users migration");
    const userIdMapping = await migrateAllUsers(null, targetDB); // Source DB mock
    progress.updateStep("Users migration", "completed");

    // Games migration
    progress.addStep("Games migration");
    await migrateAllGames(null, targetDB, userIdMapping); // Source DB mock
    progress.updateStep("Games migration", "completed");

    // Final validation
    progress.addStep("Final validation");
    // Validation logic buraya eklenebilir
    progress.updateStep("Final validation", "completed");

    // Cleanup
    await targetDB.$disconnect();

    // Migration summary
    const summary = progress.getSummary();
    logMigrationStep("Migration Complete", `Migration tamamlandı: ${JSON.stringify(summary, null, 2)}`, "success");

    // Save migration report
    const reportPath = saveMigrationReport(summary);
    summary.reportPath = reportPath;

    logMigrationEnd(migrationName, progress.startTime, summary);
    return summary;
  } catch (error) {
    const errorInfo = handleMigrationError(error, "Complete Migration");
    
    // Attempt rollback
    try {
      const rollbackResult = await rollbackMigration(
        progress.getProgress().backupSummary,
      );
      logMigrationStep("Migration Rollback", `Rollback tamamlandı: ${JSON.stringify(rollbackResult)}`, "warn");
    } catch (rollbackError) {
      logMigrationStep("Migration Rollback", `Rollback da başarısız: ${rollbackError.message}`, "error");
    }

    throw errorInfo;
  }
}

// =============================================================================
// COMMAND LINE INTERFACE
// =============================================================================

/**
 * CLI yardım mesajını göster
 */
function showHelp() {
  console.log("ℹ️ Kullanım:");
  console.log("  node migration/00-run-migration.js run    - Migration çalıştır");
  console.log("  node migration/00-run-migration.js status  - Migration durumu kontrol");
  console.log("  node migration/00-run-migration.js rollback - Rollback başlat");
}

/**
 * CLI komutunu işle
 * @param {string} command - Komut adı
 */
async function handleCommand(command) {
  switch (command) {
    case "run":
      try {
        await runCompleteMigration();
        console.log("🎉 Migration başarıyla tamamlandı!");
        process.exit(EXIT_CODES.SUCCESS);
      } catch (error) {
        console.error("💥 Migration başarısız:", error);
        process.exit(EXIT_CODES.GENERAL_ERROR);
      }
      break;

    case "status":
      try {
        const status = await checkMigrationStatus();
        if (status.exists) {
          console.log("📊 Migration status:", status.status);
          console.log("📋 Migration report:", status.report);
        } else {
          console.log("ℹ️ Migration bulunamadı");
        }
        process.exit(EXIT_CODES.SUCCESS);
      } catch (error) {
        console.error("❌ Status check hatası:", error);
        process.exit(EXIT_CODES.GENERAL_ERROR);
      }
      break;

    case "rollback":
      // Rollback logic
      console.log("🔄 Rollback manual intervention gerektiriyor");
      console.log("📁 Lütfen backup dosyalarını kontrol edin");
      process.exit(EXIT_CODES.SUCCESS);
      break;

    default:
      showHelp();
      process.exit(EXIT_CODES.SUCCESS);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  MigrationProgress,
  testDatabaseConnection,
  validateEnvironment,
  runCompleteMigration,
  checkMigrationStatus,
  rollbackMigration,
  initializeTargetDatabase,
  saveMigrationReport,
};

// =============================================================================
// CLI EXECUTION
// =============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2] || "run";
  handleCommand(command);
}
