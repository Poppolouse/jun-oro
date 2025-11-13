/**
 * @fileoverview useTutorial hook unit tests
 * @description Tests tutorial management functionality
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useTutorial, useTutorialAdmin } from "../useTutorial.js";

// Mock dependencies
vi.mock("../utils/pageVisitTracker", () => ({
  hasVisitedPage: vi.fn(),
  markPageAsVisited: vi.fn(),
  shouldShowTutorial: vi.fn(),
  markTutorialAsCompleted: vi.fn(),
  markTutorialAsSkipped: vi.fn(),
  loadTutorialSettings: vi.fn(),
}));

vi.mock("../utils/tutorialTypes", () => ({
  tutorialManager: {
    on: vi.fn(),
    startTutorial: vi.fn(),
    getCurrentTutorial: vi.fn(),
    getProgress: vi.fn(),
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    showStep: vi.fn(),
    skipTutorial: vi.fn(),
    loadTutorial: vi.fn(),
  },
}));

describe("useTutorial Hook", () => {
  const defaultProps = {
    tutorialId: "test-tutorial",
    userId: "test-user",
    pageName: "test-page",
    autoStart: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Initial State", () => {
    it("should initialize with default state", () => {
      // Arrange & Act
      const { result } = renderHook(() => useTutorial());

      // Assert
      expect(result.current.isActive).toBe(false);
      expect(result.current.currentTutorial).toBe(null);
      expect(result.current.currentStep).toBe(null);
      expect(result.current.progress).toBe(null);
      expect(result.current.hasSeenTutorial).toBe(false);
    });

    it("should initialize with provided options", () => {
      // Arrange & Act
      const { result } = renderHook(() =>
        useTutorial("test-tutorial", {
          userId: "test-user",
          pageName: "test-page",
        }),
      );

      // Assert
      expect(result.current.canShowTutorial).toBe(true);
      expect(result.current.isFirstVisit).toBe(true);
    });

    it("should handle missing tutorialId", () => {
      // Arrange & Act
      const { result } = renderHook(() => useTutorial());

      // Assert
      expect(result.current.canShowTutorial).toBe(false);
      expect(result.current.shouldAutoShow).toBe(false);
    });
  });

  describe("Tutorial Management", () => {
    it("should start tutorial when startTutorial called", async () => {
      // Arrange
      const { result } = renderHook(() => useTutorial(defaultProps.tutorialId));
      const { tutorialManager } = await import("../utils/tutorialTypes");

      // Act
      await act(async () => {
        await result.current.startTutorial();
      });

      // Assert
      expect(tutorialManager.startTutorial).toHaveBeenCalledWith(
        "test-tutorial",
        {},
      );
    });

    it("should stop tutorial when stopTutorial called", () => {
      // Arrange
      const { result } = renderHook(() => useTutorial(defaultProps.tutorialId));
      const { tutorialManager } = require("../utils/tutorialTypes");

      // Act
      act(() => {
        result.current.stopTutorial();
      });

      // Assert
      expect(tutorialManager.skipTutorial).toHaveBeenCalled();
    });

    it("should navigate to next step", () => {
      // Arrange
      const { result } = renderHook(() => useTutorial(defaultProps.tutorialId));
      const { tutorialManager } = require("../utils/tutorialTypes");

      // Act
      act(() => {
        result.current.nextStep();
      });

      // Assert
      expect(tutorialManager.nextStep).toHaveBeenCalled();
    });

    it("should navigate to previous step", () => {
      // Arrange
      const { result } = renderHook(() => useTutorial(defaultProps.tutorialId));
      const { tutorialManager } = require("../utils/tutorialTypes");

      // Act
      act(() => {
        result.current.prevStep();
      });

      // Assert
      expect(tutorialManager.prevStep).toHaveBeenCalled();
    });

    it("should navigate to specific step", () => {
      // Arrange
      const { result } = renderHook(() => useTutorial(defaultProps.tutorialId));
      const { tutorialManager } = require("../utils/tutorialTypes");

      // Act
      act(() => {
        result.current.goToStep(2);
      });

      // Assert
      expect(tutorialManager.showStep).toHaveBeenCalledWith(2);
    });
  });

  describe("Tutorial State Updates", () => {
    it("should update state when tutorial starts", async () => {
      // Arrange
      const { result } = renderHook(() => useTutorial(defaultProps.tutorialId));
      const { tutorialManager } = await import("../utils/tutorialTypes");

      // Mock tutorial manager callbacks
      let onStepShowCallback;
      tutorialManager.on.mockImplementation((callbacks) => {
        onStepShowCallback = callbacks.onStepShow;
      });

      // Act
      await act(async () => {
        await result.current.startTutorial();
        onStepShowCallback({ id: "step1" }, 0);
      });

      // Assert
      expect(result.current.isActive).toBe(true);
      expect(result.current.currentStep).toEqual({ id: "step1" });
    });

    it("should update state when tutorial finishes", async () => {
      // Arrange
      const { result } = renderHook(() => useTutorial(defaultProps));
      const { tutorialManager } = await import("../utils/tutorialTypes");
      const { markTutorialAsCompleted } = await import(
        "../utils/pageVisitTracker"
      );

      // Mock tutorial manager callbacks
      let onFinishCallback;
      tutorialManager.on.mockImplementation((callbacks) => {
        onFinishCallback = callbacks.onFinish;
      });

      // Act
      await act(async () => {
        await result.current.startTutorial();
        onFinishCallback();
      });

      // Assert
      expect(result.current.isActive).toBe(false);
      expect(result.current.currentStep).toBe(null);
      expect(markTutorialAsCompleted).toHaveBeenCalledWith(
        "test-user",
        "test-tutorial",
      );
    });

    it("should update state when tutorial is skipped", async () => {
      // Arrange
      const { result } = renderHook(() => useTutorial(defaultProps));
      const { tutorialManager } = await import("../utils/tutorialTypes");
      const { markTutorialAsSkipped } = await import(
        "../utils/pageVisitTracker"
      );

      // Mock tutorial manager callbacks
      let onSkipCallback;
      tutorialManager.on.mockImplementation((callbacks) => {
        onSkipCallback = callbacks.onSkip;
      });

      // Act
      await act(async () => {
        await result.current.startTutorial();
        onSkipCallback();
      });

      // Assert
      expect(result.current.isActive).toBe(false);
      expect(result.current.currentStep).toBe(null);
      expect(markTutorialAsSkipped).toHaveBeenCalledWith(
        "test-user",
        "test-tutorial",
      );
    });
  });

  describe("Auto Start Logic", () => {
    it("should auto-start tutorial when conditions are met", async () => {
      // Arrange
      const { shouldShowTutorial, markPageAsVisited } = await import(
        "../utils/pageVisitTracker"
      );
      shouldShowTutorial.mockReturnValue(true);
      markPageAsVisited.mockReturnValue(true);

      const options = { autoStart: true, ...defaultProps };

      // Act
      renderHook(() => useTutorial(defaultProps.tutorialId, options));

      // Assert
      await waitFor(() => {
        expect(markPageAsVisited).toHaveBeenCalledWith(
          "test-user",
          "test-page",
        );
      });
    });

    it("should not auto-start when tutorial already seen", async () => {
      // Arrange
      const { hasVisitedPage } = await import("../utils/pageVisitTracker");
      hasVisitedPage.mockReturnValue(true);

      const options = { autoStart: true, ...defaultProps };

      // Act
      renderHook(() => useTutorial(defaultProps.tutorialId, options));

      // Assert
      const { shouldShowTutorial } = await import("../utils/pageVisitTracker");
      expect(shouldShowTutorial).not.toHaveBeenCalled();
    });
  });

  describe("Reset Tutorial", () => {
    it("should reset tutorial state", () => {
      // Arrange
      localStorage.setItem(
        "pageVisits_test-user",
        JSON.stringify({ "test-page": true }),
      );
      localStorage.setItem(
        "userTutorialSettings_test-user",
        JSON.stringify({
          completedTutorials: ["test-tutorial"],
          skippedTutorials: [],
        }),
      );

      const { result } = renderHook(() => useTutorial(defaultProps));

      // Act
      act(() => {
        result.current.resetTutorial();
      });

      // Assert
      const visits = JSON.parse(localStorage.getItem("pageVisits_test-user"));
      expect(visits["test-page"]).toBeUndefined();

      const settings = JSON.parse(
        localStorage.getItem("userTutorialSettings_test-user"),
      );
      expect(settings.completedTutorials).not.toContain("test-tutorial");
    });

    it("should handle reset without pageName", () => {
      // Arrange
      const { result } = renderHook(() => useTutorial(defaultProps.tutorialId));

      // Act & Assert - Should not throw error
      expect(() => {
        act(() => {
          result.current.resetTutorial();
        });
      }).not.toThrow();
    });
  });

  describe("Get Tutorial Data", () => {
    it("should load tutorial data", async () => {
      // Arrange
      const { result } = renderHook(() => useTutorial(defaultProps.tutorialId));
      const { tutorialManager } = await import("../utils/tutorialTypes");
      const mockTutorialData = { id: "test-tutorial", steps: [] };
      tutorialManager.loadTutorial.mockResolvedValue(mockTutorialData);

      // Act
      let tutorialData;
      await act(async () => {
        tutorialData = await result.current.getTutorialData();
      });

      // Assert
      expect(tutorialManager.loadTutorial).toHaveBeenCalledWith(
        "test-tutorial",
      );
      expect(tutorialData).toEqual(mockTutorialData);
    });

    it("should handle load error gracefully", async () => {
      // Arrange
      const { result } = renderHook(() => useTutorial(defaultProps.tutorialId));
      const { tutorialManager } = await import("../utils/tutorialTypes");
      tutorialManager.loadTutorial.mockRejectedValue(new Error("Load failed"));

      // Act
      let tutorialData;
      await act(async () => {
        tutorialData = await result.current.getTutorialData();
      });

      // Assert
      expect(tutorialData).toBeNull();
    });
  });
});

describe("useTutorialAdmin Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Admin State", () => {
    it("should set admin state when user is admin", () => {
      // Arrange
      localStorage.setItem(
        "arkade_user",
        JSON.stringify({ role: "admin", name: "admin" }),
      );

      // Act
      const { result } = renderHook(() => useTutorialAdmin());

      // Assert
      expect(result.current.isAdmin).toBe(true);
    });

    it("should set non-admin state when user is not admin", () => {
      // Arrange
      localStorage.setItem(
        "arkade_user",
        JSON.stringify({ role: "user", name: "testuser" }),
      );

      // Act
      const { result } = renderHook(() => useTutorialAdmin());

      // Assert
      expect(result.current.isAdmin).toBe(false);
    });

    it("should handle invalid user data", () => {
      // Arrange
      localStorage.setItem("arkade_user", "invalid-json");

      // Act
      const { result } = renderHook(() => useTutorialAdmin());

      // Assert
      expect(result.current.isAdmin).toBe(false);
    });

    it("should handle missing user data", () => {
      // Arrange & Act
      const { result } = renderHook(() => useTutorialAdmin());

      // Assert
      expect(result.current.isAdmin).toBe(false);
    });
  });

  describe("Tutorial Management", () => {
    it("should save tutorial when admin", async () => {
      // Arrange
      localStorage.setItem(
        "arkade_user",
        JSON.stringify({ role: "admin", name: "admin" }),
      );

      const { result } = renderHook(() => useTutorialAdmin());
      const tutorialData = { id: "new-tutorial", name: "New Tutorial" };

      // Act
      await act(async () => {
        await result.current.saveTutorial("new-tutorial", tutorialData);
      });

      // Assert
      const savedTutorials = JSON.parse(
        localStorage.getItem("customTutorials"),
      );
      expect(savedTutorials["new-tutorial"]).toEqual(tutorialData);
    });

    it("should throw error when non-admin tries to save", async () => {
      // Arrange
      localStorage.setItem(
        "arkade_user",
        JSON.stringify({ role: "user", name: "testuser" }),
      );

      const { result } = renderHook(() => useTutorialAdmin());
      const tutorialData = { id: "new-tutorial", name: "New Tutorial" };

      // Act & Assert
      await expect(
        act(async () => {
          await result.current.saveTutorial("new-tutorial", tutorialData);
        }),
      ).rejects.toThrow("Admin erişimi gerekli");
    });

    it("should load tutorial", async () => {
      // Arrange
      localStorage.setItem(
        "customTutorials",
        JSON.stringify({ "test-tutorial": { name: "Test Tutorial" } }),
      );

      const { result } = renderHook(() => useTutorialAdmin());

      // Act
      let tutorialData;
      await act(async () => {
        tutorialData = await result.current.loadTutorial("test-tutorial");
      });

      // Assert
      expect(tutorialData).toEqual({ name: "Test Tutorial" });
    });

    it("should return null for non-existent tutorial", async () => {
      // Arrange
      const { result } = renderHook(() => useTutorialAdmin());

      // Act
      let tutorialData;
      await act(async () => {
        tutorialData = await result.current.loadTutorial("non-existent");
      });

      // Assert
      expect(tutorialData).toBeNull();
    });

    it("should delete tutorial when admin", async () => {
      // Arrange
      localStorage.setItem(
        "arkade_user",
        JSON.stringify({ role: "admin", name: "admin" }),
      );
      localStorage.setItem(
        "customTutorials",
        JSON.stringify({ "test-tutorial": { name: "Test Tutorial" } }),
      );

      const { result } = renderHook(() => useTutorialAdmin());

      // Act
      await act(async () => {
        await result.current.deleteTutorial("test-tutorial");
      });

      // Assert
      const savedTutorials = JSON.parse(
        localStorage.getItem("customTutorials"),
      );
      expect(savedTutorials["test-tutorial"]).toBeUndefined();
    });

    it("should throw error when non-admin tries to delete", async () => {
      // Arrange
      localStorage.setItem(
        "arkade_user",
        JSON.stringify({ role: "user", name: "testuser" }),
      );

      const { result } = renderHook(() => useTutorialAdmin());

      // Act & Assert
      await expect(
        act(async () => {
          await result.current.deleteTutorial("test-tutorial");
        }),
      ).rejects.toThrow("Admin erişimi gerekli");
    });

    it("should list all tutorials", async () => {
      // Arrange
      localStorage.setItem(
        "customTutorials",
        JSON.stringify({
          tutorial1: { name: "Tutorial 1" },
          tutorial2: { name: "Tutorial 2" },
        }),
      );

      const { result } = renderHook(() => useTutorialAdmin());

      // Act
      let tutorials;
      await act(async () => {
        tutorials = await result.current.listTutorials();
      });

      // Assert
      expect(tutorials).toHaveLength(2);
      expect(tutorials[0]).toEqual({ id: "tutorial1", name: "Tutorial 1" });
      expect(tutorials[1]).toEqual({ id: "tutorial2", name: "Tutorial 2" });
    });
  });
});
