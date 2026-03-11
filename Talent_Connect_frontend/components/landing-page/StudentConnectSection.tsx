"use client";

import {
  Zap,
  Search,
  MessageCircle,
  Briefcase,
  Building2,
  Handshake,
} from "lucide-react";

const industriesCards = [
  {
    icon: Briefcase,
    title: "Placement",
    desc: "Hire skilled students and alumni through a seamless, digitally facilitated campus hiring process",
  },
  {
    icon: Building2,
    title: "1 to 6 Month Industrial Training",
    desc: "Offer structured industrial training opportunities to students and manage the entire training lifecycle digitally",
  },
  {
    icon: Handshake,
    title: "Partner with Institutes",
    desc: "Partner with institutes to support skill development through CSR initiatives",
  },
];

const studentCards = [
  {
    icon: Zap,
    title: "Upskilling",
    desc: "Discover courses offered by nearby institutes and enhance your career opportunities",
  },
  {
    icon: Search,
    title: "Search Job",
    desc: "Find and apply for job opportunities posted by companies looking for skilled candidates like you",
  },
  {
    icon: MessageCircle,
    title: "Counselling",
    desc: "Get expert guidance to choose the right course, training path, and career based on your interests and goals",
  },
];

const StudentConnectSection = () => {
  return (
    <section className="py-8 md:py-6 bg-white" id="students">
      <div className="container px-4 max-w-[1600px] mx-auto">
        {/* Heading */}
        <div className="text-center mb-3">
          <h2 className="text-foreground text-2xl md:text-3xl text-primary font-bold mb-4">
            Get Started
          </h2>

        </div>

        {/* Two Column Layout with Vertical Divider */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 relative border border-base-300 rounded-[2.5rem] overflow-hidden shadow-xl bg-white">
          {/* LEFT - INDUSTRIES (Theme: Light Blue/Primary) */}
          <div className="p-6 lg:p-10 bg-slate-50">
            <h3 className="text-2xl font-black mb-8 text-center text-primary/80 uppercase tracking-[0.2em]">
              For Industries
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {industriesCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="group relative bg-white border border-slate-200 p-6 rounded-2xl hover:border-primary/50 hover:shadow-md transition-all duration-500 cursor-default overflow-hidden flex flex-col items-center text-center h-full min-h-[220px]"
                  >
                    <div className="mb-6 p-4 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <Icon className="w-8 h-8" />
                    </div>

                    <h4 className="font-bold text-lg text-slate-800 mb-3 group-hover:text-primary transition-colors">
                      {card.title}
                    </h4>

                    {/* Expandable Description on Hover */}
                    <div className="max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100 transition-all duration-500 ease-in-out mb-4">
                      <p className="text-sm text-slate-600 leading-relaxed italic mb-4 text-center">
                        {card.desc}
                      </p>
                    </div>

                    <div className="mt-auto pt-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-4 py-2 rounded-full group-hover:bg-secondary group-hover:text-white transition-colors duration-500">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vertical Divider (Desktop Only) */}
          <div className="hidden lg:block absolute left-1/2 top-20 bottom-20 w-px bg-slate-200 -translate-x-1/2"></div>

          {/* Horizontal Divider (Mobile Only) */}
          <div className="lg:hidden w-full h-px bg-slate-200"></div>

          {/* RIGHT - STUDENTS (Theme: Neutral/Slate) */}
          <div className="p-6 lg:p-10 bg-gray-100">
            <h3 className="text-2xl font-black mb-8 text-center text-primary/80 uppercase tracking-[0.2em]">
              For Students
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {studentCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="group relative bg-slate-50 border border-slate-100 p-6 rounded-2xl hover:border-primary/50 hover:shadow-md transition-all duration-500 cursor-default overflow-hidden flex flex-col items-center text-center h-full min-h-[220px]"
                  >
                    <div className="mb-6 p-4 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <Icon className="w-8 h-8" />
                    </div>

                    <h4 className="font-bold text-lg text-slate-800 mb-3 group-hover:text-primary transition-colors">
                      {card.title}
                    </h4>

                    {/* Expandable Description on Hover */}
                    <div className="max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100 transition-all duration-500 ease-in-out">
                      <p className="text-sm text-slate-600 leading-relaxed italic mb-4 text-center">
                        {card.desc}
                      </p>
                    </div>

                    <div className="mt-auto pt-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-4 py-2 rounded-full group-hover:bg-secondary group-hover:text-white transition-colors duration-500">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentConnectSection;
