import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ScenariosSection from "@/components/landing/ScenariosSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TutorsPreviewSection from "@/components/landing/TutorsPreviewSection";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import FooterSection from "@/components/landing/FooterSection";

const Index = () => {
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
