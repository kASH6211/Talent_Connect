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

const csrPartners = [
  { name: "Hyundai", logo: "/logos/hyundai.png" },
  { name: "Tata Motors", logo: "/logos/tata.png" },
  { name: "Mahindra", logo: "/logos/mahindra.png" },
  { name: "Maruti Suzuki", logo: "/logos/maruti.png" },
];

const trainingPartners = [
  { name: "Bosch India", logo: "/logos/bosch.png" },
  { name: "ABB India", logo: "/logos/abb.png" },
  { name: "Hero MotoCorp", logo: "/logos/hero.png" },
];

const LogoMarquee = ({
  partners,
  direction = "left",
}: {
  partners: { name: string; logo: string }[];
  direction?: "left" | "right";
}) => {
  return (
    <div className="overflow-hidden relative w-full">
      <div
        className={`flex gap-8 whitespace-nowrap ${direction === "left" ? "animate-scroll-left" : "animate-scroll-right"}`}
      >
        {[...partners, ...partners].map((partner, index) => (
          <div
            key={index}
            className="flex items-center justify-center bg-white border border-gray-200 rounded-xl px-5 py-4 min-w-[160px] shadow-sm"
          >
            <img
              src={partner.logo}
              alt={partner.name}
              className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-110"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const PartnersSection = () => {
  const router = useRouter();

  return (
    <section className="py-2 md:py-4 relative overflow-hidden bg-slate-50" id="industries">
      <div className="max-w-[1600px] mx-auto px-1 sm:px-6 lg:px-8">
        <div className="text-center mb-1 md:mb-5">
          <h2 className="text-foreground text-2xl md:text-3xl text-primary font-bold mb-3">
            Our Partners
          </h2>

        </div>

        <div className="space-y-6 md:space-y-8">
          {/* CSR Partners */}
          <div className="flex flex-col lg:flex-row items-stretch gap-4 overflow-hidden bg-white rounded-3xl p-3 border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
            {/* Left Blue Box */}
            <div className="bg-primary bg-gradient-to-br from-primary via-primary to-blue-900 text-white p-5 md:p-6 rounded-3xl lg:w-[220px] flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <h3 className="font-black text-lg md:text-xl leading-tight tracking-tighter">
                CSR <br /> PARTNERS
              </h3>
            </div>

            {/* Carousel */}
            <div className="flex-1 min-w-0 relative group self-center">
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
              <div className="py-4 md:py-6">
                <LogoMarquee partners={csrPartners} direction="left" />
              </div>
            </div>
          </div>

          {/* Training & Placement Partners */}
          <div className="flex flex-col lg:flex-row-reverse items-stretch gap-4 overflow-hidden bg-white rounded-3xl p-3 border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
            {/* Right Orange Box */}
            <div className="bg-secondary  text-white p-5 md:p-6 rounded-3xl lg:w-[260px] flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <h3 className="font-black text-lg md:text-xl leading-tight tracking-tighter">
                TRAINING & <br /> PLACEMENT
              </h3>
            </div>

            {/* Carousel */}
            <div className="flex-1 min-w-0 relative self-center">
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
              <div className="py-4 md:py-6">
                <LogoMarquee partners={trainingPartners} direction="right" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles - unchanged */}
      <style>
        {`
          @keyframes scrollLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }

          @keyframes scrollRight {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }

          .animate-scroll-left {
            animation: scrollLeft 35s linear infinite;
          }

          .animate-scroll-right {
            animation: scrollRight 35s linear infinite;
          }
        `}
      </style>
    </section>
  );
};

export default PartnersSection;
