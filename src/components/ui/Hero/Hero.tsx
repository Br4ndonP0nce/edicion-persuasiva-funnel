// src/components/ui/Hero/Hero.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import EnhancedVideoPlayer from "../EnhancedVideoPlayer/EnhancedVideoPlayer";
import { getContentBySection } from "@/lib/firebase/db";

const HeroSection = () => {
  // Content state from Firebase
  const [content, setContent] = useState({
    subtitle: "Para editores que quieran lograr más y cobrar mucho más",
    headline:
      "Cómo ganar mínimo $2,000 dólares mensuales editando y con pocos clientes",
    module1: "MÓDULO COGNITIVO",
    module2: "MÓDULO PRÁCTICO",
    module3: "CIERRES DE VENTAS",
    video_url: "https://storage.googleapis.com/edicionpersuasiva/mainVSL.mp4",
    poster_url: "/image/hero-poster.jpg",
    cta_button: "Deseo Aplicar",
    cta_url: "join",
  });

  // Loading state for content
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [videoCanPlay, setVideoCanPlay] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Fetch content from Firebase
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsContentLoading(true);
        const contentItems = await getContentBySection("hero");

        // Only update state if we got content items
        if (contentItems.length > 0) {
          // Convert array of items to an object with key/value pairs
          const contentObj: Record<string, string> = {};
          contentItems.forEach((item) => {
            contentObj[item.key] = item.value;
          });

          // Update state with new content, keeping defaults for missing items
          setContent((prevContent) => ({
            ...prevContent,
            ...contentObj,
          }));
        }
      } catch (error) {
        console.error("Error fetching hero content:", error);
        // Keep default values on error
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleVideoCanPlay = () => {
    setVideoCanPlay(true);
    console.log("✅ Hero video is ready to play without buffering");
  };

  const handleVideoError = (error: string) => {
    setVideoError(error);
    console.error("❌ Hero video error:", error);
  };

  // Animation variants for UI elements
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

  // Show loading state if content is still loading
  if (isContentLoading) {
    return (
      <div className="bg-black min-h-[600px] text-white overflow-hidden p-6 relative mt-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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
        <motion.div
          variants={itemVariants}
          className="mb-6 flex flex-col items-center mt-4"
        >
          <div className="bg-purple-900/90 border border-white italic backdrop-blur-sm text-white text-center px-6 rounded-md mx-auto">
            <p className="text-sm sm:text-base md:text-lg max-w-2xl font-medium text-gray-200">
              {content.subtitle}
            </p>
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-6 flex flex-col items-center"
        >
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

        {/* Enhanced Video Player */}
        <motion.div variants={itemVariants}>
          <EnhancedVideoPlayer
            videoUrl={content.video_url}
            posterUrl={content.poster_url}
            title="EDICIÓN PERSUASIVA"
            subtitle="Edición Persuasiva • Diego Hernández"
            autoPreload={true}
            showLoadingProgress={true}
            onCanPlay={handleVideoCanPlay}
            onError={handleVideoError}
          />
        </motion.div>

        {/* Video Status Indicator (for debugging) */}
        {process.env.NODE_ENV === "development" && (
          <motion.div variants={itemVariants} className="mt-4 text-center">
            {videoCanPlay ? (
              <div className="text-green-400 text-xs flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Video preloaded and ready
              </div>
            ) : videoError ? (
              <div className="text-red-400 text-xs flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                Video error: {videoError}
              </div>
            ) : (
              <div className="text-yellow-400 text-xs flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                Video loading...
              </div>
            )}
          </motion.div>
        )}

        {/* Application button */}
        <motion.div variants={itemVariants} className="mt-8 text-center">
          <Link href={content.cta_url || "join"}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-700 hover:bg-purple-600 text-white font-semibold text-base sm:text-lg py-2 px-8 rounded-md"
              style={{
                boxShadow: "0 0 10px rgba(138, 43, 226, 0.4)",
              }}
            >
              {content.cta_button}
            </motion.button>
          </Link>
        </motion.div>

        {/* Performance Metrics (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <details className="text-xs text-gray-400">
              <summary className="cursor-pointer hover:text-gray-200">
                Video Performance Metrics
              </summary>
              <div className="mt-2 space-y-1">
                <div>Video URL: {content.video_url}</div>
                <div>Preload Strategy: auto (full video)</div>
                <div>Ready State: {videoCanPlay ? "Ready" : "Loading"}</div>
                <div>Error State: {videoError || "None"}</div>
              </div>
            </details>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default HeroSection;
