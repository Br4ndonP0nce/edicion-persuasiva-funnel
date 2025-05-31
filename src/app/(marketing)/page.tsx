// src/app/(marketing)/page.tsx
"use client";
import Image from "next/image";
import HeroSection from "@/components/ui/Hero/Hero";
import BenefitsSection from "@/components/ui/Benefits/Benefits";
import TestimonialsSection from "@/components/ui/Testimonials/Testimonials";
import SuccessSection from "@/components/ui/success/Success";
import MentorSection from "@/components/ui/Mentor/Mentor";
import EnhancedPreloader from "@/components/ui/Preloader/EnhancedPreloader";
import MasterClassSection from "@/components/ui/MasterClass/MasterClass";
import { useState, useEffect } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);

  // Main video URL - should match what's in Hero section
  const mainVideoUrl =
    "https://firebasestorage.googleapis.com/v0/b/edicion-persuasiva.firebasestorage.app/o/public%2Fvideos%2FheroVideo.mp4?alt=media&token=4e7fac54-fbbe-48c5-8ba6-d562219f487a";

  const handlePreloadComplete = () => {
    console.log("🎉 Preloader completed - video should be ready");
    setLoading(false);

    // Small delay to ensure smooth transition
    setTimeout(() => {
      setContentReady(true);
    }, 100);
  };

  return (
    <main className="relative min-h-screen bg-black">
      {loading && (
        <EnhancedPreloader
          videoUrl={mainVideoUrl}
          onComplete={handlePreloadComplete}
          minDuration={2000} // 2 seconds minimum for branding
        />
      )}

      <div
        className={`transition-opacity duration-500 ${
          contentReady ? "opacity-100" : "opacity-0"
        }`}
      >
        <HeroSection />
        <TestimonialsSection />
        <BenefitsSection />
        <SuccessSection />
        <MentorSection />
        <MasterClassSection />
      </div>
    </main>
  );
}
