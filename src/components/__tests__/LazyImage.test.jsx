/**
 * @fileoverview LazyImage component unit tests
 * @description Tests LazyImage component functionality and edge cases
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import LazyImage from "../LazyImage.jsx";

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

describe("LazyImage Component", () => {
  const defaultProps = {
    src: "https://example.com/image.jpg",
    alt: "Test image",
    className: "test-class",
    style: { width: "100px" },
    threshold: 200,
    placeholder: "#f0f0f0",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render placeholder initially", () => {
      // Arrange & Act
      render(<LazyImage {...defaultProps} />);

      // Assert
      const placeholder = screen.getByRole("img");
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toHaveStyle({ opacity: "0" });
    });

    it("should render with correct props", () => {
      // Arrange & Act
      render(<LazyImage {...defaultProps} />);

      // Assert
      const container = screen.getByRole("img").closest("div");
      expect(container).toHaveClass("lazy-image-container test-class");
      expect(container).toHaveStyle({ width: "100px" });
    });

    it("should have proper accessibility attributes", () => {
      // Arrange & Act
      render(<LazyImage {...defaultProps} />);

      // Assert
      const container = screen.getByRole("img").closest("div");
      expect(container).toHaveAttribute("role", "img");
      expect(container).toHaveAttribute("aria-label", "Test image");
    });

    it("should use default values when props not provided", () => {
      // Arrange & Act
      render(<LazyImage src="test.jpg" alt="test" />);

      // Assert
      const placeholder = screen.getByRole("img");
      expect(placeholder).toHaveStyle({ backgroundColor: "#f3f4f" });
    });
  });

  describe("Intersection Observer", () => {
    it("should observe element on mount", () => {
      // Arrange & Act
      render(<LazyImage {...defaultProps} />);

      // Assert
      expect(mockIntersectionObserver).toHaveBeenCalled();
      expect(
        mockIntersectionObserver.mock.results[0].value.observe,
      ).toHaveBeenCalled();
    });

    it("should disconnect observer on unmount", () => {
      // Arrange
      const { unmount } = render(<LazyImage {...defaultProps} />);

      // Act
      unmount();

      // Assert
      expect(
        mockIntersectionObserver.mock.results[0].value.disconnect,
      ).toHaveBeenCalled();
    });

    it("should load image when intersecting", async () => {
      // Arrange
      let callback;
      mockIntersectionObserver.mockImplementation((cb) => {
        callback = cb;
        return {
          observe: jest.fn(),
          unobserve: jest.fn(),
          disconnect: jest.fn(),
        };
      });

      render(<LazyImage {...defaultProps} />);

      // Act
      callback([{ isIntersecting: true }]);

      // Assert
      await waitFor(() => {
        const img = screen.getByRole("img");
        expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
      });
    });
  });

  describe("Image Loading", () => {
    it("should show image when loaded", async () => {
      // Arrange
      render(<LazyImage {...defaultProps} />);

      // Simulate intersection
      const img = screen.getByRole("img");
      fireEvent.load(img);

      // Assert
      await waitFor(() => {
        expect(img).toHaveStyle({ opacity: "1" });
      });
    });

    it("should handle load error", async () => {
      // Arrange
      render(<LazyImage {...defaultProps} />);

      // Act
      const img = screen.getByRole("img");
      fireEvent.error(img);

      // Assert
      await waitFor(() => {
        const errorElement = screen.getByText("Image failed to load");
        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveClass("text-red-500");
      });
    });

    it("should render error state with custom placeholder", async () => {
      // Arrange
      const propsWithError = { ...defaultProps, placeholder: "#ff0000" };
      render(<LazyImage {...propsWithError} />);

      // Act
      const img = screen.getByRole("img");
      fireEvent.error(img);

      // Assert
      await waitFor(() => {
        const errorContainer = screen.getByRole("img").closest("div");
        expect(errorContainer).toHaveStyle({ backgroundColor: "#ff0000" });
      });
    });
  });

  describe("Props Handling", () => {
    it("should handle empty alt text", () => {
      // Arrange & Act
      render(<LazyImage src="test.jpg" alt="" />);

      // Assert
      const container = screen.getByRole("img").closest("div");
      expect(container).toHaveAttribute("aria-label", "");
    });

    it("should handle custom threshold", () => {
      // Arrange
      let callback;
      mockIntersectionObserver.mockImplementation((cb) => {
        callback = cb;
        return {
          observe: jest.fn(),
          unobserve: jest.fn(),
          disconnect: jest.fn(),
        };
      });

      render(<LazyImage {...defaultProps} threshold={100} />);

      // Assert
      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          rootMargin: "100px",
          threshold: 0.1,
        }),
      );
    });

    it("should handle empty className", () => {
      // Arrange & Act
      render(<LazyImage src="test.jpg" alt="test" className="" />);

      // Assert
      const container = screen.getByRole("img").closest("div");
      expect(container).toHaveClass("lazy-image-container");
    });
  });

  describe("Error States", () => {
    it("should handle missing src prop gracefully", () => {
      // Arrange & Act
      expect(() => {
        render(<LazyImage alt="test" />);
      }).not.toThrow();
    });

    it("should handle null src prop", () => {
      // Arrange & Act
      render(<LazyImage src={null} alt="test" />);

      // Assert
      const img = screen.getByRole("img");
      expect(img).not.toHaveAttribute("src");
    });

    it("should handle undefined src prop", () => {
      // Arrange & Act
      render(<LazyImage src={undefined} alt="test" />);

      // Assert
      const img = screen.getByRole("img");
      expect(img).not.toHaveAttribute("src");
    });
  });

  describe("Performance", () => {
    it("should not create unnecessary re-renders", () => {
      // Arrange
      const { rerender } = render(<LazyImage {...defaultProps} />);

      // Act
      rerender(<LazyImage {...defaultProps} />);

      // Assert
      expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);
    });

    it("should cleanup properly on unmount", () => {
      // Arrange
      const { unmount } = render(<LazyImage {...defaultProps} />);
      const observer = mockIntersectionObserver.mock.results[0].value;

      // Act
      unmount();

      // Assert
      expect(observer.disconnect).toHaveBeenCalled();
    });
  });
});
