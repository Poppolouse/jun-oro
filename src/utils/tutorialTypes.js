// Tutorial System Types and Utilities

/**
 * Tutorial Types
 */
export const TUTORIAL_TYPES = {
  PAGE_GUIDE: "page_guide",
  SUB_GUIDE: "sub_guide",
};

/**
 * Page Categories for Tutorial System
 */
export const PAGE_CATEGORIES = {
  ARKADE_APPS: {
    id: "arkade_apps",
    name: "Arkade Uygulamaları",
    pages: [
      { id: "arkade-dashboard", name: "Arkade Dashboard", path: "/arkade" },
      {
        id: "arkade-library",
        name: "Arkade Kütüphane",
        path: "/arkade/library",
      },
      {
        id: "arkade-active-session",
        name: "Aktif Oturum",
        path: "/arkade/session",
      },
    ],
  },
  MAIN_APPS: {
    id: "main_apps",
    name: "Ana Uygulamalar",
    pages: [
      { id: "home", name: "Ana Sayfa", path: "/" },
      { id: "backlog", name: "Backlog", path: "/backlog" },
      { id: "wishlist", name: "Wishlist", path: "/wishlist" },
      { id: "gallery", name: "Galeri", path: "/gallery" },
      { id: "stats", name: "İstatistikler", path: "/stats" },
    ],
  },
  SYSTEM_PAGES: {
    id: "system_pages",
    name: "Sistem Sayfaları",
    pages: [
      { id: "login", name: "Giriş", path: "/login" },
      { id: "settings", name: "Ayarlar", path: "/settings" },
    ],
  },
};

/**
 * Tutorial Step Button Configuration
 * @typedef {Object} TutorialButton
 * @property {string} text - Button text
 * @property {'next'|'prev'|'skip'|'finish'|'custom'} action - Button action
 * @property {'primary'|'secondary'|'danger'} style - Button style
 * @property {string} [customAction] - Custom action name for custom buttons
 */

/**
 * Tutorial Step Content
 * @typedef {Object} TutorialContent
 * @property {string} text - Main content text
 * @property {string} [image] - Optional image URL
 * @property {TutorialButton[]} buttons - Action buttons
 */

/**
 * Tutorial Step Configuration
 * @typedef {Object} TutorialStep
 * @property {string} id - Unique step identifier
 * @property {string} title - Step title
 * @property {string} description - Step description
 * @property {string} [target] - CSS selector for target element
 * @property {'top'|'bottom'|'left'|'right'|'center'} position - Tooltip position
 * @property {'none'|'outline'|'spotlight'|'overlay'} highlightType - Highlight style
 * @property {TutorialContent} content - Step content
 */

/**
 * Tutorial Settings
 * @typedef {Object} TutorialSettings
 * @property {boolean} autoStart - Auto start on first visit
 * @property {boolean} showProgress - Show progress indicator
 * @property {boolean} allowSkip - Allow skipping tutorial
 * @property {Object} overlay - Overlay settings
 * @property {Object} highlight - Highlight settings
 * @property {Object} modal - Modal settings
 */

/**
 * Complete Tutorial Configuration
 * @typedef {Object} Tutorial
 * @property {string} id - Unique tutorial identifier
 * @property {string} title - Tutorial title
 * @property {string} description - Tutorial description
 * @property {string} version - Tutorial version
 * @property {TutorialStep[]} steps - Tutorial steps
 * @property {TutorialSettings} settings - Tutorial settings
 */

/**
 * Tutorial Manager Class
 */
export class TutorialManager {
  constructor() {
    this.currentTutorial = null;
    this.currentStep = 0;
    this.isActive = false;
    this.callbacks = {};
  }

  /**
   * Load tutorial from JSON file
   * @param {string} tutorialId - Tutorial identifier
   * @returns {Promise<Tutorial>}
   */
  async loadTutorial(tutorialId) {
    try {
      const response = await fetch(`/src/data/tutorials/${tutorialId}.json`);
      const tutorial = await response.json();
      this.currentTutorial = tutorial;
      return tutorial;
    } catch (error) {
      console.error("Failed to load tutorial:", error);
      throw error;
    }
  }

  /**
   * Start tutorial
   * @param {string} tutorialId - Tutorial identifier
   * @param {Object} options - Start options
   */
  async startTutorial(tutorialId, options = {}) {
    try {
      await this.loadTutorial(tutorialId);
      this.currentStep = 0;
      this.isActive = true;

      // Check if user has seen this tutorial before
      const hasSeenTutorial = this.hasSeenTutorial(tutorialId);

      if (!hasSeenTutorial || options.force) {
        this.showStep(0);
      }
    } catch (error) {
      console.error("Failed to start tutorial:", error);
    }
  }

  /**
   * Show specific step
   * @param {number} stepIndex - Step index
   */
  showStep(stepIndex) {
    if (
      !this.currentTutorial ||
      stepIndex >= this.currentTutorial.steps.length
    ) {
      return;
    }

    this.currentStep = stepIndex;
    const step = this.currentTutorial.steps[stepIndex];

    // Trigger step show callback
    if (this.callbacks.onStepShow) {
      this.callbacks.onStepShow(step, stepIndex, this.currentTutorial);
    }
  }

  /**
   * Go to next step
   */
  nextStep() {
    if (this.currentStep < this.currentTutorial.steps.length - 1) {
      this.showStep(this.currentStep + 1);
    } else {
      this.finishTutorial();
    }
  }

  /**
   * Go to previous step
   */
  prevStep() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }

  /**
   * Skip tutorial
   */
  skipTutorial() {
    this.finishTutorial();
  }

  /**
   * Finish tutorial
   */
  finishTutorial() {
    if (this.currentTutorial) {
      this.markTutorialAsSeen(this.currentTutorial.id);
      this.isActive = false;

      // Trigger finish callback
      if (this.callbacks.onFinish) {
        this.callbacks.onFinish(this.currentTutorial);
      }
    }
  }

  /**
   * Check if user has seen tutorial
   * @param {string} tutorialId - Tutorial identifier
   * @returns {boolean}
   */
  hasSeenTutorial(tutorialId) {
    const seenTutorials = JSON.parse(
      localStorage.getItem("seenTutorials") || "[]",
    );
    return seenTutorials.includes(tutorialId);
  }

  /**
   * Mark tutorial as seen
   * @param {string} tutorialId - Tutorial identifier
   */
  markTutorialAsSeen(tutorialId) {
    const seenTutorials = JSON.parse(
      localStorage.getItem("seenTutorials") || "[]",
    );
    if (!seenTutorials.includes(tutorialId)) {
      seenTutorials.push(tutorialId);
      localStorage.setItem("seenTutorials", JSON.stringify(seenTutorials));
    }
  }

  /**
   * Register event callbacks
   * @param {Object} callbacks - Event callbacks
   */
  on(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Get current tutorial progress
   * @returns {Object}
   */
  getProgress() {
    if (!this.currentTutorial) return null;

    return {
      current: this.currentStep + 1,
      total: this.currentTutorial.steps.length,
      percentage: Math.round(
        ((this.currentStep + 1) / this.currentTutorial.steps.length) * 100,
      ),
    };
  }
}

// Create global tutorial manager instance
export const tutorialManager = new TutorialManager();

// Utility functions for tutorial management
export const TutorialUtils = {
  /**
   * Get element by selector with error handling
   * @param {string} selector - CSS selector
   * @returns {Element|null}
   */
  getTargetElement(selector) {
    if (!selector) return null;
    try {
      return document.querySelector(selector);
    } catch (error) {
      console.warn("Invalid selector:", selector);
      return null;
    }
  },

  /**
   * Calculate optimal tooltip position
   * @param {Element} target - Target element
   * @param {string} preferredPosition - Preferred position
   * @returns {Object}
   */
  calculateTooltipPosition(target, preferredPosition = "bottom") {
    if (!target) return { position: "center", x: 0, y: 0 };

    const rect = target.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Calculate positions
    const positions = {
      top: { x: rect.left + rect.width / 2, y: rect.top - 10 },
      bottom: { x: rect.left + rect.width / 2, y: rect.bottom + 10 },
      left: { x: rect.left - 10, y: rect.top + rect.height / 2 },
      right: { x: rect.right + 10, y: rect.top + rect.height / 2 },
      center: { x: viewport.width / 2, y: viewport.height / 2 },
    };

    // Check if preferred position fits in viewport
    const pos = positions[preferredPosition];
    if (
      pos.x >= 0 &&
      pos.x <= viewport.width &&
      pos.y >= 0 &&
      pos.y <= viewport.height
    ) {
      return { position: preferredPosition, ...pos };
    }

    // Find best alternative position
    for (const [position, coords] of Object.entries(positions)) {
      if (
        coords.x >= 0 &&
        coords.x <= viewport.width &&
        coords.y >= 0 &&
        coords.y <= viewport.height
      ) {
        return { position, ...coords };
      }
    }

    // Fallback to center
    return { position: "center", ...positions.center };
  },

  /**
   * Scroll element into view smoothly
   * @param {Element} element - Target element
   */
  scrollToElement(element) {
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  },
};
