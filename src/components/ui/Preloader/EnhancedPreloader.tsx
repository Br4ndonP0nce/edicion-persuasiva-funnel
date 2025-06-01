// src/components/ui/Preloader/EnhancedPreloader.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVideoPreload } from "@/contexts/VideoPreloadContent";

interface EnhancedPreloaderProps {
  videoUrl: string;
  onComplete: () => void;
  minDuration?: number; // Minimum time to show preloader (for branding)
  maxWaitTime?: number; // Maximum time to wait for video
  continueInBackground?: boolean; // Continue preloading after timeout
}

const EnhancedPreloader: React.FC<EnhancedPreloaderProps> = ({
  videoUrl,
  onComplete,
  minDuration = 1500, // Reduced for better UX
  maxWaitTime = 3000,
  continueInBackground = true,
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
    timeoutReached,
    continuePreloading,
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

  // Start video preload on mount with timeout configuration
  useEffect(() => {
    console.log("🚀 Enhanced Preloader starting video preload with timeout");

    startPreload(videoUrl, {
      maxWaitTime,
      continueInBackground,
      onTimeout: () => {
        console.log("⏰ Video preload timeout in Enhanced Preloader");
      },
      onVideoReady: () => {
        console.log("✅ Video ready in Enhanced Preloader");
      },
    }).catch((error: unknown) => {
      console.error("Failed to preload video:", error);
      // Don't block on error - the timeout will handle it
    });
  }, [videoUrl, startPreload, maxWaitTime, continueInBackground]);

  // Calculate display progress (combination of time and video progress)
  useEffect(() => {
    if (timeoutReached) {
      // If timeout reached, quickly progress to completion based on time
      const timeProgress = Math.min(
        100,
        (timeElapsed / (minDuration + 500)) * 100
      );
      setDisplayProgress(Math.max(85, timeProgress));
    } else {
      // Normal progress calculation
      const timeProgress = Math.min(70, (timeElapsed / minDuration) * 70); // Time gives us up to 70%
      const videoProgressContribution = Math.min(30, videoProgress * 0.3); // Video progress gives us up to 30%
      const totalProgress = timeProgress + videoProgressContribution;
      setDisplayProgress(totalProgress);
    }
  }, [timeElapsed, videoProgress, minDuration, timeoutReached]);

  // Complete when conditions are met
  useEffect(() => {
    const shouldComplete =
      canComplete &&
      (isVideoReady || // Video is fully ready
        timeoutReached || // Timeout reached, proceed anyway
        videoError || // Error occurred, proceed anyway
        displayProgress >= 95); // Progress is high enough

    if (shouldComplete) {
      console.log("✅ Enhanced Preloader completing:", {
        canComplete,
        isVideoReady,
        timeoutReached,
        videoError,
        displayProgress,
      });

      // Small delay for smooth transition
      setTimeout(() => {
        setLoading(false);
        onComplete();
      }, 300);
    }
  }, [
    canComplete,
    isVideoReady,
    timeoutReached,
    videoError,
    displayProgress,
    onComplete,
  ]);

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

  // Determine status message based on current state
  const getStatusMessage = () => {
    if (videoError) return "Preparando experiencia...";
    if (timeoutReached) return "Finalizando carga...";
    if (isPreloading && !timeoutReached)
      return `${Math.round(displayProgress)}%`;
    if (isVideoReady) return "";
    return `Cargando... ${Math.round(displayProgress)}%`;
  };

  // Determine progress bar color based on status
  const getProgressBarColor = () => {
    if (videoError) return "from-red-600 to-red-400";
    if (timeoutReached) return "from-green-600 to-green-400";
    return "from-purple-600 to-purple-400";
  };

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
                color: timeoutReached
                  ? ["#16a34a", "#ffffff", "#16a34a"] // Green when timeout reached
                  : ["#9333ea", "#ffffff", "#9333ea"], // Purple normally
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
                className={`h-full bg-gradient-to-r ${getProgressBarColor()} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>

            {/* Progress Text */}
            <motion.div
              className={`text-sm ${
                timeoutReached
                  ? "text-green-300"
                  : videoError
                  ? "text-red-300"
                  : "text-purple-300"
              }`}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {getStatusMessage()}
            </motion.div>

            {/* Background preloading indicator */}
            {timeoutReached && continuePreloading && !isVideoReady && (
              <motion.div
                className="mt-2 text-xs text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Video cargando en segundo plano...
              </motion.div>
            )}

            {/* Development info */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <div>Video Ready: {isVideoReady ? "✅" : "❌"}</div>
                <div>Timeout Reached: {timeoutReached ? "✅" : "❌"}</div>
                <div>Can Complete: {canComplete ? "✅" : "❌"}</div>
                <div>
                  Continue Preloading: {continuePreloading ? "✅" : "❌"}
                </div>
                <div>
                  Time: {timeElapsed}ms / {minDuration}ms
                </div>
                <div>Video Progress: {Math.round(videoProgress)}%</div>
                <div>Display Progress: {Math.round(displayProgress)}%</div>
                <div>Max Wait: {maxWaitTime}ms</div>
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
