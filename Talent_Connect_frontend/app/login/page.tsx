"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, Eye, EyeOff, X, LogIn } from "lucide-react";
import api from "@/lib/api";
import { clearAuthCache } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components2/ThemeToggle";
import { fa } from "zod/locales";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getDashboardRoute = (role: string) => {
    switch (role) {
      case "superadmin":
        return "/admin/dashboard";
      case "institute":
        return "/institute/dashboard";
      case "industry":
        return "/find-institutes";
      default:
        return "/";
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username, password });

      clearAuthCache();
      localStorage.setItem("tc_token", res.data.access_token);
      router.push(getDashboardRoute(res?.data?.user?.role));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleFastTrackLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.get(
        "https://fasttrack.punjab.gov.in/testportalnode/api/talent-portal/getSSOLoginUrl?returnUrl=http://localhost:3000/",
      );
      console.log("FastTrack SSO URL response:", res);
    } catch (err: any) {
      setError(err?.response?.data?.message || "FastTrack login failed");
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

      {/* LEFT SIDE — fixed leftover gray edges */}
      <div className="hidden lg:block lg:w-[52%] relative overflow-hidden">
        {/* Fill the rounded corner cutouts with the same color as right side form */}
        <div className="absolute inset-0 bg-base-100 dark:bg-base-900" />

        {/* Actual blue panel with radius */}
        <div
          className="relative h-full flex flex-col items-center justify-center bg-primary"
          style={{ borderRadius: "0 4rem 6rem 0" }}
        >
          {/* Your existing glows / overlays */}
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
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, hsl(var(--pc)) 0px, hsl(var(--pc)) 1px, transparent 1px, transparent 24px)",
              }}
            />
          </div>

          {/* Center logo + text + pills — exactly the same as before */}
          <div className="relative z-10 flex flex-col items-center gap-8">
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

            <div className="text-center">
              <h1
                className="text-5xl font-black text-primary-content tracking-tight leading-none"
                style={{ textShadow: "0 4px 24px hsl(var(--p) / 0.5)" }}
              >
                HUNAR
                <br />
                Punjab
              </h1>
              <div className="mt-4 w-12 h-1 rounded-full bg-primary-content/30 mx-auto" />
            </div>

            <p className="text-primary-content/70 text-base max-w-[240px] text-center leading-relaxed">
              Your bridge between talent and opportunity.
            </p>
          </div>

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
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-16 bg-base-100">
        {/* ── Scoped styles ── */}
        <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .lp-root { font-family: 'Plus Jakarta Sans', sans-serif; }

    @keyframes lp-in {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes lp-shimmer {
      from { transform: translateX(-100%); }
      to   { transform: translateX(100%); }
    }
    @keyframes lp-shake {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(-5px); }
      40%     { transform: translateX(5px); }
      60%     { transform: translateX(-3px); }
      80%     { transform: translateX(3px); }
    }

    .lp-in    { animation: lp-in .5s cubic-bezier(.22,1,.36,1) both; }
    .lp-d1    { animation-delay: .06s; }
    .lp-d2    { animation-delay: .12s; }
    .lp-d3    { animation-delay: .18s; }
    .lp-d4    { animation-delay: .24s; }
    .lp-d5    { animation-delay: .30s; }

    .lp-error-shake { animation: lp-shake .4s ease; }

    /* ── input focus ring uses primary ── */
    .lp-input {
      width: 100%;
      background: hsl(var(--b1));
      border: 1.5px solid hsl(var(--bc) / 0.22);
      border-radius: 12px;
      padding: 13px 16px;
      font-size: 14px;
      color: hsl(var(--bc));
      outline: none;
      transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
      font-family: 'Plus Jakarta Sans', sans-serif;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .lp-input::placeholder { color: hsl(var(--bc) / 0.3); }
    .lp-input:hover:not(:focus) {
      border-color: hsl(var(--bc) / 0.38);
    }
    .lp-input:focus {
      border-color: #605dff;
      background: hsl(var(--b1));
      box-shadow: 0 0 0 3px rgba(96,93,255,0.15), 0 1px 3px rgba(0,0,0,0.06);
    }

    /* ── Primary button ── */
    .lp-btn-primary {
      position: relative; overflow: hidden;
      height: 48px;
      background: #605dff;
      color: #fff;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      border: none; cursor: pointer;
      transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
      box-shadow: 0 4px 16px rgba(96,93,255,0.35);
    }
    .lp-btn-primary:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(96,93,255,0.45);
    }
    .lp-btn-primary:not(:disabled):active { transform: translateY(0); }
    .lp-btn-primary:disabled { opacity: .55; cursor: not-allowed; }
    .lp-btn-primary .lp-sheen {
      position:absolute; inset:0;
      background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%);
      transform: translateX(-100%);
      transition: transform .65s ease;
    }
    .lp-btn-primary:not(:disabled):hover .lp-sheen { transform: translateX(100%); }

    /* ── FastTrack button ── */
    .lp-btn-ft {
      position: relative; overflow: hidden;
      height: 48px;
      background: #d62c27;
      color: #fff;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      border: none; cursor: pointer;
      transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
      box-shadow: 0 4px 16px rgba(214,44,39,0.32);
    }
    .lp-btn-ft:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(214,44,39,0.42);
    }
    .lp-btn-ft:not(:disabled):active { transform: translateY(0); }
    .lp-btn-ft:disabled { opacity: .55; cursor: not-allowed; }
    .lp-btn-ft .lp-sheen {
      position:absolute; inset:0;
      background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
      transform: translateX(-100%);
      transition: transform .65s ease;
    }
    .lp-btn-ft:not(:disabled):hover .lp-sheen { transform: translateX(100%); }

    /* eye btn */
    .lp-eye {
      position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer;
      color: hsl(var(--bc) / 0.35);
      transition: color .15s ease;
      display: flex; align-items: center;
      padding: 0;
    }
    .lp-eye:hover { color: #605dff; }

    /* divider */
    .lp-divider {
      display: flex; align-items: center; gap: 12px;
      color: hsl(var(--bc) / 0.25);
      font-size: 11px; font-weight: 600; text-transform: uppercase;
      letter-spacing: .1em;
    }
    .lp-divider::before,
    .lp-divider::after {
      content: ''; flex: 1; height: 1px;
      background: hsl(var(--bc) / 0.1);
    }
  `}</style>

        <div className="lp-root w-full max-w-[400px]">
          {/* ── Mobile logo ── */}
          <div className="lp-in lg:hidden text-center mb-10">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{
                background: "#605dff",
                boxShadow: "0 8px 24px rgba(96,93,255,0.35)",
              }}
            >
              <GraduationCap size={30} color="#fff" strokeWidth={1.75} />
            </div>
            <h1
              className="text-2xl font-extrabold"
              style={{ color: "hsl(var(--bc))" }}
            >
              HUNAR Punjab
            </h1>
          </div>

          {/* ── Heading ── */}
          <div className="lp-in lp-d1 mb-8">
            {/* Colored accent line */}
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-6 h-[3px] rounded-full"
                style={{ background: "#605dff" }}
              />
              <span
                className="text-xs font-bold uppercase tracking-[.14em]"
                style={{ color: "#605dff" }}
              >
                Welcome back
              </span>
            </div>
            <h2
              className="text-[28px] font-extrabold tracking-tight"
              style={{ color: "hsl(var(--bc))" }}
            >
              Sign In
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: "hsl(var(--bc) / 0.45)" }}
            >
              Let's pick up where you left off.
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div className="lp-in lp-d2">
              <label
                className="block text-[11px] font-bold uppercase tracking-[.12em] mb-1.5 ml-0.5"
                style={{ color: "hsl(var(--bc) / 0.5)" }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
                className="lp-input"
              />
            </div>

            {/* Password */}
            <div className="lp-in lp-d3">
              <label
                className="block text-[11px] font-bold uppercase tracking-[.12em] mb-1.5 ml-0.5"
                style={{ color: "hsl(var(--bc) / 0.5)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="lp-input"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="lp-eye"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="lp-error-shake flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "rgba(214,44,39,0.07)",
                  border: "1px solid rgba(214,44,39,0.22)",
                  color: "#d62c27",
                }}
              >
                <X size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="lp-in lp-d4 pt-1 space-y-3">
              {/* Sign In */}
              <button
                type="submit"
                disabled={loading}
                className="lp-btn-primary w-full"
              >
                <div className="lp-sheen" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" /> Signing in…
                    </>
                  ) : (
                    <>
                      <LogIn size={17} /> Sign In
                    </>
                  )}
                </span>
              </button>

              {/* Divider */}
              <div className="lp-divider">or</div>

              {/* FastTrack */}
              <button
                type="button"
                disabled={loading}
                onClick={handleFastTrackLogin}
                className="lp-btn-ft w-full"
              >
                <div className="lp-sheen" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" /> Processing…
                    </>
                  ) : (
                    <>
                      {/* Lightning bolt icon for FastTrack */}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      Login with FastTrack
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          {/* ── Footer ── */}
          <p
            className="lp-in lp-d5 text-center text-[11px] mt-10"
            style={{ color: "hsl(var(--bc) / 0.28)" }}
          >
            © {new Date().getFullYear()} HUNAR Punjab • All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}
