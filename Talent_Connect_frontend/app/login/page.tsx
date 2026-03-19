"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, Eye, EyeOff, X, Mail, Phone, User, ChevronRight, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { ThemeToggle } from "@/components2/ThemeToggle";
import { useAuth } from "@/lib/AuthProvider";
import { getDashboardRoute } from "@/lib/helper";
import { setCurrentRole, updateLoginUi } from "@/store/login";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

type LoginTab = "username" | "email" | "mobile";
type OtpStep = "input" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { login } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<LoginTab>("username");

  // Username/Password state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Email OTP state
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [emailStep, setEmailStep] = useState<OtpStep>("input");
  const [emailResendTimer, setEmailResendTimer] = useState(0);

  // Mobile OTP state
  const [mobile, setMobile] = useState("");
  const [mobileOtp, setMobileOtp] = useState(["", "", "", "", "", ""]);
  const [mobileStep, setMobileStep] = useState<OtpStep>("input");
  const [mobileResendTimer, setMobileResendTimer] = useState(0);

  // Shared state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  const emailOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const mobileOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Resend countdown ──
  useEffect(() => {
    if (emailResendTimer <= 0) return;
    const t = setTimeout(() => setEmailResendTimer((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [emailResendTimer]);

  useEffect(() => {
    if (mobileResendTimer <= 0) return;
    const t = setTimeout(() => setMobileResendTimer((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [mobileResendTimer]);

  // ── Tab switch cleanup ──
  const switchTab = (tab: LoginTab) => {
    setActiveTab(tab);
    setError("");
  };

  // ── Username login ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { username, password });
      login(res.data.user, res.data.access_token);
      if (res.data.user.is_passwordchanged === "N") {
        router.replace("/change-password");
      } else {
        router.replace(getDashboardRoute(res.data.user.role));
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  // ── Send OTP (email or mobile) ──
  const handleSendOtp = async (type: "email" | "mobile") => {
    const value = type === "email" ? email : mobile;
    if (!value) return;
    setOtpSending(true);
    setError("");
    try {
      await api.post("/auth/send-otp", { type, value });
      if (type === "email") {
        setEmailStep("otp");
        setEmailResendTimer(30);
        setTimeout(() => emailOtpRefs.current[0]?.focus(), 100);
      } else {
        setMobileStep("otp");
        setMobileResendTimer(30);
        setTimeout(() => mobileOtpRefs.current[0]?.focus(), 100);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || `Failed to send OTP to your ${type}`);
    } finally {
      setOtpSending(false);
    }
  };

  // ── Verify OTP ──
  const handleVerifyOtp = async (type: "email" | "mobile") => {
    const value = type === "email" ? email : mobile;
    const otp = (type === "email" ? emailOtp : mobileOtp).join("");
    if (otp.length !== 6) { setError("Please enter the complete 6-digit OTP"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/verify-otp", { type, value, otp });
      login(res.data.user, res.data.access_token);
      if (res.data.user.is_passwordchanged === "N") {
        router.replace("/change-password");
      } else {
        router.replace(getDashboardRoute(res.data.user.role));
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input helpers ──
  const handleOtpChange = (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (!/^\d*$/.test(value)) return;
    setter((prev) => {
      const next = [...prev];
      next[index] = value.slice(-1);
      return next;
    });
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent,
    index: number,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === "Backspace" && !(e.target as HTMLInputElement).value && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (
    e: React.ClipboardEvent,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    setter(pasted.split("").concat(Array(6 - pasted.length).fill("")));
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── OTP box renderer ──
  const OtpBoxes = ({
    otp,
    setOtp,
    refs,
    type,
  }: {
    otp: string[];
    setOtp: React.Dispatch<React.SetStateAction<string[]>>;
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    type: "email" | "mobile";
  }) => (
    <div className="flex gap-2 justify-between">
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleOtpChange(i, e.target.value, setOtp, refs)}
          onKeyDown={(e) => handleOtpKeyDown(e, i, refs)}
          onPaste={(e) => handleOtpPaste(e, setOtp, refs)}
          className="w-11 h-12 text-center text-lg font-bold bg-base-200 dark:bg-base-800 border-2 rounded-xl text-base-content focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 border-base-300 dark:border-base-700"
          style={{ borderColor: digit ? "hsl(var(--p))" : undefined }}
        />
      ))}
    </div>
  );

  useEffect(() => {
    return () => {
      dispatch(setCurrentRole(""));
      dispatch(updateLoginUi({ roleSelectModal: { open: false } }));
    };
  });

  const tabs: { id: LoginTab; label: string; icon: React.ReactNode }[] = [
    { id: "username", label: "Username", icon: <User size={14} /> },
    { id: "email", label: "Email", icon: <Mail size={14} /> },
    { id: "mobile", label: "Mobile", icon: <Phone size={14} /> },
  ];

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-base-200 dark:bg-base-950">
      {/* LEFT SIDE */}
      <div className="hidden lg:block lg:w-[52%] relative overflow-hidden">
        <div className="absolute inset-0 bg-base-100 dark:bg-base-900" />
        <div
          className="relative h-full flex flex-col items-center justify-center bg-primary"
          style={{ borderRadius: "0 4rem 6rem 0" }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, hsl(var(--pc) / 0.4) 0%, transparent 70%)" }}
            />
            <div
              className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-15"
              style={{ background: "radial-gradient(circle, hsl(var(--s) / 0.5) 0%, transparent 70%)" }}
            />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: "repeating-linear-gradient(45deg, hsl(var(--pc)) 0px, hsl(var(--pc)) 1px, transparent 1px, transparent 24px)" }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-8">
            <div
              className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl"
              style={{
                background: "hsl(var(--pc) / 0.15)",
                backdropFilter: "blur(20px)",
                border: "1.5px solid hsl(var(--pc) / 0.25)",
                boxShadow: "0 32px 64px hsl(var(--p) / 0.4), inset 0 1px 0 hsl(var(--pc) / 0.2)",
              }}
            >
              <GraduationCap size={60} className="text-primary-content drop-shadow-lg" strokeWidth={1.3} />
            </div>
            <div className="text-center">
              <h1
                className="text-5xl font-black text-primary-content tracking-tight leading-none"
                style={{ textShadow: "0 4px 24px hsl(var(--p) / 0.5)" }}
              >
                HUNAR
                <br />
                PUNJAB
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

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-16 bg-base-100 dark:bg-base-900">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-5 shadow-lg shadow-primary/30">
              <GraduationCap size={36} className="text-primary-content" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-black text-base-content">HUNAR PUNJAB</h1>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-base-content tracking-tight">Sign in</h2>
            <p className="mt-1.5 text-base-content/50 text-sm">
              Welcome back — let's pick up where you left off.
            </p>
          </div>

          {/* ── Tab Switcher ── */}
          <div className="flex gap-1 p-1 bg-base-200 dark:bg-base-800 rounded-xl mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${activeTab === tab.id
                  ? "bg-primary text-primary-content shadow-md shadow-primary/25"
                  : "text-base-content/50 hover:text-base-content"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── USERNAME / PASSWORD FORM ── */}
          {activeTab === "username" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
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

              <div>
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

              {error && (
                <div className="flex items-center gap-2.5 bg-error/10 border border-error/25 text-error text-sm px-4 py-3 rounded-xl">
                  <X size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="relative w-full h-12 bg-primary hover:brightness-110 text-primary-content font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden mt-2"
              >
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? "Signing in..." : "Sign In"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
              </button>
            </form>
          )}

          {/* ── EMAIL OTP FORM ── */}
          {activeTab === "email" && (
            <div className="space-y-5">
              {emailStep === "input" ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-base-content/60 mb-1.5 ml-1 tracking-wide uppercase">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        placeholder="Enter your registered email"
                        autoFocus
                        className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-4 py-3.5 pr-12 text-sm text-base-content placeholder:text-base-content/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        onKeyDown={(e) => e.key === "Enter" && email && handleSendOtp("email")}
                      />
                      <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                    </div>
                    <p className="text-xs text-base-content/40 mt-2 ml-1">
                      We'll send a 6-digit OTP to this email address.
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2.5 bg-error/10 border border-error/25 text-error text-sm px-4 py-3 rounded-xl">
                      <X size={16} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!email || otpSending}
                    onClick={() => handleSendOtp("email")}
                    className="relative w-full h-12 bg-primary hover:brightness-110 text-primary-content font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2.5">
                      {otpSending ? (
                        <><Loader2 size={18} className="animate-spin" /> Sending OTP...</>
                      ) : (
                        <>Send OTP <ChevronRight size={16} /></>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                  </button>
                </>
              ) : (
                <>
                  {/* OTP step */}
                  <div className="flex items-center gap-3 p-3 bg-success/10 border border-success/25 rounded-xl">
                    <CheckCircle2 size={16} className="text-success shrink-0" />
                    <p className="text-xs text-success font-medium">
                      OTP sent to <span className="font-bold">{email}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => { setEmailStep("input"); setEmailOtp(["", "", "", "", "", ""]); setError(""); }}
                      className="ml-auto text-xs text-base-content/40 hover:text-base-content underline underline-offset-2 transition-colors"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-base-content/60 mb-3 ml-1 tracking-wide uppercase">
                      Enter OTP
                    </label>
                    <OtpBoxes otp={emailOtp} setOtp={setEmailOtp} refs={emailOtpRefs} type="email" />
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-base-content/40 ml-1">OTP expires in 10 minutes</p>
                      {emailResendTimer > 0 ? (
                        <span className="text-xs text-base-content/40">Resend in {emailResendTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setEmailOtp(["", "", "", "", "", ""]); handleSendOtp("email"); }}
                          className="text-xs text-primary font-semibold hover:underline underline-offset-2 transition-colors"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2.5 bg-error/10 border border-error/25 text-error text-sm px-4 py-3 rounded-xl">
                      <X size={16} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={loading || emailOtp.join("").length < 6}
                    onClick={() => handleVerifyOtp("email")}
                    className="relative w-full h-12 bg-primary hover:brightness-110 text-primary-content font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2.5">
                      {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : "Verify & Sign In"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── MOBILE OTP FORM ── */}
          {activeTab === "mobile" && (
            <div className="space-y-5">
              {mobileStep === "input" ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-base-content/60 mb-1.5 ml-1 tracking-wide uppercase">
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      {/* Country code badge */}
                      <div className="flex items-center gap-1.5 px-3 py-3.5 bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl text-sm text-base-content/70 font-semibold shrink-0 select-none">
                        🇮🇳 +91
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                          placeholder="10-digit mobile number"
                          autoFocus
                          className="w-full bg-base-200 dark:bg-base-800 border border-base-300 dark:border-base-700 rounded-xl px-4 py-3.5 pr-12 text-sm text-base-content placeholder:text-base-content/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                          onKeyDown={(e) => e.key === "Enter" && mobile.length === 10 && handleSendOtp("mobile")}
                        />
                        <Phone size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                      </div>
                    </div>
                    <p className="text-xs text-base-content/40 mt-2 ml-1">
                      We'll send a 6-digit OTP via SMS.
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2.5 bg-error/10 border border-error/25 text-error text-sm px-4 py-3 rounded-xl">
                      <X size={16} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={mobile.length !== 10 || otpSending}
                    onClick={() => handleSendOtp("mobile")}
                    className="relative w-full h-12 bg-primary hover:brightness-110 text-primary-content font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2.5">
                      {otpSending ? (
                        <><Loader2 size={18} className="animate-spin" /> Sending OTP...</>
                      ) : (
                        <>Send OTP <ChevronRight size={16} /></>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                  </button>
                </>
              ) : (
                <>
                  {/* OTP step */}
                  <div className="flex items-center gap-3 p-3 bg-success/10 border border-success/25 rounded-xl">
                    <CheckCircle2 size={16} className="text-success shrink-0" />
                    <p className="text-xs text-success font-medium">
                      OTP sent to <span className="font-bold">+91 {mobile}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => { setMobileStep("input"); setMobileOtp(["", "", "", "", "", ""]); setError(""); }}
                      className="ml-auto text-xs text-base-content/40 hover:text-base-content underline underline-offset-2 transition-colors"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-base-content/60 mb-3 ml-1 tracking-wide uppercase">
                      Enter OTP
                    </label>
                    <OtpBoxes otp={mobileOtp} setOtp={setMobileOtp} refs={mobileOtpRefs} type="mobile" />
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-base-content/40 ml-1">OTP expires in 10 minutes</p>
                      {mobileResendTimer > 0 ? (
                        <span className="text-xs text-base-content/40">Resend in {mobileResendTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setMobileOtp(["", "", "", "", "", ""]); handleSendOtp("mobile"); }}
                          className="text-xs text-primary font-semibold hover:underline underline-offset-2 transition-colors"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2.5 bg-error/10 border border-error/25 text-error text-sm px-4 py-3 rounded-xl">
                      <X size={16} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={loading || mobileOtp.join("").length < 6}
                    onClick={() => handleVerifyOtp("mobile")}
                    className="relative w-full h-12 bg-primary hover:brightness-110 text-primary-content font-semibold text-sm rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2.5">
                      {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : "Verify & Sign In"}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                  </button>
                </>
              )}
            </div>
          )}

          <p className="text-center text-base-content/30 text-xs mt-10">
            © {new Date().getFullYear()} HUNAR PUNJAB • All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}