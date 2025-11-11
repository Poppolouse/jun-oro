import express from "express";
import { prisma } from "../lib/prisma.js";
import { updatePreferencesSchema, idParamSchema } from "../lib/validation.js";

const router = express.Router();

// GET /api/preferences/:userId - Get user preferences
router.get("/:userId", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences if they don't exist
      const defaultPreferences = await prisma.userPreferences.create({
        data: { userId },
      });

      return res.json({
        success: true,
        data: defaultPreferences,
      });
    }

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/preferences/:userId - Update user preferences
router.put("/:userId", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const validatedData = updatePreferencesSchema.parse(req.body);

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: validatedData,
      create: {
        userId,
        ...validatedData,
      },
    });

    res.json({
      success: true,
      data: preferences,
      message: "Preferences updated successfully",
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/preferences/:userId/game/:gameId - Get game-specific preferences
router.get("/:userId/game/:gameId", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { gameId } = idParamSchema.parse({ id: req.params.gameId });

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
      select: { gameSpecificPrefs: true },
    });

    const gamePrefs = preferences?.gameSpecificPrefs?.[gameId] || {};

    res.json({
      success: true,
      data: gamePrefs,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/preferences/:userId/game/:gameId - Update game-specific preferences
router.put("/:userId/game/:gameId", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { id: gameId } = idParamSchema.parse({ id: req.params.gameId });
    const gamePrefs = req.body;

    // Get current preferences
    const currentPrefs = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    const gameSpecificPrefs = currentPrefs?.gameSpecificPrefs || {};
    gameSpecificPrefs[gameId] = gamePrefs;

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: { gameSpecificPrefs },
      create: {
        userId,
        gameSpecificPrefs,
      },
    });

    res.json({
      success: true,
      data: preferences.gameSpecificPrefs[gameId],
      message: "Game preferences updated successfully",
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/preferences/:userId/game/:gameId - Delete game-specific preferences
router.delete("/:userId/game/:gameId", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });
    const { id: gameId } = idParamSchema.parse({ id: req.params.gameId });

    const currentPrefs = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (currentPrefs?.gameSpecificPrefs?.[gameId]) {
      const gameSpecificPrefs = { ...currentPrefs.gameSpecificPrefs };
      delete gameSpecificPrefs[gameId];

      await prisma.userPreferences.update({
        where: { userId },
        data: { gameSpecificPrefs },
      });
    }

    res.json({
      success: true,
      message: "Game preferences deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/preferences/:userId/reset - Reset preferences to default
router.post("/:userId/reset", async (req, res, next) => {
  try {
    const { id: userId } = idParamSchema.parse({ id: req.params.userId });

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        preferredPlatform: null,
        preferredStatus: "Oynamak İstiyorum",
        includeDLCs: false,
        selectedDLCs: null,
        selectedCampaigns: null,
        preferredVersion: null,
        gameSpecificPrefs: null,
        autoLoadHLTB: true,
        autoLoadMetacritic: true,
        autoGenerateCampaigns: true,
      },
      create: { userId },
    });

    res.json({
      success: true,
      data: preferences,
      message: "Preferences reset to default successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
