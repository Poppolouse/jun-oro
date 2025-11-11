import express from "express";
import cloudflareR2 from "../lib/cloudflareR2.js";

const router = express.Router();

/**
 * GET /api/r2/stats
 * Get R2 storage statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const stats = await cloudflareR2.getStorageStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("R2 stats error:", error);
    res.status(500).json({
      success: false,
      message: "R2 istatistikleri alınamadı",
      error: error.message,
    });
  }
});

/**
 * GET /api/r2/test
 * Test R2 connection
 */
router.get("/test", async (req, res) => {
  try {
    const isConnected = await cloudflareR2.testConnection();

    res.json({
      success: true,
      data: {
        connected: isConnected,
        bucketName: process.env.R2_BUCKET_NAME,
        publicUrl: process.env.R2_PUBLIC_URL,
      },
    });
  } catch (error) {
    console.error("R2 test error:", error);
    res.status(500).json({
      success: false,
      message: "R2 bağlantı testi başarısız",
      error: error.message,
    });
  }
});

export default router;
