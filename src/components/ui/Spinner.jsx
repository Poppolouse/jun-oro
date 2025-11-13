import React from "react";

/**
 * Spinner component for loading states.
 * Uses accent color and subtle animation per design system.
 * @param {object} props
 * @param {"sm"|"md"|"lg"} [props.size]
 * @param {string} [props.className]
 */
export default function Spinner({ size = "md", className = "", ...rest }) {
  const dimension = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }[size];

  return (
    <svg
      className={[dimension, "animate-spin", className].join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      {...rest}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="#6B6661"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 018-8"
        stroke="#D97757"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

