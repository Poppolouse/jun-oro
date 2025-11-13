/**
 * Base validation helper functions for Jun-Oro project
 * Contains reusable validation logic to reduce code duplication
 */

import { z } from "zod";
import {
  STRING_LIMITS,
  NUMBER_RANGES,
  ARRAY_LIMITS,
  REGEX_PATTERNS,
  ERROR_MESSAGES,
} from "./validationConstants.js";

/**
 * Creates a string validation schema with common constraints
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} requiredMessage - Error message for required field
 * @param {string} tooLongMessage - Error message for too long field
 * @returns {z.ZodString} String validation schema
 */
export function createStringValidator(minLength, maxLength, requiredMessage, tooLongMessage) {
  return z.string().min(minLength, requiredMessage).max(maxLength, tooLongMessage).trim();
}

/**
 * Creates an optional string validation schema
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} tooLongMessage - Error message for too long field
 * @returns {z.ZodOptional} Optional string validation schema
 */
export function createOptionalStringValidator(minLength, maxLength, tooLongMessage) {
  return z.string().min(minLength).max(maxLength, tooLongMessage).trim().optional();
}

/**
 * Creates a number validation schema with range constraints
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} minMessage - Error message for minimum value
 * @param {string} maxMessage - Error message for maximum value
 * @returns {z.ZodNumber} Number validation schema
 */
export function createNumberValidator(min, max, minMessage, maxMessage) {
  return z.number().min(min, minMessage).max(max, maxMessage);
}

/**
 * Creates an optional number validation schema with range constraints
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} minMessage - Error message for minimum value
 * @param {string} maxMessage - Error message for maximum value
 * @returns {z.ZodOptional} Optional number validation schema
 */
export function createOptionalNumberValidator(min, max, minMessage, maxMessage) {
  return z.number().min(min, minMessage).max(max, maxMessage).optional();
}

/**
 * Creates an array validation schema with size constraints
 * @param {number} maxLength - Maximum array length
 * @param {string} tooManyMessage - Error message for too many items
 * @returns {z.ZodArray} Array validation schema
 */
export function createArrayValidator(maxLength, tooManyMessage) {
  return z.array(z.string().min(1)).max(maxLength, tooManyMessage);
}

/**
 * Creates an optional array validation schema with size constraints
 * @param {number} maxLength - Maximum array length
 * @param {string} tooManyMessage - Error message for too many items
 * @returns {z.ZodOptional} Optional array validation schema
 */
export function createOptionalArrayValidator(maxLength, tooManyMessage) {
  return z.array(z.string().min(1)).max(maxLength, tooManyMessage).optional();
}

/**
 * Creates an email validation schema
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodString | z.ZodOptional} Email validation schema
 */
export function createEmailValidator(isRequired = true) {
  const validator = z.string().email(ERROR_MESSAGES.INVALID_EMAIL).toLowerCase();
  return isRequired ? validator : validator.optional();
}

/**
 * Creates a username validation schema with regex pattern
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodString | z.ZodOptional} Username validation schema
 */
export function createUsernameValidator(isRequired = true) {
  const validator = z
    .string()
    .min(STRING_LIMITS.USERNAME_MIN, ERROR_MESSAGES.USERNAME_TOO_SHORT)
    .max(STRING_LIMITS.USERNAME_MAX, ERROR_MESSAGES.USERNAME_TOO_LONG)
    .regex(REGEX_PATTERNS.USERNAME, ERROR_MESSAGES.USERNAME_INVALID_CHARS)
    .trim();
  
  return isRequired ? validator : validator.optional();
}

/**
 * Creates a password validation schema
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodString | z.ZodOptional} Password validation schema
 */
export function createPasswordValidator(isRequired = true) {
  const validator = z.string().min(6, ERROR_MESSAGES.PASSWORD_TOO_SHORT);
  return isRequired ? validator : validator.optional();
}

/**
 * Creates a URL validation schema
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodString | z.ZodOptional} URL validation schema
 */
export function createUrlValidator(isRequired = false) {
  const validator = z.string().url(ERROR_MESSAGES.INVALID_URL);
  return isRequired ? validator : validator.optional();
}

/**
 * Creates a datetime validation schema
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodString | z.ZodOptional} Datetime validation schema
 */
export function createDateTimeValidator(isRequired = false) {
  const validator = z.string().datetime(ERROR_MESSAGES.INVALID_DATETIME);
  return isRequired ? validator : validator.optional();
}

/**
 * Creates a date validation schema
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodString | z.ZodOptional} Date validation schema
 */
export function createDateValidator(isRequired = false) {
  const validator = z.string().datetime(ERROR_MESSAGES.INVALID_DATE);
  return isRequired ? validator : validator.optional();
}

/**
 * Creates a rating validation schema (0-10)
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodNumber | z.ZodOptional} Rating validation schema
 */
export function createRatingValidator(isRequired = false) {
  const validator = createNumberValidator(
    NUMBER_RANGES.RATING_MIN,
    NUMBER_RANGES.RATING_MAX,
    ERROR_MESSAGES.RATING_NEGATIVE,
    ERROR_MESSAGES.RATING_TOO_HIGH
  );
  
  return isRequired ? validator : validator.optional();
}

/**
 * Creates a progress validation schema (0-100)
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodNumber | z.ZodOptional} Progress validation schema
 */
export function createProgressValidator(isRequired = false) {
  const validator = createNumberValidator(
    NUMBER_RANGES.PROGRESS_MIN,
    NUMBER_RANGES.PROGRESS_MAX,
    ERROR_MESSAGES.PROGRESS_NEGATIVE,
    ERROR_MESSAGES.PROGRESS_TOO_HIGH
  );
  
  return isRequired ? validator : validator.optional();
}

/**
 * Creates a priority validation schema (1-5)
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodNumber | z.ZodOptional} Priority validation schema
 */
export function createPriorityValidator(isRequired = false) {
  const validator = createNumberValidator(
    NUMBER_RANGES.PRIORITY_MIN,
    NUMBER_RANGES.PRIORITY_MAX,
    ERROR_MESSAGES.PRIORITY_TOO_LOW,
    ERROR_MESSAGES.PRIORITY_TOO_HIGH
  );
  
  return isRequired ? validator : validator.optional();
}

/**
 * Creates a playtime validation schema (0+)
 * @param {boolean} isRequired - Whether field is required
 * @returns {z.ZodNumber | z.ZodOptional} Playtime validation schema
 */
export function createPlaytimeValidator(isRequired = false) {
  const validator = z.number().min(0, ERROR_MESSAGES.PLAYTIME_NEGATIVE);
  return isRequired ? validator : validator.optional();
}

/**
 * Creates a pagination schema with page, limit, and sort options
 * @returns {z.ZodObject} Pagination validation schema
 */
export function createPaginationSchema() {
  return z.object({
    page: z
      .string()
      .optional()
      .transform((val) => parseInt(val) || 1),
    limit: z
      .string()
      .optional()
      .transform((val) => Math.min(parseInt(val) || 10, 100)),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  });
}

/**
 * Creates an ID parameter validation schema
 * @returns {z.ZodObject} ID parameter validation schema
 */
export function createIdParamSchema() {
  return z.object({
    id: z.string().min(1, ERROR_MESSAGES.REQUIRED),
  });
}

/**
 * Creates a library category validation with normalization
 * @param {string} defaultValue - Default category value
 * @returns {z.ZodEffects} Library category validation schema
 */
export function createLibraryCategoryValidator(defaultValue = "WISHLIST") {
  return z
    .string()
    .default(defaultValue)
    .transform((val) => (val || defaultValue).toUpperCase())
    .refine((val) => ["PLAYING", "COMPLETED", "WISHLIST", "DROPPED", "ON_HOLD", "PLAN_TO_PLAY"].includes(val), {
      message: ERROR_MESSAGES.INVALID_LIBRARY_CATEGORY,
    });
}

/**
 * Creates a refinement for progress validation based on category
 * @param {string} category - Library category
 * @param {number} progress - Progress value
 * @returns {boolean} Whether progress is valid for the category
 */
export function validateProgressByCategory(category, progress) {
  // Early return pattern
  if (progress === undefined) return true;
  
  if (category === "COMPLETED" && progress < 100) {
    return false;
  }
  
  if (category === "WISHLIST" && progress > 0) {
    return false;
  }
  
  return true;
}

/**
 * Creates a refinement for session end time validation
 * @param {string} status - Session status
 * @param {string} endTime - End time value
 * @returns {boolean} Whether end time is valid for the status
 */
export function validateSessionEndTime(status, endTime) {
  // Early return pattern
  if (status !== "COMPLETED" && status !== "ABANDONED") {
    return true;
  }
  
  return !!endTime;
}