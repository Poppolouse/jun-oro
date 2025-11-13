import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
} from "../lib/validation.js";
import { logAdminAction, getAdminAuditLogs } from "../middleware/adminAudit.js";
import { enforceRule } from "../middleware/rulesEnforcer.js";

const router = express.Router();

// GET /api/users - Get all users (with pagination)
router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { lastActive: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          status: true,
          profileImage: true,
          createdAt: true,
          lastActive: true,
        },
      }),
      prisma.user.count(),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Get user by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        libraryEntries: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
                cover: true,
                rating: true,
              },
            },
          },
        },
        preferences: true,
        userStats: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Create new user
router.post(
  "/",
  logAdminAction("CREATE_USER", "USER"),
  async (req, res, next) => {
    try {
      const validatedData = createUserSchema.parse(req.body);

      // Hash password if provided
      let userData = { ...validatedData };
      if (userData.password) {
        const saltRounds = 10;
        userData.password = await bcrypt.hash(userData.password, saltRounds);
      }

      const user = await prisma.user.create({
        data: {
          ...userData,
          preferences: {
            create: {},
          },
          userStats: {
            create: {},
          },
        },
        include: {
          preferences: true,
          userStats: true,
        },
      });

      res.status(201).json({
        success: true,
        data: user,
        message: "User created successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

// PUT /api/users/:id - Update user
router.put(
  "/:id",
  logAdminAction("UPDATE_USER", "USER"),
  async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const validatedData = updateUserSchema.parse(req.body);

      // Hash password if provided
      let userData = { ...validatedData };
      if (userData.password) {
        const saltRounds = 10;
        userData.password = await bcrypt.hash(userData.password, saltRounds);
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          ...userData,
          lastActive: new Date(),
        },
        include: {
          preferences: true,
          userStats: true,
        },
      });

      res.json({
        success: true,
        data: user,
        message: "User updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/users/:id - Delete user
router.delete(
  "/:id",
  logAdminAction("DELETE_USER", "USER"),
  enforceRule("no_user_deletion"),
  async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);

      // Admin koruma sistemi - Admin hesaplarını silmeyi engelle
      const userToDelete = await prisma.user.findUnique({
        where: { id },
        select: { role: true, username: true, name: true },
      });

      if (!userToDelete) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Admin hesabını silmeyi engelle
      if (userToDelete.role === "admin") {
        return res.status(403).json({
          success: false,
          error:
            "Admin hesapları silinemez! Güvenlik nedeniyle admin hesapları korunmaktadır.",
          details: {
            username: userToDelete.username || userToDelete.name,
            reason: "ADMIN_PROTECTION_ENABLED",
          },
        });
      }

      await prisma.user.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/users/:id/activity - Update user last activity
router.post("/:id/activity", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const user = await prisma.user.update({
      where: { id },
      data: {
        lastActive: new Date(),
      },
      select: {
        id: true,
        lastActive: true,
      },
    });

    res.json({
      success: true,
      data: user,
      message: "User activity updated",
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id/summary - Get user summary stats
router.get("/:id/summary", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { libraryEntries: true },
        },
        userStats: true,
        sessions: {
          where: { isActive: true },
          include: {
            game: {
              select: { name: true, cover: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const summary = {
      user: {
        id: user.id,
        name: user.name,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
      },
      library: {
        totalGames: user._count?.libraryEntries || 0,
        totalPlaytime: user.userStats?.totalPlayTime || 0,
      },
      stats: user.userStats,
      activeSessions: user.sessions,
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/login - User login (JWT + Session hybrid)
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate login credentials
    if (!validateLoginCredentials(username, password, res)) {
      return;
    }

    // Find and authenticate user
    const user = await findAndAuthenticateUser(username, password);
    if (!user) {
      return handleAuthenticationError(res);
    }

    // Create session
    const sessionId = await createUserSession(
      user.id,
      req.ip,
      req.get("User-Agent"),
    );

    // Create JWT token
    const token = await createJWTToken(user.id, sessionId);

    // Update user activity and return response
    const userResponse = await updateUserActivityAndReturn(user);

    res.json({
      success: true,
      data: {
        ...userResponse,
        token,
        sessionId,
        expiresIn: "24h",
      },
      message: "Giriş başarılı",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Validates login credentials
 * @param {string} username - Username to validate
 * @param {string} password - Password to validate
 * @param {object} res - Response object
 * @returns {boolean} - True if valid, false otherwise
 */
function validateLoginCredentials(username, password, res) {
  if (!username || !password) {
    res.status(400).json({
      success: false,
      message: "Kullanıcı adı ve şifre gerekli",
    });
    return false;
  }
  return true;
}

/**
 * Finds user by username or email and authenticates password
 * @param {string} username - Username or email to search
 * @param {string} password - Password to verify
 * @returns {Promise<object|null>} - User data or null if authentication fails
 */
async function findAndAuthenticateUser(username, password) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email: username }],
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      password: true,
      role: true,
      status: true,
      createdAt: true,
      lastActive: true,
      profileImage: true,
    },
  });

  if (!user || !user.password) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  return isPasswordValid ? user : null;
}

/**
 * Handles authentication error response
 * @param {object} res - Response object
 */
function handleAuthenticationError(res) {
  res.status(401).json({
    success: false,
    message: "Geçersiz kullanıcı adı veya şifre",
  });
}

/**
 * Creates user session in database
 * @param {string} userId - User ID
 * @param {string} ipAddress - User IP address
 * @param {string} userAgent - User agent string
 * @returns {Promise<string>} - Session ID
 */
async function createUserSession(userId, ipAddress, userAgent) {
  const sessionId = require("@paralleldrive/cuid2").createId();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Session tablosu bazı ortamlarda mevcut olmayabilir.
  // DB yazımı hata verirse login'i tamamen kırmak yerine devam edelim.
  try {
    await prisma.session.create({
      data: {
        id: sessionId,
        userId,
        expiresAt,
        ipAddress,
        userAgent,
        isActive: true,
      },
    });
  } catch (error) {
    console.error("Session create failed, proceeding without DB session:", error?.message || error);
  }

  return sessionId;
}

/**
 * Creates JWT token with user and session info
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<string>} - JWT token
 */
async function createJWTToken(userId, sessionId) {
  // Guard: JWT_SECRET yoksa açık bir hata mesajı verelim
  if (!process.env.JWT_SECRET) {
    const err = new Error("JWT secret is not configured");
    // Express error handler'a anlamlı mesajla düşsün
    err.statusCode = 500;
    throw err;
  }

  const payload = {
    userId,
    sessionId,
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "24h",
    issuer: "jun-oro-api",
    audience: "jun-oro-client",
  });
}

/**
 * Updates user last activity and returns user data without password
 * @param {object} user - User object
 * @returns {Promise<object>} - Updated user data without password
 */
async function updateUserActivityAndReturn(user) {
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastActive: new Date(),
    },
  });

  // Return user data without password
  // eslint-disable-next-line no-unused-vars
  const { password: pwd, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// POST /api/users/register - User registration (pending approval)
router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!validateRegistrationFields(username, email, password, res)) {
      return;
    }

    // Check if user already exists
    const existingUser = await checkUserExists(username, email);
    if (existingUser) {
      return handleExistingUserError(existingUser, res);
    }

    // Create new user
    const user = await createNewUser(
      username,
      email,
      password,
      firstName,
      lastName,
    );

    res.status(201).json({
      success: true,
      data: user,
      message: "Kayıt başarılı! Hesabınız admin onayı bekliyor.",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Validates user registration fields
 * @param {string} username - Username to validate
 * @param {string} email - Email to validate
 * @param {string} password - Password to validate
 * @param {object} res - Response object
 * @returns {boolean} - True if valid, false otherwise
 */
function validateRegistrationFields(username, email, password, res) {
  if (!username || !email || !password) {
    res.status(400).json({
      success: false,
      message: "Kullanıcı adı, email ve şifre gerekli",
    });
    return false;
  }

  if (password.length < 6) {
    res.status(400).json({
      success: false,
      message: "Şifre en az 6 karakter olmalıdır",
    });
    return false;
  }

  return true;
}

/**
 * Checks if user already exists by username or email
 * @param {string} username - Username to check
 * @param {string} email - Email to check
 * @returns {Promise<object|null>} - Existing user data or null
 */
async function checkUserExists(username, email) {
  const [existingUsername, existingEmail] = await Promise.all([
    prisma.user.findUnique({ where: { username } }),
    prisma.user.findUnique({ where: { email } }),
  ]);

  if (existingUsername) return { type: "username", data: existingUsername };
  if (existingEmail) return { type: "email", data: existingEmail };
  return null;
}

/**
 * Handles existing user error responses
 * @param {object} existingUser - Existing user data
 * @param {object} res - Response object
 */
function handleExistingUserError(existingUser, res) {
  const messages = {
    username: "Bu kullanıcı adı zaten kullanılıyor",
    email: "Bu email adresi zaten kullanılıyor",
  };

  res.status(400).json({
    success: false,
    message: messages[existingUser.type],
  });
}

/**
 * Creates a new user with hashed password
 * @param {string} username - Username
 * @param {string} email - Email
 * @param {string} password - Plain password
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {Promise<object>} - Created user data
 */
async function createNewUser(username, email, password, firstName, lastName) {
  const SALT_ROUNDS = 10;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  return await prisma.user.create({
    data: {
      name:
        firstName && lastName ? `${firstName} ${lastName}`.trim() : username,
      username,
      email,
      password: hashedPassword,
      role: "user",
      status: "pending", // Pending admin approval
      preferences: { create: {} },
      userStats: { create: {} },
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
}

// GET /api/users/admin/audit-logs - Get admin audit logs
router.get("/admin/audit-logs", getAdminAuditLogs);

// PUT /api/users/:id/approve - Approve pending user
router.put("/:id/approve", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Update user status to active
    const user = await prisma.user.update({
      where: { id },
      data: {
        status: "active",
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: user,
      message: "Kullanıcı başarıyla onaylandı.",
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id/reject - Reject pending user
router.delete("/:id/reject", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete: pending user
    await prisma.user.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Kullanıcı başarıyla reddedildi ve silindi.",
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/migrate-existing - Migrate existing users to active status
router.put("/migrate-existing", async (req, res, next) => {
  try {
    // First, get all users to see their current status
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        status: true,
      },
    });

    // Update all users to active status
    const result = await prisma.user.updateMany({
      data: {
        status: "active",
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: {
        updatedCount: result.count,
        users: allUsers,
      },
      message: `${result.count} kullanıcı aktif duruma güncellendi.`,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id/role - Update user role
router.put("/:id/role", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz rol. Sadece "user" veya "admin" olabilir.',
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        role,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: user,
      message: `Kullanıcı rolü ${role} olarak güncellendi.`,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id/security - Get user security details (admin only)
router.get("/:id/security", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find user for security check
    const user = await findUserForSecurityCheck(id);
    if (!user) {
      return handleUserNotFoundError(res);
    }

    // Build security information
    const securityInfo = await buildSecurityInfo(user);

    res.json({
      success: true,
      data: securityInfo,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

/**
 * Finds user for security check by ID
 * @param {string} id - User ID
 * @returns {Promise<object|null>} - User data or null if not found
 */
async function findUserForSecurityCheck(id) {
  return await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      username: true,
      email: true,
      password: true, // Şifreyi de dahil et (admin için)
      createdAt: true,
      updatedAt: true,
      lastActive: true,
      status: true,
      // Güvenlik bilgileri için hesaplanacak alanlar
    },
  });
}

/**
 * Handles user not found error for security endpoint
 * @param {object} res - Response object
 */
function handleUserNotFoundError(res) {
  return res.status(404).json({
    success: false,
    message: "Kullanıcı bulunamadı",
  });
}

/**
 * Builds comprehensive security information for user
 * @param {object} user - User data
 * @returns {Promise<object>} - Security information
 */
async function buildSecurityInfo(user) {
  return {
    userId: user.id,
    username: user.username,
    email: user.email,
    password: user.password, // Şifreyi döndür (admin için)
    security: {
      passwordStrength: calculatePasswordStrength(user.password),
      lastPasswordChange: formatLastPasswordChange(user.updatedAt),
      twoFactorEnabled: false, // Şimdilik false, ileride gerçek 2FA sistemi eklenebilir
      accountLocked: isAccountLocked(user.status),
      lastLogin: formatLastLogin(user.lastActive),
    },
  };
}

/**
 * Calculates password strength based on various criteria
 * @param {string} password - Password to analyze
 * @returns {string} - Password strength level
 */
function calculatePasswordStrength(password) {
  if (!password) return "Bilinmiyor";

  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score >= 4) return "Güçlü";
  if (score >= 2) return "Orta";
  return "Zayıf";
}

/**
 * Formats last password change date
 * @param {Date} updatedAt - Last update date
 * @returns {string} - Formatted date string
 */
function formatLastPasswordChange(updatedAt) {
  return updatedAt
    ? new Date(updatedAt).toLocaleDateString("tr-TR")
    : "Bilinmiyor";
}

/**
 * Checks if account is locked based on status
 * @param {string} status - User status
 * @returns {boolean} - True if account is locked
 */
function isAccountLocked(status) {
  return status === "suspended" || status === "banned";
}

/**
 * Formats last login date
 * @param {Date} lastActive - Last active date
 * @returns {string} - Formatted date string
 */
function formatLastLogin(lastActive) {
  return lastActive
    ? new Date(lastActive).toLocaleDateString("tr-TR")
    : "Hiç giriş yapmamış";
}
