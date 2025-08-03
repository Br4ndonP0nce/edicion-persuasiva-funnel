// src/components/ui/Hero/Hero.tsx - Simplified Autoplay Version
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import EnhancedVideoPlayer from "@/components/Recursos/VideoPlayer";
const HeroSection = () => {
  // Static content - no loading needed
  const content = {
    subtitle: "Para editores que quieran lograr más y cobrar mucho más",
    headline:
      "Cómo ganar mínimo $2,000 dólares mensuales editando y con pocos clientes",
    module1: "MÓDULO COGNITIVO",
    module2: "MÓDULO PRÁCTICO",
    module3: "CIERRES DE VENTAS",
    video_url: "/video/heroVideoCompressed.mp4",
    poster_url: "/image/hero-poster.jpg",
    cta_button: "Deseo Aplicar",
    cta_url: "join",
  };

  // Animation variants - like RecursosSection
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="bg-black min-h-[600px] text-white overflow-hidden p-6 relative mt-8">
      {/* Background gradient effects */}
      <div className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="absolute bottom-[5%] right-[10%] w-56 h-56 rounded-full bg-purple-600/10 blur-3xl" />

      {/* Content container */}
      <motion.div
        className="relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top subtitle banner */}
        <motion.div variants={itemVariants} className="mb-6 flex flex-col items-center mt-4">
          <div className="bg-purple-900/90 border border-white italic backdrop-blur-sm text-white text-center px-6 rounded-md mx-auto">
            <p className="text-sm sm:text-base md:text-lg max-w-2xl font-medium text-gray-200">
              {content.subtitle}
            </p>
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.div variants={itemVariants} className="text-center mb-6 flex flex-col items-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight bg-black py-2 italic">
            {content.headline.includes("$2,000") ? (
              <>
                Cómo ganar mínimo{" "}
                <span className="text-white bg-purple-800">
                  $2,000 dólares mensuales editando
                </span>{" "}
                y
                <br />
                con pocos clientes
              </>
            ) : (
              content.headline
            )}
          </h1>
        </motion.div>

        {/* Module buttons */}
        <motion.div variants={itemVariants} className="text-center mb-6">
          <div className="text-purple-300 text-xs sm:text-sm md:text-base font-medium">
            <span>{content.module1}</span>
            <span className="mx-2">|</span>
            <span>{content.module2}</span>
            <span className="mx-2">|</span>
            <span>{content.module3}</span>
          </div>
        </motion.div>

        {/* Video Player */}
        <motion.div variants={itemVariants}>
          <div className="mx-auto rounded-lg overflow-hidden border border-gray-800 shadow-2xl max-w-3xl">
            <div className="relative">
              {/* Video Element */}
              <EnhancedVideoPlayer
                videoUrl="/video/heroVideoCompressed.mp4"
                title="EDICIÓN PERSUASIVA"
                theme="purple"
                autoplay={true}
                allowSeeking={false}
              />
            </div>
          </div>
        </motion.div>

        {/* Application button */}
        <motion.div variants={itemVariants} className="mt-8 text-center">
          <Link href={content.cta_url || "join"}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-700 hover:bg-purple-600 text-white font-semibold text-base sm:text-lg py-2 px-8 rounded -md"
              style={{
                boxShadow: "0 0 10px rgba(138, 43, 226, 0.4)",
              }}
            >
              {content.cta_button}
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
