/**
 * Backend Jest Test Setup
 * Database ve API testing için ortam yapılandırması
 */

const { PrismaClient } = require("@prisma/client");

// Mock Prisma Client for testing
const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  game: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  libraryEntry: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  gameSession: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
  $transaction: jest.fn(),
};

// Global test database setup
global.testPrisma = mockPrisma;

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/jun_oro_test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.CLOUDFLARE_R2_ACCESS_KEY_ID = "test-access-key";
process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY = "test-secret-key";

// Mock console methods for cleaner test output
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console.log in tests unless explicitly needed
  console.log = jest.fn();

  // Keep error and warn for debugging
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});

afterAll(() => {
  // Restore original console
  Object.assign(console, originalConsole);
});

// Test utilities
global.createTestUser = (overrides = {}) => ({
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  username: "testuser",
  role: "user",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastActive: new Date(),
  ...overrides,
});

global.createTestGame = (overrides = {}) => ({
  id: "test-game-id",
  name: "Test Game",
  cover: "https://example.com/cover.jpg",
  rating: 8.5,
  developer: "Test Developer",
  publisher: "Test Publisher",
  genres: ["Action", "Adventure"],
  platforms: ["PC"],
  summary: "Test game summary",
  firstReleaseDate: new Date("2023-01-01"),
  cachedAt: new Date(),
  lastAccessed: new Date(),
  accessCount: 1,
  ...overrides,
});

global.createTestLibraryEntry = (overrides = {}) => ({
  id: "test-library-id",
  userId: "test-user-id",
  gameId: "test-game-id",
  category: "playing",
  playtime: 120,
  rating: 9.0,
  notes: "Test notes",
  progress: 50,
  priority: 3,
  isPublic: false,
  addedAt: new Date(),
  updatedAt: new Date(),
  lastPlayed: new Date(),
  ...overrides,
});

// Mock JWT functions
global.generateTestJWT = (payload = {}) => {
  const header = { alg: "HS256", typ: "JWT" };
  const defaultPayload = {
    userId: "test-user-id",
    email: "test@example.com",
    role: "user",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    ...payload,
  };

  return {
    header,
    payload: defaultPayload,
    signature: "test-signature",
  };
};

// Mock request/response objects
global.createMockRequest = (overrides = {}) => ({
  method: "GET",
  url: "/api/test",
  headers: {},
  body: {},
  params: {},
  query: {},
  user: null,
  ...overrides,
});

global.createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

// Database cleanup utility
global.cleanupTestData = async () => {
  if (global.testPrisma.$disconnect) {
    await global.testPrisma.$disconnect();
  }
};
