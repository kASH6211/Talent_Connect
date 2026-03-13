"use client";

import { useState } from "react";
import { X, Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { globalNotify } from "@/lib/notification";

interface AdminResetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    instituteId: number;
    instituteName: string;
}

export default function AdminResetPasswordModal({
    isOpen,
    onClose,
    instituteId,
    instituteName
}: AdminResetPasswordModalProps) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/auth/admin/reset-institute-password", {
                instituteId,
                newPassword,
            });
            setSuccessMessage(res.data.message);
            setSuccess(true);
            globalNotify(res.data.message, "success");
            setTimeout(() => {
                handleClose();
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to reset password. The institute might not have a user account yet.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setSuccess(false);
        setSuccessMessage("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-[0_20px_100px_-10px_rgba(0,0,0,0.1),0_0_20px_rgba(0,0,0,0.02)] border border-slate-200/60 overflow-hidden animate-in zoom-in-95 duration-500">

                {/* Subtle Theme Accents */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -z-10" />

                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shadow-sm hover:scale-105 transition-transform duration-300">
                            <Lock size={22} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight font-outfit uppercase truncate">
                                Reset Password
                            </h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-80 truncate">
                                {instituteName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 active:scale-75"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="px-8 pb-8 pt-4">
                    {success ? (
                        <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in-90 duration-700">
                            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-500 shadow-xl shadow-green-500/10 ring-8 ring-green-500/5">
                                <CheckCircle2 size={44} strokeWidth={2.5} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-2xl font-black text-slate-800 font-outfit uppercase tracking-tight">Success</h4>
                                <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest leading-relaxed px-4">
                                    {successMessage}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 text-red-500 text-[11px] font-black flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 uppercase tracking-wider">
                                    <AlertCircle size={16} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-5">
                                {/* New Password */}
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                                        Set New Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                        className="w-full bg-slate-50/50 border-2 border-slate-100/80 rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 placeholder:text-slate-300"
                                    />
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat password"
                                        className="w-full bg-slate-50/50 border-2 border-slate-100/80 rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 h-14 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-300 active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] h-14 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 active:scale-95 transition-all duration-500 disabled:opacity-50 disabled:grayscale"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 size={16} className="animate-spin" />
                                            Resetting
                                        </div>
                                    ) : (
                                        "Set Password"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
