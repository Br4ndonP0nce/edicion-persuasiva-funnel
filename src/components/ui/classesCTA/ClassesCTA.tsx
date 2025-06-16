// src/components/ui/classesCTA/ClassesCTAWithPreload.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getContentBySection } from "@/lib/firebase/db";
import EnhancedVideoPlayer from "@/components/Recursos/VideoPlayer";
// Try to use video preload context if available, but don't require it
let useVideoPreload: any = null;
try {
  const preloadModule = require("@/contexts/VideoPreloadContext");
  useVideoPreload = preloadModule.useVideoPreload;
} catch (e) {
  // Context not available, that's fine
  console.log("VideoPreloadContext not available in this context");
}

const ClassesCTA = () => {
  // Try to use preload context if available
  const preloadContext = useVideoPreload
    ? (() => {
        try {
          return useVideoPreload();
        } catch (e) {
          return null;
        }
      })()
    : null;

  // Video states - fallback to original behavior if no preload context
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(!preloadContext); // No loading if we have preload context

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // State for CMS content
  const [content, setContent] = useState<Record<string, string>>({
    heading: "ACCEDE A LA ACADEMIA DE EDICION PERSUASIVA",
    subheading: "La academia de edición MÁS COMPLETA de habla hispana",
    module1: "MÓDULO COGNITIVO",
    module2: "MÓDULO PRÁCTICO",
    module3: "CIERRES DE VENTAS",
    video_url:
      "https://d29v4wmhmft6s2.cloudfront.net/landingVideos/heroVideoCompressed.mp4",
    poster_url: "/image/hero-poster.jpg",
    cta_button: "Deseo acceder hoy",
    cta_url: "join",
  });

  // Fetch content from Firebase
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const contentItems = await getContentBySection("classes_cta");

        if (contentItems.length > 0) {
          const contentMap: Record<string, string> = {};
          contentItems.forEach((item) => {
            contentMap[item.key] = item.value;
          });

          setContent((prevContent) => ({
            ...prevContent,
            ...contentMap,
          }));
        }
      } catch (err) {
        console.error("Error fetching classes CTA content:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  // If we have preload context and video is ready, use it
  useEffect(() => {
    if (preloadContext?.isVideoReady && videoRef.current) {
      const preloadedVideo = preloadContext.getPreloadedVideo();
      if (preloadedVideo && preloadedVideo.src === content.video_url) {
        console.log("🔄 Using preloaded video in Classes CTA");

        // Copy the preloaded video's source and state
        videoRef.current.src = preloadedVideo.src;
        videoRef.current.currentTime = preloadedVideo.currentTime;

        if (preloadedVideo.duration > 0) {
          setDuration(preloadedVideo.duration);
          setIsLoading(false);
        }
      }
    }
  }, [preloadContext?.isVideoReady, content.video_url]);

  // Fallback video loading if no preload context
  useEffect(() => {
    if (!preloadContext && videoRef.current && content.video_url) {
      const video = videoRef.current;

      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setIsLoading(false);
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () =>
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    }
  }, [content.video_url, preloadContext]);

  // Handle fullscreen change

  // Show loading if still loading content or video (when no preload)
  if (isLoading) {
    return (
      <div className="bg-black min-h-[300px] text-white overflow-hidden p-6 relative flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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
        <div
          className="mx-auto rounded-lg overflow-hidden border border-gray-800 shadow-2xl max-w-3xl"
          ref={videoContainerRef}
        >
          <div className="relative">
            {/* Actual video element */}
            <EnhancedVideoPlayer
              videoUrl="https://d29v4wmhmft6s2.cloudfront.net/landingVideos/heroVideoCompressed.mp4"
              title="EDICIÓN PERSUASIVA"
              theme="purple"
              autoplay={true} // Autoplay enabled
            />

            {/* Overlay for title/logo when video is not playing */}

            {/* Video controls */}

            {/* Progress bar at the bottom - clickable */}
          </div>
        </div>

        {/* Status indicator for development */}
        {process.env.NODE_ENV === "development" && preloadContext && (
          <div className="mt-4 text-center">
            <div className="text-green-400 text-xs flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Using preloaded video context - Optimized loading!
            </div>
          </div>
        )}

        {/* Application button */}
        <div className="mt-8 text-center">
          <Link href={content.cta_url || "join"}>
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
