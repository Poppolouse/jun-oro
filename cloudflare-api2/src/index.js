/**
 * Cloudflare Worker - Jun Oro API
 * Main entry point for the API
 */

import { corsMiddleware, handleOptions } from "./middleware/cors.js";
import {
  errorResponse,
  serverErrorResponse,
} from "./utils/response.js";

// Import route handlers
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleMe,
  handleVerify,
} from "./routes/auth.js";

import {
  handleGetGames,
  handleGetGame,
  handleCreateGame,
  handleUpdateGame,
  handleDeleteGame,
} from "./routes/games.js";

import {
  handleGetUserLibrary,
  handleAddToLibrary,
  handleUpdateLibraryEntry,
  handleRemoveFromLibrary,
  handleGetLibraryStats,
} from "./routes/library.js";

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const method = request.method;
      const path = url.pathname;

      // Handle CORS preflight requests
      if (method === "OPTIONS") {
        return handleOptions(request);
      }

      // Add CORS headers to all responses
      const corsHeaders = corsMiddleware(request);

      // Health check endpoint
      if (path === "/health" && method === "GET") {
        // Check database connection
        const dbHealthy = await checkDatabaseHealth(env);
        
        return new Response(
          JSON.stringify({
            status: dbHealthy ? "healthy" : "unhealthy",
            timestamp: new Date().toISOString(),
            version: "2.0.0",
            database: dbHealthy ? "connected" : "disconnected",
          }),
          {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
            status: dbHealthy ? 200 : 503,
          },
        );
      }

      // API routes
      let response;

      // Authentication routes
      if (path === "/auth/register" && method === "POST") {
        response = await handleRegister(request, env);
      } else if (path === "/auth/login" && method === "POST") {
        response = await handleLogin(request, env);
      } else if (path === "/auth/logout" && method === "POST") {
        response = await handleLogout(request, env);
      } else if (path === "/auth/verify" && method === "GET") {
        response = await handleVerify(request, env);
      } else if (path === "/auth/me" && method === "GET") {
        response = await handleMe(request, env);
      }

      // Games routes
      else if (path === "/games" && method === "GET") {
        response = await handleGetGames(request, env);
      } else if (path === "/games" && method === "POST") {
        response = await handleCreateGame(request, env);
      } else if (path.startsWith("/games/") && method === "GET") {
        response = await handleGetGame(request, env);
      } else if (path.startsWith("/games/") && method === "PUT") {
        response = await handleUpdateGame(request, env);
      } else if (path.startsWith("/games/") && method === "DELETE") {
        response = await handleDeleteGame(request, env);
      }

      // Library routes
      else if (path === "/library" && method === "GET") {
        response = await handleGetUserLibrary(request, env);
      } else if (path === "/library" && method === "POST") {
        response = await handleAddToLibrary(request, env);
      } else if (path === "/library/stats" && method === "GET") {
        response = await handleGetLibraryStats(request, env);
      } else if (path.startsWith("/library/") && method === "PUT") {
        response = await handleUpdateLibraryEntry(request, env);
      } else if (path.startsWith("/library/") && method === "DELETE") {
        response = await handleRemoveFromLibrary(request, env);
      }

      // 404 - Route not found
      else {
        response = errorResponse("Route not found", 404);
      }

      // Add CORS headers to response
      if (response) {
        const newHeaders = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          newHeaders.set(key, value);
        });

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }

      return errorResponse("Internal server error", 500);
    } catch (error) {
      console.error("Worker error:", error);

      const corsHeaders = corsMiddleware(request);
      const errorResp = serverErrorResponse("Internal server error");

      const newHeaders = new Headers(errorResp.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      return new Response(errorResp.body, {
        status: errorResp.status,
        statusText: errorResp.statusText,
        headers: newHeaders,
      });
    }
  },
};
