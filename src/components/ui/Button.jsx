import React from "react";

/**
 * Reusable Button component aligned with Design System.
 * Supports variants, sizes, loading, disabled, and full width.
 * @param {object} props
 * @param {"primary"|"secondary"|"ghost"|"danger"|"success"|"danger_ghost"} [props.variant]
 * @param {"sm"|"md"|"lg"} [props.size]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.loading]
 * @param {boolean} [props.fullWidth]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {string} [props.className]
 * @param {string} [props.type]
 * @param {function} [props.onClick]
 * @returns {JSX.Element}
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  type = "button",
  onClick,
  ...rest
}) {
  const baseClasses =
    "inline-flex items-center justify-center select-none transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#D97757]/40";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  }[size];

  // Border radius per design system: Buttons 12px
  const radiusClass = "rounded-[12px]";

  // Neumorphism shadows (outer + hover glow). Tailwind supports arbitrary values.
  const outerShadow =
    "shadow-[5px_5px_10px_rgba(0,0,0,0.3),_-5px_-5px_10px_rgba(0,0,0,0.2)]";
  const hoverLift = "hover:-translate-y-[4px] hover:shadow-lg";

  // Variants map using design system colors
  const variantClasses = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
    secondary:
      "bg-slate-700 text-white hover:bg-slate-800 active:bg-slate-900",
    ghost:
      "bg-transparent text-white hover:bg-slate-700 active:bg-slate-800 border border-slate-600",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
    success:
      "bg-green-600 text-white hover:bg-green-700 active:bg-green-800",
    danger_ghost:
      "bg-transparent text-red-400 hover:bg-red-900/20 active:bg-red-900/30 border border-red-800/50",
  }[variant];

  const widthClass = fullWidth ? "w-full" : "";

  const stateClasses = disabled || loading ? "opacity-60 cursor-not-allowed" : "";

  const composed = [
    baseClasses,
    sizeClasses,
    radiusClass,
    outerShadow,
    hoverLift,
    variantClasses,
    widthClass,
    stateClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick && onClick(e);
  };

  return (
    <button
      type={type}
      className={composed}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading ? "true" : undefined}
      {...rest}
    >
      {leftIcon && (
        <span className="mr-2 inline-flex items-center">{leftIcon}</span>
      )}
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-[#2D2A26] border-t-transparent rounded-full animate-spin" />
          <span>Yükleniyor...</span>
        </span>
      ) : (
        children
      )}
      {rightIcon && (
        <span className="ml-2 inline-flex items-center">{rightIcon}</span>
      )}
    </button>
  );
}

