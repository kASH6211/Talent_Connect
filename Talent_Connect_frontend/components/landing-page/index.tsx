"use client";
import HeroSection2 from "./HeroSection2";
import InstitutesSection from "./InstitutesSection";
import StudentConnectSection from "./StudentConnectSection";
import PartnersSection from "./PartnersSection";
import Footer from "./Footer";
import ContactSection from "./ContactSection";
import RoleSelectModal from "./RoleSelectModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useAuth } from "@/lib/AuthProvider";

const HunarPunjabHome = () => {
  const openModal = useSelector((state: RootState) => state?.login?.ui);
  const { user, role } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <HeroSection2 />
      {role !== "institute" && <InstitutesSection />}
      <StudentConnectSection />
      <PartnersSection />
      {/* <ContactSection /> */}
      <Footer />
      <RoleSelectModal open={openModal?.roleSelectModal?.open} />
    </div>
  );
};

export default HunarPunjabHome;
