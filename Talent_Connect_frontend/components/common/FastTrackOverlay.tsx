"use client";

import { useAuth } from "@/lib/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, ArrowRight, X, Briefcase } from "lucide-react";
import axios from "axios";
import { useState } from "react";

const FastTrackOverlay = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  // Expanded by default
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

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

  if (user || authLoading) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence mode="wait">
        {/* Collapsed Button */}
        {!isExpanded && (
          <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.button
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              onClick={() => setIsExpanded(true)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white shadow-xl hover:scale-105 transition-all"
            >
              <LogIn size={24} />
            </motion.button>
          </div>
        )}

        {/* Expanded Banner */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.94 }}
            transition={{ type: "spring", damping: 24, stiffness: 200 }}
            className="flex items-center gap-4 max-w-[420px] bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl px-5 py-4"
          >
            {/* Icon */}
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
              <Briefcase size={20} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 leading-snug">
                Are you an{" "}
                <span className="text-primary">Industry or Employer?</span>
              </p>

              <p className="text-xs text-gray-600 leading-relaxed">
                Access the{" "}
                <span className="font-medium text-gray-700">
                  FastTrack Industry Portal
                </span>{" "}
              </p>
            </div>

            {/* Login Button */}
            <button
              onClick={handleSSO}
              disabled={loading}
              className="group px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:bg-primary/90 shadow-md transition-all"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Login
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>

            {/* Close */}
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FastTrackOverlay;
