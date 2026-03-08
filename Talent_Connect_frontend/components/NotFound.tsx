"use client";

import { motion } from "framer-motion";
import { Home, ArrowLeft, Ghost, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    // Animation variants for staggered entry
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#f0f4f8] px-4 py-8 overflow-y-auto">
            {/* Dynamic Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 40, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[150px]"
                />
            </div>

            {/* Senior Designed Premium Card */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative bg-white/80 backdrop-blur-2xl p-10 md:p-20 rounded-[4.5rem] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.15)] border border-white/40 flex flex-col items-center max-w-[750px] w-full text-center overflow-hidden"
            >
                {/* Top Branding Strip */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                {/* Impactful Header Section */}
                <motion.div variants={itemVariants} className="relative mb-14">
                    <div className="relative inline-block">
                        {/* Layered 404 with Depth */}
                        <span className="text-[10rem] md:text-[14rem] font-black text-slate-50 absolute -inset-1 select-none leading-none">404</span>
                        <span className="text-[10rem] md:text-[14rem] font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-primary via-primary/90 to-primary/60 relative z-10 select-none">
                            404
                        </span>

                        {/* Interactive Ghost Float */}
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotate: [12, 18, 12],
                                x: [0, 5, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 -right-8 md:-top-10 md:-right-12 w-20 h-20 md:w-28 md:h-28 bg-secondary rounded-[2.5rem] flex items-center justify-center text-white shadow-[0_20px_40px_rgba(242,166,44,0.4)] border-4 border-white/50"
                        >
                            <Ghost size={48} className="md:w-16 md:h-16" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Messaging with Strategic Typography */}
                <motion.div variants={itemVariants} className="space-y-6 mb-16 max-w-lg mx-auto">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase leading-[0.9]">
                        Lost in the <br /> <span className="text-primary/40">Hunar पंजाब</span> Hub?
                    </h1>
                    <div className="h-1 w-16 bg-secondary/30 mx-auto rounded-full" />
                    <p className="text-sm font-bold text-slate-400 leading-loose uppercase tracking-[0.25em]">
                        This portal section is currently offline or has been moved to a new location. Let's get you back on track.
                    </p>
                </motion.div>

                {/* High-Performance Action Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-xl">
                    <button
                        onClick={() => router.back()}
                        className="group px-8 py-6 bg-slate-50 border-2 border-slate-100 text-slate-500 hover:text-primary hover:border-primary/20 hover:bg-white font-black rounded-3xl transition-all duration-500 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.2em] active:scale-95 shadow-sm"
                    >
                        <div className="p-2 rounded-xl bg-white group-hover:bg-primary/10 transition-colors">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <span>Return to Previous</span>
                    </button>

                    <button
                        onClick={() => router.push("/")}
                        className="group px-8 py-6 bg-primary hover:bg-primary-focus text-white font-black rounded-3xl transition-all duration-500 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(30,64,175,0.3)] hover:shadow-[0_25px_50px_-10px_rgba(30,64,175,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-95"
                    >
                        <div className="p-2 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                            <Home size={16} />
                        </div>
                        <span>Navigate to Home</span>
                    </button>

                    {/* Contextual Shortcut (Senior Touch) */}
                    <button
                        onClick={() => router.push("/search-institutes")}
                        className="md:col-span-2 group px-8 py-5 border-2 border-dashed border-slate-200 text-slate-400 hover:border-secondary/40 hover:text-secondary font-bold rounded-3xl transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em]"
                    >
                        <Search size={14} />
                        Looking for something specific? Search Institutes
                    </button>
                </motion.div>

                {/* Footer Branding (Subtle) */}
                <motion.div variants={itemVariants} className="mt-20 pt-10 border-t border-slate-50 w-full flex justify-between items-center opacity-40">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">
                        Punjab Governance Portal • 404
                    </p>
                    <div className="flex gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    </div>
                </motion.div>
            </motion.div>

            {/* Absolute Bottom Badge */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1 }}
                className="mt-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]"
            >
                Talent Connect Deployment v2.0
            </motion.p>
        </div>
    );
}
