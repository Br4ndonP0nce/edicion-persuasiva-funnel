// src/components/ui/Preloader/SimplifiedPreloader.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShinyText from "@/components/animated/shinyText";

interface SimplifiedPreloaderProps {
  onComplete: () => void;
  duration?: number; // Total preloader duration in milliseconds
  fadeOutDuration?: number; // Fade out duration in milliseconds
  brandText?: string; // Customizable brand text
  showProgress?: boolean; // Whether to show fake progress
}

const SimplifiedPreloader: React.FC<SimplifiedPreloaderProps> = ({
  onComplete,
  duration = 2000, // 2 seconds default
  fadeOutDuration = 500, // 0.5 second fade out
  brandText = "EDICIÓN PERSUASIVA",
  showProgress = true,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let completeTimer: NodeJS.Timeout;

    // Simulate progress if enabled
    if (showProgress) {
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          // Smooth progress animation that reaches 100% just before completion
          const increment = Math.random() * 3 + 1; // Random increment between 1-4
          const newProgress = Math.min(prev + increment, 100);
          return newProgress;
        });
      }, 80); // Update every 80ms for smooth animation
    } else {
      // If no progress, just set to 100% immediately
      setProgress(100);
    }

    // Complete the preloader after specified duration
    completeTimer = setTimeout(() => {
      setProgress(100); // Ensure progress reaches 100%
      setIsComplete(true);

      // Start fade out after a brief moment
      setTimeout(() => {
        setIsVisible(false);

        // Call onComplete after fade out is done
        setTimeout(() => {
          onComplete();
        }, fadeOutDuration);
      }, 100);
    }, duration);

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (completeTimer) clearTimeout(completeTimer);
    };
  }, [duration, fadeOutDuration, onComplete, showProgress]);

  // Generate animated grid background
  const gridItems = Array.from({ length: 42 }, (_, i) => (
    <motion.div
      key={i}
      className="h-8 w-8 bg-purple-600/8 rounded-sm"
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.05, 0.2, 0.05],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay: i * 0.03,
        ease: "easeInOut",
      }}
    />
  ));

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          transition: { duration: fadeOutDuration / 1000, ease: "easeOut" },
        }}
      >
        {/* Animated Grid Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-7 gap-3 opacity-40">{gridItems}</div>
        </div>

        {/* Main Content */}
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Brand Text with ShinyText */}
          <div className="mb-8">
            <ShinyText
              text={brandText}
              speed={2.5}
              className="text-4xl md:text-5xl font-bold text-purple-400"
            />
          </div>

          {/* Progress Section */}
          {showProgress && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* Progress Bar */}
              <div className="w-48 h-1 bg-gray-800/60 rounded-full mx-auto overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                    type: "tween",
                  }}
                />
              </div>

              {/* Progress Text */}
              <motion.div
                className="text-sm text-purple-300/80 font-medium"
                animate={{
                  opacity: isComplete ? [1, 0.6, 1] : [0.6, 1, 0.6],
                }}
                transition={{
                  duration: isComplete ? 0.6 : 1.5,
                  repeat: isComplete ? 2 : Infinity,
                  ease: "easeInOut",
                }}
              >
                {isComplete ? "Listo" : `${Math.round(progress)}%`}
              </motion.div>
            </motion.div>
          )}

          {/* Completion Indicator */}
          {isComplete && (
            <motion.div
              className="mt-6 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
            >
              <motion.svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>
          )}

          {/* Development Info */}
          {process.env.NODE_ENV === "development" && (
            <motion.div
              className="mt-8 text-xs text-gray-500 space-y-1 max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div>Progress: {Math.round(progress)}%</div>
              <div>Duration: {duration}ms</div>
              <div>Fade Out: {fadeOutDuration}ms</div>
              <div>Complete: {isComplete ? "✅" : "❌"}</div>
            </motion.div>
          )}
        </motion.div>

        {/* Subtle pulse overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-purple-900/10 via-transparent to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default SimplifiedPreloader;
