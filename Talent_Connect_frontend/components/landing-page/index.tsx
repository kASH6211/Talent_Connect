import React from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import InstitutesSection from "./InstitutesSection";
import StudentConnectSection from "./StudentConnectSection";
import PartnersSection from "./PartnersSection";
import Footer from "./Footer";
import ContactSection from "./ContactSection";

const HunarPunjabHome = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <InstitutesSection />
      <StudentConnectSection />
      <PartnersSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default HunarPunjabHome;
