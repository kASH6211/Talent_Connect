"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import { getDashboardRoute } from "@/lib/helper";

export default function ChangePasswordPage() {
    const router = useRouter();
    const { user, login } = useAuth();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (user && user.is_passwordchanged === "Y") {
            router.replace(getDashboardRoute(user.role));
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/change-password", {
                oldPassword,
                newPassword,
            });

            // Update local user state
            if (user) {
                const updatedUser = { ...user, is_passwordchanged: "Y" };
                const token = localStorage.getItem("tc_token") || "";
                login(updatedUser, token);
            }

            setSuccess(true);
            setTimeout(() => {
                router.replace(getDashboardRoute(user?.role || "admin"));
            }, 2000);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to change password. Please check your current password.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 dark:bg-base-950 p-6">
            <div className="w-full max-w-[450px] space-y-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary mb-6 shadow-xl shadow-primary/20">
                        <Lock size={40} className="text-primary-content" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl font-black text-base-content tracking-tight">
                        Update Password
                    </h1>
                    <p className="mt-2 text-base-content/50 text-sm">
                        For security reasons, you must change your password on first login.
                    </p>
                </div>

                <div className="bg-base-100 dark:bg-base-900 rounded-[2.5rem] shadow-2xl shadow-base-content/5 p-8 lg:p-10 border border-base-content/5">
                    {success ? (
                        <div className="text-center flex flex-col items-center gap-4 py-8 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center text-success">
                                <CheckCircle2 size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-base-content">Password Updated!</h3>
                                <p className="text-sm text-base-content/50 mt-1">
                                    Redirecting to your dashboard...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-base-content/60 ml-1 uppercase tracking-wider">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showOld ? "text" : "password"}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        required
                                        className="w-full bg-base-200 dark:bg-base-800 border border-transparent focus:border-primary/30 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOld(!showOld)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-primary transition-colors"
                                    >
                                        {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-base-content/60 ml-1 uppercase tracking-wider">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNew ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Create new password"
                                        required
                                        className="w-full bg-base-200 dark:bg-base-800 border border-transparent focus:border-primary/30 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-primary transition-colors"
                                    >
                                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-base-content/60 ml-1 uppercase tracking-wider">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        required
                                        className="w-full bg-base-200 dark:bg-base-800 border border-transparent focus:border-primary/30 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-primary transition-colors"
                                    >
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-3 bg-error/10 text-error text-xs p-4 rounded-2xl border border-error/20">
                                    <AlertCircle size={18} className="shrink-0" />
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary text-primary-content font-bold rounded-2xl shadow-xl shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-4 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <CheckCircle2 size={20} />
                                )}
                                {loading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-base-content/30 text-xs mt-10">
                    © {new Date().getFullYear()} HUNAR PUNJAB • All Rights Reserved
                </p>
            </div>
        </div>
    );
}
