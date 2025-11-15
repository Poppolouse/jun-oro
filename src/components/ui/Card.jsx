import React from "react";

/**
 * Card container aligned with the design system.
 * Warm background, soft outer shadow, optional hover lift.
 * @param {object} props
 * @param {boolean} [props.interactive]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Card({ interactive = false, className = "", children, ...rest }) {
  const base = "bg-slate-800/50 text-white rounded-[16px]";
  const shadow = "shadow-[5px_5px_10px_rgba(0,0,0,0.3),_-5px_-5px_10px_rgba(0,0,0,0.2)]";
  const padding = "p-4"; // Standard spacing 16px
  const hoverable = interactive
    ? "transition-transform duration-[350ms] ease-in-out hover:-translate-y-1 hover:shadow-[6px_6px_12px_rgba(0,0,0,0.4),_-6px_-6px_12px_rgba(0,0,0,0.3)]"
    : "";

  const classes = [base, shadow, padding, hoverable, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

