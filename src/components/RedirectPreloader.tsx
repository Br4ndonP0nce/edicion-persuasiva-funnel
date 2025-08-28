"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShinyText from "@/components/animated/shinyText";

interface RedirectPreloaderProps {
  url: string;
  onRedirect: () => void;
  duration?: number;
  brandText?: string;
}

const RedirectPreloader: React.FC<RedirectPreloaderProps> = ({
  url,
  onRedirect,
  duration = 1200, // 1.2 seconds - faster for redirects
  brandText = "EDICIÓN PERSUASIVA",
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let redirectTimer: NodeJS.Timeout;

    // Smooth progress animation
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 4 + 2; // Faster increment for shorter duration
        const newProgress = Math.min(prev + increment, 95); // Stop at 95% until completion
        return newProgress;
      });
    }, 60); // Update every 60ms for smooth animation

    // Complete and redirect after duration
    redirectTimer = setTimeout(() => {
      setProgress(100);
      setIsComplete(true);

      // Brief pause to show completion, then redirect
      setTimeout(() => {
        setIsVisible(false);
        onRedirect();
      }, 200);
    }, duration);

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [duration, onRedirect]);

  // Generate animated grid background
  const gridItems = Array.from({ length: 35 }, (_, i) => (
    <motion.div
      key={i}
      className="h-6 w-6 bg-purple-600/10 rounded-sm"
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.1, 0.3, 0.1],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        delay: i * 0.02,
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
          transition: { duration: 0.3, ease: "easeOut" },
        }}
      >
        {/* Animated Grid Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-7 gap-3 opacity-30">{gridItems}</div>
        </div>

        {/* Main Content */}
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Brand Text with ShinyText */}
          <div className="mb-6">
            <ShinyText
              text={brandText}
              speed={3}
              className="text-3xl md:text-4xl font-bold text-purple-400"
            />
          </div>

          {/* Redirect Message */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="text-purple-200 text-lg font-medium mb-2">
              {isComplete ? "¡Listo!" : "Redirecting..."}
            </div>
            <div className="text-purple-300/60 text-sm max-w-sm mx-auto truncate">
              {url}
            </div>
          </motion.div>

          {/* Progress Section */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Progress Bar */}
            <div className="w-56 h-1.5 bg-gray-800/60 rounded-full mx-auto overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                  type: "tween",
                }}
              />
            </div>

            {/* Progress Text */}
            <motion.div
              className="text-xs text-purple-300/70 font-medium"
              animate={{
                opacity: isComplete ? [1, 0.5, 1] : [0.5, 1, 0.5],
              }}
              transition={{
                duration: isComplete ? 0.5 : 1.2,
                repeat: isComplete ? 1 : Infinity,
                ease: "easeInOut",
              }}
            >
              {Math.round(progress)}%
            </motion.div>
          </motion.div>

          {/* Completion Checkmark */}
          {isComplete && (
            <motion.div
              className="mt-4 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
            >
              <motion.svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>
          )}
        </motion.div>

        {/* Subtle pulse overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-purple-900/15 via-transparent to-transparent"
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.01, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default RedirectPreloader;