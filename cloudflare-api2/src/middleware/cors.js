/**
 * CORS middleware
 */

export function corsMiddleware(request) {
  const origin = request.headers.get('Origin');
  
  // Allow specific origins or all origins in development
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://jun-oro.pages.dev',
    'https://jun-oro.com'
  ];

  const corsHeaders = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Max-Age': '86400',
  };

  // Check if origin is allowed
  if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost'))) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
    corsHeaders['Access-Control-Allow-Credentials'] = 'true';
  } else {
    corsHeaders['Access-Control-Allow-Origin'] = '*';
  }

  return corsHeaders;
}

export function handleOptions(request) {
  const corsHeaders = corsMiddleware(request);
  
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}