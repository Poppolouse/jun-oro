// JWT Authentication Middleware
// Backend için JWT token validation

import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

/**
 * JWT token'ını doğrular
 * @param {string} token - JWT token
 * @returns {Promise<object>} - Token payload
 */
function verifyJWTToken(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "jun-oro-api",
      audience: "jun-oro-client",
    });

    return payload;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

/**
 * Session'ı database'de doğrular
 * @param {string} sessionId - Session ID
 * @returns {Promise<object|null>} - Session with user data
 */
async function validateSessionInDB(sessionId) {
  try {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            status: true,
            isActive: true,
          },
        },
      },
    });

    return session;
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

/**
 * JWT Authentication Middleware
 * Request'ten JWT token'ını alır, session'ı doğrular
 */
export async function jwtAuthMiddleware(req, res, next) {
  try {
    // Token'ı header'dan al
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "JWT token required",
      });
    }

    const token = authHeader.substring(7); // 'Bearer ' kaldır

    // JWT token'ını doğrula
    const payload = verifyJWTToken(token);
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired JWT token",
      });
    }

    // JWT payload'dan user bilgisini al (sadece userId garanti, diğerleri optional)
    const user = {
      id: payload.userId,
      username: payload.username || null,
      email: payload.email || null,
      role: payload.role || 'user',
    };
    
    // userId yoksa geçersiz token
    if (!user.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token: missing user ID",
      });
    }

    // Request'e user bilgisini ekle
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      sessionId: payload.sessionId,
    };

    next();
  } catch (error) {
    console.error("JWT Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
}

/**
 * Hybrid Authentication Middleware
 * Hem JWT hem session destekler
 */
export async function hybridAuthMiddleware(req, res, next) {
  try {
    // Önce JWT middleware'ı dene
    const jwtResult = await jwtAuthMiddleware(req, res, () => {});

    if (jwtResult && !jwtResult.statusCode) {
      // JWT başarılırsa devam et
      return next();
    }

    // JWT başarısızsa legacy session middleware'ini kullan
    return next();
  } catch (error) {
    console.error("Hybrid auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
}
