import {
  Wrench,
  BookOpen,
  Lightbulb,
  GraduationCap,
  HeartPulse,
  Award,
} from "lucide-react";

const institutes = [
  {
    icon: Wrench,
    name: "ITI",
    gov: 137,
    pvt: 183,
    students: 35150,
    courses: 69,
  },
  {
    icon: BookOpen,
    name: "Polytechnic",
    gov: 26,
    pvt: 66,
    students: 2415,
    courses: 30,
  },
  {
    icon: Lightbulb,
    name: "Skilling & Vocational Institutes",
    gov: "Upcoming",
    pvt: "Upcoming",
  },
  {
    icon: GraduationCap,
    name: "Engineering College",
    gov: "Upcoming",
    pvt: "Upcoming",
  },
  {
    icon: HeartPulse,
    name: "Medical College",
    gov: "Upcoming",
    pvt: "Upcoming",
  },
  {
    icon: Award,
    name: "Professional Degree College",
    gov: "Upcoming",
    pvt: "Upcoming",
  },
];

const InstitutesSection = () => {
  return (
    <section className="py-12 bg-background" id="institutes">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-foreground text-2xl md:text-3xl text-blue-900 font-extrabold mb-8">
          Explore Punjab Institutes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {institutes.map((inst) => {
            const Icon = inst.icon;

            return (
              <div
                key={inst.name}
                onClick={
                  inst.name === "ITI" || inst.name === "Polytechnic"
                    ? () => {
                        window.location.href = "http://localhost:4000/";
                      }
                    : undefined
                }
                className={`group border border-border rounded-xl bg-card overflow-hidden shadow-sm hover:shadow-lg transition ${
                  inst.name === "ITI" || inst.name === "Polytechnic"
                    ? "cursor-pointer"
                    : ""
                }`}
              >
                {/* Top Section */}
                <div className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>

                  <p className="text-primary font-bold text-base">
                    {inst.name}
                  </p>
                </div>

                {/* Blue Bottom Section */}
                <div className="relative bg-blue-900 text-white py-5 px-6 overflow-hidden">
                  {/* Default View (Government / Private) */}
                  <div className="flex justify-center gap-12 transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-2">
                    <div>
                      <p className="text-lg font-extrabold">{inst.gov}</p>
                      <p className="text-xs opacity-80">Government</p>
                    </div>

                    <div>
                      <p className="text-lg font-extrabold">{inst.pvt}</p>
                      <p className="text-xs opacity-80">Private</p>
                    </div>
                  </div>

                  {/* Hover View (Students / Courses OR Upcoming) */}
                  <div className="absolute inset-0 flex items-center justify-center gap-12 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    {inst.students ? (
                      <>
                        <div className="text-center">
                          <p className="text-xs opacity-80 mb-1">
                            No. of Students
                          </p>
                          <p className="text-lg font-extrabold">
                            {inst.students}
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-xs opacity-80 mb-1">
                            No. of Courses
                          </p>
                          <p className="text-lg font-extrabold">
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
                          <p className="text-lg font-extrabold">Upcoming</p>
                        </div>

                        <div className="text-center">
                          <p className="text-xs opacity-80 mb-1">
                            No. of Courses
                          </p>
                          <p className="text-lg font-extrabold">Upcoming</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InstitutesSection;
