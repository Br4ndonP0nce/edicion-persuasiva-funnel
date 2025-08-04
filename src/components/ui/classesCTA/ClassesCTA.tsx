// src/components/ui/classesCTA/ClassesCTAWithPreload.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import EnhancedVideoPlayer from "@/components/Recursos/VideoPlayer";

const ClassesCTA = () => {
  // Static content
  const content = {
    heading: "ACCEDE A LA ACADEMIA DE EDICION PERSUASIVA",
    subheading: "La academia de edición MÁS COMPLETA de habla hispana",
    module1: "MÓDULO COGNITIVO",
    module2: "MÓDULO PRÁCTICO",
    module3: "CIERRES DE VENTAS",
    video_url: "/video/heroVideo.mp4",
    poster_url: "/image/hero-poster.jpg",
    cta_button: "Deseo acceder hoy",
    cta_url: "join",
  };

  return (
    <div className="bg-black min-h-[600px] text-white overflow-hidden p-6 relative">
      {/* Background gradient effects */}
      <div className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="absolute bottom-[5%] right-[10%] w-56 h-56 rounded-full bg-purple-600/10 blur-3xl" />

      {/* Content container */}
      <div className="relative z-10">
        {/* Main heading */}
        <div className="text-center mb-3 flex flex-col items-center">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white leading-tight">
            {content.heading}
          </h1>
        </div>

        {/* Subheading */}
        <div className="text-center mb-6">
          <div className="text-purple-300 text-xs sm:text-sm md:text-xl font-medium">
            {content.subheading}
          </div>
        </div>

        {/* Video player */}
        <div className="mx-auto rounded-lg overflow-hidden border border-gray-800 shadow-2xl max-w-3xl">
          <div className="relative">
            {/* Video element */}
            <EnhancedVideoPlayer
              videoUrl={content.video_url}
              title="EDICIÓN PERSUASIVA"
              theme="purple"
              autoplay={true}
            />
          </div>
        </div>

        {/* Application button */}
        <div className="mt-8 text-center">
          <Link href={content.cta_url}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-700 hover:bg-purple-600 text-white font-semibold text-base md:text-2xl sm:text-lg py-4 px-8 rounded-md"
              style={{
                boxShadow: "0 0 10px rgba(138, 43, 226, 0.4)",
              }}
            >
              {content.cta_button}
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClassesCTA;
