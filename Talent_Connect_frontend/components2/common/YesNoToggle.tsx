"use client";
import React from "react";

interface YesNoToggleProps {
  value?: "Y" | "N" | boolean | null;
  onChange: (...event: any[]) => void;
  onBlur?: () => void;
  label?: string;
  name?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const YesNoToggle: React.FC<YesNoToggleProps> = ({
  value = "N",
  onChange,
  onBlur,
  label,
  disabled = false,
  error,
  className = "",
}) => {
  const isYes = value === "Y" || value === true;

  const handleChange = () => {
    if (!disabled) {
      onChange(!isYes ? "Y" : "N");
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-base-content/80">
          {label}
        </label>
      )}

      {/* ✅ UNIVERSAL VISIBILITY - LIGHT/DARK THEME */}
      <div
        role="switch"
        aria-checked={isYes}
        tabIndex={0}
        onClick={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleChange();
          }
        }}
        className={`relative inline-flex items-center w-32 h-12 rounded-2xl cursor-pointer transition-all duration-300 group shadow-lg hover:shadow-xl border-2 border-base-300/60 hover:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-base-100 bg-base-100/80 backdrop-blur-sm ${
          disabled
            ? "opacity-60 cursor-not-allowed"
            : "hover:bg-base-100/95 active:scale-[0.98]"
        } ${error ? "border-error ring-2 ring-error/30" : ""}`}
      >
        {/* Status Fill - Full Width */}
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-10 w-full rounded-xl transition-all duration-400 z-10 shadow-inner ${
            isYes
              ? "bg-gradient-to-r from-success/90 via-success shadow-success/40"
              : "bg-gradient-to-r from-base-200/70 via-base-300 shadow-base-400/20"
          }`}
        />

        {/* Labels Container */}
        <div className="relative w-full h-full flex items-center px-3 z-20 pointer-events-none select-none">
          {/* YES */}
          <span
            className={`flex-1 text-center text-sm font-bold px-1 py-3 transition-all duration-300 ${
              isYes
                ? "text-base-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" // White w/ dark shadow
                : "text-base-content/75" // Theme-aware muted
            }`}
          >
            YES
          </span>

          {/* Divider - Always Visible */}
          <div className="w-px h-8 bg-base-content/20 mx-2" />

          {/* NO */}
          <span
            className={`flex-1 text-center text-sm font-bold px-1 py-3 transition-all duration-300 ${
              !isYes
                ? "text-base-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" // White w/ dark shadow
                : "text-base-content/75" // Theme-aware muted
            }`}
          >
            NO
          </span>
        </div>

        {/* Slider Knob */}
        <div
          className={`absolute top-1.5 w-9 h-9 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl transform transition-all duration-400 z-30 border-2 border-white/70 flex items-center justify-center ${
            isYes
              ? "translate-x-21 shadow-success/50"
              : "translate-x-2 shadow-base-500/40"
          }`}
        >
          {/* Status Indicator */}
          <div
            className={`w-3 h-3 rounded-full shadow-lg ${
              isYes
                ? "bg-emerald-400 shadow-emerald-500/60"
                : "bg-slate-400 shadow-slate-500/60"
            }`}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="flex items-center gap-2 text-error text-sm mt-1">
          <div className="w-4 h-4 bg-error rounded-full animate-pulse shadow-sm" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default YesNoToggle;
