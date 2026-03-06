"use client";

import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import InstitutesSection from "./InstitutesSection";
import StudentConnectSection from "./StudentConnectSection";
import PartnersSection from "./PartnersSection";
import Footer from "./Footer";
import ContactSection from "./ContactSection";
import RoleSelectModal from "./RoleSelectModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const HunarPunjabHome = () => {
  const openModal = useSelector((state: RootState) => state?.login?.ui);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <InstitutesSection />
      <StudentConnectSection />
      <PartnersSection />
      {/* <ContactSection /> */}
      <Footer />
      <RoleSelectModal open={openModal?.roleSelectModal?.open} />
    </div>
  );
};

export default HunarPunjabHome;
