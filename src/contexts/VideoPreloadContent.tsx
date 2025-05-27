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
}

interface VideoPreloadContextType extends VideoPreloadState {
  startPreload: (videoUrl: string) => Promise<void>;
  getPreloadedVideo: () => HTMLVideoElement | null;
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
  });

  const hiddenVideoRef = useRef<HTMLVideoElement>(null);

  const startPreload = useCallback(async (videoUrl: string): Promise<void> => {
    console.log("🎬 Starting video preload:", videoUrl);

    setState((prev) => ({
      ...prev,
      isPreloading: true,
      isVideoReady: false,
      videoUrl,
      progress: 0,
      error: null,
    }));

    return new Promise((resolve, reject) => {
      const video = hiddenVideoRef.current;
      if (!video) {
        console.error("❌ Video element not available");
        const errorMsg = "Video element not available";
        setState((prev) => ({ ...prev, error: errorMsg, isPreloading: false }));
        reject(new Error(errorMsg));
        return;
      }

      // Set up event listeners
      const handleLoadStart = () => {
        console.log("📥 Video load started");
        setState((prev) => ({ ...prev, progress: 10 }));
      };

      const handleProgress = () => {
        if (video.buffered.length > 0) {
          const buffered = video.buffered.end(0);
          const duration = video.duration;
          if (duration > 0) {
            const progress = Math.min(90, (buffered / duration) * 90); // Max 90% during preload
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
        setState((prev) => ({
          ...prev,
          isVideoReady: true,
          isPreloading: false,
          progress: 100,
        }));

        // Clean up event listeners
        video.removeEventListener("loadstart", handleLoadStart);
        video.removeEventListener("progress", handleProgress);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("canplaythrough", handleCanPlayThrough);
        video.removeEventListener("error", handleError);

        resolve();
      };

      const handleError = (e: Event) => {
        console.error("❌ Video preload error:", e);
        const errorMessage = "Failed to preload video";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isPreloading: false,
          progress: 0,
        }));

        // Clean up event listeners
        video.removeEventListener("loadstart", handleLoadStart);
        video.removeEventListener("progress", handleProgress);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("canplaythrough", handleCanPlayThrough);
        video.removeEventListener("error", handleError);

        reject(new Error(errorMessage));
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
  }, []);

  const getPreloadedVideo = useCallback((): HTMLVideoElement | null => {
    return hiddenVideoRef.current;
  }, []);

  const contextValue: VideoPreloadContextType = {
    ...state,
    startPreload,
    getPreloadedVideo,
  };

  return (
    <VideoPreloadContext.Provider value={contextValue}>
      {children}
      {/* Hidden video element for preloading */}
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
