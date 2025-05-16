import React from "react";
import FreeClassesSection from "@/components/ui/FreeClasses/FreeClasses";
import YoutubeSection from "@/components/ui/YoutubeVideo/Youtube";
import TestimonialsSection from "@/components/ui/Testimonials/Testimonials";
import BenefitsSection from "@/components/ui/Benefits/Benefits";
import SuccessSection from "@/components/ui/success/Success";
import ClassesCTA from "@/components/ui/classesCTA/ClassesCTA";
const page = () => {
  return (
    <main>
      <FreeClassesSection />
      <YoutubeSection />
      <ClassesCTA />
      <TestimonialsSection />
      <BenefitsSection />
      <SuccessSection />
    </main>
  );
};

export default page;
