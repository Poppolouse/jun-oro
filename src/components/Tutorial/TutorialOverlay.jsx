import React, { useState, useEffect, useRef } from "react";
import { tutorialManager, TutorialUtils } from "../../utils/tutorialTypes";

const TutorialOverlay = ({ isVisible, onClose }) => {
  const [currentStep, setCurrentStep] = useState(null);
  const [tutorial, setTutorial] = useState(null);
  const [progress, setProgress] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({
    position: "center",
    x: 0,
    y: 0,
  });
  const [highlightStyle, setHighlightStyle] = useState({});
  const overlayRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    // Register tutorial manager callbacks
    tutorialManager.on({
      onStepShow: (step, stepIndex, tutorialData) => {
        setCurrentStep(step);
        setTutorial(tutorialData);
        setProgress(tutorialManager.getProgress());
        updateHighlight(step);
      },
      onFinish: () => {
        onClose();
      },
    });
  }, [onClose]);

  const updateHighlight = (step) => {
    if (!step.target) {
      setHighlightStyle({});
      setTooltipPosition({
        position: "center",
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      return;
    }

    const targetElement = TutorialUtils.getTargetElement(step.target);
    if (!targetElement) {
      console.warn("Target element not found:", step.target);
      return;
    }

    // Scroll to element
    TutorialUtils.scrollToElement(targetElement);

    // Calculate highlight style
    const rect = targetElement.getBoundingClientRect();
    const padding = tutorial?.settings?.highlight?.padding || 8;

    const highlight = {
      position: "fixed",
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      borderRadius: tutorial?.settings?.highlight?.borderRadius || 8,
      border: `${tutorial?.settings?.highlight?.borderWidth || 3}px solid ${tutorial?.settings?.highlight?.color || "#8b5cf6"}`,
      backgroundColor:
        step.highlightType === "spotlight"
          ? "rgba(139, 92, 246, 0.1)"
          : "transparent",
      pointerEvents: "none",
      zIndex: 9999,
      transition: "all 0.3s ease",
    };

    setHighlightStyle(highlight);

    // Calculate tooltip position
    const position = TutorialUtils.calculateTooltipPosition(
      targetElement,
      step.position,
    );
    setTooltipPosition(position);
  };

  const handleAction = (action, customAction) => {
    switch (action) {
      case "next":
        tutorialManager.nextStep();
        break;
      case "prev":
        tutorialManager.prevStep();
        break;
      case "skip":
        tutorialManager.skipTutorial();
        break;
      case "finish":
        tutorialManager.finishTutorial();
        break;
      case "custom":
        // Handle custom actions
        console.log("Custom action:", customAction);
        break;
      default:
        break;
    }
  };

  const getTooltipStyle = () => {
    const maxWidth = tutorial?.settings?.modal?.maxWidth || 400;
    const borderRadius = tutorial?.settings?.modal?.borderRadius || 12;
    const backgroundColor =
      tutorial?.settings?.modal?.backgroundColor || "rgba(17, 24, 39, 0.95)";

    let style = {
      position: "fixed",
      maxWidth: `${maxWidth}px`,
      borderRadius: `${borderRadius}px`,
      backgroundColor,
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(139, 92, 246, 0.3)",
      padding: "24px",
      zIndex: 10000,
      transform: "translate(-50%, -50%)",
      transition: "all 0.3s ease",
    };

    if (tooltipPosition.position === "center") {
      style.left = "50%";
      style.top = "50%";
    } else {
      style.left = `${tooltipPosition.x}px`;
      style.top = `${tooltipPosition.y}px`;

      // Adjust transform based on position
      switch (tooltipPosition.position) {
        case "top":
          style.transform = "translate(-50%, -100%)";
          break;
        case "bottom":
          style.transform = "translate(-50%, 0%)";
          break;
        case "left":
          style.transform = "translate(-100%, -50%)";
          break;
        case "right":
          style.transform = "translate(0%, -50%)";
          break;
        default:
          style.transform = "translate(-50%, -50%)";
      }
    }

    return style;
  };

  const getButtonStyle = (buttonStyle) => {
    const baseStyle =
      "px-4 py-2 rounded-lg font-medium transition-all duration-200 ";

    switch (buttonStyle) {
      case "primary":
        return (
          baseStyle +
          "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105"
        );
      case "secondary":
        return (
          baseStyle +
          "bg-white/10 text-white border border-white/20 hover:bg-white/20"
        );
      case "danger":
        return (
          baseStyle + "bg-red-600 text-white hover:bg-red-700 hover:scale-105"
        );
      default:
        return baseStyle + "bg-gray-600 text-white hover:bg-gray-700";
    }
  };

  if (!isVisible || !currentStep || !tutorial) {
    return null;
  }

  return (
    <div ref={overlayRef} className="tutorial-overlay">
      {/* Overlay Background */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{
          backgroundColor:
            tutorial.settings?.overlay?.color || "rgba(0, 0, 0, 0.7)",
          backdropFilter: tutorial.settings?.overlay?.blur
            ? "blur(2px)"
            : "none",
        }}
        onClick={() =>
          tutorial.settings?.allowSkip && tutorialManager.skipTutorial()
        }
      />

      {/* Highlight */}
      {currentStep.target && currentStep.highlightType !== "none" && (
        <div style={highlightStyle} className="tutorial-highlight" />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={getTooltipStyle()}
        className="tutorial-tooltip"
      >
        {/* Progress Bar */}
        {tutorial.settings?.showProgress && progress && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">
                Adım {progress.current} / {progress.total}
              </span>
              <span className="text-sm text-purple-400">
                %{progress.percentage}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-3">
            {currentStep.title}
          </h3>
          <p className="text-gray-300 leading-relaxed">
            {currentStep.content.text}
          </p>

          {/* Optional Image */}
          {currentStep.content.image && (
            <div className="mt-4">
              <img
                src={currentStep.content.image}
                alt={currentStep.title}
                className="w-full rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          {currentStep.content.buttons.map((button, index) => (
            <button
              key={index}
              className={getButtonStyle(button.style)}
              onClick={() => handleAction(button.action, button.customAction)}
            >
              {button.text}
            </button>
          ))}
        </div>

        {/* Skip Button (if allowed) */}
        {tutorial.settings?.allowSkip && (
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            onClick={() => tutorialManager.skipTutorial()}
            title="Kılavuzu atla"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Tooltip Arrow */}
        {tooltipPosition.position !== "center" && (
          <div
            className={`absolute w-3 h-3 bg-gray-800 border border-purple-500/30 transform rotate-45 ${
              tooltipPosition.position === "top"
                ? "bottom-[-6px] left-1/2 -translate-x-1/2"
                : tooltipPosition.position === "bottom"
                  ? "top-[-6px] left-1/2 -translate-x-1/2"
                  : tooltipPosition.position === "left"
                    ? "right-[-6px] top-1/2 -translate-y-1/2"
                    : tooltipPosition.position === "right"
                      ? "left-[-6px] top-1/2 -translate-y-1/2"
                      : ""
            }`}
          />
        )}
      </div>
    </div>
  );
};

export default TutorialOverlay;
