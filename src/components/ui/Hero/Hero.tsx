// src/components/ui/Hero/Hero.tsx - Simplified Autoplay Version
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useVideoPreload } from "@/contexts/VideoPreloadContent";
import { getContentBySection } from "@/lib/firebase/db";
import EnhancedVideoPlayer from "@/components/Recursos/VideoPlayer";
const HeroSection = () => {
  const {
    isVideoReady,
    getPreloadedVideo,
    error: videoError,
    timeoutReached,
    continuePreloading,
  } = useVideoPreload();

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true); // Control overlay visibility

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Content state from Firebase
  const [content, setContent] = useState({
    subtitle: "Para editores que quieran lograr más y cobrar mucho más",
    headline:
      "Cómo ganar mínimo $2,000 dólares mensuales editando y con pocos clientes",
    module1: "MÓDULO COGNITIVO",
    module2: "MÓDULO PRÁCTICO",
    module3: "CIERRES DE VENTAS",
    video_url:
      "https://d29v4wmhmft6s2.cloudfront.net/landingVideos/heroVideoCompressed.mp4",
    poster_url: "/image/hero-poster.jpg",
    cta_button: "Deseo Aplicar",
    cta_url: "join",
  });

  const [isContentLoading, setIsContentLoading] = useState(true);

  // Fetch content from Firebase
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsContentLoading(true);
        const contentItems = await getContentBySection("hero");

        if (contentItems.length > 0) {
          const contentObj: Record<string, string> = {};
          contentItems.forEach((item) => {
            contentObj[item.key] = item.value;
          });

          setContent((prevContent) => ({
            ...prevContent,
            ...contentObj,
          }));
        }
      } catch (error) {
        console.error("Error fetching hero content:", error);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Animation variants
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

        {/* Video Player - SIMPLIFIED WITH DIRECT AUTOPLAY */}
        <motion.div variants={itemVariants}>
          <div
            className="mx-auto rounded-lg overflow-hidden border border-gray-800 shadow-2xl max-w-3xl"
            ref={containerRef}
          >
            <div className="relative">
              {/* Video Element - SIMPLE AUTOPLAY APPROACH */}
              <EnhancedVideoPlayer
                videoUrl="your-video.mp4"
                title="EDICIÓN PERSUASIVA"
                theme="purple"
                autoplay={true} // Autoplay enabled
              />
            </div>
          </div>
        </motion.div>

        {/* Status Indicator for Development */}
        {process.env.NODE_ENV === "development" && (
          <motion.div variants={itemVariants} className="mt-4 text-center">
            <div className="text-sm flex items-center justify-center gap-4 flex-wrap">
              <div
                className={`flex items-center gap-2 ${
                  isVideoReady ? "text-green-400" : "text-yellow-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isVideoReady ? "bg-green-400" : "bg-yellow-400"
                  } animate-pulse`}
                ></div>
                Video Ready: {isVideoReady ? "Yes" : "No"}
              </div>
              <div
                className={`flex items-center gap-2 ${
                  isPlaying ? "text-green-400" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isPlaying ? "bg-green-400" : "bg-gray-400"
                  }`}
                ></div>
                Playing: {isPlaying ? "Yes" : "No"}
              </div>
              <div
                className={`flex items-center gap-2 ${
                  showOverlay ? "text-orange-400" : "text-green-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    showOverlay ? "bg-orange-400" : "bg-green-400"
                  }`}
                ></div>
                Overlay: {showOverlay ? "Visible" : "Hidden"}
              </div>
            </div>
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
      </motion.div>
    </div>
  );
};

export default HeroSection;
