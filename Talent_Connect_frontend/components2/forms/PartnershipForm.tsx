"use client";

import { useState } from "react";

interface PartnershipFormProps {
  title?: string;
  description?: string;
}

export default function PartnershipForm({
  title = "Start Industry Partnership",
  description = "Partner with us to provide industrial training to students.",
}: PartnershipFormProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    industryType: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    alert("Form Submitted (You handle backend)");
  };

  return (
    <>
      {/* Clean content for modal - NO full-page wrapper */}
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl lg:text-3xl font-black text-primary mb-3">
            {title}
          </h3>
          <p className="text-base-content/70 text-lg leading-relaxed">
            {description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control w-full">
            <input
              type="text"
              name="companyName"
              placeholder="Company Name *"
              className="input input-lg input-bordered w-full"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control w-full">
              <input
                type="text"
                name="contactPerson"
                placeholder="Contact Person *"
                className="input input-lg input-bordered w-full"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-control w-full">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                className="input input-lg input-bordered w-full"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-control w-full">
            <input
              type="email"
              name="email"
              placeholder="Email Address *"
              className="input input-lg input-bordered w-full"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-control w-full">
            <input
              type="text"
              name="industryType"
              placeholder="Industry Type (IT, Manufacturing, Automotive, etc.)"
              className="input input-lg input-bordered w-full"
              value={formData.industryType}
              onChange={handleChange}
            />
          </div>

          <div className="form-control w-full">
            <textarea
              name="message"
              placeholder="Tell us about your collaboration proposal..."
              className="textarea textarea-lg textarea-bordered w-full h-32 resize-none"
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="button" 
              className="btn btn-lg btn-ghost flex-1 text-lg font-semibold border-2 border-base-300 hover:border-primary hover:bg-base-200"
              onClick={() => {/* handle cancel */}}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary btn-lg flex-1 text-lg font-bold shadow-2xl hover:shadow-3xl h-14"
            >
              Submit Partnership Request
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
