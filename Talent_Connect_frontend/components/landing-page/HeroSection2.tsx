"use client";

import { useEffect, useState, useRef } from "react";
import { animate, motion, useInView } from "framer-motion";
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
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView && typeof value == "number") {
      const controls = animate(0, value, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
      });
      return controls.stop;
    }
  }, [value, isInView]);

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
      label: "Successful Placement",
      color: "text-green-500",
    },
  ];

  return (
    <section className="relative w-full h-[350px] md:h-[450px] overflow-hidden">
      {/* Blurry Background Image */}
      <div className="absolute inset-0">
        <img
          src="/hero-image.png"
          alt="Hero background"
          className="w-full h-full object-cover blur-[4px] scale-105"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1400px] w-full items-stretch">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="flex-1"
            >
              <div className="bg-white/85 backdrop-blur-md p-8 rounded-[1.5rem] shadow-xl h-full flex flex-col items-center justify-center text-center border border-white/20">
                <div className={`mb-4 p-3 rounded-2xl bg-slate-100`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <p className="text-2xl md:text-4xl font-bold text-slate-900 mb-2">
                  {typeof stat.value === "number" ? (
                    <Counter value={stat.value || 0} suffix={stat.suffix} />
                  ) : (
                    stat.value.toString()
                  )}
                </p>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] leading-tight">
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
