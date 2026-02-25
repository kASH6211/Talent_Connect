"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, LogIn } from "lucide-react";
import api from "@/lib/api";
import { clearAuthCache } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components2/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Theme toggle in top-right corner */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 dark:bg-blue-500 shadow-lg mb-5 mx-auto">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Talent Connect
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            University Placement Management Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-8 mb-6">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your username"
                required
                autoFocus
                className={`w-full px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 bg-slate-50 dark:bg-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
                  focusedField === "username"
                    ? "border-blue-500 dark:border-blue-400 shadow-md shadow-blue-500/10"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your password"
                required
                className={`w-full px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 bg-slate-50 dark:bg-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
                  focusedField === "password"
                    ? "border-blue-500 dark:border-blue-400 shadow-md shadow-blue-500/10"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              />
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                loading || !username || !password
                  ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
                  : "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 shadow-md hover:shadow-lg active:scale-95"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
            Demo Credentials
          </h3>
          
          <div className="space-y-3">
            {/* Admin */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3.5 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                👤 Admin
              </p>
              <p className="text-sm font-mono text-slate-800 dark:text-slate-200">
                <span className="block">admin</span>
                <span className="text-slate-500 dark:text-slate-400">admin123</span>
              </p>
            </div>

            {/* Institute */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3.5 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                🏫 Institute
              </p>
              <p className="text-sm font-mono text-slate-800 dark:text-slate-200">
                <span className="block">institute_pit</span>
                <span className="text-slate-500 dark:text-slate-400">institute123</span>
              </p>
            </div>

            {/* Industry */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3.5 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                🏢 Industry
              </p>
              <p className="text-sm font-mono text-slate-800 dark:text-slate-200">
                <span className="block">industry_ts</span>
                <span className="text-slate-500 dark:text-slate-400">industry123</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-6">
          Secure university placement management system
        </p>
      </div>
    </div>
  );
}