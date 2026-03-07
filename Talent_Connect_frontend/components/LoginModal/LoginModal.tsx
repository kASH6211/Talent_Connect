"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    GraduationCap,
    Loader2,
    Eye,
    EyeOff,
    X,
    Lock,
    User,
    ShieldCheck,
    ArrowRight
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import { getDashboardRoute } from "@/lib/helper";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { motion, AnimatePresence } from "framer-motion";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const router = useRouter();
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/auth/login", { username, password });
            login(res.data.user, res.data.access_token);
            onClose();
            router.replace(getDashboardRoute(res.data.user.role));
        } catch (err: any) {
            setError(err?.response?.data?.message || "Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    // Reset state on close
    useEffect(() => {
        if (!isOpen) {
            setUsername("");
            setPassword("");
            setError("");
            setLoading(false);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 isolate">
                    {/* Glass Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-[480px] overflow-hidden rounded-[2.5rem] bg-white shadow-[0_32px_120px_-20px_rgba(0,0,0,0.4)] border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Design Elements */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

                        <div className="relative z-10 p-8 sm:p-12">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all active:scale-95 border border-slate-100"
                            >
                                <X size={20} />
                            </button>

                            {/* Header */}
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 text-primary shadow-inner border border-primary/5">
                                    <ShieldCheck size={32} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                                    Welcome <span className="text-primary">Back</span>
                                </h2>
                                <p className="text-slate-400 font-bold text-sm tracking-wide">
                                    Sign in to access your talent portal
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                        Username
                                    </label>
                                    <div className="relative group">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Enter username"
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-white transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 focus:bg-white transition-all text-sm font-bold text-slate-700 placeholder:text-slate-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-500 rounded-2xl"
                                    >
                                        <X size={18} className="shrink-0" />
                                        <p className="text-xs font-bold leading-relaxed">{error}</p>
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-primary hover:bg-primary-focus text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {loading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Footer */}
                            <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                        Secure 256-bit SSL Connection
                                    </span>
                                </div>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                    © 2026 HUNAR PUNJAB
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
