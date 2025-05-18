"use client";
import Image from "next/image";
import HeroSection from "@/components/ui/Hero/Hero";
import BenefitsSection from "@/components/ui/Benefits/Benefits";
import TestimonialsSection from "@/components/ui/Testimonials/Testimonials";
import SuccessSection from "@/components/ui/success/Success";
import MentorSection from "@/components/ui/Mentor/Mentor";
import Preloader from "@/components/ui/Preloader/Preloader";
import MasterClassSection from "@/components/ui/MasterClass/MasterClass";
import { useState, useEffect } from "react";
export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading assets
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-screen bg-black">
      {loading && <Preloader />}
      <div
        className={
          loading ? "opacity-0" : "opacity-100 transition-opacity duration-500"
        }
      >
        <HeroSection />
        <TestimonialsSection />
        <BenefitsSection />
        <SuccessSection />
        <MentorSection />
        <MasterClassSection />
      </div>
      {/* Add more sections as needed */}
    </main>
  );
}
