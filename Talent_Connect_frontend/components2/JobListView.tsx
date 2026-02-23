"use client";
import React, { useState } from "react";

// Sample job data (in real app, you would fetch from API)
const jobData = [
  { id: 1, title: "Frontend Developer", company: "TechCorp", location: "New York" },
  { id: 2, title: "Backend Developer", company: "DevSolutions", location: "San Francisco" },
  { id: 3, title: "UI/UX Designer", company: "DesignHub", location: "New York" },
  { id: 4, title: "Data Analyst", company: "DataCorp", location: "Chicago" },
];

const JobSearch = () => {
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<any>([]);

  const handleSearch = () => {
    const filteredJobs = jobData.filter(job =>
      job.location.toLowerCase().includes(location.toLowerCase())
    );
    setResults(filteredJobs);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Job Search</h1>

      {/* Search Input */}
      <div className="flex mb-6 gap-2">
        <input
          type="text"
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="input input-bordered w-full"
        />
        <button onClick={handleSearch} className="btn btn-primary">
          Search
        </button>
      </div>

      {/* Job Results */}
      <div className="grid gap-4">
        {results.length === 0 ? (
          <p className="text-center text-base-content opacity-70">No jobs found</p>
        ) : (
          results.map((job:any) => (
            <div key={job.id} className="card bg-base-100 shadow-md border border-base-300">
              <div className="card-body">
                <h2 className="card-title">{job.title}</h2>
                <p className="text-sm text-base-content opacity-80">{job.company}</p>
                <p className="text-sm text-base-content opacity-70">{job.location}</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-sm btn-outline btn-primary">Apply</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JobSearch;
