// src/components/ui/Hero/Hero.tsx - Simplified Autoplay Version
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useVideoPreload } from "@/contexts/VideoPreloadContent";
import { getContentBySection } from "@/lib/firebase/db";

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

  // SIMPLIFIED: Use preloaded video if available, otherwise direct source
  useEffect(() => {
    if (!videoRef.current || !content.video_url) return;

    const video = videoRef.current;

    if (isVideoReady) {
      const preloadedVideo = getPreloadedVideo();
      if (preloadedVideo && preloadedVideo.src) {
        console.log("🔄 Using preloaded video for autoplay");
        video.src = preloadedVideo.src;
        video.currentTime = preloadedVideo.currentTime || 0;

        if (preloadedVideo.duration > 0) {
          setDuration(preloadedVideo.duration);
        }
      }
    } else {
      // Direct video loading - this will work with HTML autoplay attributes
      console.log("⚡ Using direct video loading with autoplay");
      video.src = content.video_url;
    }

    const handleLoadedMetadata = () => {
      if (video.duration > 0) {
        setDuration(video.duration);
      }
    };

    const handlePlay = () => {
      console.log("✅ Video started playing (autoplay or manual)");
      setIsPlaying(true);
      setShowOverlay(false); // Hide overlay when playing
    };

    const handlePause = () => {
      console.log("⏸️ Video paused");
      setIsPlaying(false);
      setShowOverlay(true); // Show overlay when paused
    };

    const handleEnded = () => {
      console.log("🔄 Video ended");
      setIsPlaying(false);
      setShowOverlay(true); // Show overlay when ended
    };

    // Add event listeners
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [isVideoReady, getPreloadedVideo, content.video_url]);

  // Track user interaction for unmuting
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  const isVideoAvailable = isVideoReady || timeoutReached || videoError;

  // Video control functions
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const togglePlay = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    if (isPlaying) {
      video.pause();
    } else {
      // If this is user-initiated play and they've interacted, unmute the video
      if (hasUserInteracted && isMuted) {
        video.muted = false;
        setIsMuted(false);
      }

      try {
        await video.play();
      } catch (error) {
        console.error("Error playing video:", error);
      }
    }
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
              <video
                ref={videoRef}
                className="w-full aspect-video bg-black"
                poster={content.poster_url}
                onTimeUpdate={handleTimeUpdate}
                // KEY: Direct HTML autoplay attributes (like your working example)
                autoPlay
                loop
                muted
                playsInline
                webkit-playsinline="true"
              >
                <source src={content.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Play Overlay - Only show when explicitly needed */}
              {showOverlay && (
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
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                    <div className="text-white/80 text-xs tracking-wider">
                      Edición Persuasiva • Diego Hernández
                    </div>
                  </div>
                </div>
              )}

              {/* BIG AUDIO ACTIVATION OVERLAY - Show when video is playing but muted */}
              {isPlaying && isMuted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10 touch-none"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.muted = false;
                      setIsMuted(false);
                      setHasUserInteracted(true);
                    }
                  }}
                  onTouchEnd={() => {
                    // Handle touch events specifically for mobile
                    if (videoRef.current) {
                      videoRef.current.muted = false;
                      setIsMuted(false);
                      setHasUserInteracted(true);
                    }
                  }}
                >
                  <div className="text-center cursor-pointer touch-manipulation px-4 max-w-lg">
                    {/* Main Message */}
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="bg-purple-600/90 border-2 border-purple-400 rounded-2xl px-4 sm:px-8 py-4 sm:py-6 mb-4 shadow-2xl"
                    >
                      <div className="flex items-center justify-center mb-3">
                        <svg
                          className="w-8 sm:w-12 h-8 sm:h-12 text-white mr-2 sm:mr-3"
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
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                          🔊
                        </div>
                      </div>

                      <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
                        TOCA PARA ACTIVAR
                      </h3>
                      <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">
                        EL AUDIO
                      </h3>

                      <p className="text-white/90 text-sm sm:text-lg">
                        Toca en cualquier lugar para escuchar
                      </p>
                    </motion.div>

                    {/* Visual Touch Indicator - Different for mobile/desktop */}
                    <motion.div
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="flex items-center justify-center text-white/80"
                    >
                      {/* Show touch icon on mobile, cursor on desktop */}
                      <div className="block sm:hidden">
                        <svg
                          className="w-6 h-6 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                          />
                        </svg>
                        <span className="text-lg font-semibold">Toca aquí</span>
                      </div>
                      <div className="hidden sm:flex items-center">
                        <svg
                          className="w-8 h-8 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                          />
                        </svg>
                        <span className="text-xl font-semibold">
                          Haz clic aquí
                        </span>
                      </div>
                    </motion.div>

                    {/* Skip Option */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Just hide the overlay without enabling audio
                        setHasUserInteracted(true);
                      }}
                      className="mt-4 sm:mt-6 text-white/60 hover:text-white/90 text-xs sm:text-sm underline transition-colors touch-manipulation"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Continuar sin audio
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* FALLBACK OVERLAY - Show when autoplay failed completely (common on mobile) */}
              {!isPlaying && !showOverlay && isVideoAvailable && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/70 z-10"
                  onClick={togglePlay}
                >
                  <div className="text-center">
                    <motion.button
                      onClick={togglePlay}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative w-16 sm:w-20 h-16 sm:h-20 rounded-full flex items-center justify-center transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-purple-400 bg-purple-600/80 hover:bg-purple-500/90"
                      aria-label="Play video"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 sm:h-8 w-6 sm:w-8 text-white ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-20"></div>
                    </motion.button>
                    <p className="text-white/80 text-sm sm:text-base mt-3">
                      Toca para reproducir con audio
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Video Controls - Show when playing */}
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
