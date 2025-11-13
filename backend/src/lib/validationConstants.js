/**
 * Validation constants for the Jun-Oro project
 * Contains all magic numbers and limits used in validation schemas
 */

// String length limits
export const STRING_LIMITS = {
  NAME_MIN: 1,
  NAME_MAX: 100,
  USERNAME_MIN: 3,
  USERNAME_MAX: 30,
  GAME_NAME_MAX: 200,
  SUMMARY_MAX: 2000,
  NOTES_MAX: 1000,
  PLATFORM_NAME_MAX: 50,
  SESSION_NOTES_MAX: 500,
  TAG_MAX: 50,
  CAMPAIGN_NAME_MAX: 200,
  NOTIFICATION_TITLE_MAX: 200,
  NOTIFICATION_MESSAGE_MAX: 1000,
};

// Number ranges
export const NUMBER_RANGES = {
  RATING_MIN: 0,
  RATING_MAX: 10,
  GAME_RATING_MAX: 100,
  PROGRESS_MIN: 0,
  PROGRESS_MAX: 100,
  PRIORITY_MIN: 1,
  PRIORITY_MAX: 5,
  DISCOUNT_MIN: 0,
  DISCOUNT_MAX: 100,
  METACRITIC_USER_SCORE_MAX: 10,
};

// Array limits
export const ARRAY_LIMITS = {
  GENRES_MAX: 10,
  PLATFORMS_MAX: 20,
  DEVELOPERS_MAX: 10,
  PUBLISHERS_MAX: 10,
  CAMPAIGNS_MAX: 10,
  TAGS_MAX: 10,
  SUBSTEPS_MAX: 50,
};

// Default values
export const DEFAULT_VALUES = {
  ROLE: "user",
  LIBRARY_CATEGORY: "WISHLIST",
  PLAYTIME: 0,
  PROGRESS: 0,
  PRIORITY: 3,
  IS_PUBLIC: true,
  STATUS: "ACTIVE",
  SESSION_STATUS: "ACTIVE",
  NOTIFICATION_TYPE: "info",
  IS_GLOBAL: false,
  UPDATE_TYPE: "feature",
  UPDATE_STATUS: "planned",
  UPDATE_PROGRESS: 0,
  UPDATE_PRIORITY: "medium",
  STEP_STATUS: "pending",
  STEP_PROGRESS: 0,
  STEP_ORDER: 0,
  ACCESS_COUNT: 0,
  PAGE: 1,
  LIMIT: 10,
  SORT_ORDER: "desc",
};

// Pagination limits
export const PAGINATION_LIMITS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Regex patterns
export const REGEX_PATTERNS = {
  USERNAME: /^[a-zA-Z0-9_-]+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Enum values
export const USER_ROLES = ["USER", "MODERATOR", "ADMIN"];
export const USER_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED", "BANNED"];
export const LIBRARY_CATEGORIES = [
  "PLAYING",
  "COMPLETED",
  "WISHLIST",
  "DROPPED",
  "ON_HOLD",
  "PLAN_TO_PLAY",
];
export const SESSION_STATUSES = ["ACTIVE", "PAUSED", "COMPLETED", "ABANDONED"];
export const NOTIFICATION_TYPES = ["info", "success", "warning", "error"];
export const UPDATE_TYPES = ["feature", "bugfix", "improvement"];
export const UPDATE_STATUSES = ["planned", "in_progress", "completed", "cancelled"];
export const UPDATE_PRIORITIES = ["low", "medium", "high", "critical"];
export const STEP_STATUSES = ["pending", "in_progress", "completed", "cancelled"];
export const SORT_ORDERS = ["asc", "desc"];

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED: "This field is required",
  INVALID_EMAIL: "Invalid email format",
  NAME_TOO_LONG: "Name too long",
  USERNAME_TOO_SHORT: "Username must be at least 3 characters",
  USERNAME_TOO_LONG: "Username too long",
  USERNAME_INVALID_CHARS: "Username can only contain letters, numbers, underscore and dash",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters",
  GAME_NAME_REQUIRED: "Game name is required",
  GAME_NAME_TOO_LONG: "Game name too long",
  INVALID_URL: "Invalid URL format",
  INVALID_DATE: "Invalid date format",
  INVALID_DATETIME: "Invalid datetime format",
  TOO_MANY_GENRES: "Too many genres",
  TOO_MANY_PLATFORMS: "Too many platforms",
  TOO_MANY_DEVELOPERS: "Too many developers",
  TOO_MANY_PUBLISHERS: "Too many publishers",
  SUMMARY_TOO_LONG: "Summary too long",
  DEVELOPER_NAME_TOO_LONG: "Developer name too long",
  PUBLISHER_NAME_TOO_LONG: "Publisher name too long",
  NOTES_TOO_LONG: "Notes too long",
  PLAYTIME_NEGATIVE: "Playtime cannot be negative",
  RATING_NEGATIVE: "Rating cannot be negative",
  RATING_TOO_HIGH: "Rating cannot exceed maximum",
  PROGRESS_NEGATIVE: "Progress cannot be negative",
  PROGRESS_TOO_HIGH: "Progress cannot exceed 100%",
  PRIORITY_TOO_LOW: "Priority must be at least 1",
  PRIORITY_TOO_HIGH: "Priority cannot exceed 5",
  PLATFORM_REQUIRED: "Platform is required",
  PLATFORM_TOO_LONG: "Platform name too long",
  GAME_ID_REQUIRED: "Game ID is required",
  INVALID_LIBRARY_CATEGORY: "Invalid library category",
  TOO_MANY_TAGS: "Too many tags",
  TAG_TOO_LONG: "Tag too long",
  INVALID_SESSION_STATUS: "Invalid session status",
  END_TIME_REQUIRED: "End time is required when session is completed or abandoned",
  PROGRESS_MISMATCH_CATEGORY: "Progress must match category (Completed: 100%, Wishlist: 0%)",
  STEP_TITLE_REQUIRED: "Step title is required",
  STEP_PROGRESS_OUT_OF_RANGE: "Progress must be between 0 and 100",
  STEP_ORDER_NEGATIVE: "Order must be non-negative",
  UPDATE_TITLE_REQUIRED: "Update title is required",
  UPDATE_DESCRIPTION_REQUIRED: "Update description is required",
  UPDATE_PROGRESS_OUT_OF_RANGE: "Progress must be between 0 and 100",
};