import { z } from 'zod';

// Enum schemas matching Prisma enums
export const UserRoleSchema = z.enum(['USER', 'MODERATOR', 'ADMIN']);
export const UserStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED']);
// Accept both lowercase and uppercase inputs, normalize to UPPERCASE
const AllowedLibraryCategories = ['PLAYING', 'COMPLETED', 'WISHLIST', 'DROPPED', 'ON_HOLD', 'PLAN_TO_PLAY'];
export const LibraryCategorySchema = z
  .string()
  .default('WISHLIST')
  .transform((val) => (val || 'WISHLIST').toUpperCase())
  .refine((val) => AllowedLibraryCategories.includes(val), {
    message: 'Invalid library category'
  });
export const SessionStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED']);

// User schemas with enhanced validation
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").trim(),
  email: z.string().email("Invalid email format").toLowerCase().optional(),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscore and dash")
    .trim().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.string().default("user")
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  email: z.string().email().toLowerCase().optional(),
  username: z.string()
    .min(3).max(30)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .trim().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.string().optional(),
  lastActive: z.string().datetime().optional()
});

// Game schemas with enhanced validation
export const createGameSchema = z.object({
  id: z.string().min(1, "Game ID is required"),
  name: z.string().min(1, "Game name is required").max(200, "Game name too long").trim(),
  cover: z.string().url("Invalid cover image URL").optional(),
  firstReleaseDate: z.string().datetime("Invalid release date").optional(),
  genres: z.array(z.string().min(1)).max(10, "Too many genres").optional(),
  platforms: z.array(z.string().min(1)).max(20, "Too many platforms").optional(),
  summary: z.string().max(2000, "Summary too long").optional(),
  rating: z.number().min(0, "Rating cannot be negative").max(100, "Rating cannot exceed 100").optional(),
  developer: z.string().max(100, "Developer name too long").optional(),
  developers: z.array(z.string().min(1)).max(10, "Too many developers").optional(),
  publisher: z.string().max(100, "Publisher name too long").optional(),
  publishers: z.array(z.string().min(1)).max(10, "Too many publishers").optional(),
  steamData: z.object({
    appId: z.number().optional(),
    price: z.number().min(0).optional(),
    discount: z.number().min(0).max(100).optional(),
    reviews: z.object({
      positive: z.number().min(0).optional(),
      negative: z.number().min(0).optional(),
      score: z.number().min(0).max(100).optional()
    }).optional()
  }).optional(),
  igdbData: z.object({
    id: z.number().optional(),
    slug: z.string().optional(),
    url: z.string().url().optional(),
    screenshots: z.array(z.string().url()).optional()
  }).optional(),
  hltbData: z.object({
    main: z.number().min(0).optional(),
    mainExtra: z.number().min(0).optional(),
    completionist: z.number().min(0).optional()
  }).optional(),
  metacriticData: z.object({
    score: z.number().min(0).max(100).optional(),
    userScore: z.number().min(0).max(10).optional(),
    url: z.string().url().optional()
  }).optional(),
  accessCount: z.number().min(0).default(0)
});

export const updateGameSchema = createGameSchema.partial().omit({ id: true });

// LibraryEntry schemas with enhanced validation
export const addToLibrarySchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  category: LibraryCategorySchema.optional().default('WISHLIST'),
  playtime: z.number().min(0, "Playtime cannot be negative").default(0),
  rating: z.number().min(0, "Rating cannot be negative").max(10, "Rating cannot exceed 10").optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
  progress: z.number().min(0, "Progress cannot be negative").max(100, "Progress cannot exceed 100").default(0),
  priority: z.number().min(1, "Priority must be at least 1").max(5, "Priority cannot exceed 5").default(3),
  isPublic: z.boolean().default(true),
  // Allow structured metadata object or traditional string tag arrays
  tags: z.union([
    z.array(z.string().min(1).max(50)).max(10, "Too many tags"),
    z.record(z.any())
  ]).optional()
});

export const updateLibraryEntrySchema = z.object({
  category: LibraryCategorySchema.optional(),
  playtime: z.number().min(0, "Playtime cannot be negative").optional(),
  rating: z.number().min(0).max(10).optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
  progress: z.number().min(0).max(100).optional(),
  priority: z.number().min(1).max(5).optional(),
  isPublic: z.boolean().optional(),
  // Allow structured metadata updates for tags
  tags: z.union([
    z.array(z.string().min(1).max(50)).max(10),
    z.record(z.any())
  ]).optional(),
  lastPlayed: z.string().datetime().optional()
}).refine(data => {
  // Progress validation based on category
  if (data.category === 'COMPLETED' && data.progress !== undefined && data.progress < 100) {
    return false;
  }
  if (data.category === 'WISHLIST' && data.progress !== undefined && data.progress > 0) {
    return false;
  }
  return true;
}, {
  message: "Progress must match category (Completed: 100%, Wishlist: 0%)"
});

// GameSession schemas with enhanced validation
export const createSessionSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  gameName: z.string().min(1, "Game name is required").max(200, "Game name too long").trim(),
  startTime: z.string().datetime("Invalid start time").optional(),
  campaigns: z.array(z.string().min(1)).max(10, "Too many campaigns").optional(),
  platform: z.string().min(1, "Platform is required").max(50, "Platform name too long").optional(),
  status: SessionStatusSchema.default('ACTIVE'),
  notes: z.string().max(500, "Notes too long").optional()
});

export const updateSessionSchema = z.object({
  playtime: z.number().min(0, "Playtime cannot be negative").optional(),
  campaigns: z.array(z.string().min(1)).max(10, "Too many campaigns").optional(),
  platform: z.string().min(1).max(50).optional(),
  status: SessionStatusSchema.optional(),
  notes: z.string().max(500, "Notes too long").optional(),
  endTime: z.string().datetime("Invalid end time").optional()
}).refine(data => {
  // If status is COMPLETED or ABANDONED, endTime should be provided
  if ((data.status === 'COMPLETED' || data.status === 'ABANDONED') && !data.endTime) {
    return false;
  }
  return true;
}, {
  message: "End time is required when session is completed or abandoned"
});

export const endSessionSchema = z.object({
  endTime: z.string().datetime("Invalid end time"),
  playtime: z.number().min(0, "Playtime cannot be negative").optional(),
  status: SessionStatusSchema.default('COMPLETED'),
  notes: z.string().max(500, "Notes too long").optional()
});

// Preferences schemas
export const updatePreferencesSchema = z.object({
  preferredPlatform: z.string().optional(),
  preferredStatus: z.string().optional(),
  includeDLCs: z.boolean().optional(),
  selectedDLCs: z.array(z.string()).optional(),
  selectedCampaigns: z.array(z.string()).optional(),
  preferredVersion: z.string().optional(),
  gameSpecificPrefs: z.any().optional(),
  autoLoadHLTB: z.boolean().optional(),
  autoLoadMetacritic: z.boolean().optional(),
  autoGenerateCampaigns: z.boolean().optional()
});

// Campaign schemas
export const createCampaignSchema = z.object({
  gameId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  averageDuration: z.string().optional(),
  customProperties: z.array(z.any()).optional(),
  parentId: z.string().optional(),
  isAutoGenerated: z.boolean().default(false),
  isMainCampaign: z.boolean().default(false),
  difficulty: z.string().optional(),
  features: z.array(z.string()).optional()
});

export const updateCampaignSchema = createCampaignSchema.partial().omit({ gameId: true });

// Notification schemas
export const createNotificationSchema = z.object({
  userId: z.string().optional(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  isGlobal: z.boolean().default(false),
  metadata: z.any().optional(),
  expiresAt: z.string().datetime().optional()
});

export const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  expiresAt: z.string().datetime().optional()
});

// System Update schemas
export const createUpdateStepSchema = z.object({
  title: z.string().min(1, "Step title is required"),
  description: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  order: z.number().min(0).default(0)
});

export const updateUpdateStepSchema = createUpdateStepSchema.partial();

export const createUpdateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  version: z.string().optional(),
  type: z.enum(['feature', 'bugfix', 'improvement']).default('feature'),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']).default('planned'),
  progress: z.number().min(0).max(100).default(0),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  category: z.string().optional(),
  metadata: z.any().optional(),
  substeps: z.array(createUpdateStepSchema).optional()
});

export const updateUpdateSchema = createUpdateSchema.partial();

// Common schemas
export const paginationSchema = z.object({
  page: z.string().optional().transform(val => parseInt(val) || 1),
  limit: z.string().optional().transform(val => Math.min(parseInt(val) || 10, 100)),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const idParamSchema = z.object({
  id: z.string().min(1)
});