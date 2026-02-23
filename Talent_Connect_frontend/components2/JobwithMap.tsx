"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  title: string;
  category: string;
  enrolled: number;
  applyUrl?: string;
}

const JobsWithMap: React.FC = () => {
  const router = useRouter();
  const jobs: Job[] = [
    {
      id: "1",
      title: "Electrician",
      category: "ITI",
      enrolled: 2200,
      applyUrl: "#",
    },
    {
      id: "2",
      title: "Fitter",
      category: "ITI",
      enrolled: 1950,
      applyUrl: "#",
    },
    {
      id: "3",
      title: "Welder",
      category: "ITI",
      enrolled: 1680,
      applyUrl: "#",
    },
    {
      id: "4",
      title: "MBBS",
      category: "Medical",
      enrolled: 600,
      applyUrl: "#",
    },
    {
      id: "5",
      title: "Nursing",
      category: "Medical",
      enrolled: 450,
      applyUrl: "#",
    },
    {
      id: "6",
      title: "Digital Marketing",
      category: "Skill Centres",
      enrolled: 420,
      applyUrl: "#",
    },
    {
      id: "7",
      title: "Industrial Automation",
      category: "Skill Centres",
      enrolled: 380,
      applyUrl: "#",
    },
  ];

  return (
    <div className="min-h-screen py-20 lg:py-32 bg-gradient-to-br from-base-100/50 via-base-200/30 to-base-300/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Jobs List */}
          <div className="lg:sticky lg:top-20 lg:h-screen lg:overflow-y-auto space-y-4">
            <div className="space-y-4 mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-base-content via-primary to-secondary bg-clip-text text-transparent">
                Top Courses
              </h2>
              <p className="text-xl text-base-content/70 max-w-md">
                Most enrolled programs across Punjab institutes
              </p>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/job/${job.title}/apply`}
                  className="group bg-base-100/90 backdrop-blur-md p-6 lg:p-8 rounded-2xl border border-base-200/60 hover:border-primary/40 hover:shadow-md transition-all duration-300 flex items-center justify-between h-24 lg:h-28 shadow-sm"
                >
                  <div className="space-y-2">
                    <h3 className="font-bold text-xl lg:text-2xl text-base-content group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-base-content/70">
                      <div className="w-2 h-2 bg-primary/60 rounded-full" />
                      <span>{job.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 lg:gap-6">
                    <div className="text-right">
                      <p className="text-2xl lg:text-3xl font-bold text-primary">
                        {job.enrolled.toLocaleString()}
                      </p>
                      <p className="text-xs text-base-content/60 uppercase tracking-wide">
                        enrolled
                      </p>
                    </div>
                    <div className="w-px h-12 bg-base-300/50 hidden lg:block" />
                    <div className="btn btn-primary btn-sm h-10 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl group-hover:translate-x-1 transition-all duration-200">
                      Apply
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Interactive Map */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-base-content">
                  Punjab Districts
                </h3>
                <p className="text-base-content/70">
                  Interactive map with real-time enrollment data
                </p>
              </div>
            </div>

            <div className="bg-base-100/90 backdrop-blur-md rounded-3xl border border-base-200/60 shadow-xl overflow-hidden h-[500px] lg:h-[650px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1750597.5762748502!2d74.09143928358252!3d31.022463344063066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391964aa569e7355%3A0x8fbd263103a38861!2sPunjab!5e0!3m2!1sen!2sin!4v1770894854134!5m2!1sen!2sin"
                className="w-full h-full rounded-3xl"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="bg-base-200/50 backdrop-blur-sm p-6 rounded-2xl border border-base-300/50">
              <p className="text-base-content/80 text-sm leading-relaxed">
                <Users className="w-5 h-5 inline text-primary mr-2 -mt-1" />
                Click any district to explore detailed institute data,
                enrollment trends, and alumni networks across Punjab's 23
                districts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsWithMap;
