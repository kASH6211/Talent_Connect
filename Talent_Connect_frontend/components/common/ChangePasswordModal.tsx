"use client";

import { useState } from "react";
import { X, Lock, Loader2, CheckCircle2, AlertCircle, LogOut } from "lucide-react";
import api from "@/lib/api";
import { globalNotify } from "@/lib/notification";
import { useAuth } from "@/lib/AuthProvider";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    forced?: boolean;
}

export default function ChangePasswordModal({ isOpen, onClose, forced = false }: ChangePasswordModalProps) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const { logout } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/change-password", {
                oldPassword,
                newPassword,
            });
            setSuccess(true);
            globalNotify("Password changed successfully. Logging out...", "success");
            setTimeout(() => {
                logout();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to change password. Please check your current password.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (forced) return;
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setSuccess(false);
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
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight font-outfit uppercase">
                                Change Password
                            </h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-80">
                                {forced ? "Action Required" : "Secure your account"}
                            </p>
                        </div>
                    </div>
                    {!forced && (
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 active:scale-75"
                        >
                            <X size={20} strokeWidth={3} />
                        </button>
                    )}
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
                                <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Security Updated</p>
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

                            {forced && (
                                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-amber-600 text-[10px] font-black flex items-start gap-3 animate-in fade-in duration-500 uppercase tracking-wider leading-relaxed">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <span>For security reasons, you must change your initial password before continuing.</span>
                                </div>
                            )}

                            <div className="space-y-5">
                                {/* Current Password */}
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50/50 border-2 border-slate-100/80 rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 placeholder:text-slate-300"
                                    />
                                </div>

                                {/* Separator */}
                                <div className="flex items-center gap-4 px-2">
                                    <div className="flex-1 h-[2px] bg-slate-100/80" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <div className="flex-1 h-[2px] bg-slate-100/80" />
                                </div>

                                {/* New Password */}
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                                        New Password
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
                            <div className="pt-4 flex flex-col gap-3">
                                <div className="flex gap-4">
                                    {!forced && (
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className="flex-1 h-14 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-300 active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`h-14 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:brightness-110 active:scale-95 transition-all duration-500 disabled:opacity-50 disabled:grayscale ${forced ? 'w-full' : 'flex-[2]'}`}
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                Updating
                                            </div>
                                        ) : (
                                            "Update Password"
                                        )}
                                    </button>
                                </div>

                                {forced && (
                                    <button
                                        type="button"
                                        onClick={() => logout()}
                                        className="w-full h-12 rounded-2xl bg-red-50 text-[9px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-100 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={14} />
                                        Logout from session
                                    </button>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
