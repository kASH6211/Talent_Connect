// components/CommonModal.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import { X } from "lucide-react";

interface CommonModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    showCloseButton?: boolean;
    className?: string;
}

export default function CommonModal({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    showCloseButton = true,
    className = ""
}: CommonModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    // Animation control
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    // Size classes
    const sizeClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "w-full max-w-7xl h-[90vh]"
    };

    const handleClose = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className={`
        fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm
        flex items-center justify-center p-4 sm:p-8 animate-in fade-in-0 zoom-in-95 duration-300
        ${isOpen ? 'animate-in' : 'animate-out fade-out-0 zoom-out-95 duration-300'}
      `}
            onClick={handleBackdropClick}
        >
            <div className={`
        bg-base-100 rounded-3xl shadow-3xl border border-base-300/50
        transform transition-all duration-300 max-h-[90vh] overflow-y-auto
        ${sizeClasses[size]} ${className}
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="sticky top-0 z-10 bg-base-100/95 backdrop-blur-sm border-b border-base-300/50 rounded-t-3xl p-8 lg:p-10">
                        <div className="flex items-center justify-between">
                            {title && (
                                <h2 className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    {title}
                                </h2>
                            )}
                            {showCloseButton && (
                                <button
                                    onClick={handleClose}
                                    className="btn btn-ghost btn-circle btn-lg p-2 hover:bg-base-200 rounded-2xl group"
                                    aria-label="Close modal"
                                >
                                    <X className="w-8 h-8 group-hover:rotate-90 transition-transform duration-200" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="p-8 lg:p-10 2xl:p-12 max-h-[calc(90vh-120px)] overflow-y-auto">
                    {children}
                </div>

                {/* Footer - Optional */}
                <div className="sticky bottom-0 z-10 bg-base-100/95 backdrop-blur-sm border-t border-base-300/50 rounded-b-3xl p-6 lg:p-8">
                    <div className="flex flex-wrap gap-4 justify-end">
                        {/* Children can include custom footer buttons */}
                    </div>
                </div>
            </div>
        </div>
    );
}
