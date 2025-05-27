// src/components/ui/classesCTA/ClassesCTAWithPreload.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getContentBySection } from "@/lib/firebase/db";

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
    video_url: "https://cdn.edicionpersuasiva.com/mainVSL.mp4",
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

  // Video control functions (same as before)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error playing video:", error);
        });
      }
    }

    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    if (duration > 0) {
      setProgressPercentage((current / duration) * 100);
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;

    videoRef.current.currentTime = clickPosition * duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;

    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    const newMutedState = !isMuted;
    videoRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;

    if (!document.fullscreenElement) {
      videoContainerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`
          );
        });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Show loading if still loading content or video (when no preload)
  if (isLoading) {
    return (
      <div className="bg-black min-h-[300px] text-white overflow-hidden p-6 relative flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const isVideoReady = preloadContext?.isVideoReady ?? !isLoading;

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
            <video
              ref={videoRef}
              className="w-full aspect-video bg-black"
              poster={content.poster_url}
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              playsInline
              webkit-playsinline="true"
            >
              <source src={content.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Overlay for title/logo when video is not playing */}
            {isVideoReady && !isPlaying && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                <div
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wider mb-4"
                  style={{
                    textShadow:
                      "0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(138, 43, 226, 0.3)",
                  }}
                >
                  EDICIÓN PERSUASIVA
                </div>

                {/* Play button overlay */}
                <motion.button
                  onClick={togglePlay}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 focus:outline-none focus:ring-2  focus:ring-offset-2 focus:ring-offset-black"
                  aria-label="Play video"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>

                  {/* Pulsing ring animation */}
                  <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-20"></div>
                </motion.button>

                {/* Small subtitle below logo */}
                <div className="absolute bottom-12 left-0 right-0 flex justify-center">
                  <div className="text-white/80 text-xs tracking-wider">
                    Edición Persuasiva • Diego Hernández
                  </div>
                </div>
              </div>
            )}

            {/* Video controls */}
            {isPlaying && (
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-2 bg-black/80 transition-opacity duration-300 hover:opacity-100">
                {/* Play button and timestamp */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={togglePlay}
                    className="w-8 h-8 flex items-center justify-center hover:bg-purple-700/50 rounded-full transition-colors"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                  <span className="text-white text-xs">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Right side controls */}
                <div className="flex items-center space-x-2">
                  {/* Volume control */}
                  <div className="group relative">
                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-purple-300"
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted || volume === 0 ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                        </svg>
                      )}
                    </button>

                    {/* Volume slider - only visible on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black/90 rounded p-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 accent-purple-500"
                      />
                    </div>
                  </div>

                  {/* Fullscreen button */}
                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-purple-300"
                    aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 9L4 4m0 0l5 0m-5 0l0 5M6 20l5-5m0 0l-5 0m5 0l0 5M14 4l5 5m0 0l0-5m0 5l-5 0M14 20l5-5m0 0l0 5m0-5l-5 0"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Progress bar at the bottom - clickable */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 cursor-pointer"
              onClick={handleProgressBarClick}
            >
              <div
                className="h-full bg-purple-600 transition-all duration-100 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
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
