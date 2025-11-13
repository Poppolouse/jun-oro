/**
 * Authentication middleware
 */

import { verifyJWT, extractToken } from "../utils/auth.js";
import { unauthorizedResponse } from "../utils/response.js";
import { getPrismaClient } from "../lib/prisma.js";

export async function authMiddleware(request, env) {
  try {
    const token = extractToken(request);

    if (!token) {
      return { success: false, message: "Authorization token required" };
    }

    const payload = await verifyJWT(token, env.JWT_SECRET);
    const prisma = getPrismaClient(env);

    // Check if session is still valid in database
    const session = await prisma.session.findFirst({
      where: {
        id: payload.sessionId,
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
            isActive: true,
          },
        },
      },
    });

    if (!session) {
      return { success: false, message: "Invalid or expired session" };
    }

    if (!session.user.isActive) {
      return { success: false, message: "User account is inactive" };
    }

    // Add user info to request context
    request.user = {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id,
    };

    return { success: true, userId: session.user.id, user: request.user };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return { success: false, message: "Invalid token" };
  }
}

export async function adminMiddleware(request, env) {
  // First check authentication
  const authResult = await authMiddleware(request, env);
  if (authResult) return authResult;

  // Check if user is admin
  if (request.user.role !== "admin") {
    return unauthorizedResponse("Admin access required");
  }

  return null; // No error, continue
}

export async function optionalAuthMiddleware(request, env) {
  try {
    const token = extractToken(request);

    if (!token) {
      request.user = null;
      return null;
    }

    const payload = await verifyJWT(token, env.JWT_SECRET);
    const prisma = getPrismaClient(env);

    const session = await prisma.session.findFirst({
      where: {
        id: payload.sessionId,
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
            isActive: true,
          },
        },
      },
    });

    if (session && session.user.isActive) {
      request.user = {
        id: session.user.id,
        username: session.user.username,
        email: session.user.email,
        role: session.user.role,
        sessionId: session.id,
      };
    } else {
      request.user = null;
    }

    return null;
  } catch (error) {
    request.user = null;
    return null; // Don't fail on optional auth
  }
}
