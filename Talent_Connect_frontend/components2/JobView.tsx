"use client";
import React, { useState } from "react";
import {
  Building2,
  Users,
  UserCheck,
  Briefcase,
  FileText,
  BookOpen,
  MapPin,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  applyUrl?: string;
}

const OverView: React.FC = () => {
  const [filters, setFilters] = useState({
    instituteType: "All Institute Types",
    course: "All Courses",
    district: "All Districts",
  });

  const jobs = [
    {
      id: "1",
      title: "Frontend Developer",
      company: "TechCorp",
      location: "Ludhiana",
      description: "Develop user interfaces with React.",
      applyUrl: "#",
    },
    {
      id: "2",
      title: "Backend Developer",
      company: "DevSolutions",
      location: "Amritsar",
      description: "Work on Node.js APIs.",
      applyUrl: "#",
    },
  ];

  const stats = [
    { value: "10+", label: "Institutes", icon: Building2 },
    { value: "33K+", label: "Students", icon: Users },
    { value: "87K+", label: "Alumni", icon: UserCheck },
    { value: "45+", label: "Employers", icon: Briefcase },
    { value: "128+", label: "Active MoUs", icon: FileText },
    { value: "15+", label: "Courses", icon: BookOpen },
  ];

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen py-20 lg:py-32 bg-gradient-to-br from-base-100/50 via-base-200/30 to-base-300/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-20">
        {/* Filters Section */}
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-base-content via-primary to-secondary bg-clip-text text-transparent mb-12 leading-tight">
            Access Real-Time Data
            <span className="block text-2xl lg:text-3xl font-normal text-base-content/70 mt-2">
              Across All Institutes in Punjab
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "instituteType",
                label: "Institute Type",
                options: ["All Institute Types", "Engineering", "Medical"],
              },
              {
                name: "course",
                label: "Course",
                options: ["All Courses", "Computer Science", "Mechanical"],
              },
              {
                name: "district",
                label: "District",
                options: ["All Districts", "Ludhiana", "Amritsar"],
              },
            ].map(({ name, label, options }) => (
              <div key={name} className="space-y-2">
                <label className="block text-sm font-medium text-base-content/80">
                  {label}
                </label>
                <select
                  name={name}
                  value={filters[name as keyof typeof filters]}
                  onChange={handleFilterChange}
                  className="w-full h-14 px-4 border-2 rounded-2xl text-base-content bg-base-100/80 backdrop-blur-sm border-base-300/50 hover:border-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group bg-base-100/90 backdrop-blur-md p-6 lg:p-8 rounded-2xl border border-base-200/60 hover:border-primary/40 transition-all duration-300 h-full flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-base-content mb-3 leading-tight">
                  {stat.value}
                </div>
                <p className="text-sm text-base-content/70 font-medium leading-relaxed">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OverView;
