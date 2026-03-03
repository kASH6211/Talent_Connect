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
        className={`flex gap-10 whitespace-nowrap ${
          direction === "left" ? "animate-scroll-left" : "animate-scroll-right"
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
    <section className="py-16 md:py-20 bg-gray-50" id="industries">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-extrabold text-blue-900 mb-14">
          Our Partners
        </h2>

        {/* CSR Partners */}
        <div className="flex items-center gap-6 mb-16 overflow-hidden">
          {/* Left Blue Box */}
          <div className="bg-blue-900 text-white font-bold px-8 py-10 rounded-2xl w-[250px] flex-shrink-0 text-center shadow-lg">
            CSR TECH <br /> PARTNERS
          </div>

          {/* Carousel */}
          <div className="flex-1 min-w-0">
            <LogoMarquee partners={csrPartners as any} direction="left" />
          </div>
        </div>

        {/* Training & Placement Partners */}
        <div className="flex items-center gap-6 overflow-hidden">
          {/* Carousel */}
          <div className="flex-1 min-w-0">
            <LogoMarquee partners={trainingPartners as any} direction="right" />
          </div>

          {/* Right Orange Box */}
          <div className="bg-orange-500 text-white font-bold px-8 py-10 rounded-2xl w-[300px] flex-shrink-0 text-center shadow-lg">
            TRAINING & <br /> PLACEMENT PARTNERS
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
            animation: scrollLeft 25s linear infinite;
          }

          .animate-scroll-right {
            animation: scrollRight 25s linear infinite;
          }
        `}
      </style>
    </section>
  );
};

export default PartnersSection;
