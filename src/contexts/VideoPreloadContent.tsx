// src/contexts/VideoPreloadContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";

interface VideoPreloadState {
  isPreloading: boolean;
  isVideoReady: boolean;
  videoUrl: string | null;
  progress: number;
  error: string | null;
  timeoutReached: boolean;
  continuePreloading: boolean;
  shouldAutoplay: boolean; // NEW: Track if autoplay should happen
}

interface PreloadOptions {
  maxWaitTime?: number;
  continueInBackground?: boolean;
  autoplay?: boolean; // NEW: Enable autoplay when ready
  onTimeout?: () => void;
  onVideoReady?: (shouldAutoplay: boolean) => void; // Updated callback
}

interface VideoPreloadContextType extends VideoPreloadState {
  startPreload: (videoUrl: string, options?: PreloadOptions) => Promise<void>;
  getPreloadedVideo: () => HTMLVideoElement | null;
  resetPreload: () => void;
  setAutoplayHandled: () => void; // NEW: Mark autoplay as handled
}

const VideoPreloadContext = createContext<VideoPreloadContextType | null>(null);

export const useVideoPreload = () => {
  const context = useContext(VideoPreloadContext);
  if (!context) {
    throw new Error("useVideoPreload must be used within VideoPreloadProvider");
  }
  return context;
};

interface VideoPreloadProviderProps {
  children: React.ReactNode;
}

export const VideoPreloadProvider: React.FC<VideoPreloadProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<VideoPreloadState>({
    isPreloading: false,
    isVideoReady: false,
    videoUrl: null,
    progress: 0,
    error: null,
    timeoutReached: false,
    continuePreloading: false,
    shouldAutoplay: false,
  });

  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const preloadOptionsRef = useRef<PreloadOptions>({});

  const resetPreload = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setState({
      isPreloading: false,
      isVideoReady: false,
      videoUrl: null,
      progress: 0,
      error: null,
      timeoutReached: false,
      continuePreloading: false,
      shouldAutoplay: false,
    });
  }, []);

  const setAutoplayHandled = useCallback(() => {
    setState((prev) => ({ ...prev, shouldAutoplay: false }));
  }, []);

  const startPreload = useCallback(
    async (videoUrl: string, options: PreloadOptions = {}): Promise<void> => {
      const {
        maxWaitTime = 3000,
        continueInBackground = true,
        autoplay = false, // NEW: Default to false for safety
        onTimeout,
        onVideoReady,
      } = options;

      preloadOptionsRef.current = {
        maxWaitTime,
        continueInBackground,
        autoplay,
        onTimeout,
        onVideoReady,
      };

      console.log(
        "🎬 Starting video preload:",
        videoUrl,
        "with timeout:",
        maxWaitTime + "ms",
        "autoplay:",
        autoplay
      );

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setState((prev) => ({
        ...prev,
        isPreloading: true,
        isVideoReady: false,
        videoUrl,
        progress: 0,
        error: null,
        timeoutReached: false,
        continuePreloading: false,
        shouldAutoplay: autoplay,
      }));

      return new Promise((resolve, reject) => {
        const video = hiddenVideoRef.current;
        if (!video) {
          console.error("❌ Video element not available");
          const errorMsg = "Video element not available";
          setState((prev) => ({
            ...prev,
            error: errorMsg,
            isPreloading: false,
            shouldAutoplay: false,
          }));
          reject(new Error(errorMsg));
          return;
        }

        timeoutRef.current = setTimeout(() => {
          console.log("⏰ Video preload timeout reached, proceeding anyway");

          setState((prev) => ({
            ...prev,
            timeoutReached: true,
            continuePreloading: continueInBackground && !prev.isVideoReady,
            isPreloading: false,
            // Keep autoplay flag if it was requested
            shouldAutoplay: autoplay,
          }));

          onTimeout?.();
          resolve();
        }, maxWaitTime);

        const handleLoadStart = () => {
          console.log("📥 Video load started");
          setState((prev) => ({ ...prev, progress: 10 }));
        };

        const handleProgress = () => {
          if (video.buffered.length > 0) {
            const buffered = video.buffered.end(0);
            const duration = video.duration;
            if (duration > 0) {
              const progress = Math.min(90, (buffered / duration) * 90);
              setState((prev) => ({ ...prev, progress }));
              console.log(`📊 Video buffering: ${progress.toFixed(1)}%`);
            }
          }
        };

        const handleCanPlay = () => {
          console.log("✅ Video can start playing");
          setState((prev) => ({ ...prev, progress: 95 }));
        };

        const handleCanPlayThrough = () => {
          console.log("🎯 Video fully preloaded and ready");

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }

          setState((prev) => ({
            ...prev,
            isVideoReady: true,
            isPreloading: false,
            progress: 100,
            continuePreloading: false,
            // Preserve autoplay intention
            shouldAutoplay: autoplay,
          }));

          // Clean up event listeners
          video.removeEventListener("loadstart", handleLoadStart);
          video.removeEventListener("progress", handleProgress);
          video.removeEventListener("canplay", handleCanPlay);
          video.removeEventListener("canplaythrough", handleCanPlayThrough);
          video.removeEventListener("error", handleError);

          // Call ready callback with autoplay info
          onVideoReady?.(autoplay);

          resolve();
        };

        const handleError = (e: Event) => {
          console.error("❌ Video preload error:", e);

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }

          const errorMessage = "Failed to preload video";
          setState((prev) => ({
            ...prev,
            error: errorMessage,
            isPreloading: false,
            progress: 0,
            continuePreloading: false,
            shouldAutoplay: false, // Reset autoplay on error
          }));

          // Clean up event listeners
          video.removeEventListener("loadstart", handleLoadStart);
          video.removeEventListener("progress", handleProgress);
          video.removeEventListener("canplay", handleCanPlay);
          video.removeEventListener("canplaythrough", handleCanPlayThrough);
          video.removeEventListener("error", handleError);

          console.log("🔄 Resolving despite error to avoid blocking UI");
          resolve();
        };

        // Add event listeners
        video.addEventListener("loadstart", handleLoadStart);
        video.addEventListener("progress", handleProgress);
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("canplaythrough", handleCanPlayThrough);
        video.addEventListener("error", handleError);

        // Start preloading
        video.preload = "auto";
        video.src = videoUrl;
        video.load();
      });
    },
    []
  );

  const getPreloadedVideo = useCallback((): HTMLVideoElement | null => {
    return hiddenVideoRef.current;
  }, []);

  const contextValue: VideoPreloadContextType = {
    ...state,
    startPreload,
    getPreloadedVideo,
    resetPreload,
    setAutoplayHandled,
  };

  return (
    <VideoPreloadContext.Provider value={contextValue}>
      {children}
      <video
        ref={hiddenVideoRef}
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none",
        }}
        muted
        playsInline
        webkit-playsinline="true"
      />
    </VideoPreloadContext.Provider>
  );
};
