"use client";
import { useState } from "react";
import { MapPin, Mail, Clock, Send, Info } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/landing-page/Footer";
import RoleSelectModal from "@/components/landing-page/RoleSelectModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const ContactPage = () => {
  const roleSelectUI = useSelector((state: RootState) => state?.login?.ui);
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <main className="flex-1">
        {/* Professional Hero Section */}
        <section className="relative w-full bg-primary overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-white text-4xl md:text-6xl font-black tracking-tight mb-4"
            >
              Contact Support
            </motion.h1>
          </div>
        </section>

        <div className="container mx-auto px-4 -mt-12 relative z-20 pb-20">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Formal Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 h-fit"
            >
              <h2 className="text-xl font-black text-primary uppercase tracking-wider mb-8 flex items-center gap-2">
                <span className="w-8 h-1 bg-primary rounded-full" />
                Information
              </h2>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-black text-sm uppercase tracking-wide">
                      Main Office
                    </h3>
                    <p className="text-slate-700 text-sm leading-relaxed mt-1.5 font-medium">
                      Department of Technical Education & Industrial Training,
                      Sector 36-A, Chandigarh, Punjab
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 border-t border-slate-100 pt-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-black text-sm uppercase tracking-wide">
                      Official Email
                    </h3>
                    <p className="text-primary text-sm mt-1.5 font-bold underline underline-offset-4">
                      dtepunjab@punjab.gov.in
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 border-t border-slate-100 pt-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-black text-sm uppercase tracking-wide">
                      Business Hours
                    </h3>
                    <p className="text-slate-700 text-sm mt-1.5 font-medium">
                      Mon – Fri: 09:00 AM - 05:00 PM
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[#64748B] text-xs font-bold leading-relaxed">
                  For faster processing of your query, please include your
                  Registration ID if applicable.
                </p>
              </div>
            </motion.div>

            {/* Official Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-2 bg-white p-8 md:p-12 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200"
            >
              <div className="mb-10">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  Electronic Inquiry Form
                </h2>
                <p className="text-slate-600 mt-2 font-medium">
                  Submit your request through our secure portal. All fields are
                  mandatory.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-slate-900 text-[11px] font-black uppercase tracking-widest ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="ENTER FULL NAME"
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-900 text-[11px] font-black uppercase tracking-widest ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="ENTER EMAIL ADDRESS"
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-slate-900 text-[11px] font-black uppercase tracking-widest ml-1">
                    Inquiry Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    placeholder="ENTER SUBJECT"
                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-slate-900 text-[11px] font-black uppercase tracking-widest ml-1">
                    Message Details
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder="PROVIDE DETAILED INFORMATION..."
                    rows={6}
                    className="w-full px-4 py-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-primary text-white px-12 py-4 rounded-lg text-sm font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
                  >
                    Submit Request
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
      <RoleSelectModal open={roleSelectUI?.roleSelectModal?.open} />
    </div>
  );
};

export default ContactPage;
