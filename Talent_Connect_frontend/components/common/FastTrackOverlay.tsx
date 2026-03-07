"use client";

import { useAuth } from "@/lib/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, ArrowRight, ShieldCheck } from "lucide-react";
import axios from "axios";
import { useState } from "react";

const FastTrackOverlay = () => {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSSO = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/sso");
            if (res.data?.url) {
                window.location.href = res.data.url;
            }
        } catch (e) {
            console.error("SSO redirect failed", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence mode="wait">
            {!user && !authLoading && (
                <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 100, scale: 0.9 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-8 right-8 z-[100] max-w-[280px] w-full"
                >
                    <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] p-6 group transition-all duration-500 hover:shadow-[0_25px_60px_rgba(33,65,164,0.2)]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Access</p>
                                <h4 className="text-sm font-bold text-slate-800">FastTrack Portal</h4>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                            Access industry partnerships and placement data directly.
                        </p>

                        <button
                            onClick={handleSSO}
                            disabled={loading}
                            className="w-full bg-primary text-white py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-70"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={16} />
                                    <span>Login with FastTrack</span>
                                    <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FastTrackOverlay;
