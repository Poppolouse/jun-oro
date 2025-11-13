import sharp from "sharp";
import { IMAGE_CONFIG } from "./cloudflareR2.js";

/**
 * @file Image processing utilities using the Sharp library for R2 uploads.
 * @description Optimizes images for different use cases like avatars, logos, and covers.
 */

/**
 * Processes an avatar image with predefined settings from IMAGE_CONFIG.
 * Resizes, crops, and converts the image to JPEG.
 *
 * @param {Buffer} imageBuffer - The raw image buffer to process.
 * @returns {Promise<Buffer>} A promise that resolves with the processed image buffer.
 * @throws {Error} Throws an error if the image processing fails.
 */
export async function processAvatarImage(imageBuffer) {
  try {
    const config = IMAGE_CONFIG.AVATAR;

    return await sharp(imageBuffer)
      .resize(config.WIDTH, config.HEIGHT, {
        fit: config.FIT,
        position: config.POSITION,
      })
      .jpeg({
        quality: config.QUALITY,
        progressive: config.PROGRESSIVE,
      })
      .toBuffer();
  } catch (error) {
    console.error("Error processing avatar image:", error);
    // Re-throw a more specific error for upstream handlers.
    throw new Error(`Avatar image processing failed: ${error.message}`);
  }
}

/**
 * Processes a platform logo image with predefined settings from IMAGE_CONFIG.
 * Resizes and converts the image to PNG with a transparent background.
 *
 * @param {Buffer} imageBuffer - The raw image buffer to process.
 * @returns {Promise<Buffer>} A promise that resolves with the processed image buffer.
 * @throws {Error} Throws an error if the image processing fails.
 */
export async function processPlatformLogo(imageBuffer) {
  try {
    const config = IMAGE_CONFIG.PLATFORM_LOGO;

    return await sharp(imageBuffer)
      .resize(config.WIDTH, config.HEIGHT, {
        fit: config.FIT,
        background: config.BACKGROUND,
      })
      .png({
        quality: config.QUALITY,
        compressionLevel: config.COMPRESSION_LEVEL,
      })
      .toBuffer();
  } catch (error) {
    console.error("Error processing platform logo:", error);
    throw new Error(`Platform logo processing failed: ${error.message}`);
  }
}

/**
 * Processes a game cover image with predefined settings from IMAGE_CONFIG.
 * Resizes, crops, and converts the image to JPEG.
 *
 * @param {Buffer} imageBuffer - The raw image buffer to process.
 * @returns {Promise<Buffer>} A promise that resolves with the processed image buffer.
 * @throws {Error} Throws an error if the image processing fails.
 */
export async function processGameCoverImage(imageBuffer) {
  try {
    const config = IMAGE_CONFIG.GAME_COVER;

    return await sharp(imageBuffer)
      .resize(config.WIDTH, config.HEIGHT, {
        fit: config.FIT,
        position: config.POSITION,
      })
      .jpeg({
        quality: config.QUALITY,
        progressive: config.PROGRESSIVE,
      })
      .toBuffer();
  } catch (error) {
    console.error("Error processing game cover image:", error);
    throw new Error(`Game cover image processing failed: ${error.message}`);
  }
}

/**
 * Gets the image format (file extension) based on the processing type.
 *
 * @param {string} type - The image processing type ('avatar', 'platform', 'game').
 * @returns {string} The corresponding file extension (e.g., 'jpeg', 'png'). Defaults to 'jpeg'.
 */
export function getImageFormat(type) {
  const formatMap = {
    avatar: IMAGE_CONFIG.AVATAR.FORMAT,
    platform: IMAGE_CONFIG.PLATFORM_LOGO.FORMAT,
    game: IMAGE_CONFIG.GAME_COVER.FORMAT,
  };

  return formatMap[type] || "jpeg";
}

/**
 * Gets the MIME content type based on the image format.
 *
 * @param {string} format - The image format (e.g., 'jpeg', 'png').
 * @returns {string} The corresponding MIME content type (e.g., 'image/jpeg'). Defaults to 'image/jpeg'.
 */
export function getContentType(format) {
  const contentTypeMap = {
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };

  return contentTypeMap[format] || "image/jpeg";
}