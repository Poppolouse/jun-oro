import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { createUserSchema, updateUserSchema, idParamSchema } from '../lib/validation.js';
import { logAdminAction, getAdminAuditLogs } from '../middleware/adminAudit.js';

const router = express.Router();

// GET /api/users - Get all users (with pagination)
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { lastActive: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          status: true,
          profileImage: true,
          createdAt: true,
          lastActive: true
        }
      }),
      prisma.user.count()
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res, next) => {
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
                rating: true
              }
            }
          }
        },
        preferences: true,
        userStats: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Create new user
router.post('/', logAdminAction('CREATE_USER', 'USER'), async (req, res, next) => {
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
          create: {}
        },
        userStats: {
          create: {}
        }
      },
      include: {
        preferences: true,
        userStats: true
      }
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', logAdminAction('UPDATE_USER', 'USER'), async (req, res, next) => {
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
        lastActive: new Date()
      },
      include: {
        preferences: true,
        userStats: true
      }
    });

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', logAdminAction('DELETE_USER', 'USER'), async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    // Admin koruma sistemi - Admin hesaplarını silmeyi engelle
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { role: true, username: true, name: true }
    });

    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Admin hesabını silmeyi engelle
    if (userToDelete.role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin hesapları silinemez! Güvenlik nedeniyle admin hesapları korunmaktadır.',
        details: {
          username: userToDelete.username || userToDelete.name,
          reason: 'ADMIN_PROTECTION_ENABLED'
        }
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/:id/activity - Update user last activity
router.post('/:id/activity', async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const user = await prisma.user.update({
      where: { id },
      data: {
        lastActive: new Date()
      },
      select: {
        id: true,
        lastActive: true
      }
    });

    res.json({
      success: true,
      data: user,
      message: 'User activity updated'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id/summary - Get user summary stats
router.get('/:id/summary', async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { libraryEntries: true }
        },
        userStats: true,
        sessions: {
          where: { isActive: true },
          include: {
            game: {
              select: { name: true, cover: true }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const summary = {
      user: {
        id: user.id,
        name: user.name,
        createdAt: user.createdAt,
        lastActive: user.lastActive
      },
      library: {
        totalGames: user._count?.libraryEntries || 0,
        totalPlaytime: user.userStats?.totalPlayTime || 0
      },
      stats: user.userStats,
      activeSessions: user.sessions
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/login - User login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı ve şifre gerekli'
      });
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        password: true,
        role: true,
        createdAt: true,
        lastActive: true,
        profileImage: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı adı veya şifre'
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Bu kullanıcı için şifre tanımlanmamış'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz kullanıcı adı veya şifre'
      });
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    });

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: userWithoutPassword,
      message: 'Giriş başarılı'
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/users/register - User registration (pending approval)
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı, email ve şifre gerekli'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 6 karakter olmalıdır'
      });
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcı adı zaten kullanılıyor'
      });
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with pending status (requires admin approval)
    const user = await prisma.user.create({
      data: {
        name: firstName && lastName ? `${firstName} ${lastName}`.trim() : username,
        username,
        email,
        password: hashedPassword,
        role: 'user',
        status: 'pending', // Pending admin approval
        preferences: {
          create: {}
        },
        userStats: {
          create: {}
        }
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'Kayıt başarılı! Hesabınız admin onayı bekliyor.'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/users/admin/audit-logs - Get admin audit logs
router.get('/admin/audit-logs', getAdminAuditLogs);

// PUT /api/users/:id/approve - Approve pending user
router.put('/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Update user status to active
    const user = await prisma.user.update({
      where: { id },
      data: { 
        status: 'active',
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: user,
      message: 'Kullanıcı başarıyla onaylandı.'
    });

  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id/reject - Reject pending user
router.delete('/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete the pending user
    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla reddedildi ve silindi.'
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/users/migrate-existing - Migrate existing users to active status
router.put('/migrate-existing', async (req, res, next) => {
  try {
    // First, get all users to see their current status
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        status: true
      }
    });

    // Update all users to active status
    const result = await prisma.user.updateMany({
      data: {
        status: 'active',
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: { 
        updatedCount: result.count,
        users: allUsers
      },
      message: `${result.count} kullanıcı aktif duruma güncellendi.`
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id/role - Update user role
router.put('/:id/role', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz rol. Sadece "user" veya "admin" olabilir.'
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { 
        role,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: user,
      message: `Kullanıcı rolü ${role} olarak güncellendi.`
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id/security - Get user security details (admin only)
router.get('/:id/security', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
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
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Şifre gücünü hesapla
    const calculatePasswordStrength = (password) => {
      if (!password) return 'Bilinmiyor';
      
      let score = 0;
      if (password.length >= 8) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;
      
      if (score >= 4) return 'Güçlü';
      if (score >= 2) return 'Orta';
      return 'Zayıf';
    };

    // Son şifre değişimi (updatedAt'i kullan)
    const lastPasswordChange = user.updatedAt ? 
      new Date(user.updatedAt).toLocaleDateString('tr-TR') : 
      'Bilinmiyor';

    // 2FA durumu (şimdilik false, ileride gerçek 2FA sistemi eklenebilir)
    const twoFactorEnabled = false;

    // Hesap kilidi durumu (status'e göre)
    const accountLocked = user.status === 'suspended' || user.status === 'banned';

    const securityInfo = {
      userId: user.id,
      username: user.username,
      email: user.email,
      password: user.password, // Şifreyi döndür (admin için)
      security: {
        passwordStrength: calculatePasswordStrength(user.password),
        lastPasswordChange,
        twoFactorEnabled,
        accountLocked,
        lastLogin: user.lastActive ? 
          new Date(user.lastActive).toLocaleDateString('tr-TR') : 
          'Hiç giriş yapmamış'
      }
    };

    res.json({
      success: true,
      data: securityInfo
    });

  } catch (error) {
    next(error);
  }
});

export default router;