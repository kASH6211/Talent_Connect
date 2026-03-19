"use client";

import { useEffect, useRef, useState } from "react";
import {
    GraduationCap,
    Target,
    Eye,
    Heart,
    Users,
    Lightbulb,
    Shield,
    TrendingUp,
    MapPin,
    Mail,
    Phone,
    ArrowRight,
    CheckCircle2,
    Building2,
    Briefcase,
    Star,
} from "lucide-react";

// ── Animated counter hook ──────────────────────────────────────────────────
function useCounter(target: number, duration = 2000, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(ease * target));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(target);
        };
        requestAnimationFrame(step);
    }, [start, target, duration]);
    return count;
}

// ── Intersection observer hook ──────────────────────────────────────────────
function useInView(threshold = 0.2) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setInView(true); },
            { threshold }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

// ── Stat card ───────────────────────────────────────────────────────────────
function StatCard({
    target, suffix, label, start,
}: { target: number; suffix: string; label: string; start: boolean }) {
    const count = useCounter(target, 2000, start);
    return (
        <div className="flex flex-col items-center gap-2 p-6 bg-base-100 dark:bg-base-800 rounded-2xl border border-base-200 dark:border-base-700 shadow-sm">
            <span className="text-4xl font-black text-primary tabular-nums">
                {count.toLocaleString()}
                {suffix}
            </span>
            <span className="text-sm text-base-content/60 font-medium text-center leading-tight">{label}</span>
        </div>
    );
}

// ── Value card ──────────────────────────────────────────────────────────────
function ValueCard({
    icon: Icon, title, desc, delay,
}: { icon: React.ElementType; title: string; desc: string; delay: number }) {
    return (
        <div
            className="group flex flex-col gap-4 p-6 bg-base-100 dark:bg-base-800 rounded-2xl border border-base-200 dark:border-base-700 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 group-hover:bg-primary group-hover:scale-110 transition-all duration-300"
            >
                <Icon size={22} className="text-primary group-hover:text-primary-content transition-colors duration-300" strokeWidth={1.8} />
            </div>
            <div>
                <h4 className="font-bold text-base-content text-base mb-1">{title}</h4>
                <p className="text-sm text-base-content/55 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

// ── Team card ───────────────────────────────────────────────────────────────
function TeamCard({
    name, role, initials, color, delay,
}: { name: string; role: string; initials: string; color: string; delay: number }) {
    return (
        <div
            className="group flex flex-col items-center gap-4 p-6 bg-base-100 dark:bg-base-800 rounded-2xl border border-base-200 dark:border-base-700 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-md group-hover:scale-105 transition-transform duration-300"
                style={{ background: color }}
            >
                {initials}
            </div>
            <div className="text-center">
                <p className="font-bold text-base-content text-base">{name}</p>
                <p className="text-xs text-base-content/50 mt-0.5">{role}</p>
            </div>
        </div>
    );
}

// ── Main About Page ─────────────────────────────────────────────────────────
export default function AboutPage() {
    const statsSection = useInView(0.3);

    const stats = [
        { target: 5000, suffix: "+", label: "Students Enrolled" },
        { target: 120, suffix: "+", label: "Partner Institutes" },
        { target: 350, suffix: "+", label: "Industry Partners" },
        { target: 22, suffix: "", label: "Districts Covered" },
    ];

    const values = [
        {
            icon: Lightbulb,
            title: "Skill-First Approach",
            desc: "We believe practical skills define career readiness. Every programme is designed around industry-relevant competencies, not just certifications.",
        },
        {
            icon: Shield,
            title: "Transparency & Trust",
            desc: "From placement records to institute credentials, we maintain full transparency so students, institutes, and industry can make informed decisions.",
        },
        {
            icon: Heart,
            title: "Inclusive Growth",
            desc: "Hunar Punjab is built to serve every corner of Punjab — rural and urban — giving equal access to opportunity regardless of geography.",
        },
        {
            icon: TrendingUp,
            title: "Continuous Improvement",
            desc: "We iterate constantly. Student feedback, employer insights, and data analytics shape how the platform evolves month after month.",
        },
        {
            icon: Users,
            title: "Community First",
            desc: "We nurture a thriving ecosystem where students, educators, and employers collaborate — not just connect — for long-term mutual success.",
        },
        {
            icon: Star,
            title: "Excellence in Delivery",
            desc: "Quality benchmarks are set high. We work only with certified institutes and vetted industry partners to guarantee a world-class experience.",
        },
    ];

    const team = [
        { name: "Dr. Arjun Mehta", role: "Founder & Director", initials: "AM", color: "#3B6FEB" },
        { name: "Simran Kaur", role: "Head of Institute Relations", initials: "SK", color: "#8B5CF6" },
        { name: "Rohit Sharma", role: "Industry Partnership Lead", initials: "RS", color: "#059669" },
        { name: "Priya Nanda", role: "Technology & Product", initials: "PN", color: "#DC2626" },
    ];

    const pillars = [
        { icon: Building2, label: "Institutes", desc: "Verified training centres across Punjab" },
        { icon: Briefcase, label: "Industry", desc: "Employers offering real placement opportunities" },
        { icon: GraduationCap, label: "Students", desc: "Youth building future-ready careers" },
    ];

    return (
        <div className="min-h-screen bg-base-200 dark:bg-base-950">

            {/* ── HERO ── */}
            <section className="relative overflow-hidden bg-primary">
                {/* background overlays */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-10"
                        style={{ background: "radial-gradient(circle, hsl(var(--pc) / 0.6) 0%, transparent 70%)" }}
                    />
                    <div
                        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
                        style={{ background: "radial-gradient(circle, hsl(var(--s) / 0.5) 0%, transparent 70%)" }}
                    />
                    <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage:
                                "repeating-linear-gradient(45deg, hsl(var(--pc)) 0px, hsl(var(--pc)) 1px, transparent 1px, transparent 28px)",
                        }}
                    />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 lg:py-32 text-center">
                    {/* badge */}
                    <span
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest text-primary-content/80 border border-primary-content/20 mb-6"
                        style={{ background: "hsl(var(--pc) / 0.12)" }}
                    >
                        <GraduationCap size={13} strokeWidth={2} />
                        ABOUT HUNAR PUNJAB
                    </span>

                    <h1
                        className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary-content leading-tight tracking-tight mb-6"
                        style={{ textShadow: "0 4px 32px hsl(var(--p) / 0.5)" }}
                    >
                        Bridging Talent
                        <br />
                        <span className="opacity-80">& Opportunity</span>
                        <br />
                        Across Punjab
                    </h1>

                    <p className="text-primary-content/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                        Hunar Punjab is the Government of Punjab's unified skill development
                        platform — connecting aspiring youth with certified institutes and
                        industry-leading employers to build a workforce ready for tomorrow.
                    </p>

                    {/* pillars */}
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                        {pillars.map(({ icon: Icon, label, desc }) => (
                            <div
                                key={label}
                                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-primary-content/90 border border-primary-content/15"
                                style={{ background: "hsl(var(--pc) / 0.1)" }}
                            >
                                <Icon size={16} className="opacity-80" strokeWidth={1.8} />
                                <div className="text-left">
                                    <p className="text-xs font-bold leading-none">{label}</p>
                                    <p className="text-[10px] opacity-60 leading-tight mt-0.5">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section ref={statsSection.ref} className="max-w-5xl mx-auto px-6 -mt-10 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s) => (
                        <StatCard key={s.label} {...s} start={statsSection.inView} />
                    ))}
                </div>
            </section>

            {/* ── MISSION + VISION ── */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Mission */}
                    <div className="relative overflow-hidden rounded-3xl bg-primary p-8 lg:p-10">
                        <div
                            className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-10"
                            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
                        />
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-content/10 mb-6">
                            <Target size={24} className="text-primary-content" strokeWidth={1.8} />
                        </div>
                        <h3 className="text-2xl font-black text-primary-content mb-4">Our Mission</h3>
                        <p className="text-primary-content/75 leading-relaxed text-sm">
                            To democratise access to quality skill development across every district of
                            Punjab by building a seamless digital bridge between motivated youth,
                            accredited training providers, and forward-looking employers — empowering
                            every individual to unlock their full economic potential.
                        </p>
                        <ul className="mt-6 space-y-2.5">
                            {[
                                "Accessible skilling for rural & urban youth",
                                "Industry-aligned curriculum design",
                                "Transparent placement & outcome tracking",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-2.5 text-xs text-primary-content/70">
                                    <CheckCircle2 size={14} className="text-primary-content/80 mt-0.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Vision */}
                    <div className="relative overflow-hidden rounded-3xl bg-base-100 dark:bg-base-800 border border-base-200 dark:border-base-700 p-8 lg:p-10">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-secondary/10 mb-6">
                            <Eye size={24} className="text-secondary" strokeWidth={1.8} />
                        </div>
                        <h3 className="text-2xl font-black text-base-content mb-4">Our Vision</h3>
                        <p className="text-base-content/60 leading-relaxed text-sm">
                            To make Punjab the skill capital of India — a state where no young person is
                            left behind due to lack of opportunity, information, or access. We envision a
                            thriving, data-driven ecosystem where talent is discovered, nurtured, and
                            placed at scale, driving economic growth for generations to come.
                        </p>
                        {/* decorative stat */}
                        <div className="mt-8 flex items-center gap-4 p-4 bg-secondary/8 rounded-xl border border-secondary/15">
                            <span className="text-3xl font-black text-secondary">2030</span>
                            <p className="text-xs text-base-content/55 leading-relaxed">
                                Target year to skill <strong className="text-base-content/80">1 million</strong> youth
                                across all 22 districts of Punjab
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── WHO WE ARE ── */}
            <section className="bg-base-100 dark:bg-base-900 border-y border-base-200 dark:border-base-700 py-20">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* text side */}
                        <div>
                            <span className="text-xs font-bold tracking-widest text-primary uppercase mb-3 block">
                                Who We Are
                            </span>
                            <h2 className="text-3xl lg:text-4xl font-black text-base-content leading-tight mb-5">
                                A Government Initiative <br />
                                <span className="text-primary">Built for Punjab's Youth</span>
                            </h2>
                            <p className="text-base-content/60 leading-relaxed text-sm mb-5">
                                Launched under the Department of Technical Education & Industrial Training,
                                Government of Punjab, Hunar Punjab is not just a portal — it is a
                                movement. We work with district administration, industry bodies, and
                                national skill development missions to create a unified, verifiable
                                skilling ecosystem.
                            </p>
                            <p className="text-base-content/60 leading-relaxed text-sm">
                                Whether you're a student exploring your first vocational course, an
                                institute seeking more enrolments, or a company looking to hire
                                work-ready talent — Hunar Punjab is your single window to Punjab's
                                skill economy.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                {[
                                    "NSDC Aligned",
                                    "PMKVY Compliant",
                                    "ISO 9001 Institutes",
                                    "Live Placement Tracking",
                                ].map((badge) => (
                                    <span
                                        key={badge}
                                        className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                                    >
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* visual side — stacked cards */}
                        <div className="flex flex-col gap-4">
                            {[
                                {
                                    icon: Building2,
                                    title: "For Institutes",
                                    desc: "Get verified, manage courses, track enrolments, and showcase placement outcomes on a trusted government platform.",
                                    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
                                },
                                {
                                    icon: Briefcase,
                                    title: "For Industry",
                                    desc: "Post requirements, discover pre-screened talent, participate in campus recruitment drives, and fulfil your CSR skilling mandates.",
                                    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
                                },
                                {
                                    icon: GraduationCap,
                                    title: "For Students",
                                    desc: "Browse certified courses, apply for scholarships, track your learning journey, and connect directly with hiring companies.",
                                    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20",
                                },
                            ].map(({ icon: Icon, title, desc, color }) => (
                                <div
                                    key={title}
                                    className="flex gap-4 p-5 bg-base-200 dark:bg-base-800 rounded-2xl border border-base-300 dark:border-base-700 hover:border-primary/30 transition-colors duration-200"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                                        <Icon size={20} strokeWidth={1.8} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-base-content mb-1">{title}</p>
                                        <p className="text-xs text-base-content/55 leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── VALUES ── */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <div className="text-center mb-12">
                    <span className="text-xs font-bold tracking-widest text-primary uppercase mb-3 block">
                        Our Core Values
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-black text-base-content leading-tight">
                        The Principles That Drive Us
                    </h2>
                    <p className="mt-3 text-base-content/50 text-sm max-w-lg mx-auto">
                        Every decision, feature, and partnership at Hunar Punjab is anchored
                        by these six founding principles.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {values.map((v, i) => (
                        <ValueCard key={v.title} {...v} delay={i * 60} />
                    ))}
                </div>
            </section>

            {/* ── TEAM ── */}
            <section className="bg-base-100 dark:bg-base-900 border-y border-base-200 dark:border-base-700 py-20">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold tracking-widest text-primary uppercase mb-3 block">
                            The Team
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-black text-base-content">
                            People Behind the Platform
                        </h2>
                        <p className="mt-3 text-base-content/50 text-sm max-w-lg mx-auto">
                            A passionate cross-functional team of educators, technologists, and
                            policy experts committed to Punjab's skill revolution.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {team.map((t, i) => (
                            <TeamCard key={t.name} {...t} delay={i * 80} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CONTACT / CTA ── */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <div className="relative overflow-hidden rounded-3xl bg-primary p-8 lg:p-14 text-center">
                    {/* bg decoration */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div
                            className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-10"
                            style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
                        />
                        <div
                            className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-10"
                            style={{ background: "radial-gradient(circle, hsl(var(--s)) 0%, transparent 70%)" }}
                        />
                    </div>

                    <div className="relative z-10">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest text-primary-content/80 border border-primary-content/20 mb-5"
                            style={{ background: "hsl(var(--pc) / 0.12)" }}>
                            GET IN TOUCH
                        </span>

                        <h2 className="text-3xl lg:text-4xl font-black text-primary-content mb-4 leading-tight">
                            Ready to Join the
                            <br />Hunar Punjab Ecosystem?
                        </h2>
                        <p className="text-primary-content/70 text-sm max-w-xl mx-auto mb-10 leading-relaxed">
                            Whether you're a student ready to upskill, an institute looking to partner,
                            or an employer seeking talent — we'd love to hear from you.
                        </p>

                        {/* contact pills */}
                        <div className="flex flex-wrap justify-center gap-4 mb-10">
                            {[
                                { icon: Mail, label: "info@hunarpunjab.gov.in" },
                                { icon: Phone, label: "+91 172-XXXX-XXXX" },
                                { icon: MapPin, label: "Chandigarh, Punjab, India" },
                            ].map(({ icon: Icon, label }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-primary-content/20 text-primary-content/85 text-xs font-medium"
                                    style={{ background: "hsl(var(--pc) / 0.1)" }}
                                >
                                    <Icon size={14} strokeWidth={1.8} className="opacity-70" />
                                    {label}
                                </div>
                            ))}
                        </div>

                        {/* CTA buttons */}
                        <div className="flex flex-wrap justify-center gap-3">
                            <button className="flex items-center gap-2 px-6 py-3 bg-primary-content text-primary font-bold text-sm rounded-xl hover:opacity-90 transition-opacity shadow-lg">
                                Enrol as Student
                                <ArrowRight size={16} />
                            </button>
                            <button
                                className="flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl border border-primary-content/30 text-primary-content hover:bg-primary-content/10 transition-colors"
                            >
                                Partner With Us
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER NOTE ── */}
            <div className="text-center pb-10 text-xs text-base-content/30">
                © {new Date().getFullYear()} Hunar Punjab — Department of Technical Education &amp; Industrial Training, Government of Punjab
            </div>
        </div>
    );
}