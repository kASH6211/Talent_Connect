"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, Eye, EyeOff, X } from "lucide-react";
import api from "@/lib/api";
import { clearAuthCache } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components2/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("tc_token", res.data.access_token);
      clearAuthCache();
      router.push("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-base-200 dark:bg-base-950">
      {/* Theme Toggle */}
      <div className="fixed top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      {/* LEFT SIDE — full height, clipped bottom-right with large radius */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col items-center justify-center overflow-hidden bg-primary"
        style={{ borderRadius: "0 4rem 6rem 0" }}
      >
        {/* Subtle layered radial glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--pc) / 0.4) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-15"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--s) / 0.5) 0%, transparent 70%)",
            }}
          />
          {/* Soft diagonal stripe texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, hsl(var(--pc)) 0px, hsl(var(--pc)) 1px, transparent 1px, transparent 24px)",
            }}
          />
        </div>

        {/* Center logo card */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          {/* Icon card with glassmorphism */}
          <div
            className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl"
            style={{
              background: "hsl(var(--pc) / 0.15)",
              backdropFilter: "blur(20px)",
              border: "1.5px solid hsl(var(--pc) / 0.25)",
              boxShadow:
                "0 32px 64px hsl(var(--p) / 0.4), inset 0 1px 0 hsl(var(--pc) / 0.2)",
            }}
          >
            <GraduationCap
              size={60}
              className="text-primary-content drop-shadow-lg"
              strokeWidth={1.3}
            />
          </div>

          {/* Wordmark */}
          <div className="text-center">
            <h1
              className="text-5xl font-black text-primary-content tracking-tight leading-none"
              style={{ textShadow: "0 4px 24px hsl(var(--p) / 0.5)" }}
            >
              Talent
              <br />
              Connect
            </h1>
            <div className="mt-4 w-12 h-1 rounded-full bg-primary-content/30 mx-auto" />
          </div>

          <p className="text-primary-content/70 text-base max-w-[240px] text-center leading-relaxed">
            Your bridge between talent and opportunity.
          </p>
        </div>

        {/* Bottom floating pills */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {["Institutes", "Industry", "Students"].map((label) => (
            <span
              key={label}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-primary-content/80 border border-primary-content/20"
              style={{ background: "hsl(var(--pc) / 0.1)" }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-16 bg-base-100 dark:bg-base-900">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-5 shadow-lg shadow-primary/30">
              <GraduationCap
                size={36}
                className="text-primary-content"
                strokeWidth={1.5}
              />
            </div>
            <h1 className="text-3xl font-black text-base-content">
              Talent Connect
            </h1>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-base-content tracking-tight">
              Sign in
            </h2>
            <p className="mt-1.5 text-base-content/50 text-sm">
              Welcome back — let's pick up where you left off.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username field */}
            <div className="relative group">
              <label className="block text-xs font-semibold text-base-content/60 mb-1.5 ml-1 tracking-wide uppercase">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
                className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-4 py-3.5 text-sm text-base-content placeholder:text-base-content/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>

            {/* Password field */}
            <div className="relative group">
              <label className="block text-xs font-semibold text-base-content/60 mb-1.5 ml-1 tracking-wide uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-4 py-3.5 pr-12 text-sm text-base-content placeholder:text-base-content/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 bg-error/10 border border-error/25 text-error text-sm px-4 py-3 rounded-xl animate-pulse">
                <X size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full h-12 bg-primary hover:brightness-110 text-primary-content font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden mt-2"
            >
              <span className="relative z-10 flex items-center justify-center gap-2.5">
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Signing in..." : "Sign In"}
              </span>
              {/* Shimmer sweep on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-base-300 dark:bg-base-700" />
            <span className="text-xs text-base-content/40 font-medium">
              DEMO ACCESS
            </span>
            <div className="flex-1 h-px bg-base-300 dark:bg-base-700" />
          </div>

          {/* Demo credentials */}
          <div className="space-y-2.5">
            {[
              {
                creds: "admin / admin123",
                role: "Admin",
                color: "text-primary bg-primary/10",
              },
              {
                creds: "institute_pit / institute123",
                role: "Institute",
                color: "text-success bg-success/10",
              },
              {
                creds: "industry_ts / industry123",
                role: "Industry",
                color: "text-secondary bg-secondary/10",
              },
            ].map(({ creds, role, color }) => (
              <div
                key={role}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700"
              >
                <span className="font-mono text-xs text-base-content/70">
                  {creds}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ml-2 ${color}`}
                >
                  {role}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="text-center text-base-content/30 text-xs mt-10">
            © {new Date().getFullYear()} Talent Connect • All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}
