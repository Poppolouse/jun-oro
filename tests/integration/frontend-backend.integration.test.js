/**
 * @fileoverview Frontend-Backend integration tests
 * @description Tests frontend components with real backend API
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../../src/contexts/AuthContext.jsx";
import { NavigationProvider } from "../../src/contexts/NavigationContext.jsx";
import request from "supertest";
import { prisma } from "../../backend/src/lib/prisma.js";

// Test app
const app = require("../../backend/src/index.js");

// Test components
import HomePage from "../../src/pages/HomePage.jsx";
import LoginPage from "../../src/pages/LoginPage.jsx";
import ArkadeLibrary from "../../src/pages/ArkadeLibrary.jsx";

// Mock API service
jest.mock("../../src/services/api.js", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Test utilities
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

function renderWithProviders(ui) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <NavigationProvider>{ui}</NavigationProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>,
  );
}

describe("Frontend-Backend Integration Tests", () => {
  let testUser;
  let testGame;
  let authToken;

  beforeAll(async () => {
    // Setup test data in backend
    testUser = await prisma.user.create({
      data: {
        username: "integrationuser",
        email: "integration@example.com",
        password: "$2a$10$testpassword",
        role: "user",
        status: "active",
      },
    });

    testGame = await prisma.game.create({
      data: {
        name: "Integration Test Game",
        summary: "A game for integration testing",
        genres: [{ name: "Action" }],
        platforms: [{ name: "PC" }],
        rating: 75,
        category: 0,
      },
    });

    // Get auth token
    const loginResponse = await request(app).post("/api/users/login").send({
      username: testUser.username,
      password: "testpassword",
    });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.libraryEntry.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    await prisma.game.delete({
      where: { id: testGame.id },
    });
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    // Cleanup
    localStorageMock.clear();
  });

  describe("Authentication Integration", () => {
    it("should handle successful login", async () => {
      // Arrange
      const { api } = require("../../src/services/api.js");
      api.post.mockResolvedValue({
        data: {
          success: true,
          data: {
            id: testUser.id,
            username: testUser.username,
            token: authToken,
          },
        },
      });

      // Act
      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/kullanıcı adı/i);
      const passwordInput = screen.getByLabelText(/şifre/i);
      const loginButton = screen.getByRole("button", { name: /giriş/i });

      fireEvent.change(usernameInput, { target: { value: testUser.username } });
      fireEvent.change(passwordInput, { target: { value: "testpassword" } });
      fireEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith("/users/login", {
          username: testUser.username,
          password: "testpassword",
        });
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "authToken",
          authToken,
        );
      });
    });

    it("should handle login error", async () => {
      // Arrange
      const { api } = require("../../src/services/api.js");
      api.post.mockRejectedValue(new Error("Invalid credentials"));

      // Act
      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/kullanıcı adı/i);
      const passwordInput = screen.getByLabelText(/şifre/i);
      const loginButton = screen.getByRole("button", { name: /giriş/i });

      fireEvent.change(usernameInput, { target: { value: "wronguser" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
      fireEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/geçersiz kullanıcı adı veya şifre/i),
        ).toBeInTheDocument();
      });
    });

    it("should handle logout", async () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue(authToken);
      const { api } = require("../../src/services/api.js");
      api.post.mockResolvedValue({ data: { success: true } });

      // Act
      renderWithProviders(<HomePage />);

      // Find and click logout button
      const logoutButton = screen.getByRole("button", { name: /çıkış/i });
      fireEvent.click(logoutButton);

      // Assert
      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith("authToken");
      });
    });
  });

  describe("Game Library Integration", () => {
    it("should fetch and display games", async () => {
      // Arrange
      const { api } = require("../../src/services/api.js");
      api.get.mockResolvedValue({
        data: {
          success: true,
          data: [
            {
              id: testGame.id,
              name: testGame.name,
              summary: testGame.summary,
              rating: testGame.rating,
              cover: null,
            },
          ],
        },
      });

      // Act
      renderWithProviders(<ArkadeLibrary />);

      // Assert
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith("/games");
      });

      await waitFor(() => {
        expect(screen.getByText(testGame.name)).toBeInTheDocument();
      });
    });

    it("should add game to library", async () => {
      // Arrange
      const { api } = require("../../src/services/api.js");
      api.post.mockResolvedValue({
        data: {
          success: true,
          data: {
            id: "library-entry-id",
            gameId: testGame.id,
            status: "playing",
          },
        },
      });

      // Act
      renderWithProviders(<ArkadeLibrary />);

      // Find add to library button
      const addButton = screen.getByRole("button", {
        name: /kütüphaneye ekle/i,
      });
      fireEvent.click(addButton);

      // Assert
      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(`/library/${testUser.id}/games`, {
          gameId: testGame.id,
          status: "playing",
        });
      });
    });

    it("should update game status", async () => {
      // Arrange
      const { api } = require("../../src/services/api.js");
      api.put.mockResolvedValue({
        data: {
          success: true,
          data: {
            id: "library-entry-id",
            status: "completed",
            rating: 85,
          },
        },
      });

      // Act
      renderWithProviders(<ArkadeLibrary />);

      // Find status update button
      const statusButton = screen.getByRole("button", {
        name: /durumu güncelle/i,
      });
      fireEvent.click(statusButton);

      // Select completed status
      const completedOption = screen.getByText(/tamamlandı/i);
      fireEvent.click(completedOption);

      // Assert
      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith(
          `/library/${testUser.id}/games/${testGame.id}`,
          {
            status: "completed",
            rating: expect.any(Number),
          },
        );
      });
    });

    it("should handle search functionality", async () => {
      // Arrange
      const { api } = require("../../src/services/api.js");
      api.get.mockResolvedValue({
        data: {
          success: true,
          data: [
            {
              id: testGame.id,
              name: testGame.name,
              summary: testGame.summary,
            },
          ],
        },
      });

      // Act
      renderWithProviders(<ArkadeLibrary />);

      // Find search input
      const searchInput = screen.getByPlaceholderText(/oyun ara/i);
      fireEvent.change(searchInput, { target: { value: "Integration" } });

      // Assert
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith("/games", {
          params: { search: "Integration" },
        });
      });
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle network errors gracefully", async () => {
      // Arrange
      const { api } = require("../../src/services/api.js");
      api.get.mockRejectedValue(new Error("Network error"));

      // Act
      renderWithProviders(<ArkadeLibrary />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/bağlantı hatası/i)).toBeInTheDocument();
      });
    });

    it("should handle server errors", async () => {
      // Arrange
      const { api } = require("../../src/services/api.js");
      api.get.mockResolvedValue({
        data: {
          success: false,
          error: "Server error occurred",
        },
      });

      // Act
      renderWithProviders(<ArkadeLibrary />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/sunucu hatası/i)).toBeInTheDocument();
      });
    });

    it("should handle unauthorized access", async () => {
      // Arrange
      const { api } = require("../../src/services/api.js");
      api.get.mockRejectedValue({
        response: {
          status: 401,
          data: { error: "Unauthorized" },
        },
      });

      // Act
      renderWithProviders(<ArkadeLibrary />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/yetkisiz erişim/i)).toBeInTheDocument();
      });
    });
  });

  describe("Real-time Updates Integration", () => {
    it("should update UI when data changes", async () => {
      // Arrange
      const { api } = require("../../src/services/api.js");
      api.get
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: [
              {
                id: testGame.id,
                name: testGame.name,
                status: "playing",
              },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: [
              {
                id: testGame.id,
                name: testGame.name,
                status: "completed",
              },
            ],
          },
        });

      // Act
      renderWithProviders(<ArkadeLibrary />);

      // Initial render
      await waitFor(() => {
        expect(screen.getByText(/oynanıyor/i)).toBeInTheDocument();
      });

      // Simulate data refresh
      const refreshButton = screen.getByRole("button", { name: /yenile/i });
      fireEvent.click(refreshButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/tamamlandı/i)).toBeInTheDocument();
      });
    });
  });

  describe("Performance Integration", () => {
    it("should handle large datasets efficiently", async () => {
      // Arrange
      const largeGameList = Array(100)
        .fill()
        .map((_, index) => ({
          id: `game-${index}`,
          name: `Game ${index}`,
          summary: `Summary for game ${index}`,
          rating: Math.floor(Math.random() * 100),
        }));

      const { api } = require("../../src/services/api.js");
      api.get.mockResolvedValue({
        data: {
          success: true,
          data: largeGameList,
        },
      });

      const startTime = performance.now();

      // Act
      renderWithProviders(<ArkadeLibrary />);

      // Assert
      await waitFor(() => {
        expect(screen.getAllByRole("article")).toHaveLength(100);
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(1000); // Should render in under 1 second
    });

    it("should implement lazy loading", async () => {
      // Arrange
      const { api } = require("../../src/services/api.js");
      api.get.mockResolvedValue({
        data: {
          success: true,
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 100,
            pages: 5,
          },
        },
      });

      // Act
      renderWithProviders(<ArkadeLibrary />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/daha fazla/i)).toBeInTheDocument();
      });

      // Test lazy loading
      const loadMoreButton = screen.getByRole("button", {
        name: /daha fazla/i,
      });
      fireEvent.click(loadMoreButton);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith("/games", {
          params: { page: 2 },
        });
      });
    });
  });

  describe("Form Integration", () => {
    it("should validate form inputs", async () => {
      // Act
      renderWithProviders(<LoginPage />);

      const loginButton = screen.getByRole("button", { name: /giriş/i });
      fireEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/kullanıcı adı gerekli/i)).toBeInTheDocument();
        expect(screen.getByText(/şifre gerekli/i)).toBeInTheDocument();
      });
    });

    it("should handle form submission", async () => {
      // Arrange
      const { api } = require("../../src/services/api.js");
      api.post.mockResolvedValue({
        data: {
          success: true,
          data: {
            id: testUser.id,
            username: testUser.username,
            token: authToken,
          },
        },
      });

      // Act
      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/kullanıcı adı/i);
      const passwordInput = screen.getByLabelText(/şifre/i);
      const loginButton = screen.getByRole("button", { name: /giriş/i });

      fireEvent.change(usernameInput, { target: { value: testUser.username } });
      fireEvent.change(passwordInput, { target: { value: "testpassword" } });
      fireEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith("/users/login", {
          username: testUser.username,
          password: "testpassword",
        });
      });
    });
  });

  describe("Cache Integration", () => {
    it("should cache API responses", async () => {
      // Arrange
      const { api } = require("../../src/services/api.js");
      api.get.mockResolvedValue({
        data: {
          success: true,
          data: [testGame],
        },
      });

      // Act
      renderWithProviders(<ArkadeLibrary />);

      // First call
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith("/games");
      });

      // Second call (should use cache)
      const refreshButton = screen.getByRole("button", { name: /yenile/i });
      fireEvent.click(refreshButton);

      // Assert
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledTimes(1); // Should not call API again
      });
    });

    it("should invalidate cache on update", async () => {
      // Arrange
      const { api } = require("../../src/services/api.js");
      api.get.mockResolvedValue({
        data: {
          success: true,
          data: [testGame],
        },
      });
      api.put.mockResolvedValue({
        data: {
          success: true,
          data: {
            ...testGame,
            status: "completed",
          },
        },
      });

      // Act
      renderWithProviders(<ArkadeLibrary />);

      // Initial load
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith("/games");
      });

      // Update game status
      const statusButton = screen.getByRole("button", {
        name: /durumu güncelle/i,
      });
      fireEvent.click(statusButton);

      const completedOption = screen.getByText(/tamamlandı/i);
      fireEvent.click(completedOption);

      // Assert
      await waitFor(() => {
        expect(api.put).toHaveBeenCalled();
      });

      // Should refetch data after update
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledTimes(2);
      });
    });
  });
});
