import crypto from "crypto";
import bcrypt from "bcrypt";

// --- Constants ---

// Encryption Configuration
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const ADDITIONAL_AUTH_DATA = "apikey";

// Password Hashing Configuration
const SALT_ROUNDS = 10;

// Error Messages
const ERROR_MESSAGES = {
  INVALID_KEY_LENGTH: "ENCRYPTION_KEY must be 64 hex characters (32 bytes).",
  MISSING_KEY_PRODUCTION: "ENCRYPTION_KEY environment variable is required in production.",
  ENCRYPTION_FAILED: "Failed to encrypt data.",
  DECRYPTION_FAILED: "Failed to decrypt data.",
  INVALID_INPUT: "Input must be a non-empty string.",
  HASHING_FAILED: "Failed to hash password.",
  COMPARISON_FAILED: "Failed to compare password.",
};

// Development Warning Messages
const DEV_WARNINGS = {
  NO_KEY_FOUND: "⚠️ No ENCRYPTION_KEY found. Generating a temporary key for development.",
  ADD_KEY_TO_ENV: "⚠️ For production, add a securely generated ENCRYPTION_KEY to your .env file.",
};

// --- Helper Functions ---

/**
 * Validates if the input is a non-empty string.
 * @param {any} input - The input to validate.
 * @returns {boolean} - True if the input is a valid, non-empty string.
 */
function isValidString(input) {
  return typeof input === "string" && input.length > 0;
}

/**
 * Retrieves the encryption key from environment variables or generates a temporary one for development.
 * This function is executed only once when the module is loaded.
 * @returns {Buffer} - A Buffer containing the encryption key.
 * @throws {Error} - Throws if the key is invalid or missing in production.
 */
function getEncryptionKey() {
  const envKey = process.env.ENCRYPTION_KEY;

  if (envKey) {
    const key = Buffer.from(envKey, "hex");
    if (key.length !== KEY_LENGTH) {
      throw new Error(ERROR_MESSAGES.INVALID_KEY_LENGTH);
    }
    return key;
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(DEV_WARNINGS.NO_KEY_FOUND);
    console.warn(DEV_WARNINGS.ADD_KEY_TO_ENV);
    return crypto.randomBytes(KEY_LENGTH);
  }

  throw new Error(ERROR_MESSAGES.MISSING_KEY_PRODUCTION);
}

// Initialize encryption key once at module load
const encryptionKey = getEncryptionKey();

// --- Exported Functions ---

/**
 * Encrypts a string value using AES-256-GCM.
 * Returns the original value if it's falsy.
 * @param {string} text - The plaintext string to encrypt.
 * @returns {string | null} - A Base64 encoded string containing the IV, auth tag, and encrypted data, or the original value.
 * @throws {Error} - Throws if the input is invalid or encryption fails.
 */
export function encrypt(text) {
  if (!text) return text;

  if (!isValidString(text)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
    cipher.setAAD(Buffer.from(ADDITIONAL_AUTH_DATA, "utf8"));

    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([iv, tag, encrypted]).toString("base64");
  } catch (error) {
    console.error("Encryption error:", error.message);
    throw new Error(ERROR_MESSAGES.ENCRYPTION_FAILED);
  }
}

/**
 * Decrypts a string value encrypted with AES-256-GCM.
 * Returns the original value if it's falsy.
 * @param {string} encryptedData - The Base64 encoded encrypted data.
 * @returns {string | null} - The decrypted plaintext string, or the original value.
 * @throws {Error} - Throws if the input is invalid or decryption fails.
 */
export function decrypt(encryptedData) {
  if (!encryptedData) return encryptedData;

  if (!isValidString(encryptedData)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }

  try {
    const combined = Buffer.from(encryptedData, "base64");

    if (combined.length < IV_LENGTH + TAG_LENGTH) {
      throw new Error("Invalid encrypted data format.");
    }

    const iv = combined.subarray(0, IV_LENGTH);
    const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from(ADDITIONAL_AUTH_DATA, "utf8"));

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decrypted.toString("utf8");
  } catch (error) {
    console.error("Decryption error:", error.message);
    // In case of a tag mismatch, a specific error is thrown, which is a valid outcome.
    // We still wrap it for consistent error handling upstream.
    throw new Error(ERROR_MESSAGES.DECRYPTION_FAILED);
  }
}

/**
 * Generates a secure, random encryption key for environment setup.
 * @returns {string} - A 64-character hex-encoded encryption key.
 */
export function generateEncryptionKey() {
  return crypto.randomBytes(KEY_LENGTH).toString("hex");
}

/**
 * Hashes a password using bcrypt.
 * This is a one-way process.
 * @param {string} password - The plaintext password to hash.
 * @returns {Promise<string>} - A promise that resolves to the hashed password.
 * @throws {Error} - Throws if the input is invalid or hashing fails.
 */
export async function hashPassword(password) {
  if (!isValidString(password)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    console.error("Password hashing error:", error.message);
    throw new Error(ERROR_MESSAGES.HASHING_FAILED);
  }
}

/**
 * Compares a plaintext password with a bcrypt hash.
 * @param {string} password - The plaintext password to compare.
 * @param {string} hash - The bcrypt hash to compare against.
 * @returns {Promise<boolean>} - A promise that resolves to true if the password matches the hash, false otherwise.
 * @throws {Error} - Throws if inputs are invalid or comparison fails.
 */
export async function comparePassword(password, hash) {
  if (!isValidString(password) || !isValidString(hash)) {
    throw new Error(ERROR_MESSAGES.INVALID_INPUT);
  }
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Password comparison error:", error.message);
    throw new Error(ERROR_MESSAGES.COMPARISON_FAILED);
  }
}
