/**
 * @fileoverview Playwright configuration for E2E testing
 * @description Configures Playwright for end-to-end testing with multiple browsers
 */

import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration object
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = defineConfig({
  // Test directory
  testDir: "./tests/e2e",

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results.json" }],
    ["junit", { outputFile: "test-results.xml" }],
    process.env.CI ? ["github"] : ["list"],
  ],

  // Global setup and teardown
  globalSetup: "./tests/e2e/global-setup.js",
  globalTeardown: "./tests/e2e/global-teardown.js",

  // Use different timeout values
  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    // Test against mobile viewports
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Environment variables
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: "http://localhost:5173",

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Record video only when retrying a test for the first time
    video: "retain-on-failure",

    // Take screenshot on failure
    screenshot: "only-on-failure",

    // Global timeout for each action
    actionTimeout: 10000,

    // Global timeout for navigation
    navigationTimeout: 30000,
  },

  // Test files pattern
  testMatch: [
    "**/*.e2e.spec.js",
    "**/*.e2e.test.js",
    "**/*.e2e.spec.jsx",
    "**/*.e2e.test.jsx",
  ],

  // Ignore patterns
  testIgnore: ["**/node_modules/**", "**/dist/**", "**/build/**"],

  // Output directory for test artifacts
  outputDir: "test-results/",
});

export default config;
