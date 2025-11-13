import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { initializeServiceWorker } from "./utils/serviceWorker.js";
import { initializePerformanceMonitoring } from "./utils/performanceMonitor.js";

/**
 * Initialize service worker for performance optimization
 */
async function initializeApp() {
  try {
    // Initialize service worker with caching strategies
    const swResult = await initializeServiceWorker({
      autoRegister: true,
      showUpdatePrompt: true,
      clearCacheOnUpdate: false,
    });

    if (swResult.success) {
      console.log("🚀 Service Worker initialized successfully");
    } else {
      console.warn("⚠️ Service Worker initialization failed:", swResult.error);
    }
  } catch (error) {
    console.error("❌ Service Worker initialization error:", error);
  }

  try {
    // Initialize performance monitoring
    const perfMonitor = initializePerformanceMonitoring({
      onMetricReport: (metric) => {
        // Log performance metrics in development
        if (import.meta.env.MODE === "development") {
          console.log("📊 Performance Metric:", metric);
        }

        // Send to analytics service in production
        if (import.meta.env.MODE === "production" && metric.value) {
          // You can send metrics to your analytics service here
          // Example: sendToAnalytics(metric);
        }
      },
      enableMemoryMonitoring: true,
      enableNetworkMonitoring: true,
      memoryInterval: 10000, // Monitor memory every 10 seconds
      analyticsEndpoint: import.meta.env.VITE_PERFORMANCE_ANALYTICS_ENDPOINT || null,
    });

    console.log("📊 Performance monitoring initialized");

    // Make performance monitor available globally for debugging
    window.performanceMonitor = perfMonitor;
  } catch (error) {
    console.error("❌ Performance monitoring initialization error:", error);
  }

  // Render the app
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
}

// Initialize the application
initializeApp();
