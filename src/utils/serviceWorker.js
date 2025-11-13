/**
 * Service Worker registration and management utilities
 * Provides caching strategies and performance optimization
 */

const SW_VERSION = "1.0.0";
const SW_URL = "/sw.js";

/**
 * Check if service workers are supported
 * @returns {boolean} - Service worker support
 */
function isServiceWorkerSupported() {
  return "serviceWorker" in navigator;
}

/**
 * Register service worker with error handling
 * @param {object} options - Registration options
 * @returns {Promise<object>} - Registration result
 */
async function registerServiceWorker(options = {}) {
  if (!isServiceWorkerSupported()) {
    console.warn("⚠️ Service workers are not supported in this browser");
    return { success: false, error: "Service workers not supported" };
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_URL, {
      scope: "/",
      ...options,
    });

    console.log(
      "✅ Service Worker registered successfully:",
      registration.scope,
    );

    // Handle updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          // New version available
          if (confirm("Yeni bir sürüm mevcut. Güncellemek ister misiniz?")) {
            newWorker.postMessage({ type: "SKIP_WAITING" });
            window.location.reload();
          }
        }
      });
    });

    return { success: true, registration };
  } catch (error) {
    console.error("❌ Service Worker registration failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Unregister service worker
 * @returns {Promise<boolean>} - Success status
 */
async function unregisterServiceWorker() {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const result = await registration.unregister();
      console.log("🗑️ Service Worker unregistered:", result);
      return result;
    }
    return true;
  } catch (error) {
    console.error("❌ Service Worker unregistration failed:", error);
    return false;
  }
}

/**
 * Clear all caches
 * @returns {Promise<boolean>} - Success status
 */
async function clearAllCaches() {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.active) {
      // Send message to service worker to clear caches
      const messageChannel = new MessageChannel();

      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.success);
        };

        registration.active.postMessage({ type: "CLEAR_CACHE" }, [
          messageChannel.port2,
        ]);

        // Timeout after 5 seconds
        setTimeout(() => resolve(false), 5000);
      });
    }
    return false;
  } catch (error) {
    console.error("❌ Cache clearing failed:", error);
    return false;
  }
}

/**
 * Get cache statistics
 * @returns {Promise<object>} - Cache statistics
 */
async function getCacheStats() {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.active) {
      const messageChannel = new MessageChannel();

      return new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };

        registration.active.postMessage({ type: "GET_CACHE_STATS" }, [
          messageChannel.port2,
        ]);

        // Timeout after 5 seconds
        setTimeout(() => resolve(null), 5000);
      });
    }
    return null;
  } catch (error) {
    console.error("❌ Cache stats failed:", error);
    return null;
  }
}

/**
 * Trigger cache cleanup
 * @returns {Promise<boolean>} - Success status
 */
async function triggerCacheCleanup() {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.active) {
      registration.active.postMessage({ type: "CACHE_CLEANUP" });
      return true;
    }
    return false;
  } catch (error) {
    console.error("❌ Cache cleanup failed:", error);
    return false;
  }
}

/**
 * Check if service worker is active
 * @returns {boolean} - Service worker status
 */
function isServiceWorkerActive() {
  return (
    isServiceWorkerSupported() && navigator.serviceWorker.controller !== null
  );
}

/**
 * Get service worker version
 * @returns {Promise<string|null>} - Service worker version
 */
async function getServiceWorkerVersion() {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.active) {
      return SW_VERSION;
    }
    return null;
  } catch (error) {
    console.error("❌ Version check failed:", error);
    return null;
  }
}

/**
 * Initialize service worker with best practices
 * @param {object} options - Initialization options
 * @returns {Promise<object>} - Initialization result
 */
async function initializeServiceWorker(options = {}) {
  const {
    autoRegister = true,
    showUpdatePrompt = true,
    clearCacheOnUpdate = false,
  } = options;

  if (!isServiceWorkerSupported()) {
    return { success: false, error: "Service workers not supported" };
  }

  // Wait for page to load
  if (document.readyState === "loading") {
    await new Promise((resolve) => {
      document.addEventListener("DOMContentLoaded", resolve);
    });
  }

  if (autoRegister) {
    const result = await registerServiceWorker();

    if (result.success && showUpdatePrompt) {
      // Set up update checking
      setInterval(
        async () => {
          try {
            if (result.registration) {
              await result.registration.update();
            }
          } catch (error) {
            // Ignore update errors
          }
        },
        60 * 60 * 1000,
      ); // Check every hour
    }

    return result;
  }

  return { success: true, message: "Service worker support detected" };
}

/**
 * Service worker manager class for advanced usage
 */
class ServiceWorkerManager {
  constructor(options = {}) {
    this.options = {
      autoRegister: true,
      showUpdatePrompt: true,
      clearCacheOnUpdate: false,
      ...options,
    };
    this.registration = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the service worker
   * @returns {Promise<object>} - Initialization result
   */
  async init() {
    if (this.isInitialized) {
      return { success: true, message: "Already initialized" };
    }

    const result = await initializeServiceWorker(this.options);

    if (result.success) {
      this.isInitialized = true;
      this.registration = await navigator.serviceWorker.getRegistration();
    }

    return result;
  }

  /**
   * Clear all caches
   * @returns {Promise<boolean>} - Success status
   */
  async clearCache() {
    return await clearAllCaches();
  }

  /**
   * Get cache statistics
   * @returns {Promise<object|null>} - Cache statistics
   */
  async getStats() {
    return await getCacheStats();
  }

  /**
   * Trigger cache cleanup
   * @returns {Promise<boolean>} - Success status
   */
  async cleanup() {
    return await triggerCacheCleanup();
  }

  /**
   * Check if service worker is active
   * @returns {boolean} - Service worker status
   */
  isActive() {
    return isServiceWorkerActive();
  }

  /**
   * Get service worker version
   * @returns {Promise<string|null>} - Service worker version
   */
  async getVersion() {
    return await getServiceWorkerVersion();
  }
}

export {
  isServiceWorkerSupported,
  registerServiceWorker,
  unregisterServiceWorker,
  clearAllCaches,
  getCacheStats,
  triggerCacheCleanup,
  isServiceWorkerActive,
  getServiceWorkerVersion,
  initializeServiceWorker,
  ServiceWorkerManager,
};

export default ServiceWorkerManager;
