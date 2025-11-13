/**
 * @fileoverview Authentication E2E tests
 * @description Tests user login, logout, and authentication flows
 */

import { test, expect } from "@playwright/test";
import { AuthPage, TestUtils, TEST_DATA } from "./helpers/test-helpers.js";

test.describe("Authentication", () => {
  let authPage;
  let testUtils;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    testUtils = new TestUtils(page);
  });

  test.describe("Login Flow", () => {
    test("should display login form", async ({ page }) => {
      // Arrange & Act
      await authPage.goto();

      // Assert
      await expect(authPage.emailInput).toBeVisible();
      await expect(authPage.passwordInput).toBeVisible();
      await expect(authPage.loginButton).toBeVisible();
    });

    test("should show error with invalid credentials", async ({ page }) => {
      // Arrange
      await authPage.goto();
      await authPage.fillLoginForm(TEST_DATA.INVALID_USER);

      // Act
      await authPage.submitLogin();

      // Assert
      await expect(authPage.errorMessage).toBeVisible();
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage).toContain("Invalid credentials");
    });

    test("should login successfully with valid credentials", async ({
      page,
    }) => {
      // Arrange
      await authPage.goto();
      await authPage.fillLoginForm(TEST_DATA.VALID_USER);

      // Act
      await authPage.submitLogin();

      // Assert
      await testUtils.waitForPageLoad();
      await expect(page).toHaveURL("/dashboard");
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test("should redirect to dashboard after login", async ({ page }) => {
      // Arrange & Act
      await authPage.login(TEST_DATA.VALID_USER);

      // Assert
      await testUtils.waitForPageLoad();
      await expect(page).toHaveURL("/dashboard");
    });
  });

  test.describe("Form Validation", () => {
    test("should validate email format", async ({ page }) => {
      // Arrange
      await authPage.goto();
      await authPage.emailInput.fill("invalid-email");
      await authPage.passwordInput.fill("password");

      // Act
      await authPage.submitLogin();

      // Assert
      await expect(authPage.errorMessage).toBeVisible();
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage).toContain("Invalid email format");
    });

    test("should require password", async ({ page }) => {
      // Arrange
      await authPage.goto();
      await authPage.emailInput.fill("test@example.com");

      // Act
      await authPage.submitLogin();

      // Assert
      await expect(authPage.errorMessage).toBeVisible();
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage).toContain("Password is required");
    });

    test("should require email", async ({ page }) => {
      // Arrange
      await authPage.goto();
      await authPage.passwordInput.fill("password");

      // Act
      await authPage.submitLogin();

      // Assert
      await expect(authPage.errorMessage).toBeVisible();
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage).toContain("Email is required");
    });
  });

  test.describe("Accessibility", () => {
    test("should be keyboard navigable", async ({ page }) => {
      // Arrange & Act
      await authPage.goto();

      // Test tab navigation
      await page.keyboard.press("Tab");
      await expect(authPage.emailInput).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(authPage.passwordInput).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(authPage.loginButton).toBeFocused();
    });

    test("should have proper ARIA labels", async ({ page }) => {
      // Arrange & Act
      await authPage.goto();

      // Assert
      await expect(authPage.emailInput).toHaveAttribute(
        "aria-label",
        "Email address",
      );
      await expect(authPage.passwordInput).toHaveAttribute(
        "aria-label",
        "Password",
      );
      await expect(authPage.loginButton).toHaveAttribute(
        "aria-label",
        "Sign in",
      );
    });
  });

  test.describe("Responsive Design", () => {
    test("should work on mobile devices", async ({ page }) => {
      // Arrange
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

      // Act
      await authPage.goto();

      // Assert
      await expect(authPage.emailInput).toBeVisible();
      await expect(authPage.passwordInput).toBeVisible();
      await expect(authPage.loginButton).toBeVisible();
    });

    test("should work on tablet devices", async ({ page }) => {
      // Arrange
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad

      // Act
      await authPage.goto();

      // Assert
      await expect(authPage.emailInput).toBeVisible();
      await expect(authPage.passwordInput).toBeVisible();
      await expect(authPage.loginButton).toBeVisible();
    });
  });

  test.describe("Performance", () => {
    test("should load quickly", async ({ page }) => {
      // Arrange
      const startTime = Date.now();

      // Act
      await authPage.goto();
      await testUtils.waitForPageLoad();

      // Assert
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
    });

    test("should not have console errors", async ({ page }) => {
      // Arrange
      const consoleErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      // Act
      await authPage.goto();

      // Assert
      expect(consoleErrors.length).toBe(0);
    });
  });

  test.describe("Security", () => {
    test("should mask password input", async ({ page }) => {
      // Arrange & Act
      await authPage.goto();

      // Assert
      await expect(authPage.passwordInput).toHaveAttribute("type", "password");
    });

    test("should have CSRF protection", async ({ page }) => {
      // Arrange & Act
      await authPage.goto();

      // Assert - Check for CSRF token
      const csrfToken = await page.locator('input[name="_csrf"]').count();
      expect(csrfToken).toBeGreaterThan(0);
    });
  });
});
