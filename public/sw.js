/**
 * Service Worker for Jun-Oro Performance Optimization
 * Implements caching strategies for better performance and offline support
 */

const CACHE_NAME = "jun-oro-v1";
const STATIC_CACHE_NAME = "jun-oro-static-v1";
const API_CACHE_NAME = "jun-oro-api-v1";
const IMAGE_CACHE_NAME = "jun-oro-images-v1";

// Cache duration settings (in seconds)
const CACHE_DURATIONS = {
  static: 7 * 24 * 60 * 60, // 7 days for static assets
  api: 5 * 60, // 5 minutes for API responses
  images: 24 * 60 * 60, // 24 hours for images
};

// URLs to cache on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/src/main.jsx",
  "/src/index.css",
  // Add other critical static assets
];

// API endpoints to cache
const API_PATTERNS = [
  /^\/api\/games/,
  /^\/api\/library/,
  /^\/api\/stats/,
  /^\/api\/preferences/,
];

// Image patterns to cache
const IMAGE_PATTERNS = [
  /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i,
  /^https:\/\/images\.igdb\.com/,
];

/**
 * Install event - cache static assets
 */
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker installing");

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("📦 Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()),
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activating");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== API_CACHE_NAME &&
              cacheName !== IMAGE_CACHE_NAME
            ) {
              console.log("🗑️ Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension requests
  if (url.protocol === "chrome-extension:") return;

  // Route to appropriate caching strategy
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

/**
 * Handle API requests with stale-while-revalidate strategy
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} - Response from cache or network
 */
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Try network first for POST/PUT/DELETE, cache-first for GET
  if (request.method === "GET") {
    try {
      // Try network first
      const networkResponse = await fetch(request);

      // Cache successful responses
      if (networkResponse.ok) {
        const responseToCache = networkResponse.clone();
        await cache.put(request, responseToCache);
      }

      return networkResponse;
    } catch (error) {
      // Network failed, return cached version if available
      if (cachedResponse) {
        console.log("📡 API offline - serving from cache:", request.url);
        return cachedResponse;
      }

      // No cache available, return offline response
      return new Response(
        JSON.stringify({
          error: "Network unavailable",
          message: "No cached data available",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  // For non-GET requests, always go to network
  return fetch(request);
}

/**
 * Handle image requests with cache-first strategy
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} - Response from cache or network
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Check if cache is still valid
    const dateHeader = cachedResponse.headers.get("date");
    if (dateHeader) {
      const cacheTime = new Date(dateHeader).getTime();
      const now = Date.now();
      const ageSeconds = (now - cacheTime) / 1000;

      if (ageSeconds < CACHE_DURATIONS.images) {
        return cachedResponse;
      }
    }
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    // Network failed, return cached version if available
    if (cachedResponse) {
      console.log("🖼️ Image offline - serving from cache:", request.url);
      return cachedResponse;
    }

    throw error;
  }
}

/**
 * Handle static requests with cache-first strategy
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} - Response from cache or network
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    // For navigation requests, return offline page
    if (request.mode === "navigate") {
      return caches.match("/");
    }

    throw error;
  }
}

/**
 * Check if request is for API
 * @param {URL} url - Request URL
 * @returns {boolean} - Is API request
 */
function isAPIRequest(url) {
  return API_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

/**
 * Check if request is for image
 * @param {URL} url - Request URL
 * @returns {boolean} - Is image request
 */
function isImageRequest(url) {
  return IMAGE_PATTERNS.some(
    (pattern) => pattern.test(url.pathname) || pattern.test(url.href),
  );
}

/**
 * Clean up expired cache entries
 */
async function cleanupExpiredCache() {
  const cachesToClean = [API_CACHE_NAME, IMAGE_CACHE_NAME];

  for (const cacheName of cachesToClean) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get("date");
        if (dateHeader) {
          const cacheTime = new Date(dateHeader).getTime();
          const now = Date.now();
          const ageSeconds = (now - cacheTime) / 1000;

          const maxAge =
            cacheName === API_CACHE_NAME
              ? CACHE_DURATIONS.api
              : CACHE_DURATIONS.images;

          if (ageSeconds > maxAge) {
            await cache.delete(request);
            console.log("🗑️ Expired cache entry removed:", request.url);
          }
        }
      }
    }
  }
}

// Run cache cleanup periodically
setInterval(cleanupExpiredCache, 60 * 60 * 1000); // Every hour

/**
 * Message event for cache management
 */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CACHE_CLEANUP") {
    cleanupExpiredCache();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        );
      })
      .then(() => {
        event.ports[0].postMessage({ success: true });
      });
  }
});

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    isAPIRequest,
    isImageRequest,
    handleAPIRequest,
    handleImageRequest,
    handleStaticRequest,
    cleanupExpiredCache,
  };
}
