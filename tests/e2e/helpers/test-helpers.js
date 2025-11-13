/**
 * @fileoverview Helper functions for E2E testing
 * @description Common utilities and page objects for Playwright tests
 */

import { expect } from "@playwright/test";

/**
 * Test data constants
 */
export const TEST_DATA = {
  VALID_USER: {
    email: "test@example.com",
    password: "TestPassword123!",
    username: "testuser",
  },
  INVALID_USER: {
    email: "invalid@example.com",
    password: "wrongpassword",
  },
  SAMPLE_GAME: {
    name: "Test Game",
    platform: "PC",
    status: "playing",
  },
};

/**
 * Page object for authentication
 */
export class AuthPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator(".error-message");
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto("/login");
  }

  /**
   * Fill login form
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   */
  async fillLoginForm(credentials) {
    await this.emailInput.fill(credentials.email);
    await this.passwordInput.fill(credentials.password);
  }

  /**
   * Submit login form
   */
  async submitLogin() {
    await this.loginButton.click();
  }

  /**
   * Complete login process
   * @param {Object} credentials - User credentials
   */
  async login(credentials) {
    await this.goto();
    await this.fillLoginForm(credentials);
    await this.submitLogin();
  }

  /**
   * Get error message text
   * @returns {Promise<string>} Error message
   */
  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}

/**
 * Page object for game library
 */
export class GameLibraryPage {
  constructor(page) {
    this.page = page;
    this.addGameButton = page.locator('[data-testid="add-game-button"]');
    this.gameGrid = page.locator('[data-testid="game-grid"]');
    this.gameCards = page.locator('[data-testid="game-card"]');
    this.searchInput = page.locator('input[placeholder*="search"]');
  }

  /**
   * Navigate to library page
   */
  async goto() {
    await this.page.goto("/library");
  }

  /**
   * Add a new game
   */
  async addGame() {
    await this.addGameButton.click();
  }

  /**
   * Search for games
   * @param {string} searchTerm - Search term
   */
  async searchGames(searchTerm) {
    await this.searchInput.fill(searchTerm);
  }

  /**
   * Get game cards count
   * @returns {Promise<number>} Number of game cards
   */
  async getGameCount() {
    return await this.gameCards.count();
  }

  /**
   * Wait for games to load
   */
  async waitForGames() {
    await this.gameGrid.waitFor({ state: "visible" });
  }
}

/**
 * Page object for settings
 */
export class SettingsPage {
  constructor(page) {
    this.page = page;
    this.settingsTabs = page.locator('[data-testid="settings-tab"]');
    this.saveButton = page.locator('[data-testid="save-settings"]');
    this.notification = page.locator('[data-testid="notification"]');
  }

  /**
   * Navigate to settings page
   */
  async goto() {
    await this.page.goto("/settings");
  }

  /**
   * Select settings tab
   * @param {string} tabName - Tab name
   */
  async selectTab(tabName) {
    await this.settingsTabs.filter({ hasText: tabName }).click();
  }

  /**
   * Save settings
   */
  async saveSettings() {
    await this.saveButton.click();
  }

  /**
   * Wait for notification
   */
  async waitForNotification() {
    await this.notification.waitFor({ state: "visible" });
  }

  /**
   * Get notification text
   * @returns {Promise<string>} Notification message
   */
  async getNotificationText() {
    return await this.notification.textContent();
  }
}

/**
 * Common test utilities
 */
export class TestUtils {
  constructor(page) {
    this.page = page;
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Take screenshot on failure
   * @param {string} testName - Test name for screenshot
   */
  async takeScreenshot(testName) {
    await this.page.screenshot({
      path: `test-results/${testName}-failure.png`,
      fullPage: true,
    });
  }

  /**
   * Check if element is visible
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>} Element visibility
   */
  async isElementVisible(selector) {
    return await this.page.locator(selector).isVisible();
  }

  /**
   * Wait for element to be visible
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForElement(selector, timeout = 5000) {
    await this.page.locator(selector).waitFor({ state: "visible", timeout });
  }

  /**
   * Fill form with data
   * @param {Object} formData - Form data
   */
  async fillForm(formData) {
    for (const [key, value] of Object.entries(formData)) {
      const input = this.page.locator(
        `[name="${key}"], [data-testid="${key}"]`,
      );
      if (await input.isVisible()) {
        await input.fill(value);
      }
    }
  }

  /**
   * Mock API response
   * @param {string} url - API URL to mock
   * @param {Object} response - Mock response data
   */
  async mockApiResponse(url, response) {
    await this.page.route(url, (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Check console for errors
   * @returns {Promise<string[]>} Array of error messages
   */
  async checkConsoleErrors() {
    const errors = [];
    this.page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    return errors;
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceUtils {
  constructor(page) {
    this.page = page;
  }

  /**
   * Measure page load time
   * @returns {Promise<number>} Load time in milliseconds
   */
  async measurePageLoadTime() {
    const startTime = Date.now();
    await this.page.waitForLoadState("networkidle");
    return Date.now() - startTime;
  }

  /**
   * Get page metrics
   * @returns {Promise<Object>} Performance metrics
   */
  async getPerformanceMetrics() {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType("paint")[0]?.startTime || 0,
        firstContentfulPaint:
          performance.getEntriesByType("paint")[1]?.startTime || 0,
      };
    });
    return metrics;
  }
}

/**
 * Mobile testing utilities
 */
export class MobileUtils {
  constructor(page) {
    this.page = page;
  }

  /**
   * Set mobile viewport
   * @param {string} device - Device name
   */
  async setMobileViewport(device = "iPhone 12") {
    const devices = {
      "iPhone 12": {
        width: 390,
        height: 844,
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      },
      "Pixel 5": {
        width: 393,
        height: 851,
        userAgent: "Mozilla/5.0 (Linux; Android 11; Pixel 5)",
      },
    };

    const deviceConfig = devices[device];
    if (deviceConfig) {
      await this.page.setViewportSize(deviceConfig);
      await this.page.setUserAgent(deviceConfig.userAgent);
    }
  }

  /**
   * Swipe gesture
   * @param {Object} options - Swipe options
   * @param {number} options.startX - Start X coordinate
   * @param {number} options.startY - Start Y coordinate
   * @param {number} options.endX - End X coordinate
   * @param {number} options.endY - End Y coordinate
   */
  async swipe({ startX, startY, endX, endY }) {
    await this.page.touchscreen.tap(startX, startY);
    await this.page.touchscreen.move(endX, endY);
    await this.page.touchscreen.tap(endX, endY);
  }
}

/**
 * Accessibility testing utilities
 */
export class AccessibilityUtils {
  constructor(page) {
    this.page = page;
  }

  /**
   * Check for accessibility issues
   * @returns {Promise<Object>} Accessibility report
   */
  async checkAccessibility() {
    const violations = await this.page.locator('[aria-invalid="true"]').count();
    const missingLabels = await this.page
      .locator("input:not([aria-label]):not([aria-labelledby])")
      .count();

    return {
      violations,
      missingLabels,
      score:
        violations === 0 && missingLabels === 0
          ? 100
          : Math.max(0, 100 - violations * 10 - missingLabels * 5),
    };
  }

  /**
   * Test keyboard navigation
   * @returns {Promise<boolean>} Keyboard navigation works
   */
  async testKeyboardNavigation() {
    let focusableElements = 0;
    let currentFocusIndex = 0;

    await this.page.keyboard.press("Tab");

    // Count focusable elements
    const elements = await this.page
      .locator(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      .all();
    focusableElements = elements.length;

    // Test tab navigation through all elements
    for (let i = 0; i < focusableElements; i++) {
      await this.page.keyboard.press("Tab");
      const focusedElement = await this.page.locator(":focus").count();
      if (focusedElement === 0) {
        return false;
      }
    }

    return true;
  }
}
