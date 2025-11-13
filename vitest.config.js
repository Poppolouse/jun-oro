/**
 * @fileoverview Vitest configuration
 * @description Test framework configuration for unit and integration tests
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: "jsdom",

    // Global setup
    globalSetup: ["./tests/setup.js"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./tests/coverage",
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.config.js",
        "**/*.config.jsx",
        "dist/",
        "build/",
        "coverage/",
        "**/*.test.js",
        "**/*.test.jsx",
        "**/*.spec.js",
        "**/*.spec.jsx",
        "src/main.jsx",
        "src/vite-env.d.ts",
      ],
      include: ["src/**/*.{js,jsx,ts,tsx}", "backend/src/**/*.{js,jsx,ts,tsx}"],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // Critical files should have higher coverage
        "src/components/**/*.{js,jsx}": {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        "backend/src/routes/*.js": {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },

    // Test files
    include: [
      "tests/unit/**/*.test.{js,jsx}",
      "tests/integration/**/*.test.{js,jsx}",
    ],
    exclude: ["tests/e2e/**", "tests/coverage/**", "node_modules/**"],

    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,

    // Parallel execution
    threads: true,
    maxThreads: 4,
    minThreads: 1,

    // Verbose output
    verbose: true,

    // Watch mode
    watch: false,

    // Reporter
    reporter: ["verbose", "json", "html"],

    // Output directory
    outputFile: "./tests/test-results.json",

    // Setup files
    setupFiles: ["./tests/setup.js", "./tests/mocks/setup.js"],

    // Global variables
    globals: true,

    // Clear mocks
    clearMocks: true,
    restoreMocks: true,

    // Isolate tests
    isolate: true,

    // Pass-through environment variables
    env: {
      NODE_ENV: "test",
      VITE_API_URL: "http://localhost:3001",
      VITE_APP_NAME: "Jun-Oro Test",
    },
  },

  // Resolve configuration
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@pages": resolve(__dirname, "./src/pages"),
      "@hooks": resolve(__dirname, "./src/hooks"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@services": resolve(__dirname, "./src/services"),
      "@contexts": resolve(__dirname, "./src/contexts"),
      "@backend": resolve(__dirname, "./backend/src"),
    },
  },

  // Define constants
  define: {
    __TEST__: true,
    __DEV__: false,
  },
});
