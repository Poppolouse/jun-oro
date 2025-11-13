/**
 * Authentication routes
 */

import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "../utils/response.js";
import {
  hashPassword,
  verifyPassword,
  createJWT,
  generateSessionId,
} from "../utils/auth.js";
import {
  validateUserRegistration,
  validateUserLogin,
} from "../utils/validation.js";
import { authMiddleware } from "../middleware/auth.js";
import { getPrismaClient, withTransaction } from "../lib/prisma.js";

export async function handleRegister(request, env) {
  try {
    const userData = await request.json();
    const prisma = getPrismaClient(env);

    // Validate input
    const validationErrors = validateUserRegistration(userData);
    if (validationErrors.length > 0) {
      return errorResponse("Validation failed", 400, {
        errors: validationErrors,
      });
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: userData.username }, { email: userData.email }],
      },
    });

    if (existingUser) {
      return errorResponse("Username or email already exists", 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user with transaction
    const result = await withTransaction(env, async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: userData.username,
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          role: "user",
          isActive: true,
        },
      });

      // Create session
      const sessionId = generateSessionId();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await tx.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          expiresAt,
          isActive: true,
        },
      });

      // Create JWT token
      const token = await createJWT(
        { userId: user.id, sessionId },
        env.JWT_SECRET,
        "24h",
      );

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      };
    });

    return successResponse("User registered successfully", result);
  } catch (error) {
    console.error("Register error:", error);
    return serverErrorResponse("Registration failed");
  }
}

export async function handleLogin(request, env) {
  try {
    const loginData = await request.json();
    const prisma = getPrismaClient(env);

    // Validate input
    const validationErrors = validateUserLogin(loginData);
    if (validationErrors.length > 0) {
      return errorResponse("Validation failed", 400, {
        errors: validationErrors,
      });
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: loginData.username }, { email: loginData.username }],
      },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return errorResponse("Invalid credentials", 401);
    }

    if (!user.isActive) {
      return errorResponse("Account is inactive", 401);
    }

    // Verify password
    console.log("Password verification starting...");
    console.log("Plain password from frontend:", loginData.password);
    console.log("Hashed password from DB:", user.password);
    const isValidPassword = await verifyPassword(
      loginData.password,
      user.password,
    );
    console.log("Password validation result:", isValidPassword);
    if (!isValidPassword) {
      console.log("Password verification failed.");
      return errorResponse("Invalid credentials", 401);
    }
    console.log("Password verification successful.");

    // Create new session with transaction
    const result = await withTransaction(env, async (tx) => {
      // Deactivate old sessions
      await tx.session.updateMany({
        where: {
          userId: user.id,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Create new session
      const sessionId = generateSessionId();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await tx.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          expiresAt,
          isActive: true,
        },
      });

      // Create JWT token
      const token = await createJWT(
        { userId: user.id, sessionId },
        env.JWT_SECRET,
        "24h",
      );

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      };
    });

    return successResponse("Login successful", result);
  } catch (error) {
    console.error("Login error:", error);
    return serverErrorResponse("Login failed");
  }
}

export async function handleLogout(request, env) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request, env);
    if (authResult) return authResult;

    const prisma = getPrismaClient(env);

    // Deactivate current session
    await prisma.session.update({
      where: {
        id: request.user.sessionId,
      },
      data: {
        isActive: false,
      },
    });

    return successResponse("Logout successful");
  } catch (error) {
    console.error("Logout error:", error);
    return serverErrorResponse("Logout failed");
  }
}

export async function handleVerify(request, env) {
  try {
    // Auth middleware will handle token verification
    const authResult = await authMiddleware(request, env);

    if (!authResult.success) {
      return errorResponse(authResult.message, 401);
    }

    const prisma = getPrismaClient(env);

    // Get user details
    const user = await prisma.user.findUnique({
      where: {
        id: authResult.userId,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse("Token verified", { user });
  } catch (error) {
    console.error("Verify error:", error);
    return serverErrorResponse("Token verification failed");
  }
}

export async function handleMe(request, env) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request, env);
    if (authResult) return authResult;

    const prisma = getPrismaClient(env);

    // Get user details
    const user = await prisma.user.findUnique({
      where: {
        id: request.user.id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse("User details retrieved", { user });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return serverErrorResponse("Failed to get user details");
  }
}
