import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import DoctorsSection from "@/components/sections/DoctorsSection";
import StatsSection from "@/components/sections/StatsSection";
import StepsSection from "@/components/sections/StepsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTASection from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <DoctorsSection />
      <StepsSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
