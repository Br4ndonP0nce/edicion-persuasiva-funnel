// src/components/ui/VideoPlayer/EnhancedVideoPlayer.tsx
"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useVideoPlayer,
  formatVideoTime,
} from "@/hooks/EnhancedUseVideoPlayer";

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  title: string;
  subtitle?: string;
  onVideoEnd?: () => void;
  onPlay?: () => void; // NEW: Custom play handler
  onPause?: () => void; // NEW: Custom pause handler
  autoplay?: boolean;
  loop?: boolean;
  showControls?: boolean;
  allowSeeking?: boolean; // NEW: Control seeking ability
  className?: string;
  overlayContent?: React.ReactNode;
  theme?: "purple" | "green" | "blue";
  enableFullscreen?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>; // NEW: External video ref
}

interface VideoOverlayProps {
  title: string;
  subtitle?: string;
  isPlaying: boolean;
  onPlayClick: () => void;
  theme: "purple" | "green" | "blue";
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({
  title,
  subtitle,
  isPlaying,
  onPlayClick,
  theme,
}) => {
  const themeColors = {
    purple: {
      text: "text-purple-300",
      ring: "border-purple-400",
      shadow: "rgba(138, 43, 226, 0.3)",
    },
    green: {
      text: "text-green-300",
      ring: "border-green-400",
      shadow: "rgba(34, 197, 94, 0.3)",
    },
    blue: {
      text: "text-blue-300",
      ring: "border-blue-400",
      shadow: "rgba(59, 130, 246, 0.3)",
    },
  };

  const colors = themeColors[theme];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
      <div
        className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wider mb-4"
        style={{
          textShadow: `0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px ${colors.shadow}`,
        }}
      >
        {title}
      </div>

      <motion.button
        onClick={onPlayClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-${theme}-400 focus:ring-offset-2 focus:ring-offset-black`}
        aria-label="Play video"
      >
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
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
        )}

        <div
          className={`absolute inset-0 rounded-full border-2 ${colors.ring} animate-ping opacity-20`}
        ></div>
      </motion.button>

      {subtitle && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="text-white/80 text-xs tracking-wider">{subtitle}</div>
        </div>
      )}
    </div>
  );
};

interface AudioActivationOverlayProps {
  onActivate: () => void;
  theme: "purple" | "green" | "blue";
}

const AudioActivationOverlay: React.FC<AudioActivationOverlayProps> = ({
  onActivate,
  theme,
}) => {
  const themeColors = {
    purple: "bg-purple-600/90 border-purple-400",
    green: "bg-green-600/90 border-green-400",
    blue: "bg-blue-600/90 border-blue-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10 touch-none"
      onClick={onActivate}
      onTouchEnd={onActivate}
    >
      <div className="text-center cursor-pointer touch-manipulation px-4 max-w-lg">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`${themeColors[theme]} border-2 rounded-2xl px-4 sm:px-8 py-4 sm:py-6 mb-4 shadow-2xl`}
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
            <div className="text-lg sm:text-2xl md:text-3xl font-bold text-white">
              🔊
            </div>
          </div>

          <h3 className="text-lg md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
            TOCA PARA ACTIVAR
          </h3>
          <h3 className="text-lg md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">
            EL AUDIO
          </h3>

          <p className="text-white/90 text-sm sm:text-lg">
            Toca en cualquier lugar para escuchar
          </p>
        </motion.div>

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
            <span className="text-xl font-semibold">Haz clic aquí</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const EnhancedVideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  posterUrl,
  title,
  subtitle,
  onVideoEnd,
  onPlay,
  onPause,
  autoplay = false,
  loop = false,
  showControls = true,
  allowSeeking = true,
  className = "",
  overlayContent,
  theme = "purple",
  enableFullscreen = true,
  videoRef: externalVideoRef,
}) => {
  // Use external ref if provided, otherwise create internal ref
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef || internalVideoRef;
  const containerRef = useRef<HTMLDivElement>(null);

  const [videoState, videoControls] = useVideoPlayer(videoRef, containerRef, {
    autoplay,
    loop,
    muted: true,
    allowSeeking, // Pass through the allowSeeking prop
    onVideoEnd,
    onPlay: () => {
      console.log(`▶️ ${title} video started playing`);
      onPlay?.(); // Call custom play handler if provided
    },
    onPause: () => {
      console.log(`⏸️ ${title} video paused`);
      onPause?.(); // Call custom pause handler if provided
    },
  });

  // Set up video source - direct loading
  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;

    const video = videoRef.current;
    console.log(`⚡ Loading video directly for ${title}`);
    video.src = videoUrl;
  }, [videoUrl, title]);

  // Handle progress bar click
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!allowSeeking) {
      // Prevent seeking if not allowed
      e.preventDefault();
      return;
    }

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    videoControls.seekToPercentage(clickPosition * 100);
  };

  // Handle audio activation
  const handleAudioActivation = () => {
    videoControls.toggleMute();
    videoControls.setUserInteracted();
  };

  // Theme-based colors
  const themeColors = {
    purple: {
      accent: "accent-purple-500",
      progress: "bg-purple-600",
      hover: "hover:text-purple-300",
    },
    green: {
      accent: "accent-green-500",
      progress: "bg-green-600",
      hover: "hover:text-green-300",
    },
    blue: {
      accent: "accent-blue-500",
      progress: "bg-blue-600",
      hover: "hover:text-blue-300",
    },
  };

  const colors = themeColors[theme];

  return (
    <div
      className={`mx-auto rounded-lg overflow-hidden border border-gray-800 shadow-2xl ${className}`}
      ref={containerRef}
    >
      <div className="relative">
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full aspect-video bg-black"
          {...(posterUrl && { poster: posterUrl })} // Only add poster if provided
          autoPlay={autoplay}
          loop={loop}
          muted
          playsInline
          webkit-playsinline="true"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Play Overlay */}
        {videoState.showOverlay && !overlayContent && (
          <VideoOverlay
            title={title}
            subtitle={subtitle}
            isPlaying={videoState.isPlaying}
            onPlayClick={videoControls.togglePlay}
            theme={theme}
          />
        )}

        {/* Custom Overlay Content */}
        {overlayContent && videoState.showOverlay && overlayContent}

        {/* Audio Activation Overlay */}
        {videoState.isPlaying && videoState.isMuted && (
          <AudioActivationOverlay
            onActivate={handleAudioActivation}
            theme={theme}
          />
        )}

        {/* Fallback Overlay */}
        {!videoState.isPlaying && !videoState.showOverlay && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/70 z-10"
            onClick={videoControls.togglePlay}
          >
            <div className="text-center">
              <button
                onClick={videoControls.togglePlay}
                className={`relative w-16 sm:w-20 h-16 sm:h-20 rounded-full flex items-center justify-center transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-${theme}-400 bg-${theme}-600/80 hover:bg-${theme}-500/90`}
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
              </button>
              <p className="text-white/80 text-sm sm:text-base mt-3">
                Toca para reproducir con audio
              </p>
            </div>
          </div>
        )}

        {/* Video Controls */}
        {showControls && videoState.isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-3 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300">
            {/* Left Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={videoControls.togglePlay}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
                aria-label={videoState.isPlaying ? "Pause" : "Play"}
              >
                {videoState.isPlaying ? (
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
                {formatVideoTime(videoState.currentTime)} /{" "}
                {formatVideoTime(videoState.duration)}
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              {/* Volume Control */}
              <div className="group relative">
                <button
                  onClick={videoControls.toggleMute}
                  className={`text-white ${colors.hover} p-1`}
                  aria-label={videoState.isMuted ? "Unmute" : "Mute"}
                >
                  {videoState.isMuted || videoState.volume === 0 ? (
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
                    value={videoState.volume}
                    onChange={(e) =>
                      videoControls.setVolumeLevel(parseFloat(e.target.value))
                    }
                    className={`w-20 h-1 ${colors.accent}`}
                  />
                </div>
              </div>

              {/* Fullscreen Button */}
              {enableFullscreen && (
                <button
                  onClick={videoControls.toggleFullscreen}
                  className={`text-white ${colors.hover} p-1`}
                  aria-label={
                    videoState.isFullscreen ? "Exit fullscreen" : "Fullscreen"
                  }
                >
                  {videoState.isFullscreen ? (
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
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1">
          {/* Playback Progress */}
          <div
            className={`absolute top-0 left-0 h-full ${
              colors.progress
            } transition-all duration-100 ease-out ${
              allowSeeking ? "cursor-pointer" : ""
            }`}
            style={{ width: `${videoState.progressPercentage}%` }}
            {...(allowSeeking && { onClick: handleProgressBarClick })}
          />

          {/* Interactive Progress Bar Overlay - Only if seeking is allowed */}
          {allowSeeking && (
            <div
              className="absolute top-0 left-0 right-0 h-full cursor-pointer bg-transparent hover:bg-white/10"
              onClick={handleProgressBarClick}
            />
          )}

          {/* Background bar for visual feedback only when seeking is disabled */}
          {!allowSeeking && (
            <div className="absolute top-0 left-0 right-0 h-full bg-gray-800/50" />
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedVideoPlayer;
