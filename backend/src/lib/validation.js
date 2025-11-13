
/**
 * @file Contains all Zod validation schemas for the Jun-Oro project.
 * @description This file centralizes request body and parameter validation schemas,
 * organized by data model for clarity and maintainability. It uses helper
 * functions for creating common validators to ensure consistency.
 */

import { z } from "zod";
import {
  USER_ROLES,
  USER_STATUSES,
  SESSION_STATUSES,
  NOTIFICATION_TYPES,
  UPDATE_TYPES,
  UPDATE_STATUSES,
  UPDATE_PRIORITIES,
  STEP_STATUSES,
} from "./validationConstants.js";
import {
  createStringValidator,
  createOptionalStringValidator,
  createEmailValidator,
  createUsernameValidator,
  createPasswordValidator,
  createUrlValidator,
  createDateTimeValidator,
  createDateValidator,
  createNumberValidator,
  createOptionalNumberValidator,
  createArrayValidator,
  createOptionalArrayValidator,
  createRatingValidator,
  createProgressValidator,
  createPriorityValidator,
  createPlaytimeValidator,
  createPaginationSchema,
  createIdParamSchema,
  createLibraryCategoryValidator,
  validateProgressByCategory,
  validateSessionEndTime,
} from "./validationHelpers.js";

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

/**
 * Validates that the user role is one of the predefined roles.
 * @type {z.ZodEnum<typeof USER_ROLES>}
 */
export const UserRoleSchema = z.enum(USER_ROLES);

/**
 * Validates that the user status is one of the predefined statuses.
 * @type {z.ZodEnum<typeof USER_STATUSES>}
 */
export const UserStatusSchema = z.enum(USER_STATUSES);

/**
 * Validates that the session status is one of the predefined statuses.
 * @type {z.ZodEnum<typeof SESSION_STATUSES>}
 */
export const SessionStatusSchema = z.enum(SESSION_STATUSES);

// ============================================================================
// USER SCHEMAS
// ============================================================================

/**
 * Schema for validating new user creation requests.
 * Requires name, email, username, and password. Role defaults to 'user'.
 * @type {z.ZodObject<any>}
 */
export const createUserSchema = z.object({
  name: createStringValidator(1, 100, "Name is required", "Name too long"),
  email: createEmailValidator(),
  username: createUsernameValidator(),
  password: createPasswordValidator(),
  role: UserRoleSchema.default("user"),
});

/**
 * Schema for validating user update requests.
 * All fields are optional.
 * @type {z.ZodObject<any>}
 */
export const updateUserSchema = z.object({
  name: createOptionalStringValidator(1, 100, "Name too long"),
  email: createEmailValidator().optional(),
  username: createUsernameValidator().optional(),
  password: createPasswordValidator().optional(),
  role: UserRoleSchema.optional(),
  lastActive: createDateTimeValidator().optional(),
});

// ============================================================================
// GAME SCHEMAS
// ============================================================================

/**
 * Creates a validation schema for Steam-related game data.
 * @returns {z.ZodObject<any>} Steam data validation schema.
 * @private
 */
function createSteamDataSchema() {
  return z.object({
    appId: createOptionalNumberValidator(0, 999999, "App ID must be positive", "App ID too high"),
    price: createOptionalNumberValidator(0, 999999, "Price must be positive", "Price too high"),
    discount: createOptionalNumberValidator(0, 100, "Discount must be positive", "Discount cannot exceed 100"),
    reviews: z
      .object({
        positive: createOptionalNumberValidator(0, 999999, "Positive reviews must be positive", "Too many positive reviews"),
        negative: createOptionalNumberValidator(0, 999999, "Negative reviews must be positive", "Too many negative reviews"),
        score: createOptionalNumberValidator(0, 100, "Review score must be positive", "Review score cannot exceed 100"),
      })
      .optional(),
  });
}

/**
 * Creates a validation schema for IGDB-related game data.
 * @returns {z.ZodObject<any>} IGDB data validation schema.
 * @private
 */
function createIgdbDataSchema() {
  return z.object({
    id: createOptionalNumberValidator(0, 999999, "IGDB ID must be positive", "IGDB ID too high"),
    slug: createOptionalStringValidator(1, 200, "Slug too long"),
    url: createUrlValidator().optional(),
    screenshots: createOptionalArrayValidator(50, "Too many screenshots"),
  });
}

/**
 * Creates a validation schema for HowLongToBeat (HLTB) data.
 * @returns {z.ZodObject<any>} HLTB data validation schema.
 * @private
 */
function createHltbDataSchema() {
  return z.object({
    main: createOptionalNumberValidator(0, 999999, "Main time must be positive", "Main time too high"),
    mainExtra: createOptionalNumberValidator(0, 999999, "Main+Extra time must be positive", "Main+Extra time too high"),
    completionist: createOptionalNumberValidator(0, 999999, "Completionist time must be positive", "Completionist time too high"),
  });
}

/**
 * Creates a validation schema for Metacritic-related game data.
 * @returns {z.ZodObject<any>} Metacritic data validation schema.
 * @private
 */
function createMetacriticDataSchema() {
  return z.object({
    score: createOptionalNumberValidator(0, 100, "Score must be positive", "Score cannot exceed 100"),
    userScore: createOptionalNumberValidator(0, 10, "User score must be positive", "User score cannot exceed 10"),
    url: createUrlValidator().optional(),
  });
}

/**
 * Schema for validating new game creation requests.
 * @type {z.ZodObject<any>}
 */
export const createGameSchema = z.object({
  id: z.string().min(1, "Game ID is required"),
  name: createStringValidator(1, 200, "Game name is required", "Game name too long"),
  cover: createUrlValidator(),
  firstReleaseDate: createDateValidator(),
  genres: createOptionalArrayValidator(10, "Too many genres"),
  platforms: createOptionalArrayValidator(20, "Too many platforms"),
  summary: createOptionalStringValidator(1, 2000, "Summary too long"),
  rating: createOptionalNumberValidator(0, 100, "Rating must be positive", "Rating cannot exceed 100"),
  developer: createOptionalStringValidator(1, 100, "Developer name too long"),
  developers: createOptionalArrayValidator(10, "Too many developers"),
  publisher: createOptionalStringValidator(1, 100, "Publisher name too long"),
  publishers: createOptionalArrayValidator(10, "Too many publishers"),
  steamData: createSteamDataSchema().optional(),
  igdbData: createIgdbDataSchema().optional(),
  hltbData: createHltbDataSchema().optional(),
  metacriticData: createMetacriticDataSchema().optional(),
  accessCount: createNumberValidator(0, 999999, "Access count must be positive", "Access count too high").default(0),
});

/**
 * Schema for validating game update requests.
 * Inherits from createGameSchema, makes all fields partial, and omits the 'id'.
 * @type {z.ZodObject<any>}
 */
export const updateGameSchema = createGameSchema.partial().omit({ id: true });

// ============================================================================
// LIBRARY SCHEMAS
// ============================================================================

/**
 * Schema for validating requests to add a game to a user's library.
 * @type {z.ZodObject<any>}
 */
export const addToLibrarySchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  category: createLibraryCategoryValidator("WISHLIST"),
  playtime: createPlaytimeValidator().default(0),
  rating: createRatingValidator().optional(),
  notes: createOptionalStringValidator(1, 1000, "Notes too long"),
  progress: createProgressValidator().default(0),
  priority: createPriorityValidator().default(3),
  isPublic: z.boolean().default(true),
  /**
   * Tags can be an array of strings or a flexible key-value object.
   * The `z.record(z.any())` provides flexibility but lacks strict type safety.
   */
  tags: z
    .union([
      createArrayValidator(10, "Too many tags"),
      z.record(z.any()),
    ])
    .optional(),
});

/**
 * Schema for validating updates to a library entry.
 * Includes a refinement to ensure progress value is valid for the given category.
 * @type {z.ZodObject<any>}
 */
export const updateLibraryEntrySchema = z
  .object({
    category: createLibraryCategoryValidator().optional(),
    playtime: createPlaytimeValidator().optional(),
    rating: createRatingValidator().optional(),
    notes: createOptionalStringValidator(1, 1000, "Notes too long"),
    progress: createProgressValidator().optional(),
    priority: createPriorityValidator().optional(),
    isPublic: z.boolean().optional(),
    /**
     * Tags can be an array of strings or a flexible key-value object.
     * The `z.record(z.any())` provides flexibility but lacks strict type safety.
     */
    tags: z
      .union([createArrayValidator(10, "Too many tags"), z.record(z.any())])
      .optional(),
    lastPlayed: createDateTimeValidator().optional(),
  })
  .refine(
    (data) => {
      // Progress validation is only necessary if both category and progress are being updated.
      if (data.category !== undefined && data.progress !== undefined) {
        return validateProgressByCategory(data.category, data.progress);
      }
      return true;
    },
    {
      message: "Progress must match category constraints (e.g., 'COMPLETED' requires 100, 'WISHLIST' requires 0).",
      path: ["progress"],
    },
  );

// ============================================================================
// SESSION SCHEMAS
// ============================================================================

/**
 * Schema for validating new game session creation requests.
 * @type {z.ZodObject<any>}
 */
export const createSessionSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  gameName: createStringValidator(1, 200, "Game name is required", "Game name too long"),
  startTime: createDateTimeValidator(),
  campaigns: createOptionalArrayValidator(10, "Too many campaigns"),
  platform: createOptionalStringValidator(1, 50, "Platform name too long"),
  status: SessionStatusSchema.default("ACTIVE"),
  notes: createOptionalStringValidator(1, 500, "Notes too long"),
});

/**
 * Schema for validating game session update requests.
 * Includes a refinement to ensure endTime is set when a session is finished.
 * @type {z.ZodObject<any>}
 */
export const updateSessionSchema = z
  .object({
    playtime: createPlaytimeValidator().optional(),
    campaigns: createOptionalArrayValidator(10, "Too many campaigns"),
    platform: createOptionalStringValidator(1, 50, "Platform name too long"),
    status: SessionStatusSchema.optional(),
    notes: createOptionalStringValidator(1, 500, "Notes too long"),
    endTime: createDateTimeValidator().optional(),
  })
  .refine(
    (data) => {
      // If status marks the session as finished, an endTime must be provided.
      if (data.status !== undefined && data.endTime !== undefined) {
        return validateSessionEndTime(data.status, data.endTime);
      }
      return true;
    },
    {
      message: "End time is required when session status is 'COMPLETED' or 'ABANDONED'.",
      path: ["endTime"],
    },
  );

/**
 * Schema for validating requests to end a game session.
 * @type {z.ZodObject<any>}
 */
export const endSessionSchema = z.object({
  endTime: createDateTimeValidator(),
  playtime: createPlaytimeValidator(),
  status: SessionStatusSchema.default("COMPLETED"),
  notes: createOptionalStringValidator(1, 500, "Notes too long"),
});

// ============================================================================
// PREFERENCES SCHEMAS
// ============================================================================

/**
 * Schema for validating user preferences update requests.
 * All fields are optional.
 * @type {z.ZodObject<any>}
 */
export const updatePreferencesSchema = z.object({
  preferredPlatform: createOptionalStringValidator(1, 100, "Platform name too long"),
  preferredStatus: createOptionalStringValidator(1, 50, "Status name too long"),
  includeDLCs: z.boolean().optional(),
  selectedDLCs: createOptionalArrayValidator(50, "Too many DLCs"),
  selectedCampaigns: createOptionalArrayValidator(20, "Too many campaigns"),
  preferredVersion: createOptionalStringValidator(1, 50, "Version name too long"),
  /**
   * `gameSpecificPrefs` allows for storing unstructured preference data.
   * This provides flexibility but bypasses strict type validation. Use with caution.
   */
  gameSpecificPrefs: z.any().optional(),
  autoLoadHLTB: z.boolean().optional(),
  autoLoadMetacritic: z.boolean().optional(),
  autoGenerateCampaigns: z.boolean().optional(),
});

// ============================================================================
// CAMPAIGN SCHEMAS
// ============================================================================

/**
 * Schema for validating new campaign creation requests.
 * @type {z.ZodObject<any>}
 */
export const createCampaignSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  name: createStringValidator(1, 200, "Campaign name is required", "Campaign name too long"),
  description: createOptionalStringValidator(1, 1000, "Description too long"),
  averageDuration: createOptionalStringValidator(1, 100, "Duration too long"),
  customProperties: createOptionalArrayValidator(20, "Too many custom properties"),
  parentId: createOptionalStringValidator(1, 100, "Parent ID too long"),
  isAutoGenerated: z.boolean().default(false),
  isMainCampaign: z.boolean().default(false),
  difficulty: createOptionalStringValidator(1, 50, "Difficulty name too long"),
  features: createOptionalArrayValidator(20, "Too many features"),
});

/**
 * Schema for validating campaign update requests.
 * Inherits from createCampaignSchema, makes all fields partial, and omits 'gameId'.
 * @type {z.ZodObject<any>}
 */
export const updateCampaignSchema = createCampaignSchema.partial().omit({ gameId: true });

// ============================================================================
// NOTIFICATION SCHEMAS
// ============================================================================

/**
 * Schema for validating new notification creation requests.
 * @type {z.ZodObject<any>}
 */
export const createNotificationSchema = z.object({
  userId: createOptionalStringValidator(1, 100, "User ID too long"),
  title: createStringValidator(1, 200, "Title is required", "Title too long"),
  message: createStringValidator(1, 1000, "Message is required", "Message too long"),
  type: z.enum(NOTIFICATION_TYPES).default("info"),
  isGlobal: z.boolean().default(false),
  metadata: z.any().optional(),
  expiresAt: createDateTimeValidator().optional(),
});

/**
 * Schema for validating notification update requests.
 * @type {z.ZodObject<any>}
 */
export const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  expiresAt: createDateTimeValidator().optional(),
});

// ============================================================================
// SYSTEM UPDATE SCHEMAS
// ============================================================================

/**
 * Schema for validating a single step within a system update.
 * @type {z.ZodObject<any>}
 */
export const createUpdateStepSchema = z.object({
  title: createStringValidator(1, 200, "Step title is required", "Step title too long"),
  description: createOptionalStringValidator(1, 1000, "Description too long"),
  progress: createNumberValidator(0, 100, "Progress must be between 0 and 100").default(0),
  status: z.enum(STEP_STATUSES).default("pending"),
  order: createNumberValidator(0, 999999, "Order must be positive", "Order too high").default(0),
});

/**
 * Schema for validating updates to a system update step.
 * @type {z.ZodObject<any>}
 */
export const updateUpdateStepSchema = createUpdateStepSchema.partial();

/**
 * Schema for validating new system update creation requests.
 * @type {z.ZodObject<any>}
 */
export const createUpdateSchema = z.object({
  title: createStringValidator(1, 200, "Update title is required", "Update title too long"),
  description: createStringValidator(1, 2000, "Update description is required", "Update description too long"),
  version: createOptionalStringValidator(1, 50, "Version too long"),
  type: z.enum(UPDATE_TYPES).default("feature"),
  status: z.enum(UPDATE_STATUSES).default("planned"),
  progress: createNumberValidator(0, 100, "Progress must be between 0 and 100").default(0),
  priority: z.enum(UPDATE_PRIORITIES).default("medium"),
  category: createOptionalStringValidator(1, 100, "Category name too long"),
  metadata: z.any().optional(),
  substeps: z.array(createUpdateStepSchema).optional(),
});

/**
 * Schema for validating updates to a system update.
 * @type {z.ZodObject<any>}
 */
export const updateUpdateSchema = createUpdateSchema.partial();

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

/**
 * Schema for validating pagination parameters (page, limit, sort).
 * @type {z.ZodObject<any>}
 */
export const paginationSchema = createPaginationSchema();

/**
 * Schema for validating a generic ID parameter in the URL.
 * @type {z.ZodObject<any>}
 */
export const idParamSchema = createIdParamSchema();
