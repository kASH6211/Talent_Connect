"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Wrench,
  BookOpen,
  Lightbulb,
  GraduationCap,
  HeartPulse,
  Award,
  ArrowRight,
} from "lucide-react";

const institutes = [
  {
    icon: Wrench,
    name: "ITI",
    gov: 137,
    pvt: "Coming Soon",
    students: 35150,
    courses: 69,
  },
  {
    icon: BookOpen,
    name: "Polytechnic",
    gov: 26,
    pvt: "Coming Soon",
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
    <section className="py-2 md:py-2 bg-slate-50 border-t border-slate-200" id="institutes">
      <div className="container mx-auto px-2 sm:px-4 md:px-5 lg:px-6 text-center">
        <h2 className="text-foreground text-2xl md:text-3xl text-primary font-bold mb-8 mt-5">
          Explore Punjab Institutes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-6xl mx-auto">
          {institutes.map((inst) => {
            const Icon = inst.icon;
            const isActive = inst.name === "ITI" || inst.name === "Polytechnic";

            return (
              <div
                key={inst.name}
                onClick={
                  isActive
                    ? () => router.push(`/search-institutes?type=${inst.name}`)
                    : undefined
                }
                className={`group border bg-white border-gray-200 rounded-xl bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/70 transition-all duration-300 ${isActive ? "cursor-pointer" : ""
                  }`}
              >
                {/* Top Section */}
                <div className="p-5 md:p-6">
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-3 md:mb-4 mx-auto transition-colors duration-300 ${isActive ? "group-hover:bg-primary" : "bg-muted"
                      }`}
                  >
                    <Icon
                      className={`w-6 h-6 md:w-7 md:h-7 transition-colors duration-300 ${isActive
                        ? "text-primary group-hover:text-white"
                        : "text-primary"
                        }`}
                    />
                  </div>

                  <p className="text-primary font-bold text-base md:text-lg">
                    {inst.name}
                  </p>
                </div>

                {/* Blue Bottom Section */}
                <div className="relative bg-blue-900 text-white py-4 md:py-5 px-5 md:px-6 overflow-hidden">
                  {/* Default View */}
                  <div className="flex justify-center gap-10 md:gap-12 transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-2">
                    <div className="text-center">
                      <p className="text-base md:text-lg font-extrabold">
                        {inst.gov}
                      </p>
                      <p className="text-xs opacity-80">Government</p>
                    </div>

                    <div className="text-center">
                      <p className="text-base md:text-lg font-extrabold">
                        {inst.pvt}
                      </p>
                      <p className="text-xs opacity-80">Private</p>
                    </div>
                  </div>

                  {/* Hover View */}
                  <div className="absolute inset-0 flex items-center justify-center gap-10 md:gap-12 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    {inst.students ? (
                      <>
                        <div className="text-center">
                          <p className="text-xs opacity-80 mb-1">
                            No. of Students
                          </p>
                          <p className="text-base md:text-lg font-extrabold">
                            {inst.students}
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-xs opacity-80 mb-1">
                            No. of Courses
                          </p>
                          <p className="text-base md:text-lg font-extrabold">
                            {inst.courses}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center">
                          <p className="text-xs opacity-80 mb-1">
                            No. of Students
                          </p>
                          <p className="text-base md:text-lg font-extrabold">
                            Comming soon
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-xs opacity-80 mb-1">
                            No. of Courses
                          </p>
                          <p className="text-base md:text-lg font-extrabold">
                            Comming soon
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Small Arrow Icon on Hover - bottom right */}
                <motion.div
                  className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  <ArrowRight size={20} className="text-primary" />
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Find All Institutes Link at bottom */}
        <div className="mt-4 md:mt-5 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/search-institutes")}
            className="flex items-center gap-3 text-sm font-semibold text-slate-600"
          >
            Find All Institutes
            <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
              <ArrowRight
                size={16}
                className="text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-transform"
              />
            </div>
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default InstitutesSection;
