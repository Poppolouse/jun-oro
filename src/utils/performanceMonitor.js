/**
 * Performance monitoring utilities for measuring and optimizing app performance
 * Tracks Core Web Vitals and other performance metrics
 */

// Performance metrics storage
const performanceMetrics = {
  navigation: [],
  resources: [],
  vitals: {},
  memory: [],
  network: [],
};

/**
 * Measure Core Web Vitals
 * @param {Function} onReport - Callback function for reporting metrics
 */
function measureCoreWebVitals(onReport) {
  if (!window.performance) return;

  // Largest Contentful Paint (LCP)
  observeLCP(onReport);

  // First Input Delay (FID)
  observeFID(onReport);

  // Cumulative Layout Shift (CLS)
  observeCLS(onReport);

  // Time to First Byte (TTFB)
  measureTTFB(onReport);

  // First Contentful Paint (FCP)
  measureFCP(onReport);
}

/**
 * Observe Largest Contentful Paint
 * @param {Function} onReport - Callback function
 */
function observeLCP(onReport) {
  if (!window.PerformanceObserver) return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];

    if (lastEntry) {
      const lcp = {
        name: "LCP",
        value: lastEntry.renderTime || lastEntry.loadTime,
        rating: getLCPRating(lastEntry.renderTime || lastEntry.loadTime),
        timestamp: Date.now(),
      };

      performanceMetrics.vitals.lcp = lcp;
      onReport(lcp);
    }
  });

  observer.observe({ type: "largest-contentful-paint", buffered: true });
}

/**
 * Observe First Input Delay
 * @param {Function} onReport - Callback function
 */
function observeFID(onReport) {
  if (!window.PerformanceObserver) return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.name === "first-input") {
        const fid = {
          name: "FID",
          value: entry.processingStart - entry.startTime,
          rating: getFIDRating(entry.processingStart - entry.startTime),
          timestamp: Date.now(),
        };

        performanceMetrics.vitals.fid = fid;
        onReport(fid);
      }
    });
  });

  observer.observe({ type: "first-input", buffered: true });
}

/**
 * Observe Cumulative Layout Shift
 * @param {Function} onReport - Callback function
 */
function observeCLS(onReport) {
  if (!window.PerformanceObserver) return;

  let clsValue = 0;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });

    const cls = {
      name: "CLS",
      value: clsValue,
      rating: getCLSRating(clsValue),
      timestamp: Date.now(),
    };

    performanceMetrics.vitals.cls = cls;
    onReport(cls);
  });

  observer.observe({ type: "layout-shift", buffered: true });
}

/**
 * Measure Time to First Byte
 * @param {Function} onReport - Callback function
 */
function measureTTFB(onReport) {
  if (!window.performance || !window.performance.timing) return;

  const navigation = window.performance.timing;
  const ttfb = navigation.responseStart - navigation.navigationStart;

  const metric = {
    name: "TTFB",
    value: ttfb,
    rating: getTTFBRating(ttfb),
    timestamp: Date.now(),
  };

  performanceMetrics.vitals.ttfb = metric;
  onReport(metric);
}

/**
 * Measure First Contentful Paint
 * @param {Function} onReport - Callback function
 */
function measureFCP(onReport) {
  if (!window.PerformanceObserver) return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const fcpEntry = entries.find(
      (entry) => entry.name === "first-contentful-paint",
    );

    if (fcpEntry) {
      const fcp = {
        name: "FCP",
        value: fcpEntry.startTime,
        rating: getFCPRating(fcpEntry.startTime),
        timestamp: Date.now(),
      };

      performanceMetrics.vitals.fcp = fcp;
      onReport(fcp);
    }
  });

  observer.observe({ type: "paint", buffered: true });
}

/**
 * Get LCP rating
 * @param {number} value - LCP value in milliseconds
 * @returns {string} - Rating (good, needs-improvement, poor)
 */
function getLCPRating(value) {
  if (value <= 2500) return "good";
  if (value <= 4000) return "needs-improvement";
  return "poor";
}

/**
 * Get FID rating
 * @param {number} value - FID value in milliseconds
 * @returns {string} - Rating (good, needs-improvement, poor)
 */
function getFIDRating(value) {
  if (value <= 100) return "good";
  if (value <= 300) return "needs-improvement";
  return "poor";
}

/**
 * Get CLS rating
 * @param {number} value - CLS value
 * @returns {string} - Rating (good, needs-improvement, poor)
 */
function getCLSRating(value) {
  if (value <= 0.1) return "good";
  if (value <= 0.25) return "needs-improvement";
  return "poor";
}

/**
 * Get TTFB rating
 * @param {number} value - TTFB value in milliseconds
 * @returns {string} - Rating (good, needs-improvement, poor)
 */
function getTTFBRating(value) {
  if (value <= 800) return "good";
  if (value <= 1800) return "needs-improvement";
  return "poor";
}

/**
 * Get FCP rating
 * @param {number} value - FCP value in milliseconds
 * @returns {string} - Rating (good, needs-improvement, poor)
 */
function getFCPRating(value) {
  if (value <= 1800) return "good";
  if (value <= 3000) return "needs-improvement";
  return "poor";
}

/**
 * Monitor memory usage
 * @param {Function} onReport - Callback function
 * @param {number} interval - Monitoring interval in milliseconds
 */
function monitorMemoryUsage(onReport, interval = 5000) {
  if (!window.performance || !window.performance.memory) return;

  const measureMemory = () => {
    const memory = window.performance.memory;
    const usage = {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      timestamp: Date.now(),
    };

    performanceMetrics.memory.push(usage);
    onReport(usage);
  };

  // Initial measurement
  measureMemory();

  // Set up interval for continuous monitoring
  return setInterval(measureMemory, interval);
}

/**
 * Monitor network performance
 * @param {Function} onReport - Callback function
 */
function monitorNetworkPerformance(onReport) {
  if (!window.PerformanceObserver) return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (
        entry.initiatorType === "fetch" ||
        entry.initiatorType === "xmlhttprequest"
      ) {
        const networkMetric = {
          url: entry.name,
          duration: entry.duration,
          size: entry.transferSize || 0,
          timestamp: Date.now(),
          type: entry.initiatorType,
        };

        performanceMetrics.network.push(networkMetric);
        onReport(networkMetric);
      }
    });
  });

  observer.observe({ type: "resource", buffered: true });
}

/**
 * Measure bundle size and analyze
 * @returns {object} - Bundle analysis results
 */
function analyzeBundleSize() {
  if (!window.performance || !window.performance.getEntriesByType) {
    return { error: "Performance API not supported" };
  }

  const resources = window.performance.getEntriesByType("resource");
  const jsResources = resources.filter((r) => r.name.endsWith(".js"));
  const cssResources = resources.filter((r) => r.name.endsWith(".css"));

  const jsSize = jsResources.reduce(
    (total, r) => total + (r.transferSize || 0),
    0,
  );
  const cssSize = cssResources.reduce(
    (total, r) => total + (r.transferSize || 0),
    0,
  );

  return {
    js: {
      count: jsResources.length,
      totalSize: jsSize,
      averageSize: jsSize / jsResources.length,
      resources: jsResources.map((r) => ({
        name: r.name,
        size: r.transferSize,
        duration: r.duration,
      })),
    },
    css: {
      count: cssResources.length,
      totalSize: cssSize,
      averageSize: cssSize / cssResources.length,
      resources: cssResources.map((r) => ({
        name: r.name,
        size: r.transferSize,
        duration: r.duration,
      })),
    },
    total: jsSize + cssSize,
  };
}

/**
 * Get performance summary
 * @returns {object} - Performance metrics summary
 */
function getPerformanceSummary() {
  return {
    vitals: performanceMetrics.vitals,
    memory: {
      current: performanceMetrics.memory[performanceMetrics.memory.length - 1],
      peak: Math.max(...performanceMetrics.memory.map((m) => m.used)),
      average:
        performanceMetrics.memory.length > 0
          ? performanceMetrics.memory.reduce((sum, m) => sum + m.used, 0) /
            performanceMetrics.memory.length
          : 0,
    },
    network: {
      totalRequests: performanceMetrics.network.length,
      averageDuration:
        performanceMetrics.network.length > 0
          ? performanceMetrics.network.reduce((sum, n) => sum + n.duration, 0) /
            performanceMetrics.network.length
          : 0,
      slowRequests: performanceMetrics.network.filter((n) => n.duration > 1000),
      totalDataTransferred: performanceMetrics.network.reduce(
        (sum, n) => sum + n.size,
        0,
      ),
    },
    bundle: analyzeBundleSize(),
  };
}

/**
 * Clear performance metrics
 */
function clearMetrics() {
  performanceMetrics.navigation = [];
  performanceMetrics.resources = [];
  performanceMetrics.vitals = {};
  performanceMetrics.memory = [];
  performanceMetrics.network = [];
}

/**
 * Export performance metrics to JSON
 * @returns {string} - JSON string of metrics
 */
function exportMetrics() {
  return JSON.stringify(getPerformanceSummary(), null, 2);
}

/**
 * Send performance metrics to analytics service
 * @param {string} endpoint - Analytics endpoint URL
 * @param {object} metrics - Metrics to send
 */
async function sendMetricsToAnalytics(endpoint, metrics = null) {
  const dataToSend = metrics || getPerformanceSummary();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    console.error("Failed to send performance metrics:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Initialize performance monitoring
 * @param {object} options - Configuration options
 * @returns {object} - Monitoring instance
 */
function initializePerformanceMonitoring(options = {}) {
  const {
    onMetricReport = console.log,
    enableMemoryMonitoring = true,
    enableNetworkMonitoring = true,
    memoryInterval = 5000,
    analyticsEndpoint = null,
  } = options;

  // Start Core Web Vitals monitoring
  measureCoreWebVitals(onMetricReport);

  // Start memory monitoring if enabled
  let memoryMonitorInterval = null;
  if (enableMemoryMonitoring) {
    memoryMonitorInterval = monitorMemoryUsage(onMetricReport, memoryInterval);
  }

  // Start network monitoring if enabled
  if (enableNetworkMonitoring) {
    monitorNetworkPerformance(onMetricReport);
  }

  // Send metrics to analytics if endpoint provided
  if (analyticsEndpoint) {
    setInterval(() => {
      sendMetricsToAnalytics(analyticsEndpoint);
    }, 60000); // Send every minute
  }

  return {
    getSummary: getPerformanceSummary,
    exportMetrics,
    clearMetrics,
    sendToAnalytics: (endpoint) => sendMetricsToAnalytics(endpoint),
    stop: () => {
      if (memoryMonitorInterval) {
        clearInterval(memoryMonitorInterval);
      }
    },
  };
}

export {
  measureCoreWebVitals,
  monitorMemoryUsage,
  monitorNetworkPerformance,
  analyzeBundleSize,
  getPerformanceSummary,
  clearMetrics,
  exportMetrics,
  sendMetricsToAnalytics,
  initializePerformanceMonitoring,
};

export default initializePerformanceMonitoring;
