const stats = [
  { value: "45+", label: "Industry Partners", sub: "Across Punjab & beyond" },
  {
    value: "3.5 Lakh+",
    label: "Students Directly Engaged",
    sub: "In industry programs",
  },
  {
    value: "1.5 Lakh+",
    label: "Successful Placements",
    sub: "And growing every year",
  },
];

const HeroSection = () => {
  return (
    <section className="relative">
      {/* Hero Image */}
      <div className="relative w-full h-[260px] md:h-[320px] overflow-hidden">
        <img
          src={"/hero-image.png"}
          alt="Students in technical workshop"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />

        {/* Softer Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Transparent Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 text-white z-10">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] mb-6 text-center">
            Impact at a Glance
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-extrabold text-orange-400">
                  {stat.value}
                </p>

                <p className="font-semibold mt-2 text-base">{stat.label}</p>

                <p className="font-semibold mt-2 text-base">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
