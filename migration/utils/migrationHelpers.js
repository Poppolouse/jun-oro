/**
 * Migration Helpers
 * Migration script'leri için ortak yardımcı fonksiyonlar
 */

import fs from "fs";
import path from "path";

// =============================================================================
// LOGGING HELPERS
// =============================================================================

const LOG_LEVELS = {
  info: "\x1b[34m", // Blue
  success: "\x1b[32m", // Green
  warn: "\x1b[33m", // Yellow
  error: "\x1b[31m", // Red
  reset: "\x1b[0m",
};

function log(level, message) {
  console.log(`${LOG_LEVELS[level]}[${level.toUpperCase()}]${LOG_LEVELS.reset} ${message}`);
}

export function logMigrationStart(name) {
  log("info", `🚀 Starting: ${name}`);
}

export function logMigrationEnd(name, startTime, summary) {
  const duration = (Date.now() - startTime) / 1000;
  log("success", `✅ Completed: ${name} in ${duration.toFixed(2)}s`);
  if (summary) {
    // console.log(JSON.stringify(summary, null, 2));
  }
}

export function logMigrationStep(step, message, level = "info") {
  log(level, `[${step}] ${message}`);
}

export function handleMigrationError(error, step) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logMigrationStep(step, `Error: ${errorMessage}`, "error");
  // console.error(error); // Full stack trace
  return {
    step,
    error: errorMessage,
    stack: error.stack,
  };
}


// =============================================================================
// FILE SYSTEM HELPERS
// =============================================================================

export function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logMigrationStep("FS", `Directory created: ${dirPath}`, "info");
  }
}

export function createBackupPath(basePath, type) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dir = path.dirname(basePath);
    const ext = path.extname(basePath);
    const baseName = path.basename(basePath, ext);
    return path.join(dir, `${baseName}-${type}-${timestamp}${ext}`);
}


// =============================================================================
// ENVIRONMENT HELPERS
// =============================================================================

export function validateEnvironmentVariable(varName, required = true) {
  const value = process.env[varName];
  if (required && !value) {
    throw new Error(`Required environment variable is not set: ${varName}`);
  }
  return value;
}


// =============================================================================
// DATABASE & BATCH HELPERS
// =============================================================================

export async function processBatch(items, batchSize, processFn, itemName = "item", ...args) {
    let allProcessedItems = [];
    const totalBatches = Math.ceil(items.length / batchSize);
    logMigrationStep("BATCH", `Processing ${items.length} ${itemName}(s) in ${totalBatches} batches of ${batchSize}...`);

    for (let i = 0; i < totalBatches; i++) {
        const batch = items.slice(i * batchSize, (i + 1) * batchSize);
        logMigrationStep("BATCH", `Processing batch ${i + 1}/${totalBatches}...`);
        try {
            const processedItems = await processFn(batch, i + 1, totalBatches, ...args);
            allProcessedItems = allProcessedItems.concat(processedItems);
        } catch (error) {
            handleMigrationError(error, `BATCH ${i + 1}`);
            throw new Error(`Batch ${i + 1} for ${itemName} failed.`);
        }
    }
    return allProcessedItems;
}
