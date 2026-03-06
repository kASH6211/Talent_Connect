"use client";
import { setCurrentRole, updateLoginUi } from "@/store/login";
import { AppDispatch } from "@/store/store";
import {
  X,
  Factory,
  GraduationCap,
  Building2,
  BookOpen,
  Landmark,
  Code,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

interface RoleSelectModalProps {
  open: boolean;
}

const roles = [
  { name: "Industry", icon: Factory },
  { name: "Student", icon: GraduationCap },
  { name: "Institute", icon: Building2 },
  { name: "Faculty", icon: BookOpen },
  { name: "Department", icon: Landmark },
  { name: "Admin Tech", icon: Code },
];

export default function RoleSelectModal({ open }: RoleSelectModalProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleRoleSelect = async (role: string) => {
    if (role === "Industry") {
      setLoading(true);
      try {
        const res = await axios.get("/api/sso");
        if (res.data?.url) {
          window.location.href = res.data.url;
          return; // Prevent further execution as we are redirecting
        }
      } catch (e) {
        console.error("SSO login proxy failed", e);
      } finally {
        // Only stop loading if we didn't redirect
        setLoading(false);
      }
    }

    dispatch(setCurrentRole(role));
    dispatch(updateLoginUi({ roleSelectModal: { open: false } }));
    router.push("/login");
  };

  const handleClose = () => {
    dispatch(updateLoginUi({ roleSelectModal: { open: false } }));
    router.push("/");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
      bg-black/60 px-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-3xl 
        bg-white rounded-xl 
        border border-gray-200
        shadow-2xl
        p-8 md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 
          text-gray-500 hover:text-gray-800 
          transition-colors"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Select Login Role
          </h2>
          <p className="text-gray-500 mt-2">
            Choose your role to continue to the portal
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-5 md:gap-6">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <button
                key={role.name}
                onClick={() => handleRoleSelect(role.name)}
                disabled={loading}
                className={`group flex flex-col items-center justify-center
                p-6 rounded-lg
                border border-gray-200
                bg-white
                hover:border-blue-500
                hover:shadow-md
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div
                  className="w-14 h-14 rounded-full 
                  bg-gray-100 
                  flex items-center justify-center mb-4
                  group-hover:bg-blue-50
                  transition-colors"
                >
                  {loading && role.name === "Industry" ? (
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  ) : (
                    <Icon className="w-6 h-6 text-blue-600" />
                  )}
                </div>

                <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {role.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
