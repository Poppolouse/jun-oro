/**
 * Response utility functions for consistent API responses
 */

export function createResponse(data, status = 200, headers = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...headers
  };

  return new Response(JSON.stringify(data), {
    status,
    headers: defaultHeaders
  });
}

export function successResponse(data, message = 'Success') {
  return createResponse({
    success: true,
    message,
    data
  });
}

export function errorResponse(message, status = 400, code = null) {
  return createResponse({
    success: false,
    message,
    code,
    timestamp: new Date().toISOString()
  }, status);
}

export function validationErrorResponse(errors) {
  return createResponse({
    success: false,
    message: 'Validation failed',
    errors
  }, 422);
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return createResponse({
    success: false,
    message
  }, 401);
}

export function forbiddenResponse(message = 'Forbidden') {
  return createResponse({
    success: false,
    message
  }, 403);
}

export function notFoundResponse(message = 'Not found') {
  return createResponse({
    success: false,
    message
  }, 404);
}

export function serverErrorResponse(message = 'Internal server error') {
  return createResponse({
    success: false,
    message
  }, 500);
}

export function corsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}