// src/components/ui/Recursos/RecursosSectionWithEnhancedPlayer.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getContentBySection } from "@/lib/firebase/db";
import EnhancedVideoPlayer from "./VideoPlayer";

interface RecursosContent {
  headline: string;
  subtitle: string;
  video_url: string;
  poster_url?: string;
  cta_academy: string;
  cta_academy_url: string;
  cta_resources: string;
  cta_resources_url: string;
  description: string;
}

const RecursosSectionWithEnhancedPlayer = () => {
  const [showCTAs, setShowCTAs] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);

  // Direct video ref for controlling playback
  const videoRef = useRef<HTMLVideoElement>(null);

  // Content state from Firebase
  const [content, setContent] = useState<RecursosContent>({
    headline: "Recursos Exclusivos de Edición Persuasiva",
    subtitle: "Accede a herramientas y plantillas que transformarán tu trabajo",
    video_url:
      "https://d29v4wmhmft6s2.cloudfront.net/landingVideos/heroVideoCompressed.mp4",
    poster_url: "", // No poster needed
    cta_academy: "¿Te gustó? Únete a la academia",
    cta_academy_url: "/join",
    cta_resources: "Continúa aquí para recibir tus recursos gratis",
    cta_resources_url:
      "https://drive.google.com/drive/folders/1JAWqF7Hfdl3kmQTvyByVhwJnbZhgSDIy?usp=drive_link",
    description:
      "Para desbloquear tus recursos gratuitos, mira el video y haz clic en los botones al final. ¡No te lo pierdas!",
  });

  const [isContentLoading, setIsContentLoading] = useState(true);

  // Fetch content from Firebase
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsContentLoading(true);
        const contentItems = await getContentBySection("recursos");

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
        console.error("Error fetching recursos content:", error);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Handle video completion
  const handleVideoEnd = () => {
    console.log("🎯 Recursos video ended - showing CTAs");
    setShowCTAs(true);
    setShowPauseModal(false);
  };

  // Handle video pause
  const handleVideoPause = () => {
    console.log("⏸️ Recursos video paused - showing pause modal");
    if (!showCTAs) {
      setShowPauseModal(true);
    }
  };

  // Handle video play
  const handleVideoPlay = () => {
    console.log("✅ Recursos video started playing");
    setShowPauseModal(false);
  };

  // Handle continue watching from pause modal
  const handleContinueWatching = () => {
    setShowPauseModal(false);

    // Auto-resume the video when continue button is clicked
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Error resuming video:", error);
      });
    }
  };

  // Handle replay when CTAs are visible
  const handleReplay = () => {
    setShowCTAs(false);
    setShowPauseModal(false);
    // Video will restart via the EnhancedVideoPlayer
  };

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

  const ctaVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Create custom overlay content for when CTAs should show - ONLY success message
  const customOverlayContent = showCTAs ? (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4"
    >
      <div className="text-center">
        {/* Success Message Only */}
        <motion.div variants={ctaVariants} className="mb-4">
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-400 mb-3">
            🎉 ¡Completado!
          </div>
          <p className="text-white/90 text-lg sm:text-xl px-2">
            ¡Felicidades! Aquí están tus recursos
          </p>
        </motion.div>

        {/* Replay option inside overlay */}
        <motion.div variants={ctaVariants} className="mt-6">
          <button
            onClick={handleReplay}
            className="text-white/60 hover:text-white/90 text-sm underline transition-colors"
          >
            Ver video nuevamente
          </button>
        </motion.div>
      </div>
    </motion.div>
  ) : null;

  if (isContentLoading) {
    return (
      <div className="bg-black min-h-screen text-white overflow-hidden p-6 relative flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white overflow-hidden p-6 relative flex items-center justify-center">
      {/* Background gradient effects */}
      <div className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="absolute bottom-[5%] right-[10%] w-56 h-56 rounded-full bg-green-600/10 blur-3xl" />

      {/* Content container */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8 mt-8 ">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            {content.headline}
          </h1>
          <p className="text-lg sm:text-xl text-purple-300 max-w-3xl mx-auto">
            {content.subtitle}
          </p>
        </motion.div>

        {/* Description */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="bg-purple-900/30 border border-purple-700/50 backdrop-blur-sm rounded-lg px-6 py-4 max-w-4xl mx-auto">
            <p className="text-gray-200 text-base sm:text-lg">
              {content.description}
            </p>
          </div>
        </motion.div>

        {/* Enhanced Video Player */}
        <motion.div variants={itemVariants}>
          <div className="relative">
            <EnhancedVideoPlayer
              videoUrl={content.video_url}
              posterUrl={content.poster_url}
              title="RECURSOS EXCLUSIVOS"
              subtitle="Recursos Exclusivos • Edición Persuasiva"
              theme="green"
              className="max-w-4xl"
              autoplay={true}
              allowSeeking={false}
              onVideoEnd={handleVideoEnd}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              overlayContent={customOverlayContent}
              videoRef={videoRef} // Pass the ref for external control
            />

            {/* Pause Modal - Show when video is paused */}
            <AnimatePresence>
              {showPauseModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-30"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-gradient-to-br from-orange-600/90 to-red-600/90 border-2 border-orange-400 rounded-2xl px-6 sm:px-8 py-6 sm:py-8 mx-4 max-w-md text-center shadow-2xl"
                  >
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Message */}
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                      ¡Espera!
                    </h3>
                    <p className="text-white/90 text-base sm:text-lg mb-6 leading-relaxed">
                      ¡Tus recursos te esperan al terminar el video!
                    </p>

                    {/* Continue Button */}
                    <motion.button
                      onClick={handleContinueWatching}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-orange-600 font-semibold text-lg py-3 px-8 rounded-lg hover:bg-orange-50 transition-all duration-300 shadow-lg"
                    >
                      Continuar viendo
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* CTA Buttons - Below the video player */}
        <AnimatePresence>
          {showCTAs && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="mt-8 max-w-4xl mx-auto"
            >
              {/* Primary CTA - Academy */}
              <motion.div variants={ctaVariants} className="mb-4">
                <Link href={content.cta_academy_url}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-purple-700 hover:bg-purple-600 text-white font-semibold text-lg py-4 px-8 rounded-lg shadow-2xl transition-all duration-300 w-full"
                    style={{
                      boxShadow: "0 0 20px rgba(138, 43, 226, 0.5)",
                    }}
                  >
                    {content.cta_academy}
                  </motion.button>
                </Link>
              </motion.div>

              {/* Secondary CTA - Free Resources */}
              <motion.div variants={ctaVariants}>
                <Link
                  href={content.cta_resources_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-green-700 hover:bg-green-600 text-white font-medium text-base py-3 px-6 rounded-lg border-2 border-green-500/50 hover:border-green-400 transition-all duration-300 w-full flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-center">{content.cta_resources}</span>
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom navigation hint - Only show when CTAs are not visible */}
        {!showCTAs && (
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <div className="text-white/60 text-sm">
              💡 Ve el video completo para desbloquear tus recursos gratuitos
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default RecursosSectionWithEnhancedPlayer;
