/**
 * @fileoverview Test setup configuration
 * @description Global test setup and environment configuration
 */

import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { configure } from "@testing-library/dom";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server.js";

// Configure testing library
configure({ testIdAttribute: "data-testid" });

// Global test setup
beforeAll(() => {
  // Start mock server
  server.listen({
    onUnhandledRequest: "warn",
  });

  // Set up global test environment
  global.console = {
    ...console,
    // Suppress console.log in tests unless explicitly needed
    log: process.env.NODE_ENV === "test" ? jest.fn() : console.log,
    // Keep error and warn for debugging
    error: console.error,
    warn: console.warn,
  };

  // Set up test environment variables
  process.env.NODE_ENV = "test";
  process.env.VITE_API_URL = "http://localhost:3001";
  process.env.JWT_SECRET = "test-jwt-secret";
  process.env.DATABASE_URL = "file:./test.db";
});

beforeEach(() => {
  // Reset mock server handlers
  server.resetHandlers();

  // Clear localStorage
  localStorage.clear();

  // Clear sessionStorage
  sessionStorage.clear();

  // Reset fetch mock
  global.fetch = require("jest-fetch-mock");
});

afterEach(() => {
  // Cleanup React testing library
  cleanup();

  // Reset all mocks
  jest.clearAllMocks();

  // Clear DOM
  document.body.innerHTML = "";

  // Reset history
  window.history.pushState({}, "", "/");
});

afterAll(() => {
  // Close mock server
  server.close();

  // Restore console
  global.console = console;
});

// Global test utilities
const testUtils = {
  /**
   * Wait for a specified time
   * @param {number} ms - Milliseconds to wait
   */
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Create a mock event
   * @param {string} type - Event type
   * @param {object} data - Event data
   */
  createEvent: (type, data = {}) => {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.assign(event, data);
    return event;
  },

  /**
   * Create a mock user
   * @param {object} overrides - User data overrides
   */
  createMockUser: (overrides = {}) => ({
    id: "test-user-id",
    username: "testuser",
    email: "test@example.com",
    name: "Test User",
    role: "user",
    status: "active",
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    ...overrides,
  }),

  /**
   * Create a mock game
   * @param {object} overrides - Game data overrides
   */
  createMockGame: (overrides = {}) => ({
    id: "test-game-id",
    name: "Test Game",
    summary: "A test game for testing",
    genres: [{ name: "Action" }],
    platforms: [{ name: "PC" }],
    rating: 75,
    category: 0,
    cover: null,
    firstReleaseDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
    accessCount: 0,
    ...overrides,
  }),

  /**
   * Create a mock library entry
   * @param {object} overrides - Library entry overrides
   */
  createMockLibraryEntry: (overrides = {}) => ({
    id: "test-library-id",
    userId: "test-user-id",
    gameId: "test-game-id",
    status: "playing",
    rating: null,
    playtime: 0,
    addedAt: new Date().toISOString(),
    lastPlayed: null,
    completedAt: null,
    ...overrides,
  }),

  /**
   * Mock intersection observer
   */
  mockIntersectionObserver: () => {
    const mockObserver = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    };

    global.IntersectionObserver = jest
      .fn()
      .mockImplementation(() => mockObserver);

    return mockObserver;
  },

  /**
   * Mock resize observer
   */
  mockResizeObserver: () => {
    const mockObserver = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    };

    global.ResizeObserver = jest.fn().mockImplementation(() => mockObserver);

    return mockObserver;
  },

  /**
   * Mock local storage
   */
  mockLocalStorage: () => {
    const store = {};

    return {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn((key) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach((key) => delete store[key]);
      }),
      key: jest.fn((index) => Object.keys(store)[index] || null),
      get length() {
        return Object.keys(store).length;
      },
    };
  },

  /**
   * Mock session storage
   */
  mockSessionStorage: () => {
    const store = {};

    return {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn((key) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach((key) => delete store[key]);
      }),
      key: jest.fn((index) => Object.keys(store)[index] || null),
      get length() {
        return Object.keys(store).length;
      },
    };
  },

  /**
   * Mock fetch response
   * @param {object} response - Response data
   */
  mockFetchResponse: (response) => {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    });
  },

  /**
   * Mock fetch error
   * @param {string} error - Error message
   * @param {number} status - HTTP status code
   */
  mockFetchError: (error = "Network error", status = 500) => {
    return Promise.resolve({
      ok: false,
      status,
      json: () => Promise.resolve({ error }),
      text: () => Promise.resolve(JSON.stringify({ error })),
    });
  },
};

// Assign to global for backward compatibility
global.testUtils = testUtils;

// Extend Jest matchers
expect.extend({
  /**
   * Check if element has proper ARIA attributes
   */
  toBeAccessible(received) {
    const hasAriaLabel = received.hasAttribute("aria-label");
    const hasAriaDescribedBy = received.hasAttribute("aria-describedby");
    const hasRole = received.hasAttribute("role");

    const pass = hasAriaLabel || hasAriaDescribedBy || hasRole;

    if (pass) {
      return {
        message: () => `expected element not to be accessible`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected element to be accessible (missing aria-label, aria-describedby, or role)`,
        pass: false,
      };
    }
  },

  /**
   * Check if element has proper data-testid
   */
  toHaveTestId(received, expectedTestId) {
    const actualTestId = received.getAttribute("data-testid");
    const pass = actualTestId === expectedTestId;

    if (pass) {
      return {
        message: () => `expected element not to have test id ${expectedTestId}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected element to have test id ${expectedTestId}, but got ${actualTestId}`,
        pass: false,
      };
    }
  },

  /**
   * Check if element is within viewport
   */
  toBeInViewport(received) {
    const rect = received.getBoundingClientRect();
    const isInViewport =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth;

    if (isInViewport) {
      return {
        message: () => `expected element not to be in viewport`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected element to be in viewport, but it's not`,
        pass: false,
      };
    }
  },
});

// Export test utilities for use in test files
export { testUtils };
