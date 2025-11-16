const cache = new Map();

/**
 * Clears a specific entry from the cache by its key.
 * @param {string} key - The cache key to clear.
 */
export function clearCacheByKey(key) {
  console.log(`[CACHE-DEBUG] Attempting to clear cache for key: "${key}"`);
  console.log(`[CACHE-DEBUG] Cache size before clear: ${cache.size}`);
  if (cache.has(key)) {
    cache.delete(key);
    console.log(`[CACHE-SUCCESS] ✅ Cache cleared for key: "${key}"`);
  } else {
    console.log(`[CACHE-WARN] ⚠️ Cache key not found, nothing to clear: "${key}"`);
  }
  console.log(`[CACHE-DEBUG] Cache size after clear: ${cache.size}`);
}

/**
 * Cache middleware for API response caching
 * @param {number} defaultTTL - Default cache time in seconds (default: 300)
 * @param {number} maxTTL - Maximum cache time in seconds (default: 3600)
 * @returns {Function} - Express middleware function
 */
function createCacheMiddleware(defaultTTL = 300, maxTTL = 3600) {
  /**
   * Generate cache key from request
   * @param {object} req - Express request object
   * @returns {string} - Cache key
   */
  function generateCacheKey(req) {
    const { method, url, query } = req;
    const queryString = new URLSearchParams(query).toString();
    return `${method}:${url}:${queryString}`;
  }

  /**
   * Check if response should be cached
   * @param {object} res - Express response object
   * @returns {boolean} - Should cache response
   */
  function shouldCacheResponse(res) {
    const contentType = res.get("Content-Type") || "";

    // Only cache successful GET requests
    if (res.statusCode !== 200) return false;

    // Don't cache binary files, large responses, or errors
    if (
      contentType.includes("image/") ||
      contentType.includes("video/") ||
      contentType.includes("application/octet-stream") ||
      res.statusCode >= 400
    ) {
      return false;
    }

    return true;
  }

  /**
   * Get cache TTL based on response type
   * @param {object} res - Express response object
   * @returns {number} - TTL in seconds
   */
  function getCacheTTL(res) {
    const contentType = res.get("Content-Type") || "";

    // Longer cache for static assets
    if (
      contentType.includes("text/css") ||
      contentType.includes("application/javascript") ||
      contentType.includes("image/") ||
      contentType.includes("font/")
    ) {
      return maxTTL;
    }

    return defaultTTL;
  }

  return (req, res, next) => {
    const key = generateCacheKey(req);
    console.log(`[CACHE-DEBUG] Request received. Generated cache key: "${key}"`);

    // Check cache first
    if (cache.has(key)) {
      const cached = cache.get(key);
      const { data, timestamp, ttl } = cached;

      // Check if cache is still valid
      if (Date.now() - timestamp < ttl * 1000) {
        res.set("X-Cache", "HIT");
        res.set(
          "X-Cache-Age",
          Math.floor((ttl * 1000 - (Date.now() - timestamp)) / 1000),
        );
        console.log(`[CACHE-HIT] ⚡️ Serving from cache for key: "${key}"`);
        return res.json(data);
      } else {
        console.log(`[CACHE-STALE]  stale data found for key: "${key}". Deleting.`);
        cache.delete(key);
      }
    }

    console.log(`[CACHE-MISS] 🐢 No valid cache entry found for key: "${key}". Proceeding to route handler.`);
    // Continue to next middleware
    const originalJson = res.json;
    const originalSend = res.send;

    // Override res.json to cache response
    res.json = (data) => {
      const responseData = data;

      // Cache the response if it meets criteria
      if (shouldCacheResponse(res)) {
        const ttl = getCacheTTL(res);
        cache.set(key, {
          data: responseData,
          timestamp: Date.now(),
          ttl,
        });
        console.log(`[CACHE-SET] 💾 Storing response in cache for key: "${key}"`);

        // Set cache headers
        res.set("X-Cache", "MISS");
        res.set("X-Cache-Age", ttl);
        res.set("Cache-Control", `public, max-age=${ttl}`);
      }

      return originalJson.call(res, responseData);
    };

    // Override res.send to cache response
    res.send = (data) => {
      const responseData = data;

      if (shouldCacheResponse(res)) {
        const ttl = getCacheTTL(res);
        cache.set(key, {
          data: responseData,
          timestamp: Date.now(),
          ttl,
        });
        console.log(`[CACHE-SET] 💾 Storing response in cache for key: "${key}" (from res.send)`);

        res.set("X-Cache", "MISS");
        res.set("X-Cache-Age", ttl);
        res.set("Cache-Control", `public, max-age=${ttl}`);
      }

      return originalSend.call(res, responseData);
    };

    next();
  };
}

/**
 * Cache cleanup function to remove expired entries
 * @param {Map} cache - Cache instance
 */
function cleanupExpiredCache(cache) {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    const { timestamp, ttl } = value;
    if (now - timestamp > ttl * 1000) {
      cache.delete(key);
    }
  }
}

/**
 * Get cache statistics
 * @param {Map} cache - Cache instance
 * @returns {object} - Cache statistics
 */
function getCacheStats(cache) {
  const stats = {
    size: cache.size,
    entries: Array.from(cache.entries()).map(([key, value]) => ({
      key,
      age: Date.now() - value.timestamp,
      ttl: value.ttl,
    })),
  };

  return stats;
}

export { createCacheMiddleware, cleanupExpiredCache, getCacheStats };
