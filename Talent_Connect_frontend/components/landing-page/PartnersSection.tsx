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
    <section className="py-12 bg-white" id="industries">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 mb-2">
            Strategic Partners
          </h2>
          <div className="h-1 w-16 bg-secondary mx-auto rounded-full"></div>
        </div>

        <div className="space-y-4">
          {/* CSR Partners */}
          <div className="flex flex-col md:flex-row items-stretch gap-2 overflow-hidden bg-slate-50 rounded-3xl p-2 border border-slate-100 shadow-sm">
            {/* Left Blue Box */}
            <div className="bg-primary bg-gradient-to-br from-primary to-blue-800 text-white p-6 md:p-8 rounded-2xl md:w-[220px] flex flex-col justify-center items-center text-center shadow-md">
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-80 mb-1 font-bold">Category</span>
              <h3 className="font-black text-lg leading-tight">
                CSR TECH <br /> PARTNERS
              </h3>
            </div>

            {/* Carousel with Edge Fades */}
            <div className="flex-1 min-w-0 relative group">
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>
              <div className="py-4">
                <LogoMarquee partners={csrPartners as any} direction="left" />
              </div>
            </div>
          </div>

          {/* Training & Placement Partners */}
          <div className="flex flex-col md:flex-row-reverse items-stretch gap-2 overflow-hidden bg-slate-50 rounded-3xl p-2 border border-slate-100 shadow-sm">
            {/* Right Orange Box */}
            <div className="bg-secondary bg-gradient-to-br from-secondary to-yellow-500 text-white p-6 md:p-8 rounded-2xl md:w-[260px] flex flex-col justify-center items-center text-center shadow-md">
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-80 mb-1 font-bold">Category</span>
              <h3 className="font-black text-lg leading-tight">
                TRAINING & <br /> PLACEMENT PARTNERS
              </h3>
            </div>

            {/* Carousel with Edge Fades */}
            <div className="flex-1 min-w-0 relative">
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>
              <div className="py-4">
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
