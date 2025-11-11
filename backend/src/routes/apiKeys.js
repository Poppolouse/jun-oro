import express from "express";
import { prisma } from "../lib/prisma.js";
import { encrypt, decrypt } from "../lib/encryption.js";
import { z } from "zod";

const router = express.Router();

// Validation schemas
const createApiKeySchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  keyName: z.string().min(1, "Key name is required"),
  keyValue: z.string().min(1, "Key value is required"),
  isGlobal: z.boolean().default(false),
  metadata: z.object({}).optional(),
});

const updateApiKeySchema = z.object({
  keyName: z.string().min(1).optional(),
  keyValue: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  metadata: z.object({}).optional(),
});

const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// GET /api/api-keys - Get all API keys for a user or global keys
router.get("/", async (req, res, next) => {
  try {
    const { userId, includeGlobal = "true" } = req.query;

    const where = {
      OR: [],
    };

    // Add user-specific keys if userId provided
    if (userId) {
      where.OR.push({ userId, isGlobal: false });
    }

    // Add global keys if requested
    if (includeGlobal === "true") {
      where.OR.push({ isGlobal: true });
    }

    // If no conditions, return empty array
    if (where.OR.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const apiKeys = await prisma.apiKey.findMany({
      where,
      orderBy: [
        { isGlobal: "desc" }, // Global keys first
        { serviceName: "asc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        serviceName: true,
        keyName: true,
        isActive: true,
        isGlobal: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        lastUsed: true,
        userId: true,
        // Note: keyValue is excluded for security
      },
    });

    res.json({
      success: true,
      data: apiKeys,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/api-keys/:id - Get specific API key (without decrypted value)
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
      select: {
        id: true,
        serviceName: true,
        keyName: true,
        isActive: true,
        isGlobal: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        lastUsed: true,
        userId: true,
      },
    });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        error: "API key not found",
      });
    }

    res.json({
      success: true,
      data: apiKey,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/api-keys/service/:serviceName - Get API key for specific service
router.get("/service/:serviceName", async (req, res, next) => {
  try {
    const { serviceName } = req.params;
    const { userId, decrypt: shouldDecrypt = "false" } = req.query;

    // Build query to find the most appropriate key
    const where = {
      serviceName,
      isActive: true,
      OR: [],
    };

    // Prefer user-specific keys over global keys
    if (userId) {
      where.OR.push({ userId, isGlobal: false });
    }
    where.OR.push({ isGlobal: true });

    const apiKey = await prisma.apiKey.findFirst({
      where,
      orderBy: [
        { isGlobal: "asc" }, // User-specific keys first
        { createdAt: "desc" },
      ],
    });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        error: `No active API key found for service: ${serviceName}`,
      });
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsed: new Date() },
    });

    const response = {
      id: apiKey.id,
      serviceName: apiKey.serviceName,
      keyName: apiKey.keyName,
      isGlobal: apiKey.isGlobal,
      metadata: apiKey.metadata,
    };

    // Only decrypt if explicitly requested (for actual API usage)
    if (shouldDecrypt === "true") {
      try {
        response.keyValue = decrypt(apiKey.keyValue);
      } catch (error) {
        console.error("Failed to decrypt API key:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to decrypt API key",
        });
      }
    }

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/api-keys - Create new API key
router.post("/", async (req, res, next) => {
  try {
    const validatedData = createApiKeySchema.parse(req.body);
    const { userId } = req.query;

    // Encrypt the API key value
    const encryptedKeyValue = encrypt(validatedData.keyValue);

    // Check for existing key with same service and user
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        serviceName: validatedData.serviceName,
        userId: validatedData.isGlobal ? null : userId,
        isGlobal: validatedData.isGlobal,
      },
    });

    if (existingKey) {
      return res.status(409).json({
        success: false,
        error: `API key for ${validatedData.serviceName} already exists`,
      });
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        serviceName: validatedData.serviceName,
        keyName: validatedData.keyName,
        keyValue: encryptedKeyValue,
        isGlobal: validatedData.isGlobal,
        isActive: true, // Explicitly set to true
        metadata: validatedData.metadata || {},
        userId: validatedData.isGlobal ? null : userId,
      },
      select: {
        id: true,
        serviceName: true,
        keyName: true,
        isActive: true,
        isGlobal: true,
        metadata: true,
        createdAt: true,
        userId: true,
      },
    });

    res.status(201).json({
      success: true,
      data: apiKey,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/api-keys/:id - Update API key
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const validatedData = updateApiKeySchema.parse(req.body);

    // Check if API key exists
    const existingKey = await prisma.apiKey.findUnique({
      where: { id },
    });

    if (!existingKey) {
      return res.status(404).json({
        success: false,
        error: "API key not found",
      });
    }

    const updateData = { ...validatedData };

    // Encrypt new key value if provided
    if (validatedData.keyValue) {
      updateData.keyValue = encrypt(validatedData.keyValue);
    }

    const updatedKey = await prisma.apiKey.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        serviceName: true,
        keyName: true,
        isActive: true,
        isGlobal: true,
        metadata: true,
        updatedAt: true,
        userId: true,
      },
    });

    res.json({
      success: true,
      data: updatedKey,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/api-keys/:id - Delete API key
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const deletedKey = await prisma.apiKey.delete({
      where: { id },
      select: {
        id: true,
        serviceName: true,
        keyName: true,
      },
    });

    res.json({
      success: true,
      data: deletedKey,
      message: "API key deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "API key not found",
      });
    }
    next(error);
  }
});

export default router;
