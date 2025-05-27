// src/components/ui/Preloader/EnhancedPreloader.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVideoPreload } from "@/contexts/VideoPreloadContent";

interface EnhancedPreloaderProps {
  videoUrl: string;
  onComplete: () => void;
  minDuration?: number; // Minimum time to show preloader (for branding)
}

const EnhancedPreloader: React.FC<EnhancedPreloaderProps> = ({
  videoUrl,
  onComplete,
  minDuration = 2000, // 2 seconds minimum
}) => {
  const [loading, setLoading] = useState(true);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [canComplete, setCanComplete] = useState(false);

  const {
    startPreload,
    isVideoReady,
    progress: videoProgress,
    error: videoError,
    isPreloading,
  } = useVideoPreload();

  // Timer to track minimum duration
  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setTimeElapsed(elapsed);

      if (elapsed >= minDuration) {
        setCanComplete(true);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [minDuration]);

  // Start video preload on mount
  useEffect(() => {
    console.log("🚀 Enhanced Preloader starting video preload");
    startPreload(videoUrl).catch((error: unknown) => {
      console.error("Failed to preload video:", error);
      // Continue anyway after minimum time
    });
  }, [videoUrl, startPreload]);

  // Calculate display progress (combination of time and video progress)
  useEffect(() => {
    const timeProgress = Math.min(70, (timeElapsed / minDuration) * 70); // Time gives us up to 70%
    const totalProgress = Math.max(timeProgress, videoProgress); // Use whichever is higher

    setDisplayProgress(totalProgress);
  }, [timeElapsed, videoProgress, minDuration]);

  // Complete when both conditions are met
  useEffect(() => {
    if (canComplete && (isVideoReady || videoError) && displayProgress >= 95) {
      console.log("✅ Preloader completing:", {
        canComplete,
        isVideoReady,
        videoError,
        displayProgress,
      });

      // Small delay for smooth transition
      setTimeout(() => {
        setLoading(false);
        onComplete();
      }, 300);
    }
  }, [canComplete, isVideoReady, videoError, displayProgress, onComplete]);

  // Generate grid items with staggered animation
  const gridItems = Array.from({ length: 50 }, (_, i) => (
    <motion.div
      key={i}
      className="h-10 w-10 bg-purple-600/10 rounded-sm"
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.1, 0.3, 0.1],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay: i * 0.02,
      }}
    />
  ));

  if (!loading) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.5, delay: 0.2 },
      }}
    >
      <div className="relative">
        <div className="grid grid-cols-10 gap-2 opacity-30">{gridItems}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.h1
              className="text-3xl font-bold text-purple-500 mb-4"
              animate={{
                color: ["#9333ea", "#ffffff", "#9333ea"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              EDICIÓN PERSUASIVA
            </motion.h1>

            {/* Progress Bar */}
            <div className="w-32 h-2 bg-gray-800 rounded-full mx-auto mb-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>

            {/* Progress Text */}
            <motion.div
              className="text-purple-300 text-sm"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {isPreloading && !videoError
                ? ` ${Math.round(displayProgress)}%`
                : videoError
                ? "Preparando experiencia..."
                : isVideoReady
                ? ""
                : `Cargando... ${Math.round(displayProgress)}%`}
            </motion.div>

            {/* Development info */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <div>Video Ready: {isVideoReady ? "✅" : "❌"}</div>
                <div>Can Complete: {canComplete ? "✅" : "❌"}</div>
                <div>
                  Time: {timeElapsed}ms / {minDuration}ms
                </div>
                <div>Video Progress: {Math.round(videoProgress)}%</div>
                <div>Display Progress: {Math.round(displayProgress)}%</div>
                {videoError && (
                  <div className="text-red-400">Error: {videoError}</div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedPreloader;
