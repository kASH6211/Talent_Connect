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
        className={`flex gap-10 whitespace-nowrap ${direction === "left" ? "animate-scroll-left" : "animate-scroll-right"
          }`}
      >
        {[...partners, ...partners].map((partner, index) => (
          <div
            key={index}
            className="flex items-center justify-center bg-white border border-gray-200 rounded-xl px-6 py-6 min-w-[180px] shadow-sm"
          >
            <img
              src={partner.logo}
              alt={partner.name}
              className="h-20 w-auto object-contain transition-transform duration-300 hover:scale-110"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const PartnersSection = () => {
  return (
    <section className="py-24 bg-[#fcfdfe]" id="industries">
      <div className="max-w-[1600px] mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            STRATEGIC PARTNERS
          </h2>
          <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full"></div>
          <p className="mt-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
            COLLABORATING FOR A SKILLED PUNJAB
          </p>
        </div>

        <div className="space-y-10">
          {/* CSR Partners */}
          <div className="flex flex-col lg:flex-row items-stretch gap-4 overflow-hidden bg-white rounded-[3rem] p-3 border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]">
            {/* Left Blue Box */}
            <div className="bg-primary bg-gradient-to-br from-primary via-primary to-blue-900 text-white p-6 md:p-8 rounded-[2.5rem] lg:w-[240px] flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-60 mb-2 font-black">Strategic</span>
              <h3 className="font-black text-xl leading-tight tracking-tighter">
                CSR TECH <br /> PARTNERS
              </h3>
            </div>

            {/* Carousel with Edge Fades */}
            <div className="flex-1 min-w-0 relative group self-center">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
              <div className="py-8">
                <LogoMarquee partners={csrPartners as any} direction="left" />
              </div>
            </div>
          </div>

          {/* Training & Placement Partners */}
          <div className="flex flex-col lg:flex-row-reverse items-stretch gap-4 overflow-hidden bg-white rounded-[3rem] p-3 border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]">
            {/* Right Orange Box */}
            <div className="bg-secondary bg-gradient-to-br from-secondary via-secondary to-yellow-600 text-white p-6 md:p-8 rounded-[2.5rem] lg:w-[280px] flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-60 mb-2 font-black">Institutional</span>
              <h3 className="font-black text-xl leading-tight tracking-tighter">
                TRAINING & <br /> PLACEMENT
              </h3>
            </div>

            {/* Carousel with Edge Fades */}
            <div className="flex-1 min-w-0 relative self-center">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
              <div className="py-8">
                <LogoMarquee partners={trainingPartners as any} direction="right" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
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
