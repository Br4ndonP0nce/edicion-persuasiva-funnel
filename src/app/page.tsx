import Image from "next/image";
import HeroSection from "@/components/ui/Hero/Hero";
import BenefitsSection from "@/components/ui/Benefits/Benefits";
import TestimonialsSection from "@/components/ui/Testimonials/Testimonials";
import SuccessSection from "@/components/ui/success/Success";
import MentorSection from "@/components/ui/Mentor/Mentor";
export default function Home() {
  return (
    <main>
      <HeroSection />
      <TestimonialsSection />
      <BenefitsSection />
      <SuccessSection />
      <MentorSection />
      {/* Add more sections as needed */}
    </main>
  );
}
