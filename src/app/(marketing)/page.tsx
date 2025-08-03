// src/app/(marketing)/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroSection from "@/components/ui/Hero/Hero";
import BenefitsSection from "@/components/ui/Benefits/Benefits";
import TestimonialsSection from "@/components/ui/Testimonials/Testimonials";
import SuccessSection from "@/components/ui/success/Success";
import MentorSection from "@/components/ui/Mentor/Mentor";
import MasterClassSection from "@/components/ui/MasterClass/MasterClass";
import SimplifiedPreloader from "@/components/ui/Preloader/simplePreloader";
import JsonLd, {
  createOrganizationSchema,
  createWebsiteSchema,
  createCourseSchema,
} from "@/components/JsonLd";

export default function Home() {
  const [showPreloader, setShowPreloader] = useState(true);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
  };

  return (
    <main className="relative min-h-screen bg-black">
      {/* JSON-LD Schema - Load immediately */}
      <JsonLd data={createOrganizationSchema()} />
      <JsonLd data={createWebsiteSchema()} />
      <JsonLd data={createCourseSchema()} />

      {/* Preloader */}
      <AnimatePresence>
        {showPreloader && (
          <SimplifiedPreloader
            onComplete={handlePreloaderComplete}
            duration={1000} // 2 seconds - perfect for branding
            fadeOutDuration={600} // Smooth fade out
            brandText="EDICIÓN PERSUASIVA"
            showProgress={false}
          />
        )}
      </AnimatePresence>

      {/* Main Content with Fade-in Animation */}

      {!showPreloader && (
        <>
          <HeroSection />
          <TestimonialsSection />
          <BenefitsSection />
          <SuccessSection />
          <MentorSection />
          <MasterClassSection />
        </>
      )}
    </main>
  );
}
