import {
  S3Client,
  DeleteObjectCommand,
  ListObjectsV2Command,
  CreateBucketCommand,
  PutBucketCorsCommand,
  GetBucketCorsCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import {
  processAvatarImage,
  processPlatformLogo,
  processGameCoverImage,
  getImageFormat,
  getContentType,
} from "./imageProcessor.js";

// =============================================================================
// CONSTANTS
// =============================================================================

export const IMAGE_CONFIG = {
  AVATAR: { WIDTH: 200, HEIGHT: 200, FIT: 'cover', POSITION: 'center', FORMAT: 'jpeg', QUALITY: 85, PROGRESSIVE: true },
  PLATFORM_LOGO: { WIDTH: 64, HEIGHT: 64, FIT: 'contain', BACKGROUND: { r: 0, g: 0, b: 0, alpha: 0 }, FORMAT: 'png', QUALITY: 90, COMPRESSION_LEVEL: 9 },
  GAME_COVER: { WIDTH: 300, HEIGHT: 400, FIT: 'cover', POSITION: 'center', FORMAT: 'jpeg', QUALITY: 85, PROGRESSIVE: true },
};

const CACHE_SETTINGS = {
  DEFAULT_CACHE_CONTROL: 'public, max-age=31536000', // 1 year
};

const CORS_CONFIG = {
  ALLOWED_HEADERS: ['*'],
  ALLOWED_METHODS: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
  ALLOWED_ORIGINS: ['https://jun-oro.com', 'https://www.jun-oro.com', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  EXPOSE_HEADERS: ['ETag'],
  MAX_AGE_SECONDS: 3000,
};

const FILE_PATHS = {
  AVATAR: 'avatars',
  PLATFORM: 'platforms',
  GAMES: 'games',
};

const PRESIGNED_URL = {
  DEFAULT_EXPIRES_IN: 3600, // 1 hour
};

const STORAGE_STATS = {
  RECENT_FILES_LIMIT: 10,
  BYTE_UNITS: ['B', 'KB', 'MB', 'GB', 'TB'],
  BYTE_CONVERSION: 1024,
};

const ERROR_MESSAGES = {
  CONNECTION_FAILED: 'R2 connection failed',
  UPLOAD_FAILED: 'Upload failed',
  DELETE_FAILED: 'Delete failed',
  BUCKET_CREATE_FAILED: 'Bucket creation failed',
  PRESIGNED_URL_FAILED: 'Failed to generate upload URL',
  CORS_CONFIG_FAILED: 'Failed to configure bucket CORS',
  STORAGE_STATS_FAILED: 'Failed to get storage statistics',
  VALIDATION_ERROR: 'Invalid parameters provided',
  CONFIG_MISSING: 'Missing required R2 configuration',
};

// =============================================================================
// ERROR HANDLING & LOGGING HELPERS
// =============================================================================

/**
 * Logs a detailed R2 error message to the console.
 * @private
 * @param {Error} error - The error object.
 * @param {string} context - The context where the error occurred.
 * @param {Object} [additionalInfo={}] - Additional information to log.
 */
function _logR2Error(error, context, additionalInfo = {}) {
  const errorDetails = {
    context,
    message: error.message,
    code: error.Code || error.code,
    statusCode: error.$metadata?.httpStatusCode,
    requestId: error.$metadata?.requestId,
    timestamp: new Date().toISOString(),
    ...additionalInfo,
  };
  console.error(`❌ R2 Error [${context}]:`, errorDetails);
}

/**
 * Creates a standardized error object for R2 operations.
 * @private
 * @param {string} context - The error context key (e.g., 'UPLOAD_FAILED').
 * @param {string} [details] - Specific details about the error.
 * @returns {Error} A formatted error object.
 */
function _createR2Error(context, details) {
  const message = `${ERROR_MESSAGES[context] || 'Unknown R2 error'}${details ? `: ${details}` : ''}`;
  const error = new Error(message);
  error.context = context;
  return error;
}

// =============================================================================
// CLOUDFLARE R2 SERVICE
// =============================================================================

/**
 * A consolidated and refactored service for interacting with Cloudflare R2 storage.
 * It handles image processing, uploading, deleting, and other bucket operations.
 */
class CloudflareR2Service {
  /**
   * Initializes the R2 service, validates configuration, and sets up the S3 client.
   * @throws {Error} If the R2 configuration is invalid.
   */
  constructor() {
    const config = {
      accountId: process.env.R2_ACCOUNT_ID,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      bucketName: process.env.R2_BUCKET_NAME,
      publicUrl: process.env.R2_PUBLIC_URL,
    };

    this._validateConfig(config);

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    this.bucketName = config.bucketName;
    this.publicUrl = config.publicUrl;
  }

  /**
   * Wraps an asynchronous R2 operation with standardized error handling.
   * @private
   * @param {Function} operation - The async function to execute.
   * @param {string} context - The operation context for error messages.
   * @param {Object} [additionalInfo={}] - Additional info for error logging.
   * @returns {Promise<any>} The result of the operation.
   * @throws {Error} A standardized error if the operation fails.
   */
  async _withErrorHandling(operation, context, additionalInfo = {}) {
    try {
      return await operation();
    } catch (error) {
      _logR2Error(error, context, additionalInfo);
      throw _createR2Error(context, error.message);
    }
  }

  /**
   * Validates the essential R2 configuration.
   * @private
   * @param {Object} config - The R2 configuration object.
   * @throws {Error} If any required configuration field is missing.
   */
  _validateConfig(config) {
    const requiredFields = ['accountId', 'accessKeyId', 'secretAccessKey', 'bucketName', 'publicUrl'];
    for (const field of requiredFields) {
      if (!config[field]) {
        throw _createR2Error('CONFIG_MISSING', `Field: ${field}`);
      }
    }
  }

  /**
   * Validates parameters for an image upload.
   * @private
   * @param {Object} params - The parameters to validate.
   * @throws {Error} If any parameter is invalid.
   */
  _validateUploadParams({ imageBuffer, type, identifier, originalName }) {
    if (!imageBuffer || Buffer.byteLength(imageBuffer) === 0) {
      throw _createR2Error('VALIDATION_ERROR', 'Image buffer is required and cannot be empty');
    }
    if (!type || !['avatar', 'platform', 'game'].includes(type)) {
      throw _createR2Error('VALIDATION_ERROR', 'Type must be one of: avatar, platform, game');
    }
    if (!identifier || typeof identifier !== 'string') {
      throw _createR2Error('VALIDATION_ERROR', 'Identifier is required and must be a string');
    }
    if (!originalName || typeof originalName !== 'string') {
      throw _createR2Error('VALIDATION_ERROR', 'Original name is required and must be a string');
    }
  }

  /**
   * Generates a unique file name and path for an upload.
   * @private
   * @param {string} type - The type of file (e.g., 'avatar').
   * @param {string} identifier - A unique identifier (e.g., userId, gameId).
   * @returns {string} The generated file key (path and name).
   */
  _generateFileName(type, identifier) {
    const pathMap = {
      avatar: `${FILE_PATHS.AVATAR}/${identifier}`,
      platform: `${FILE_PATHS.PLATFORM}/${identifier.toLowerCase().replace(/\s+/g, '-')}`,
      game: `${FILE_PATHS.GAMES}/${identifier}`,
    };
    const format = getImageFormat(type);
    const path = pathMap[type];
    const uniqueId = uuidv4();
    return `${path}/${uniqueId}.${format}`;
  }

  /**
   * Processes and uploads an image to R2.
   * @private
   * @param {Object} params - The upload parameters.
   * @param {Buffer} params.imageBuffer - The raw image buffer.
   * @param {string} params.type - The type of image ('avatar', 'platform', 'game').
   * @param {string} params.identifier - The associated ID (userId, gameId, etc.).
   * @param {string} params.originalName - The original name of the file.
   * @returns {Promise<{url: string, key: string}>} The public URL and R2 key of the uploaded file.
   */
  async _uploadImage({ imageBuffer, type, identifier, originalName }) {
    return this._withErrorHandling(async () => {
      this._validateUploadParams({ imageBuffer, type, identifier, originalName });

      const processorMap = {
        avatar: processAvatarImage,
        platform: processPlatformLogo,
        game: processGameCoverImage,
      };
      const processedImage = await processorMap[type](imageBuffer);

      const fileName = this._generateFileName(type, identifier);
      const format = getImageFormat(type);
      const contentType = getContentType(format);

      const metadata = {
        "original-name": originalName,
        "upload-date": new Date().toISOString(),
        "content-type": type,
        "identifier": identifier,
      };

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: processedImage,
        ContentType: contentType,
        CacheControl: CACHE_SETTINGS.DEFAULT_CACHE_CONTROL,
        Metadata: metadata,
      });

      await this.client.send(command);

      return {
        url: `${this.publicUrl}/${fileName}`,
        key: fileName,
      };
    }, 'UPLOAD_FAILED', { type, identifier });
  }

  /**
   * Tests the connection to R2 by listing the first object.
   * @returns {Promise<boolean>} True if the connection is successful.
   */
  async testConnection() {
    return this._withErrorHandling(async () => {
      const command = new ListObjectsV2Command({ Bucket: this.bucketName, MaxKeys: 1 });
      await this.client.send(command);
      return true;
    }, 'CONNECTION_FAILED');
  }

  /**
   * Uploads a user avatar image.
   * @param {Buffer} imageBuffer - The image data.
   * @param {string} userId - The ID of the user.
   * @param {string} originalName - The original file name.
   * @returns {Promise<{url: string, key: string}>} The public URL and R2 key.
   */
  async uploadAvatar(imageBuffer, userId, originalName) {
    return this._uploadImage({ imageBuffer, type: 'avatar', identifier: userId, originalName });
  }

  /**
   * Uploads a platform logo image.
   * @param {Buffer} imageBuffer - The image data.
   * @param {string} platformName - The name of the platform.
   * @param {string} originalName - The original file name.
   * @returns {Promise<{url: string, key: string}>} The public URL and R2 key.
   */
  async uploadPlatformLogo(imageBuffer, platformName, originalName) {
    return this._uploadImage({ imageBuffer, type: 'platform', identifier: platformName, originalName });
  }

  /**
   * Uploads a game cover image.
   * @param {Buffer} imageBuffer - The image data.
   * @param {string} gameId - The ID of the game.
   * @param {string} originalName - The original file name.
   * @returns {Promise<{url: string, key: string}>} The public URL and R2 key.
   */
  async uploadGameCover(imageBuffer, gameId, originalName) {
    return this._uploadImage({ imageBuffer, type: 'game', identifier: gameId, originalName });
  }

  /**
   * Deletes a file from the R2 bucket.
   * @param {string} key - The key of the file to delete.
   * @returns {Promise<boolean>} True if deletion is successful.
   */
  async deleteFile(key) {
    return this._withErrorHandling(async () => {
      const command = new DeleteObjectCommand({ Bucket: this.bucketName, Key: key });
      await this.client.send(command);
      return true;
    }, 'DELETE_FAILED', { key });
  }

  /**
   * Generates a presigned URL for direct client-side uploads.
   * @param {string} key - The key (path and filename) for the object to be uploaded.
   * @param {string} contentType - The MIME type of the file.
   * @param {number} [expiresIn=3600] - URL validity duration in seconds.
   * @returns {Promise<string>} The generated presigned URL.
   */
  async generatePresignedUploadUrl(key, contentType, expiresIn = PRESIGNED_URL.DEFAULT_EXPIRES_IN) {
    return this._withErrorHandling(async () => {
      const command = new PutObjectCommand({ Bucket: this.bucketName, Key: key, ContentType: contentType });
      return getSignedUrl(this.client, command, { expiresIn });
    }, 'PRESIGNED_URL_FAILED', { key });
  }

  /**
   * Checks if the R2 service is fully configured with environment variables.
   * @returns {boolean} True if all required variables are set.
   */
  isConfigured() {
    const config = {
      accountId: process.env.R2_ACCOUNT_ID,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      bucketName: process.env.R2_BUCKET_NAME,
      publicUrl: process.env.R2_PUBLIC_URL,
    };
    return Object.values(config).every(Boolean);
  }

  /**
   * Sets the CORS configuration for the R2 bucket.
   * @returns {Promise<boolean>} True if the CORS rules are set successfully.
   */
  async setBucketCors() {
    return this._withErrorHandling(async () => {
      const corsConfiguration = {
        CORSRules: [{
          AllowedHeaders: CORS_CONFIG.ALLOWED_HEADERS,
          AllowedMethods: CORS_CONFIG.ALLOWED_METHODS,
          AllowedOrigins: [...CORS_CONFIG.ALLOWED_ORIGINS, process.env.FRONTEND_URL].filter(Boolean),
          ExposeHeaders: CORS_CONFIG.EXPOSE_HEADERS,
          MaxAgeSeconds: CORS_CONFIG.MAX_AGE_SECONDS,
        }],
      };
      const command = new PutBucketCorsCommand({
        Bucket: this.bucketName,
        CORSConfiguration: corsConfiguration,
      });
      await this.client.send(command);
      return true;
    }, 'CORS_CONFIG_FAILED');
  }

  /**
   * Retrieves and calculates storage statistics for the bucket.
   * @returns {Promise<Object>} An object containing storage stats.
   */
  async getStorageStats() {
    return this._withErrorHandling(async () => {
      const command = new ListObjectsV2Command({ Bucket: this.bucketName });
      const response = await this.client.send(command);
      const objects = response.Contents || [];

      let totalSize = 0;
      const fileTypes = {};
      objects.forEach((obj) => {
        totalSize += obj.Size || 0;
        const extension = obj.Key.split(".").pop()?.toLowerCase() || "unknown";
        fileTypes[extension] = (fileTypes[extension] || 0) + 1;
      });

      const formatBytes = (bytes) => {
        if (bytes === 0) return "0 B";
        const i = Math.floor(Math.log(bytes) / Math.log(STORAGE_STATS.BYTE_CONVERSION));
        return `${parseFloat((bytes / Math.pow(STORAGE_STATS.BYTE_CONVERSION, i)).toFixed(2))} ${STORAGE_STATS.BYTE_UNITS[i]}`;
      };

      return {
        totalFiles: objects.length,
        totalSize,
        totalSizeFormatted: formatBytes(totalSize),
        fileTypes,
        bucketName: this.bucketName,
      };
    }, 'STORAGE_STATS_FAILED');
  }
}

export default new CloudflareR2Service();
