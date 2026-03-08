"use client";

import {
  Wrench,
  BookOpen,
  Lightbulb,
  GraduationCap,
  HeartPulse,
  Award,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const institutes = [
  {
    icon: Wrench,
    name: "ITI",
    gov: 137,
    pvt: 183,
    students: 35150,
    courses: 69,
    ref: "P-ITI-01",
  },
  {
    icon: BookOpen,
    name: "Polytechnic",
    gov: 26,
    pvt: 66,
    students: 2415,
    courses: 30,
    ref: "P-POL-02",
  },
  {
    icon: Lightbulb,
    name: "Skilling & Vocational",
    gov: "-",
    pvt: "-",
    ref: "P-SKL-03",
  },
  {
    icon: GraduationCap,
    name: "Engineering College",
    gov: "-",
    pvt: "-",
    ref: "P-ENG-04",
  },
  {
    icon: HeartPulse,
    name: "Medical College",
    gov: "-",
    pvt: "-",
    ref: "P-MED-05",
  },
  {
    icon: Award,
    name: "Degree College",
    gov: "-",
    pvt: "-",
    ref: "P-DEG-06",
  },
];

const InstitutesSection = () => {
  const router = useRouter();

  return (
    <section className="py-24 relative overflow-hidden" id="institutes">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg mb-6 shadow-sm"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Resource Directory</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight uppercase leading-[0.9]">
            Empowering <span className="text-primary italic">Punjab</span> <br /> Through Knowledge
          </h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
          {institutes.map((inst, index) => {
            const Icon = inst.icon;
            const isActive = inst.gov !== "-";

            return (
              <motion.div
                key={inst.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                onClick={isActive ? () => router.push(`/search-institutes?type=${inst.name}`) : undefined}
                className={`group relative min-h-[320px] bg-white border border-slate-200 rounded-xl p-8 transition-all duration-500 overflow-hidden flex flex-col shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(30,64,175,0.15)] hover:border-primary/20 ${isActive ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {/* Reference Identifier & Icon */}
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center transition-all duration-500 shadow-sm ${isActive ? 'group-hover:bg-primary group-hover:shadow-primary/30' : ''}`}>
                    <Icon className={`w-6 h-6 text-primary transition-all duration-500 ${isActive ? 'group-hover:text-white group-hover:scale-110' : ''}`} />
                  </div>
                  <span className="text-[9px] font-bold font-mono text-slate-300 uppercase tracking-widest leading-none mt-1">
                    {inst.ref}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className={`text-lg font-black mb-2 leading-tight uppercase transition-colors tracking-tight text-slate-900 ${isActive ? 'group-hover:text-primary' : ''}`}>
                    {inst.name}
                  </h3>
                  <div className={`h-0.5 w-6 bg-slate-100 transition-all duration-500 ${isActive ? 'group-hover:w-12 group-hover:bg-primary/30' : ''}`} />
                </div>

                {/* Technical Statistics Grid */}
                <div className="grid grid-cols-2 border-t border-slate-50 pt-6 gap-x-6">
                  <div className="space-y-1">
                    <p className="text-xl font-black tracking-tighter tabular-nums leading-none text-slate-900">
                      {inst.gov}
                    </p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Government</p>
                  </div>
                  <div className="space-y-1 border-l border-slate-100 pl-6">
                    <p className="text-xl font-black tracking-tighter tabular-nums leading-none text-slate-900">
                      {inst.pvt}
                    </p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Private</p>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className={`absolute inset-x-0 bottom-0 py-4 px-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex justify-between items-center ${isActive ? 'bg-primary' : 'bg-slate-50'}`}>
                  {isActive ? (
                    <>
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">Impact Factor</span>
                        <span className="text-[10px] font-black text-white leading-none tabular-nums">
                          {inst.students?.toLocaleString()}+ Enrolled
                        </span>
                      </div>
                      <ArrowRight size={14} className="text-white" />
                    </>
                  ) : (
                    <div className="w-full flex justify-center items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Coming Soon</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Professional Footer Reference */}
        <div className="mt-10 flex flex-col items-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent mb-8" />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/search-institutes")}
            className="flex items-center gap-4 text-xs font-black text-slate-500 uppercase tracking-[0.3em] hover:text-primary transition-colors group"
          >
            Find all Institutes
            <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default InstitutesSection;
