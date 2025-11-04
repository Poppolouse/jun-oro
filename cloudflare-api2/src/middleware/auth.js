/**
 * Authentication middleware
 */

import { verifyJWT, extractToken } from '../utils/auth.js';
import { unauthorizedResponse, serverErrorResponse } from '../utils/response.js';

export async function authMiddleware(request, env) {
  try {
    const token = extractToken(request);
    
    if (!token) {
      return { success: false, message: 'Authorization token required' };
    }

    const payload = await verifyJWT(token, env.JWT_SECRET);
    
    // Check if session is still valid in database
    const session = await env.DB.prepare(
      'SELECT s.*, u.username, u.email, u.role, u.is_active FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.is_active = 1 AND s.expires_at > datetime("now")'
    ).bind(payload.sessionId).first();

    if (!session) {
      return { success: false, message: 'Invalid or expired session' };
    }

    if (!session.is_active) {
      return { success: false, message: 'User account is inactive' };
    }

    // Add user info to request context
    request.user = {
      id: session.user_id,
      username: session.username,
      email: session.email,
      role: session.role,
      sessionId: session.id
    };

    return { success: true, userId: session.user_id, user: request.user };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return { success: false, message: 'Invalid token' };
  }
}

export async function adminMiddleware(request, env) {
  // First check authentication
  const authResult = await authMiddleware(request, env);
  if (authResult) return authResult;

  // Check if user is admin
  if (request.user.role !== 'admin') {
    return unauthorizedResponse('Admin access required');
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
    
    const session = await env.DB.prepare(
      'SELECT s.*, u.username, u.email, u.role, u.is_active FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.is_active = 1 AND s.expires_at > datetime("now")'
    ).bind(payload.sessionId).first();

    if (session && session.is_active) {
      request.user = {
        id: session.user_id,
        username: session.username,
        email: session.email,
        role: session.role,
        sessionId: session.id
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