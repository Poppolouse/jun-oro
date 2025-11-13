import React from "react";

/**
 * ToggleSwitch component following the design system.
 * Smooth ease-in-out animation, accessible, and disabled state.
 * @param {object} props
 * @param {boolean} props.checked
 * @param {function} props.onChange
 * @param {string} [props.id]
 * @param {boolean} [props.disabled]
 * @param {"sm"|"md"|"lg"} [props.size]
 * @param {string} [props.className]
 * @param {React.ReactNode} [props.labelLeft]
 * @param {React.ReactNode} [props.labelRight]
 */
export default function ToggleSwitch({
  checked,
  onChange,
  id,
  disabled = false,
  size = "md",
  className = "",
  labelLeft,
  labelRight,
  ...rest
}) {
  const sizes = {
    sm: { track: "w-10 h-5", knob: "w-4 h-4", translate: "translate-x-5" },
    md: { track: "w-12 h-6", knob: "w-5 h-5", translate: "translate-x-6" },
    lg: { track: "w-16 h-8", knob: "w-7 h-7", translate: "translate-x-8" },
  }[size];

  const trackBase = `relative inline-flex items-center ${sizes.track} rounded-[20px] transition-colors duration-[400ms] ease-in-out`;
  const trackColor = checked ? "bg-[#D97757]" : "bg-[#EEEAE4]";
  const trackState = disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer";

  const knobBase = `absolute top-0.5 left-0.5 ${sizes.knob} rounded-full bg-white shadow-[5px_5px_10px_rgba(0,0,0,0.1),_-5px_-5px_10px_rgba(255,255,255,0.7)] transition-transform duration-[400ms] ease-in-out`;
  const knobTransform = checked ? sizes.translate : "translate-x-0";

  const handleClick = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  return (
    <div className={["flex items-center gap-3", className].filter(Boolean).join(" ")}> 
      {labelLeft && (
        <span className="text-sm text-[#6B6661] select-none">{labelLeft}</span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        id={id}
        className={[trackBase, trackColor, trackState].join(" ")}
        onClick={handleClick}
        {...rest}
      >
        <span className={[knobBase, knobTransform].join(" ")} />
      </button>
      {labelRight && (
        <span className="text-sm text-[#6B6661] select-none">{labelRight}</span>
      )}
    </div>
  );
}

