import { AlertCircle } from "lucide-react";
import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: React.ReactNode;
}

export const CommonInputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
    ({ label, className, error, icon, ...props }, ref) => (
        <div className="space-y-3">
            <label className="text-sm font-semibold text-base-content/90 flex items-center gap-2">
                {icon}
                {label}
            </label>
            <div className={`relative ${error ? "pb-10" : "pb-2"}`}>
                <input
                    ref={ref}
                    className={`w-full px-12 py-4 pr-4 border-2 rounded-2xl text-lg font-medium transition-all duration-200 focus:outline-none focus:ring-4 input input-bordered ${error
                            ? "input-error border-error bg-error/5 focus:border-error focus:ring-error/20"
                            : "border-base-300 hover:border-primary/50 focus:border-primary focus:ring-primary/20 bg-base-100"
                        }`}
                    {...props}
                />
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-base-content/50">
                        {icon}
                    </div>
                )}
            </div>
            {error && (
                <div className="flex items-center gap-2 text-error text-sm p-3 bg-error/10 border border-error/20 rounded-xl backdrop-blur-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}
        </div>
    )
);

CommonInputField.displayName = "InputField";