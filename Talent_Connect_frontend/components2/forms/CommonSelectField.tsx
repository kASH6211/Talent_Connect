import { AlertCircle } from "lucide-react";
import React from "react";

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const CommonSelectFeild = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, children, className, error, icon, value, onChange, ...props }, ref) => {
    return (
      <div className="space-y-3">
        <label className="text-sm font-semibold text-base-content/90 flex items-center gap-2">
          {icon}
          {label}
        </label>

        <div className={`relative ${error ? "pb-10" : "pb-2"}`}>
          <select
            ref={ref}
            value={value ?? ""} // Always use value prop when provided
            onChange={onChange}  // Always use onChange when provided
            className={`w-full pl-12 pr-10 py-4 border-2 rounded-2xl text-lg font-medium appearance-none bg-base-100 transition-all duration-200 focus:outline-none focus:ring-4 select select-bordered ${
              error
                ? "select-error border-error bg-error/5 focus:border-error focus:ring-error/20"
                : "border-base-300 hover:border-primary/50 focus:border-primary focus:ring-primary/20"
            } ${className || ""}`}
            {...props}
          >
            {children}
          </select>

          {/* Arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-base-content/40">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Icon */}
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-base-content/50">
              {icon}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-error text-sm p-3 bg-error/10 border border-error/20 rounded-xl backdrop-blur-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>
    );
  }
);

CommonSelectFeild.displayName = "CommonSelectFeild";
export default CommonSelectFeild;
