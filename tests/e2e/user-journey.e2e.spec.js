/**
 * @fileoverview User journey E2E tests
 * @description Tests complete user workflows from login to game management
 */

import { test, expect } from "@playwright/test";
import { LoginPage } from "../e2e/pages/LoginPage.js";
import { HomePage } from "../e2e/pages/HomePage.js";
import { LibraryPage } from "../e2e/pages/LibraryPage.js";
import { GamePage } from "../e2e/pages/GamePage.js";
import { SettingsPage } from "../e2e/pages/SettingsPage.js";
import { setupTestUser, cleanupTestUser } from "../e2e/helpers/test-helpers.js";

test.describe("User Journey Tests", () => {
  let testUser;
  let loginPage;
  let homePage;
  let libraryPage;
  let gamePage;
  let settingsPage;

  test.beforeAll(async () => {
    // Setup test user
    testUser = await setupTestUser();

    // Initialize page objects
    loginPage = new LoginPage();
    homePage = new HomePage();
    libraryPage = new LibraryPage();
    gamePage = new GamePage();
    settingsPage = new SettingsPage();
  });

  test.afterAll(async () => {
    // Cleanup test user
    await cleanupTestUser(testUser.id);
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to application
    await page.goto("/");
  });

  test("Complete user journey: Login → Browse → Add to Library → Play → Rate", async ({
    page,
  }) => {
    // Step 1: Login
    await test.step("User logs in", async () => {
      await loginPage.navigateToLogin(page);
      await loginPage.login(page, testUser.username, testUser.password);

      // Verify successful login
      await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
      await expect(
        page.locator(`text=Hoş geldin, ${testUser.username}`),
      ).toBeVisible();
    });

    // Step 2: Browse games
    await test.step("User browses games", async () => {
      await homePage.navigateToHome(page);

      // Wait for games to load
      await expect(page.locator('[data-testid="game-grid"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="game-card"]').first(),
      ).toBeVisible();

      // Search for specific game
      await homePage.searchGames(page, "Test Game");

      // Verify search results
      await expect(
        page.locator('[data-testid="search-results"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="game-card"]').first(),
      ).toBeVisible();
    });

    // Step 3: View game details
    await test.step("User views game details", async () => {
      await homePage.clickFirstGame(page);

      // Verify game page
      await expect(page.locator('[data-testid="game-title"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="game-description"]'),
      ).toBeVisible();
      await expect(page.locator('[data-testid="game-rating"]')).toBeVisible();
    });

    // Step 4: Add game to library
    await test.step("User adds game to library", async () => {
      await gamePage.addToLibrary(page);

      // Verify success message
      await expect(
        page.locator('[data-testid="success-message"]'),
      ).toBeVisible();
      await expect(page.locator("text=Oyun kütüphaneye eklendi")).toBeVisible();
    });

    // Step 5: Navigate to library
    await test.step("User navigates to library", async () => {
      await libraryPage.navigateToLibrary(page);

      // Verify library page
      await expect(page.locator('[data-testid="library-grid"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="library-entry"]').first(),
      ).toBeVisible();
    });

    // Step 6: Update game status to playing
    await test.step("User updates game status to playing", async () => {
      await libraryPage.clickFirstGame(page);
      await gamePage.updateStatus(page, "playing");

      // Verify status update
      await expect(page.locator('[data-testid="game-status"]')).toContainText(
        "Oynanıyor",
      );
    });

    // Step 7: Play game session
    await test.step("User starts playing game", async () => {
      await gamePage.startPlaying(page);

      // Verify session started
      await expect(page.locator('[data-testid="session-timer"]')).toBeVisible();
      await expect(page.locator('[data-testid="play-session"]')).toBeVisible();

      // Wait a bit for session to track
      await page.waitForTimeout(2000);
    });

    // Step 8: Stop playing session
    await test.step("User stops playing session", async () => {
      await gamePage.stopPlaying(page);

      // Verify session ended
      await expect(
        page.locator('[data-testid="session-summary"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="playtime-updated"]'),
      ).toBeVisible();
    });

    // Step 9: Rate game
    await test.step("User rates game", async () => {
      await gamePage.rateGame(page, 8);

      // Verify rating saved
      await expect(page.locator('[data-testid="rating-saved"]')).toBeVisible();
      await expect(page.locator('[data-testid="game-rating"]')).toContainText(
        "8",
      );
    });

    // Step 10: Mark as completed
    await test.step("User marks game as completed", async () => {
      await gamePage.updateStatus(page, "completed");

      // Verify status update
      await expect(page.locator('[data-testid="game-status"]')).toContainText(
        "Tamamlandı",
      );
      await expect(
        page.locator('[data-testid="completion-date"]'),
      ).toBeVisible();
    });
  });

  test("User profile management journey", async ({ page }) => {
    // Step 1: Login
    await test.step("User logs in", async () => {
      await loginPage.navigateToLogin(page);
      await loginPage.login(page, testUser.username, testUser.password);
      await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
    });

    // Step 2: Navigate to settings
    await test.step("User navigates to settings", async () => {
      await settingsPage.navigateToSettings(page);
      await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();
    });

    // Step 3: Update profile information
    await test.step("User updates profile", async () => {
      await settingsPage.updateProfile(page, {
        name: "Updated Name",
        email: "updated@example.com",
      });

      // Verify update success
      await expect(
        page.locator('[data-testid="profile-updated"]'),
      ).toBeVisible();
    });

    // Step 4: Update preferences
    await test.step("User updates preferences", async () => {
      await settingsPage.updatePreferences(page, {
        theme: "dark",
        language: "tr",
        notifications: true,
      });

      // Verify preferences saved
      await expect(
        page.locator('[data-testid="preferences-saved"]'),
      ).toBeVisible();
    });

    // Step 5: Change password
    await test.step("User changes password", async () => {
      await settingsPage.changePassword(
        page,
        testUser.password,
        "newpassword123",
      );

      // Verify password changed
      await expect(
        page.locator('[data-testid="password-changed"]'),
      ).toBeVisible();
    });

    // Step 6: Logout and login with new password
    await test.step("User logs out and logs back in", async () => {
      await settingsPage.logout(page);

      // Login with new password
      await loginPage.navigateToLogin(page);
      await loginPage.login(page, testUser.username, "newpassword123");

      // Verify successful login
      await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
    });
  });

  test("Game discovery and recommendation journey", async ({ page }) => {
    // Step 1: Login
    await test.step("User logs in", async () => {
      await loginPage.navigateToLogin(page);
      await loginPage.login(page, testUser.username, testUser.password);
    });

    // Step 2: Browse by genre
    await test.step("User browses games by genre", async () => {
      await homePage.navigateToHome(page);
      await homePage.selectGenre(page, "Action");

      // Verify genre filter applied
      await expect(page.locator('[data-testid="genre-filter"]')).toContainText(
        "Action",
      );
      await expect(
        page.locator('[data-testid="game-card"]').first(),
      ).toBeVisible();
    });

    // Step 3: Browse by platform
    await test.step("User browses games by platform", async () => {
      await homePage.selectPlatform(page, "PC");

      // Verify platform filter applied
      await expect(
        page.locator('[data-testid="platform-filter"]'),
      ).toContainText("PC");
    });

    // Step 4: Sort games
    await test.step("User sorts games by rating", async () => {
      await homePage.sortGames(page, "rating");

      // Verify sorting applied
      await expect(page.locator('[data-testid="sort-dropdown"]')).toContainText(
        "Rating",
      );
    });

    // Step 5: View recommendations
    await test.step("User views recommendations", async () => {
      await homePage.viewRecommendations(page);

      // Verify recommendations section
      await expect(
        page.locator('[data-testid="recommendations"]'),
      ).toBeVisible();
      await expect(page.locator('[data-testid="recommended-game"]'))
        .first()
        .toBeVisible();
    });

    // Step 6: Add multiple games to wishlist
    await test.step("User adds games to wishlist", async () => {
      await homePage.addToWishlist(page, 0); // First game
      await homePage.addToWishlist(page, 1); // Second game

      // Verify wishlist updates
      await expect(
        page.locator('[data-testid="wishlist-count"]'),
      ).toContainText("2");
    });

    // Step 7: View wishlist
    await test.step("User views wishlist", async () => {
      await homePage.viewWishlist(page);

      // Verify wishlist page
      await expect(page.locator('[data-testid="wishlist-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="wishlist-item"]')).toHaveCount(
        2,
      );
    });
  });

  test("Library management journey", async ({ page }) => {
    // Step 1: Login and navigate to library
    await test.step("User logs in and navigates to library", async () => {
      await loginPage.navigateToLogin(page);
      await loginPage.login(page, testUser.username, testUser.password);
      await libraryPage.navigateToLibrary(page);
    });

    // Step 2: Filter library by status
    await test.step("User filters library by status", async () => {
      await libraryPage.filterByStatus(page, "playing");

      // Verify filter applied
      await expect(page.locator('[data-testid="status-filter"]')).toContainText(
        "Oynanıyor",
      );
    });

    // Step 3: Sort library
    await test.step("User sorts library by last played", async () => {
      await libraryPage.sortLibrary(page, "lastPlayed");

      // Verify sorting applied
      await expect(page.locator('[data-testid="sort-dropdown"]')).toContainText(
        "Son Oynanan",
      );
    });

    // Step 4: Search library
    await test.step("User searches library", async () => {
      await libraryPage.searchLibrary(page, "Test");

      // Verify search results
      await expect(
        page.locator('[data-testid="search-results"]'),
      ).toBeVisible();
    });

    // Step 5: Batch update games
    await test.step("User batch updates games", async () => {
      await libraryPage.selectGames(page, [0, 1]); // Select first two games
      await libraryPage.batchUpdateStatus(page, "backlog");

      // Verify batch update
      await expect(page.locator('[data-testid="batch-updated"]')).toBeVisible();
    });

    // Step 6: Export library
    await test.step("User exports library", async () => {
      await libraryPage.exportLibrary(page);

      // Verify export initiated
      await expect(
        page.locator('[data-testid="export-started"]'),
      ).toBeVisible();
    });

    // Step 7: View library statistics
    await test.step("User views library statistics", async () => {
      await libraryPage.viewStatistics(page);

      // Verify statistics page
      await expect(page.locator('[data-testid="library-stats"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-games"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="total-playtime"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="completion-rate"]'),
      ).toBeVisible();
    });
  });

  test("Error handling and recovery journey", async ({ page }) => {
    // Step 1: Test network error handling
    await test.step("App handles network errors gracefully", async () => {
      // Simulate network offline
      await page.context().setOffline(true);

      await loginPage.navigateToLogin(page);
      await loginPage.login(page, testUser.username, testUser.password);

      // Verify error message
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
      await expect(page.locator("text=Bağlantı hatası")).toBeVisible();

      // Restore network
      await page.context().setOffline(false);
    });

    // Step 2: Test server error handling
    await test.step("App handles server errors gracefully", async () => {
      // Mock server error
      await page.route("**/api/games", (route) => {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Server error" }),
        });
      });

      await homePage.navigateToHome(page);

      // Verify error message
      await expect(page.locator('[data-testid="server-error"]')).toBeVisible();
      await expect(page.locator("text=Sunucu hatası")).toBeVisible();
    });

    // Step 3: Test session timeout
    await test.step("App handles session timeout", async () => {
      // Clear auth token to simulate timeout
      await page.evaluate(() => {
        localStorage.removeItem("authToken");
      });

      await libraryPage.navigateToLibrary(page);

      // Verify redirect to login
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
      await expect(page.locator("text=Oturum süresi doldu")).toBeVisible();
    });

    // Step 4: Test form validation
    await test.step("App validates form inputs", async () => {
      await loginPage.navigateToLogin(page);

      // Submit empty form
      await loginPage.clickLoginButton(page);

      // Verify validation errors
      await expect(
        page.locator('[data-testid="username-error"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="password-error"]'),
      ).toBeVisible();
      await expect(page.locator("text=Kullanıcı adı gerekli")).toBeVisible();
      await expect(page.locator("text=Şifre gerekli")).toBeVisible();
    });
  });

  test("Performance and accessibility journey", async ({ page }) => {
    // Step 1: Test page load performance
    await test.step("Pages load within acceptable time", async () => {
      const startTime = Date.now();

      await loginPage.navigateToLogin(page);
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
    });

    // Step 2: Test accessibility
    await test.step("App is accessible", async () => {
      await loginPage.navigateToLogin(page);

      // Check for proper ARIA labels
      await expect(
        page.locator('input[aria-label="Kullanıcı adı"]'),
      ).toBeVisible();
      await expect(page.locator('input[aria-label="Şifre"]')).toBeVisible();
      await expect(
        page.locator('button[aria-label="Giriş yap"]'),
      ).toBeVisible();

      // Check keyboard navigation
      await page.keyboard.press("Tab");
      await expect(page.locator("input:focus")).toBeVisible();
    });

    // Step 3: Test responsive design
    await test.step("App is responsive", async () => {
      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await homePage.navigateToHome(page);
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

      // Test desktop view
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
    });

    // Step 4: Test memory usage
    await test.step("App manages memory efficiently", async () => {
      const initialMemory = await page.evaluate(
        () => performance.memory?.usedJSHeapSize || 0,
      );

      // Navigate through multiple pages
      await homePage.navigateToHome(page);
      await libraryPage.navigateToLibrary(page);
      await settingsPage.navigateToSettings(page);

      const finalMemory = await page.evaluate(
        () => performance.memory?.usedJSHeapSize || 0,
      );
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });
  });
});
