import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ScenariosSection from "@/components/landing/ScenariosSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TutorsPreviewSection from "@/components/landing/TutorsPreviewSection";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import FooterSection from "@/components/landing/FooterSection";
import { useCurrentUser } from "@/lib/useCurrentUser";

const Index = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, loading } = useCurrentUser();

  useEffect(() => {
    if (!loading && user && pathname === "/") {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, pathname, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ScenariosSection />
      <HowItWorksSection />
      <TutorsPreviewSection />
      <PricingSection />
      <CTASection />
      <FooterSection />
    </div>
  );
};

export default Index;
