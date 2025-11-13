import React from "react";

/**
 * Reusable Button component aligned with Design System.
 * Supports variants, sizes, loading, disabled, and full width.
 * @param {object} props
 * @param {"primary"|"secondary"|"ghost"|"danger"} [props.variant]
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
    "shadow-[5px_5px_10px_rgba(0,0,0,0.1),_-5px_-5px_10px_rgba(255,255,255,0.7)]";
  const hoverLift = "hover:-translate-y-[4px] hover:shadow-lg";

  // Variants map using design system colors
  const variantClasses = {
    primary:
      "bg-[#D97757] text-[#2D2A26] hover:bg-[#c56e51] active:bg-[#b6664c]",
    secondary:
      "bg-[#EEEAE4] text-[#2D2A26] hover:bg-[#e6e2dc] active:bg-[#dedad4]",
    ghost:
      "bg-transparent text-[#2D2A26] hover:bg-[#EEEAE4] active:bg-[#e6e2dc] border border-[#EEEAE4]",
    danger:
      "bg-[#B91C1C] text-white hover:bg-[#991b1b] active:bg-[#7f1d1d]",
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

