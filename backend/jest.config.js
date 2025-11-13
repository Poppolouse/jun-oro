/**
 * Jest Configuration for Backend Testing
 * Node.js environment ve API testing için ayarlar
 */

export default {
  // Test environment
  testEnvironment: "node",

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  // Module file extensions
  moduleFileExtensions: ["js", "json"],

  // Test file patterns
  testMatch: [
    "<rootDir>/tests/**/*.test.js",
    "<rootDir>/src/**/__tests__/**/*.test.js",
  ],

  // Ignore patterns
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/dist/"],

  // Coverage configuration
  collectCoverage: false,
  collectCoverageFrom: ["src/**/*.js", "!src/**/*.test.js", "!src/index.js"],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Coverage reporters
  coverageReporters: ["text", "lcov", "html"],

  // Coverage directory
  coverageDirectory: "coverage",

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Test timeout
  testTimeout: 10000,

  // Transform ignore patterns
  transformIgnorePatterns: ["node_modules/(?!(.*\\.mjs$))"],

  // Globals
  globals: {
    "process.env": {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://test:test@localhost:5432/jun_oro_test",
    },
  },

  // Test runner options
  runner: "jest-runner",

  // Module name mapping for absolute imports
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@middleware/(.*)$": "<rootDir>/src/middleware/$1",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1"
  },
};
