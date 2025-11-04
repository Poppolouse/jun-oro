/**
 * Authentication routes
 */

import { successResponse, errorResponse, serverErrorResponse } from '../utils/response.js';
import { hashPassword, verifyPassword, createJWT, generateSessionId, generateUUID } from '../utils/auth.js';
import { validateUserRegistration, validateUserLogin } from '../utils/validation.js';
import { authMiddleware } from '../middleware/auth.js';

export async function handleRegister(request, env) {
  try {
    const userData = await request.json();
    
    // Validate input
    const validationErrors = validateUserRegistration(userData);
    if (validationErrors.length > 0) {
      return errorResponse('Validation failed', 400, { errors: validationErrors });
    }

    // Check if username or email already exists
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE username = ? OR email = ?'
    ).bind(userData.username, userData.email).first();

    if (existingUser) {
      return errorResponse('Username or email already exists', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const result = await env.DB.prepare(
      'INSERT INTO users (username, email, password_hash, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))'
    ).bind(userData.username, userData.email, hashedPassword, 'user', 1).run();

    const userId = result.meta.last_row_id;

    // Create session
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, is_active, expires_at, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
    ).bind(sessionId, userId, 1, expiresAt.toISOString()).run();

    // Create JWT token
    const token = await createJWT({ userId, sessionId }, env.JWT_SECRET, '24h');

    return successResponse('User registered successfully', {
      user: {
        id: userId,
        username: userData.username,
        email: userData.email,
        role: 'user'
      },
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    return serverErrorResponse('Registration failed');
  }
}

export async function handleLogin(request, env) {
  try {
    const loginData = await request.json();
    
    // Validate input
    const validationErrors = validateUserLogin(loginData);
    if (validationErrors.length > 0) {
      return errorResponse('Validation failed', 400, { errors: validationErrors });
    }

    // Find user
    const user = await env.DB.prepare(
      'SELECT id, username, email, password_hash, role, is_active FROM users WHERE username = ? OR email = ?'
    ).bind(loginData.username, loginData.username).first();

    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    if (!user.is_active) {
      return errorResponse('Account is inactive', 401);
    }

    // Verify password
    console.log("Password verification starting...");
    console.log("Plain password from frontend:", loginData.password);
    console.log("Hashed password from DB:", user.password_hash);
    const isValidPassword = await verifyPassword(loginData.password, user.password_hash);
    console.log("Password validation result:", isValidPassword);
    if (!isValidPassword) {
      console.log("Password verification failed.");
      return errorResponse('Invalid credentials', 401);
    }
    console.log("Password verification successful.");

    // Deactivate old sessions
    await env.DB.prepare(
      'UPDATE sessions SET is_active = 0 WHERE user_id = ? AND is_active = 1'
    ).bind(user.id).run();

    // Create new session
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, is_active, expires_at, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
    ).bind(sessionId, user.id, 1, expiresAt.toISOString()).run();

    // Create JWT token
    const token = await createJWT({ userId: user.id, sessionId }, env.JWT_SECRET, '24h');

    return successResponse('Login successful', {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return serverErrorResponse('Login failed');
  }
}

export async function handleLogout(request, env) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request, env);
    if (authResult) return authResult;

    // Deactivate current session
    await env.DB.prepare(
      'UPDATE sessions SET is_active = 0 WHERE id = ?'
    ).bind(request.user.sessionId).run();

    return successResponse('Logout successful');

  } catch (error) {
    console.error('Logout error:', error);
    return serverErrorResponse('Logout failed');
  }
}

export async function handleVerify(request, env) {
  try {
    // Auth middleware will handle token verification
    const authResult = await authMiddleware(request, env);
    
    if (!authResult.success) {
      return errorResponse(authResult.message, 401);
    }

    // Get user details
    const user = await env.DB.prepare(
      'SELECT id, username, email, role, is_active, created_at, last_login FROM users WHERE id = ?'
    ).bind(authResult.userId).first();

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse('Token verified', { user });
  } catch (error) {
    console.error('Verify error:', error);
    return serverErrorResponse('Token verification failed');
  }
}

export async function handleMe(request, env) {
  try {
    // Check authentication
    const authResult = await authMiddleware(request, env);
    if (authResult) return authResult;

    // Get user details
    const user = await env.DB.prepare(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?'
    ).bind(request.user.id).first();

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse('User details retrieved', { user });

  } catch (error) {
    console.error('Me endpoint error:', error);
    return serverErrorResponse('Failed to get user details');
  }
}