import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  CreateBucketCommand,
  PutBucketCorsCommand,
  GetBucketCorsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

class CloudflareR2Service {
  constructor() {
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    this.bucketName = process.env.R2_BUCKET_NAME;
    this.publicUrl = process.env.R2_PUBLIC_URL;
  }

  /**
   * Test R2 connection
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      // Try to list objects in the bucket (limit to 1 to minimize data transfer)
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        MaxKeys: 1,
      });

      await this.client.send(command);
      console.log("✅ R2 connection successful");
      return true;
    } catch (error) {
      console.error("❌ R2 connection failed:", {
        message: error.message,
        code: error.Code || error.code,
        statusCode: error.$metadata?.httpStatusCode,
        requestId: error.$metadata?.requestId,
      });
      return false;
    }
  }

  /**
   * Create bucket if it doesn't exist
   * @returns {Promise<boolean>}
   */
  async createBucketIfNotExists() {
    try {
      // First try to list objects to see if bucket exists
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        MaxKeys: 1,
      });

      await this.client.send(listCommand);
      console.log("✅ Bucket already exists:", this.bucketName);
      return true;
    } catch (error) {
      if (error.Code === "NoSuchBucket") {
        try {
          console.log("🔧 Creating bucket:", this.bucketName);
          const createCommand = new CreateBucketCommand({
            Bucket: this.bucketName,
          });

          await this.client.send(createCommand);
          console.log("✅ Bucket created successfully:", this.bucketName);
          return true;
        } catch (createError) {
          console.error("❌ Failed to create bucket:", {
            message: createError.message,
            code: createError.Code || createError.code,
            statusCode: createError.$metadata?.httpStatusCode,
          });
          return false;
        }
      } else {
        console.error("❌ Error checking bucket:", error);
        return false;
      }
    }
  }

  /**
   * Upload avatar image to R2
   * @param {Buffer} imageBuffer - Image buffer
   * @param {string} userId - User ID
   * @param {string} originalName - Original filename
   * @returns {Promise<{url: string, key: string}>}
   */
  async uploadAvatar(imageBuffer, userId, originalName) {
    try {
      // Process image with sharp - resize and optimize
      const processedImage = await sharp(imageBuffer)
        .resize(200, 200, {
          fit: "cover",
          position: "center",
        })
        .jpeg({
          quality: 85,
          progressive: true,
        })
        .toBuffer();

      const fileExtension = "jpg";
      const fileName = `avatars/${userId}/${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: processedImage,
        ContentType: "image/jpeg",
        CacheControl: "public, max-age=31536000", // 1 year cache
        Metadata: {
          "original-name": originalName,
          "user-id": userId,
          "upload-date": new Date().toISOString(),
        },
      });

      await this.client.send(command);

      return {
        url: `${this.publicUrl}/${fileName}`,
        key: fileName,
      };
    } catch (error) {
      console.error("Error uploading avatar:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        statusCode: error.$metadata?.httpStatusCode,
        requestId: error.$metadata?.requestId,
      });
      throw new Error(`Avatar upload failed: ${error.message}`);
    }
  }

  /**
   * Upload platform logo to R2
   * @param {Buffer} imageBuffer - Image buffer
   * @param {string} platformName - Platform name
   * @param {string} originalName - Original filename
   * @returns {Promise<{url: string, key: string}>}
   */
  async uploadPlatformLogo(imageBuffer, platformName, originalName) {
    try {
      // Process image with sharp - resize and optimize for logos
      const processedImage = await sharp(imageBuffer)
        .resize(64, 64, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({
          quality: 90,
          compressionLevel: 9,
        })
        .toBuffer();

      const fileExtension = "png";
      const fileName = `platforms/${platformName.toLowerCase().replace(/\s+/g, "-")}/${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: processedImage,
        ContentType: "image/png",
        CacheControl: "public, max-age=31536000", // 1 year cache
        Metadata: {
          "original-name": originalName,
          "platform-name": platformName,
          "upload-date": new Date().toISOString(),
        },
      });

      await this.client.send(command);

      return {
        url: `${this.publicUrl}/${fileName}`,
        key: fileName,
      };
    } catch (error) {
      console.error("Error uploading platform logo:", error);
      throw new Error("Platform logo upload failed");
    }
  }

  /**
   * Upload game cover image to R2
   * @param {Buffer} imageBuffer - Image buffer
   * @param {string} gameId - Game ID
   * @param {string} originalName - Original filename
   * @returns {Promise<{url: string, key: string}>}
   */
  async uploadGameCover(imageBuffer, gameId, originalName) {
    try {
      // Process image with sharp - resize and optimize for game covers
      const processedImage = await sharp(imageBuffer)
        .resize(300, 400, {
          fit: "cover",
          position: "center",
        })
        .jpeg({
          quality: 85,
          progressive: true,
        })
        .toBuffer();

      const fileExtension = "jpg";
      const fileName = `games/${gameId}/${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: processedImage,
        ContentType: "image/jpeg",
        CacheControl: "public, max-age=31536000", // 1 year cache
        Metadata: {
          "original-name": originalName,
          "game-id": gameId,
          "upload-date": new Date().toISOString(),
        },
      });

      await this.client.send(command);

      return {
        url: `${this.publicUrl}/${fileName}`,
        key: fileName,
      };
    } catch (error) {
      console.error("Error uploading game cover:", error);
      throw new Error("Game cover upload failed");
    }
  }

  /**
   * Delete file from R2
   * @param {string} key - File key
   * @returns {Promise<boolean>}
   */
  async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  /**
   * Delete avatar from R2
   * @param {string} key - Avatar file key
   * @returns {Promise<boolean>}
   */
  async deleteAvatar(key) {
    return this.deleteFile(key);
  }

  /**
   * Generate presigned URL for direct upload
   * @param {string} key - File key
   * @param {string} contentType - Content type
   * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns {Promise<string>}
   */
  async generatePresignedUploadUrl(key, contentType, expiresIn = 3600) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(this.client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      throw new Error("Failed to generate upload URL");
    }
  }

  /**
   * Check if R2 is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    return !!(
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL
    );
  }

  /**
   * Get bucket CORS configuration
   * @returns {Promise<Object>}
   */
  async getBucketCors() {
    try {
      const command = new GetBucketCorsCommand({
        Bucket: this.bucketName,
      });

      const response = await this.client.send(command);
      return response.CORSRules || [];
    } catch (error) {
      console.error("Error getting bucket CORS:", error);
      return [];
    }
  }

  /**
   * Set bucket CORS configuration
   * @returns {Promise<boolean>}
   */
  async setBucketCors() {
    try {
      const corsConfiguration = {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: [
              "https://jun-oro.com",
              "https://www.jun-oro.com",
              "http://localhost:3000",
              "http://localhost:3001",
              "http://localhost:3002",
              "http://localhost:5173",
              process.env.FRONTEND_URL,
            ].filter(Boolean),
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3000,
          },
        ],
      };

      const command = new PutBucketCorsCommand({
        Bucket: this.bucketName,
        CORSConfiguration: corsConfiguration,
      });

      await this.client.send(command);
      console.log("✅ R2 bucket CORS configuration updated");
      return true;
    } catch (error) {
      console.error("❌ Error setting bucket CORS:", error);
      return false;
    }
  }

  /**
   * Get storage statistics
   * @returns {Promise<Object>}
   */
  async getStorageStats() {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
      });

      const response = await this.client.send(command);
      const objects = response.Contents || [];

      let totalSize = 0;
      let totalFiles = objects.length;
      let fileTypes = {};
      let recentFiles = [];

      // Calculate total size and categorize files
      objects.forEach((obj) => {
        totalSize += obj.Size || 0;

        // Get file extension
        const fileName = obj.Key;
        const extension = fileName.split(".").pop()?.toLowerCase() || "unknown";
        fileTypes[extension] = (fileTypes[extension] || 0) + 1;

        // Add to recent files (last 10)
        recentFiles.push({
          name: fileName,
          size: obj.Size,
          lastModified: obj.LastModified,
          url: `${this.publicUrl}/${fileName}`,
        });
      });

      // Sort recent files by last modified date
      recentFiles.sort(
        (a, b) => new Date(b.lastModified) - new Date(a.lastModified),
      );
      recentFiles = recentFiles.slice(0, 10);

      return {
        totalFiles,
        totalSize,
        totalSizeFormatted: this.formatBytes(totalSize),
        fileTypes,
        recentFiles,
        bucketName: this.bucketName,
        publicUrl: this.publicUrl,
      };
    } catch (error) {
      console.error("❌ Error getting storage stats:", error);
      return {
        totalFiles: 0,
        totalSize: 0,
        totalSizeFormatted: "0 B",
        fileTypes: {},
        recentFiles: [],
        bucketName: this.bucketName,
        publicUrl: this.publicUrl,
        error: error.message,
      };
    }
  }

  /**
   * Format bytes to human readable format
   * @param {number} bytes
   * @returns {string}
   */
  formatBytes(bytes) {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

export default new CloudflareR2Service();
