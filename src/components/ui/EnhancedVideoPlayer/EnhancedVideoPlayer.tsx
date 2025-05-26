// src/components/ui/VideoPlayer/EnhancedVideoPlayer.tsx
"use client";

import React from "react";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { motion, AnimatePresence } from "framer-motion";

interface EnhancedVideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  autoPreload?: boolean;
  showLoadingProgress?: boolean;
  onCanPlay?: () => void;
  onError?: (error: string) => void;
}

const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  videoUrl,
  posterUrl,
  title = "EDICIÓN PERSUASIVA",
  subtitle = "Edición Persuasiva • Diego Hernández",
  className = "",
  autoPreload = true,
  showLoadingProgress = true,
  onCanPlay,
  onError,
}) => {
  const [state, actions, videoRef, containerRef] = useVideoPlayer({
    autoPreload,
    preloadStrategy: "auto", // Preload entire video for smooth playback
    onCanPlay,
    onError,
  });

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className={`mx-auto rounded-lg overflow-hidden border border-gray-800 shadow-2xl max-w-3xl ${className}`}
      ref={containerRef}
    >
      <div className="relative">
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full aspect-video bg-black"
          poster={posterUrl}
          playsInline
          webkit-playsinline="true"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Loading Overlay */}
        <AnimatePresence>
          {state.isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80"
            >
              <div className="text-white text-center">
                {/* Loading Spinner */}
                <div className="relative mb-4">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  {showLoadingProgress && state.loadProgress > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {Math.round(state.loadProgress)}%
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-300">Loading video...</p>

                {/* Progress Bar */}
                {showLoadingProgress && (
                  <div className="w-48 h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-purple-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${state.loadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buffering Overlay */}
        <AnimatePresence>
          {state.isBuffering && !state.isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50"
            >
              <div className="flex items-center space-x-2 text-white">
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Buffering...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Overlay */}
        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80"
            >
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
                <p className="text-sm text-gray-300 mb-4">{state.error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                >
                  Retry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play Overlay */}
        {!state.isPlaying &&
          state.canPlay &&
          !state.error &&
          !state.isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
              <div
                className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wider mb-4"
                style={{
                  textShadow:
                    "0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(138, 43, 226, 0.3)",
                }}
              >
                {title}
              </div>

              {/* Enhanced Play Button */}
              <motion.button
                onClick={actions.togglePlay}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-20 h-20 rounded-full  flex items-center justify-center transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-black"
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
                  {subtitle}
                </div>
              </div>
            </div>
          )}

        {/* Video Controls */}
        <AnimatePresence>
          {state.isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-3 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300"
            >
              {/* Left Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={actions.togglePlay}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
                  aria-label={state.isPlaying ? "Pause" : "Play"}
                >
                  {state.isPlaying ? (
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
                  {formatTime(state.currentTime)} / {formatTime(state.duration)}
                </span>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-2">
                {/* Volume Control */}
                <div className="group relative">
                  <button
                    onClick={actions.toggleMute}
                    className="text-white hover:text-purple-300 p-1"
                    aria-label={state.isMuted ? "Unmute" : "Mute"}
                  >
                    {state.isMuted || state.volume === 0 ? (
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
                      value={state.volume}
                      onChange={(e) =>
                        actions.setVolume(parseFloat(e.target.value))
                      }
                      className="w-20 h-1 accent-purple-500"
                    />
                  </div>
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={actions.toggleFullscreen}
                  className="text-white hover:text-purple-300 p-1"
                  aria-label={
                    state.isFullscreen ? "Exit fullscreen" : "Fullscreen"
                  }
                >
                  {state.isFullscreen ? (
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
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1">
          {/* Buffered Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-gray-600 transition-all duration-300"
            style={{ width: `${state.loadProgress}%` }}
          />

          {/* Playback Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-purple-600 cursor-pointer transition-all duration-100 ease-out"
            style={{ width: `${state.progressPercentage}%` }}
            onClick={actions.handleProgressBarClick}
          />

          {/* Interactive Progress Bar Overlay */}
          <div
            className="absolute top-0 left-0 right-0 h-full cursor-pointer bg-transparent hover:bg-white/10"
            onClick={actions.handleProgressBarClick}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedVideoPlayer;
