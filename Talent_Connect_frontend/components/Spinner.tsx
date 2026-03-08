"use client";

import { motion } from "framer-motion";

export default function SpinnerFallback({
  title = "HUNAR PUNJAB",
}: {
  title?: string;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-xl">
      {/* Premium Glassmorphic Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white/90 p-12 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-white flex flex-col items-center max-w-[320px] w-full"
      >
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-primary/5 rounded-[3.5rem] blur-3xl -z-10 animate-pulse" />

        {/* Logo Section with Pulse Glow */}
        <div className="relative mb-12">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -inset-6 bg-primary/20 rounded-full blur-2xl"
          />
          <div className="relative bg-white p-6 rounded-full shadow-2xl border border-slate-50">
            <img
              src="/Gov Logo.png"
              alt="Govt of Punjab"
              className="w-16 h-16 object-contain"
            />
          </div>

          {/* Orbiting Ring */}
          <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary/10"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="48%"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="100 300"
              strokeLinecap="round"
              className="text-secondary"
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ originX: "50%", originY: "50%" }}
            />
          </svg>
        </div>

        {/* Text Section */}
        <div className="text-center space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-tight"
          >
            {title}
          </motion.h2>

          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-secondary"
                />
              ))}
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"
            >
              Preparing Portal
            </motion.p>
          </div>
        </div>

        {/* Subtle Bottom Badge */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em]">
            Department of Technical Education
          </p>
        </div>
      </motion.div>
    </div>
  );
}
