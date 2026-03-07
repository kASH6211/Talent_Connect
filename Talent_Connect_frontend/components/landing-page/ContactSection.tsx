"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default function ContactSection() {
  return (
    <section
      className="section-alt py-12 px-6 lg:px-20 rounded-2xl"
      id="contact"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Heading */}
        <h2 className="heading-primary text-3xl lg:text-4xl">Contact Us</h2>
        <p className="text-base-content/70 text-lg lg:text-xl max-w-3xl">
          Have questions or need support? Reach out to us and we’ll get back to
          you as soon as possible.
        </p>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-custom flex items-start gap-4 p-6">
            <div className="w-12 h-12 flex items-center justify-center bg-primary text-primary-content rounded-lg shadow-md">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-base-content">
                Email Support
              </h3>
              <p className="text-base-content/60 mt-1">
                support@yourcompany.com
              </p>
            </div>
          </div>

          <div className="card-custom flex items-start gap-4 p-6">
            <div className="w-12 h-12 flex items-center justify-center bg-primary text-primary-content rounded-lg shadow-md">
              <Phone size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-base-content">
                Call Us
              </h3>
              <p className="text-base-content/60 mt-1">+91 1234 567 890</p>
            </div>
          </div>

          <div className="card-custom flex items-start gap-4 p-6">
            <div className="w-12 h-12 flex items-center justify-center bg-primary text-primary-content rounded-lg shadow-md">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-base-content">
                Office Location
              </h3>
              <p className="text-base-content/60 mt-1">
                123 Talent Connect Street, City, State
              </p>
            </div>
          </div>
        </div>

        {/* Contact Button */}
        <div className="mt-6">
          <Link
            href="/contact-form"
            className="btn-yellow px-8 py-3 rounded-lg font-bold text-lg"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </section>
  );
}
