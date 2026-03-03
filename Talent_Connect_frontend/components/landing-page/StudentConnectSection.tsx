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
    desc: "See our students placed in top industries across India",
  },
  {
    icon: Building2,
    title: "1 to 6 Month Industrial Training",
    desc: "Track the journey from enrollment to employment",
  },
  {
    icon: Handshake,
    title: "Partner with Institutes",
    desc: "Build long-term industry-academia relationships",
  },
];

const studentCards = [
  {
    icon: Zap,
    title: "Upskilling",
    desc: "Access certified training programs to sharpen your technical skills.",
  },
  {
    icon: Search,
    title: "Search Job",
    desc: "Browse thousands of verified job openings matched with your trade.",
  },
  {
    icon: MessageCircle,
    title: "Counselling",
    desc: "Get expert guidance on career paths and industry opportunities.",
  },
];

const StudentConnectSection = () => {
  return (
    <section className="py-12 section-alt" id="students">
      <div className="container px-4 max-w-6xl mx-auto">
        {/* Heading */}
        <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-12 heading-primary">
          Get Started
        </h2>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
          {/* LEFT - INDUSTRIES */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-center text-secondary">
              For Industries
            </h3>

            <div className="space-y-6">
              {industriesCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="card-custom p-6 hover:shadow-lg transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                      <p className="font-semibold text-base-content">
                        {card.title}
                      </p>
                    </div>
                    <p className="text-sm text-base-content/70 mb-4">
                      {card.desc}
                    </p>
                    <button className="btn-orange text-xs font-semibold px-4 py-2 rounded">
                      Explore Now →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT - STUDENTS */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-center text-secondary">
              For Students
            </h3>

            <div className="space-y-6">
              {studentCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="card-custom p-6 hover:shadow-lg transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                      <p className="font-semibold text-base-content">
                        {card.title}
                      </p>
                    </div>
                    <p className="text-sm text-base-content/70 mb-4">
                      {card.desc}
                    </p>
                    <button className="btn-orange text-xs font-semibold px-4 py-2 rounded">
                      Explore Now →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vertical Divider (center) */}
          <div className="hidden md:block absolute left-1/2 top-0 h-full w-px border-base-300 -translate-x-1/2"></div>
        </div>
      </div>
    </section>
  );
};

export default StudentConnectSection;
