"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setCurrentRole, updateLoginUi } from "@/store/login";
import { AppDispatch } from "@/store/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Factory,
  GraduationCap,
  Building2,
  BookOpen,
  Landmark,
  Code,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";

interface RoleSelectModalProps {
  open: boolean;
}

const roles = [
  {
    name: "Industry",
    icon: Factory,
    description: "Partner for placements",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50"
  },
  {
    name: "Student",
    icon: GraduationCap,
    description: "Explore opportunities",
    color: "from-orange-500 to-amber-600",
    bg: "bg-orange-50"
  },
  {
    name: "Institute",
    icon: Building2,
    description: "Manage your portal",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50"
  },
  {
    name: "Faculty",
    icon: BookOpen,
    description: "Academic access",
    color: "from-purple-500 to-violet-600",
    bg: "bg-purple-50"
  },
  {
    name: "Department",
    icon: Landmark,
    description: "Administrative view",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50"
  },
  {
    name: "Admin Tech",
    icon: Code,
    description: "Technical support",
    color: "from-slate-700 to-slate-900",
    bg: "bg-slate-100"
  },
];

export default function RoleSelectModal({ open }: RoleSelectModalProps) {
  const router = useRouter();
  const path = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (role: string) => {
    if (role === "Industry") {
      setLoading(true);
      try {
        const res = await axios.get("/api/sso");
        if (res.data?.url) {
          window.location.href = res.data.url;
          return;
        }
      } catch (e) {
        console.error("SSO login proxy failed", e);
      } finally {
        setLoading(false);
      }
    }

    dispatch(setCurrentRole(role));
    dispatch(updateLoginUi({ roleSelectModal: { open: false } }));
    router.push("/login");
  };

  const handleClose = () => {
    dispatch(updateLoginUi({ roleSelectModal: { open: false } }));
    if (path === "/search-institutes" || path === "/contact") {
      router.push(path);
    } else {
      router.push("/");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center isolate">
          {/* Glass Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl mx-4 overflow-hidden rounded-[2.5rem] bg-white shadow-[0_32px_100px_-20px_rgba(0,0,0,0.3)] border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

            <div className="relative z-10 p-8 md:p-12">
              {/* Header */}
              <div className="flex justify-between items-start mb-12">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                    <Sparkles size={12} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Identity Gateway</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                    Select Your <span className="text-primary">Role</span>
                  </h2>
                  <p className="text-slate-400 font-bold text-sm tracking-wide">
                    Please choose your workspace to continue to the portal
                  </p>
                </div>

                <button
                  onClick={handleClose}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all active:scale-95 shadow-sm border border-slate-100"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Roles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role, idx) => {
                  const Icon = role.icon;
                  return (
                    <motion.button
                      key={role.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleRoleSelect(role.name)}
                      disabled={loading}
                      className={`group relative flex flex-col items-start p-8 rounded-[2rem] bg-slate-50 hover:bg-white border border-slate-100 hover:border-primary/20 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 text-left overflow-hidden ${loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                      {/* Gradient Accent */}
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl transition-opacity duration-500`} />

                      <div className={`w-14 h-14 rounded-2xl ${role.bg} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-br ${role.color} transition-all duration-500 shadow-sm border border-white`}>
                        {loading && role.name === "Industry" ? (
                          <Loader2 className="w-7 h-7 text-primary animate-spin" />
                        ) : (
                          <Icon className={`w-7 h-7 text-primary group-hover:text-white transition-colors duration-500`} />
                        )}
                      </div>

                      <div className="space-y-1 w-full">
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-slate-800 text-lg tracking-tight group-hover:text-primary transition-colors">
                            {role.name}
                          </h3>
                          <ArrowRight size={18} className="text-slate-300 -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-500" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                          {role.description}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer Info */}
              <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                  © 2026 Talent Connect Punjab
                </p>
                <div className="flex gap-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary cursor-pointer transition-colors">Help Center</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary cursor-pointer transition-colors">Contact Admin</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
