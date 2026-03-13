"use client";

import { useEffect, useState, useRef } from "react";
import { animate, motion } from "framer-motion";
import { Building2, Users, GraduationCap } from "lucide-react";

const Counter = ({
  value,
  suffix = "",
}: {
  value: number | string;
  suffix?: string;
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (typeof value === "number") {
      const controls = animate(0, value, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
      });
      return controls.stop;
    }
  }, [value]);

  return (
    <span ref={ref}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

const HeroSection2 = () => {
  const stats = [
    {
      icon: Building2,
      value: 150,
      suffix: "+",
      label: "Industry Partners",
      color: "text-blue-500",
    },
    {
      icon: Users,
      value: 27930,
      label: "Students Available for Placements",
      color: "text-orange-500",
    },
    {
      icon: GraduationCap,
      value: "coming soon",
      label: "Jobs Offered",
      color: "text-green-500",
    },
  ];

  return (
    <section className="relative w-full min-h-[260px] sm:min-h-[300px] md:h-[380px] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/hero-image (2).png"
          alt="Hero background"
          className="w-full h-full object-cover blur-[4px] scale-105"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-end justify-center px-4 pb-6 md:pb-8 pt-16 md:pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-5xl w-full">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="w-full"
            >
              <div className="bg-white/90 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl shadow-xl flex flex-col items-center justify-center text-center border border-white/20">
                <div className="mb-2 sm:mb-3 p-2 sm:p-2.5 rounded-lg md:rounded-xl bg-slate-50">
                  <stat.icon className={`w-6 h-6 md:w-7 md:h-7 ${stat.color}`} />
                </div>

                <p className="text-lg sm:text-xl md:text-3xl font-bold text-slate-900 mb-1">
                  {typeof stat.value === "number" ? (
                    <Counter value={stat.value || 0} suffix={stat.suffix} />
                  ) : (
                    stat.value.toString()
                  )}
                </p>

                <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection2;