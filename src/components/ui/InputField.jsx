import React from "react";

/**
 * InputField component following the design system.
 * Supports label, hint, error, icons, and textarea mode.
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.hint]
 * @param {string} [props.error]
 * @param {boolean} [props.required]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.multiline]
 * @param {"sm"|"md"|"lg"} [props.size]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {string} [props.type]
 * @param {string} [props.placeholder]
 * @param {string|number} [props.value]
 * @param {function} [props.onChange]
 * @param {string} [props.className]
 */
export default function InputField({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  multiline = false,
  size = "md",
  leftIcon,
  rightIcon,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  ...rest
}) {
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  }[size];

  // Small elements radius: 8px (per design system)
  const radiusClass = "rounded-[8px]";
  const baseClasses =
    "w-full bg-slate-700 text-white placeholder-slate-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50";
  const stateClasses = disabled ? "opacity-60 cursor-not-allowed" : "";
  const iconPaddingLeft = leftIcon ? "pl-10" : "";
  const iconPaddingRight = rightIcon ? "pr-10" : "";
  const errorClasses = error ? "border-[#B91C1C]" : "border-transparent";

  const containerClasses = ["relative", className].filter(Boolean).join(" ");
  const inputClasses = [
    baseClasses,
    sizeClasses,
    radiusClass,
    stateClasses,
    iconPaddingLeft,
    iconPaddingRight,
    errorClasses,
  ]
    .filter(Boolean)
    .join(" ");

  const labelEl = label ? (
    <label className="block mb-1 text-sm text-slate-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
  ) : null;

  const leftIconEl = leftIcon ? (
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
      {leftIcon}
    </span>
  ) : null;

  const rightIconEl = rightIcon ? (
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
      {rightIcon}
    </span>
  ) : null;

  const fieldEl = multiline ? (
    <textarea
      className={inputClasses}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      rows={size === "lg" ? 4 : 3}
      {...rest}
    />
  ) : (
    <input
      type={type}
      className={inputClasses}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      {...rest}
    />
  );

  return (
    <div className="mb-2">
      {labelEl}
      <div className={containerClasses}>
        {leftIconEl}
        {rightIconEl}
        {fieldEl}
      </div>
      {hint && !error && (
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

