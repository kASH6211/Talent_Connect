"use client";

import React from "react";

interface CommonToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const CommonToggle: React.FC<CommonToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  className = "",
}) => {
  return (
    <label className={`toggle text-base-content ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />

      {/* Enabled Icon */}
      <svg
        aria-label="enabled"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <g
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeWidth="4"
          fill="none"
          stroke="currentColor"
        >
          <path d="M20 6 9 17l-5-5"></path>
        </g>
      </svg>

      {/* Disabled Icon */}
      <svg
        aria-label="disabled"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </label>
  );
};

export default CommonToggle;
