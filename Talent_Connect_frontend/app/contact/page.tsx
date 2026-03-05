"use client";
import { useState } from "react";
import { MapPin, Mail, Clock, Phone, Send } from "lucide-react";
import Navbar from "@/components/landing-page/Navbar";
import Footer from "@/components/landing-page/Footer";

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Message sent!\nName: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}`,
    );
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <div className="bg-primary py-12 text-center">
          <p className="text-secondary text-xs font-bold uppercase tracking-[0.2em] mb-2">
            Get in Touch
          </p>
          <h1 className="text-white text-3xl font-extrabold">Contact Us</h1>
          <p className="text-white text-sm mt-2 max-w-md mx-auto">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-foreground font-bold text-lg">
                Contact Information
              </h2>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold">
                      Address
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Department of Technical Education & Industrial Training
                      <br />
                      Sector 36-A, Chandigarh, Punjab
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold">
                      Phone
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      +91-172-2601300
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold">
                      Email
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      info.dteit@punjab.gov.in
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold">
                      Working Hours
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Mon – Fri: 9:00 AM to 5:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                <h2 className="text-foreground font-bold text-lg mb-6">
                  Send us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-foreground text-sm font-medium block mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="Your full name"
                        className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-foreground text-sm font-medium block mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder="your@email.com"
                        className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-foreground text-sm font-medium block mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      placeholder="What is this about?"
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-foreground text-sm font-medium block mb-1.5">
                      Message
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      placeholder="Write your message here..."
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-secondary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
