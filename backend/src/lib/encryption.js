import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

// Get encryption key from environment variable or generate one
function getEncryptionKey() {
  const envKey = process.env.ENCRYPTION_KEY;
  
  if (envKey) {
    // If key is provided in env, ensure it's the right length
    const key = Buffer.from(envKey, 'hex');
    if (key.length !== KEY_LENGTH) {
      throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    }
    return key;
  }
  
  // Generate a new key (for development only)
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  No ENCRYPTION_KEY found. Generating temporary key for development.');
    console.warn('⚠️  Add ENCRYPTION_KEY to .env for production use.');
    return crypto.randomBytes(KEY_LENGTH);
  }
  
  throw new Error('ENCRYPTION_KEY environment variable is required in production');
}

const encryptionKey = getEncryptionKey();

/**
 * Encrypt a string value
 * @param {string} text - The text to encrypt
 * @returns {string} - Base64 encoded encrypted data with IV and tag
 */
export function encrypt(text) {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
    cipher.setAAD(Buffer.from('apikey', 'utf8')); // Additional authenticated data
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine IV + tag + encrypted data
    const combined = Buffer.concat([iv, tag, Buffer.from(encrypted, 'hex')]);
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt a string value
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @returns {string} - The decrypted text
 */
export function decrypt(encryptedData) {
  if (!encryptedData) return encryptedData;
  
  try {
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract IV, tag, and encrypted data
    const iv = combined.subarray(0, IV_LENGTH);
    const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    decipher.setAAD(Buffer.from('apikey', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generate a new encryption key for environment setup
 * @returns {string} - Hex encoded encryption key
 */
export function generateEncryptionKey() {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Hash a value for comparison (one-way)
 * @param {string} value - The value to hash
 * @returns {string} - SHA-256 hash
 */
export function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}