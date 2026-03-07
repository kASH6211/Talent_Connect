"use client";
import {
  Wrench,
  BookOpen,
  Lightbulb,
  GraduationCap,
  HeartPulse,
  Award,
} from "lucide-react";
import { useRouter } from "next/navigation";

const institutes = [
  {
    icon: Wrench,
    name: "ITI",
    gov: 137,
    pvt: 183,
    students: 35150,
    courses: 69,
  },
  {
    icon: BookOpen,
    name: "Polytechnic",
    gov: 26,
    pvt: 66,
    students: 2415,
    courses: 30,
  },
  {
    icon: Lightbulb,
    name: "Skilling & Vocational Institutes",
    gov: "Coming Soon",
    pvt: "Coming Soon",
  },
  {
    icon: GraduationCap,
    name: "Engineering College",
    gov: "Coming Soon",
    pvt: "Coming Soon",
  },
  {
    icon: HeartPulse,
    name: "Medical College",
    gov: "Coming Soon",
    pvt: "Coming Soon",
  },
  {
    icon: Award,
    name: "Professional Degree College",
    gov: "Coming Soon",
    pvt: "Coming Soon",
  },
];

const InstitutesSection = () => {
  const router = useRouter();

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden" id="institutes">
      {/* Background Decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full mb-6 shadow-sm animate-fade-in-down">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Government of Punjab</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4 tracking-tight">
            Explore Punjab Institutes
          </h2>
          <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
          {institutes.map((inst, index) => {
            const Icon = inst.icon;

            return (
              <div
                key={inst.name}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={
                  inst.name === "ITI" || inst.name === "Polytechnic"
                    ? () => {
                      router.push(`/search-institutes?type=${inst.name}`);
                    }
                    : undefined
                }
                className={`group relative overflow-hidden rounded-[1.5rem] bg-white shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-100 animate-fade-in-up ${inst.name === "ITI" || inst.name === "Polytechnic"
                  ? "cursor-pointer"
                  : ""
                  }`}
              >
                {/* Accent Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Top Section */}
                <div className="p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 mx-auto group-hover:bg-primary transition-all duration-500 shadow-inner">
                    <Icon className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-500" />
                  </div>

                  <h3 className="text-slate-800 font-bold text-xl leading-tight mb-2 group-hover:text-primary transition-colors">
                    {inst.name}
                  </h3>
                  <div className="w-8 h-1 bg-slate-100 mx-auto rounded-full group-hover:bg-primary/20 transition-colors"></div>
                </div>

                {/* Info Section (Integrated look) */}
                <div className="relative h-20 w-full overflow-hidden bg-white border-t border-slate-50">
                  {/* Default View (Counter) */}
                  <div className="absolute inset-0 flex items-center justify-center gap-10 transition-all duration-500 ease-in-out group-hover:opacity-0 group-hover:-translate-y-8">
                    <div className="text-center">
                      <p className="text-xl font-bold text-primary">{inst.gov}</p>
                      <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Govt.</p>
                    </div>

                    <div className="h-6 w-px bg-slate-100"></div>

                    <div className="text-center">
                      <p className="text-xl font-bold text-primary">{inst.pvt}</p>
                      <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Pvt.</p>
                    </div>
                  </div>

                  {/* Hover View (Detail) */}
                  <div className="absolute inset-0 flex items-center justify-center gap-8 bg-primary px-6 translate-y-full transition-all duration-500 ease-in-out group-hover:translate-y-0">
                    {inst.students ? (
                      <>
                        <div className="text-center">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-white/60 mb-0.5">Students</p>
                          <p className="text-base font-bold text-white italic tracking-wider">
                            {inst.students.toLocaleString()}
                          </p>
                        </div>
                        <div className="w-px h-5 bg-white/20"></div>
                        <div className="text-center">
                          <p className="text-[9px] uppercase tracking-widest font-bold text-white/60 mb-0.5">Courses</p>
                          <p className="text-base font-bold text-white italic tracking-wider">
                            {inst.courses}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full border-2 border-dashed border-white/30 animate-spin"></div>
                        <span className="text-sm font-bold text-secondary tracking-[0.2em] uppercase italic">Coming Soon</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in-up {
            opacity: 0;
            animation: fadeInUp 0.6s ease-out forwards;
          }

          .animate-fade-in-down {
            opacity: 0;
            animation: fadeInDown 0.6s ease-out forwards;
          }
        `}
      </style>
    </section>
  );
};

export default InstitutesSection;
