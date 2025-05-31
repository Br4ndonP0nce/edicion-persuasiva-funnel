// src/components/ui/Hero/HeroWithPreload.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useVideoPreload } from "@/contexts/VideoPreloadContent";
import { getContentBySection } from "@/lib/firebase/db";

const HeroSection = () => {
  // Get preloaded video context
  const {
    isVideoReady,
    getPreloadedVideo,
    error: videoError,
  } = useVideoPreload();

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Local video ref for the visible player
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
      "https://firebasestorage.googleapis.com/v0/b/edicion-persuasiva.firebasestorage.app/o/public%2Fvideos%2FheroVideo.mp4?alt=media&token=4e7fac54-fbbe-48c5-8ba6-d562219f487a",
    poster_url: "/image/hero-poster.jpg",
    cta_button: "Deseo Aplicar",
    cta_url: "join",
  });

  // Loading state for content
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

  // Transfer preloaded video to visible player when ready
  useEffect(() => {
    if (isVideoReady && videoRef.current) {
      const preloadedVideo = getPreloadedVideo();
      if (preloadedVideo) {
        console.log("🔄 Transferring preloaded video to Hero player");

        // Copy the preloaded video's source and current state
        videoRef.current.src = preloadedVideo.src;
        videoRef.current.currentTime = preloadedVideo.currentTime;

        // Set up the visible video element
        videoRef.current.addEventListener("loadedmetadata", () => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            console.log("✅ Hero video ready for playback");
          }
        });

        // If the preloaded video has already loaded metadata, use it immediately
        if (preloadedVideo.duration > 0) {
          setDuration(preloadedVideo.duration);
        }
      }
    }
  }, [isVideoReady, getPreloadedVideo]);

  // Video control functions
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (!videoRef.current || !isVideoReady) return;

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

  const setVolumeLevel = (newVolume: number) => {
    if (!videoRef.current) return;

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
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
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

        {/* Video Player - No loading states needed! */}
        <motion.div variants={itemVariants}>
          <div
            className="mx-auto rounded-lg overflow-hidden border border-gray-800 shadow-2xl max-w-3xl"
            ref={containerRef}
          >
            <div className="relative">
              {/* Video Element */}
              <video
                ref={videoRef}
                className="w-full aspect-video bg-black"
                poster={content.poster_url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                playsInline
                webkit-playsinline="true"
              >
                Your browser does not support the video tag.
              </video>

              {/* Play Overlay - Shows when video is ready and not playing */}
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

                  {/* Enhanced Play Button */}
                  <motion.button
                    onClick={togglePlay}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-black"
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

                    {/* Pulsing Ring Animation */}
                    <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-20"></div>
                  </motion.button>

                  {/* Subtitle */}
                  <div className="absolute bottom-12 left-0 right-0 flex justify-center">
                    <div className="text-white/80 text-xs tracking-wider">
                      Edición Persuasiva • Diego Hernández
                    </div>
                  </div>
                </div>
              )}

              {/* Video Controls - Only show when playing */}
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-3 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300"
                >
                  {/* Left Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={togglePlay}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
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

                  {/* Right Controls */}
                  <div className="flex items-center space-x-2">
                    {/* Volume Control */}
                    <div className="group relative">
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-purple-300 p-1"
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

                      {/* Volume Slider */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 rounded p-2">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={(e) =>
                            setVolumeLevel(parseFloat(e.target.value))
                          }
                          className="w-20 h-1 accent-purple-500"
                        />
                      </div>
                    </div>

                    {/* Fullscreen Button */}
                    <button
                      onClick={toggleFullscreen}
                      className="text-white hover:text-purple-300 p-1"
                      aria-label={
                        isFullscreen ? "Exit fullscreen" : "Fullscreen"
                      }
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
                </motion.div>
              )}

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1">
                {/* Playback Progress */}
                <div
                  className="absolute top-0 left-0 h-full bg-purple-600 cursor-pointer transition-all duration-100 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                  onClick={handleProgressBarClick}
                />

                {/* Interactive Progress Bar Overlay */}
                <div
                  className="absolute top-0 left-0 right-0 h-full cursor-pointer bg-transparent hover:bg-white/10"
                  onClick={handleProgressBarClick}
                />
              </div>

              {/* Error State */}
              {videoError && !isVideoReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                  <div className="text-center text-white p-6">
                    <div className="text-red-400 mb-2">
                      <svg
                        className="w-12 h-12 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Video Error</h3>
                    <p className="text-sm text-gray-300 mb-4">{videoError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Status Indicator for Development */}
        {process.env.NODE_ENV === "development" && (
          <motion.div variants={itemVariants} className="mt-4 text-center">
            <div className="text-green-400 text-xs flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Video preloaded and ready - No loading states needed!
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
