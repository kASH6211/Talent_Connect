"use client";

import React from "react";
import { Shield } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateLoginUi } from "@/store/login";

interface LoginPromptModalProps {
    onClose: () => void;
}

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ onClose }) => {
    const dispatch = useDispatch<AppDispatch>();

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                    <Shield size={32} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-primary text-center mb-2">
                    Authentication Required
                </h2>
                <p className="text-slate-600 text-center mb-8 text-sm sm:text-base">
                    Please sign in to contact institutes or send placement offers.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => {
                            onClose();
                            dispatch(updateLoginUi({ roleSelectModal: { open: true } }));
                        }}
                        className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-primary hover:bg-primary text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full px-4 sm:px-6 py-2.5 sm:py-3 border border-slate-300 text-primary hover:bg-slate-50 font-semibold rounded-lg transition-colors text-sm sm:text-base"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPromptModal;
