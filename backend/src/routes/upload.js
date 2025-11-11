import express from "express";
import { prisma } from "../lib/prisma.js";
import cloudflareR2 from "../lib/cloudflareR2.js";
import {
  uploadAvatar,
  uploadPlatformLogo,
  uploadGameCover,
  handleUploadError,
} from "../middleware/upload.js";

const router = express.Router();

// Test R2 connection
router.get("/test-r2", async (req, res) => {
  try {
    const uploadService = getUploadService();
    if (uploadService.testConnection) {
      const isConnected = await uploadService.testConnection();
      res.json({
        success: true,
        connected: isConnected,
        message: isConnected
          ? "R2 bağlantısı başarılı"
          : "R2 bağlantısı başarısız",
      });
    } else {
      res.json({
        success: false,
        message: "Test connection method not available",
      });
    }
  } catch (error) {
    console.error("R2 test error:", error);
    res.status(500).json({
      success: false,
      message: "R2 test failed",
      error: error.message,
    });
  }
});

// Create bucket if not exists
router.post("/create-bucket", async (req, res) => {
  try {
    const uploadService = getUploadService();
    if (uploadService.createBucketIfNotExists) {
      const created = await uploadService.createBucketIfNotExists();
      res.json({
        success: true,
        created: created,
        message: created ? "Bucket hazır" : "Bucket oluşturulamadı",
      });
    } else {
      res.json({
        success: false,
        message: "Create bucket method not available",
      });
    }
  } catch (error) {
    console.error("Bucket creation error:", error);
    res.status(500).json({
      success: false,
      message: "Bucket creation failed",
      error: error.message,
    });
  }
});

// Get/Set CORS configuration
router.get("/cors", async (req, res) => {
  try {
    const uploadService = getUploadService();
    if (uploadService.getBucketCors) {
      const corsRules = await uploadService.getBucketCors();
      res.json({
        success: true,
        data: corsRules,
        message: "CORS ayarları alındı",
      });
    } else {
      res.json({
        success: false,
        message: "CORS ayarları özelliği mevcut değil",
      });
    }
  } catch (error) {
    console.error("CORS get error:", error);
    res.status(500).json({
      success: false,
      message: "CORS ayarları alınamadı",
      error: error.message,
    });
  }
});

router.post("/cors", async (req, res) => {
  try {
    const uploadService = getUploadService();
    if (uploadService.setBucketCors) {
      const success = await uploadService.setBucketCors();
      res.json({
        success: success,
        message: success
          ? "CORS ayarları güncellendi"
          : "CORS ayarları güncellenemedi",
      });
    } else {
      res.json({
        success: false,
        message: "CORS ayarlama özelliği mevcut değil",
      });
    }
  } catch (error) {
    console.error("CORS set error:", error);
    res.status(500).json({
      success: false,
      message: "CORS ayarları güncellenemedi",
      error: error.message,
    });
  }
});

// Get the appropriate upload service (only R2 supported)
const getUploadService = () => {
  if (!cloudflareR2.isConfigured()) {
    throw new Error(
      "Cloudflare R2 is not configured. Please set up R2 environment variables.",
    );
  }
  console.log("Using Cloudflare R2 for file uploads");
  return cloudflareR2;
};

// POST /api/upload/avatar - Upload user avatar
router.post("/avatar", uploadAvatar, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Dosya seçilmedi",
      });
    }

    const userId = req.body.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Kullanıcı ID gerekli",
      });
    }

    // Get current user data to check for existing avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImageKey: true },
    });

    // Get the appropriate upload service
    const uploadService = getUploadService();

    // Delete existing avatar if it exists
    if (currentUser?.profileImageKey) {
      try {
        await uploadService.deleteAvatar(currentUser.profileImageKey);
        console.log("Existing avatar deleted:", currentUser.profileImageKey);
      } catch (error) {
        console.warn("Failed to delete existing avatar:", error.message);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new avatar using the selected service
    const uploadResult = await uploadService.uploadAvatar(
      req.file.buffer,
      userId,
      req.file.originalname,
    );

    // Update user profile in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileImage: uploadResult.url,
        profileImageKey: uploadResult.key,
      },
      select: {
        id: true,
        username: true,
        profileImage: true,
      },
    });

    res.json({
      success: true,
      data: {
        url: uploadResult.url,
        user: updatedUser,
      },
      message: "Avatar başarıyla yüklendi",
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    next(error);
  }
});

// POST /api/upload/platform-logo - Upload platform logo
router.post("/platform-logo", uploadPlatformLogo, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Dosya seçilmedi",
      });
    }

    const { platformName } = req.body;
    if (!platformName) {
      return res.status(400).json({
        success: false,
        message: "Platform adı gerekli",
      });
    }

    // Get the appropriate upload service
    const uploadService = getUploadService();

    // Upload using the selected service
    const uploadResult = await uploadService.uploadPlatformLogo(
      req.file.buffer,
      platformName,
      req.file.originalname,
    );

    // Save platform logo info to database
    const platform = await prisma.platform.upsert({
      where: { name: platformName },
      update: {
        logoUrl: uploadResult.url,
        logoKey: uploadResult.key,
      },
      create: {
        name: platformName,
        logoUrl: uploadResult.url,
        logoKey: uploadResult.key,
      },
    });

    res.json({
      success: true,
      data: {
        url: uploadResult.url,
        platform: platform,
      },
      message: "Platform logosu başarıyla yüklendi",
    });
  } catch (error) {
    console.error("Platform logo upload error:", error);
    next(error);
  }
});

// POST /api/upload/game-cover - Upload game cover
router.post("/game-cover", uploadGameCover, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Dosya seçilmedi",
      });
    }

    const { gameId } = req.body;
    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: "Oyun ID gerekli",
      });
    }

    // Get the appropriate upload service
    const uploadService = getUploadService();

    // Upload using the selected service
    const uploadResult = await uploadService.uploadGameCover(
      req.file.buffer,
      gameId,
      req.file.originalname,
    );

    // Update game cover in database
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        cover: uploadResult.url,
        coverKey: uploadResult.key,
      },
      select: {
        id: true,
        name: true,
        cover: true,
      },
    });

    res.json({
      success: true,
      data: {
        url: uploadResult.url,
        game: updatedGame,
      },
      message: "Oyun kapağı başarıyla yüklendi",
    });
  } catch (error) {
    console.error("Game cover upload error:", error);
    next(error);
  }
});

// DELETE /api/upload/avatar/:userId - Delete user avatar
router.delete("/avatar/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImageKey: true },
    });

    if (!user || !user.profileImageKey) {
      return res.status(404).json({
        success: false,
        message: "Avatar bulunamadı",
      });
    }

    // Get the appropriate upload service
    const uploadService = getUploadService();

    // Delete using the selected service
    const deleted = await uploadService.deleteAvatar(user.profileImageKey);

    if (deleted) {
      // Update user in database
      await prisma.user.update({
        where: { id: userId },
        data: {
          profileImage: null,
          profileImageKey: null,
        },
      });
    }

    res.json({
      success: true,
      message: "Avatar başarıyla silindi",
    });
  } catch (error) {
    console.error("Avatar delete error:", error);
    next(error);
  }
});

// GET /api/upload/presigned-url - Generate presigned URL for direct upload
router.post("/presigned-url", async (req, res, next) => {
  try {
    // Check if R2 is configured (presigned URLs only work with R2)
    if (!cloudflareR2.isConfigured()) {
      return res.status(503).json({
        success: false,
        message:
          "Presigned URL özelliği sadece Cloudflare R2 ile kullanılabilir",
      });
    }

    const { fileName, contentType, uploadType } = req.body;

    if (!fileName || !contentType || !uploadType) {
      return res.status(400).json({
        success: false,
        message: "Dosya adı, içerik türü ve yükleme türü gerekli",
      });
    }

    const allowedTypes = ["avatar", "platform-logo", "game-cover"];
    if (!allowedTypes.includes(uploadType)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz yükleme türü",
      });
    }

    // Generate unique key based on upload type
    const timestamp = Date.now();
    const key = `${uploadType}s/${timestamp}-${fileName}`;

    const presignedUrl = await cloudflareR2.generatePresignedUploadUrl(
      key,
      contentType,
    );

    res.json({
      success: true,
      data: {
        uploadUrl: presignedUrl,
        key: key,
        publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
      },
      message: "Yükleme URL'si oluşturuldu",
    });
  } catch (error) {
    console.error("Presigned URL error:", error);
    next(error);
  }
});

// Error handling middleware
router.use(handleUploadError);

export default router;
