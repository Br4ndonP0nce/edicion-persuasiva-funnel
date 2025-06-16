// src/hooks/useVideoPlayer.ts
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseVideoPlayerOptions {
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  allowSeeking?: boolean; // NEW: Control whether seeking is allowed
  onVideoEnd?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onVolumeChange?: (volume: number, muted: boolean) => void;
}

interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  progressPercentage: number;
  hasUserInteracted: boolean;
  showOverlay: boolean;
  videoEnded: boolean;
  isLoading: boolean;
  error: string | null;
}

interface VideoPlayerControls {
  togglePlay: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  restart: () => void;
  seekTo: (time: number) => void;
  seekToPercentage: (percentage: number) => void;
  setVolumeLevel: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  setUserInteracted: () => void;
  resetPlayer: () => void;
}

export const useVideoPlayer = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseVideoPlayerOptions = {}
): [VideoPlayerState, VideoPlayerControls] => {
  const {
    autoplay = false,
    loop = false,
    muted = true,
    allowSeeking = true, // NEW: Default to true for backward compatibility
    onVideoEnd,
    onPlay,
    onPause,
    onTimeUpdate,
    onVolumeChange,
  } = options;

  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: muted,
    isFullscreen: false,
    progressPercentage: 0,
    hasUserInteracted: false,
    showOverlay: true,
    videoEnded: false,
    isLoading: true,
    error: null,
  });

  // Format time helper
  const formatTime = useCallback((timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Video control functions
  const togglePlay = useCallback(async (): Promise<void> => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    if (state.isPlaying) {
      video.pause();
    } else {
      // If video ended, restart from beginning
      if (state.videoEnded) {
        video.currentTime = 0;
        setState(prev => ({ ...prev, videoEnded: false }));
      }

      // If this is user-initiated play and they've interacted, unmute the video
      if (state.hasUserInteracted && state.isMuted) {
        video.muted = false;
        setState(prev => ({ ...prev, isMuted: false }));
      }

      try {
        await video.play();
      } catch (error) {
        console.error("Error playing video:", error);
        setState(prev => ({ 
          ...prev, 
          error: "Failed to play video" 
        }));
      }
    }
  }, [state.isPlaying, state.videoEnded, state.hasUserInteracted, state.isMuted]);

  const play = useCallback(async (): Promise<void> => {
    if (!videoRef.current || state.isPlaying) return;

    const video = videoRef.current;
    
    if (state.videoEnded) {
      video.currentTime = 0;
      setState(prev => ({ ...prev, videoEnded: false }));
    }

    try {
      await video.play();
    } catch (error) {
      console.error("Error playing video:", error);
      setState(prev => ({ 
        ...prev, 
        error: "Failed to play video" 
      }));
    }
  }, [state.isPlaying, state.videoEnded]);

  const pause = useCallback((): void => {
    if (!videoRef.current) return;
    videoRef.current.pause();
  }, []);

  const restart = useCallback((): void => {
    if (!videoRef.current) return;
    
    videoRef.current.currentTime = 0;
    setState(prev => ({ 
      ...prev, 
      videoEnded: false,
      currentTime: 0,
      progressPercentage: 0
    }));
  }, []);

  const seekTo = useCallback((time: number): void => {
    if (!videoRef.current || !allowSeeking) return; // Respect allowSeeking option
    videoRef.current.currentTime = Math.max(0, Math.min(time, state.duration));
  }, [state.duration, allowSeeking]);

  const seekToPercentage = useCallback((percentage: number): void => {
    if (!videoRef.current || state.duration === 0 || !allowSeeking) return; // Respect allowSeeking option
    const time = (percentage / 100) * state.duration;
    seekTo(time);
  }, [seekTo, state.duration, allowSeeking]);

  const setVolumeLevel = useCallback((newVolume: number): void => {
    if (!videoRef.current) return;

    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    videoRef.current.volume = clampedVolume;
    
    setState(prev => ({ 
      ...prev, 
      volume: clampedVolume,
      isMuted: clampedVolume === 0
    }));
    
    onVolumeChange?.(clampedVolume, clampedVolume === 0);
  }, [onVolumeChange]);

  const toggleMute = useCallback((): void => {
    if (!videoRef.current) return;

    const newMutedState = !state.isMuted;
    videoRef.current.muted = newMutedState;
    
    setState(prev => ({ ...prev, isMuted: newMutedState }));
    onVolumeChange?.(state.volume, newMutedState);
  }, [state.isMuted, state.volume, onVolumeChange]);

  const toggleFullscreen = useCallback((): void => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => {
          setState(prev => ({ ...prev, isFullscreen: true }));
        })
        .catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
      document.exitFullscreen();
      setState(prev => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  const setUserInteracted = useCallback((): void => {
    setState(prev => ({ ...prev, hasUserInteracted: true }));
  }, []);

  const resetPlayer = useCallback((): void => {
    setState({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      isMuted: muted,
      isFullscreen: false,
      progressPercentage: 0,
      hasUserInteracted: false,
      showOverlay: true,
      videoEnded: false,
      isLoading: true,
      error: null,
    });
  }, [muted]);

  // Set up video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setState(prev => ({ 
        ...prev, 
        duration: video.duration,
        isLoading: false
      }));
    };

    const handlePlay = () => {
      setState(prev => ({ 
        ...prev, 
        isPlaying: true,
        showOverlay: false
      }));
      onPlay?.();
    };

    const handlePause = () => {
      setState(prev => ({ 
        ...prev, 
        isPlaying: false,
        showOverlay: true
      }));
      onPause?.();
    };

    const handleEnded = () => {
      setState(prev => ({ 
        ...prev, 
        isPlaying: false,
        videoEnded: true,
        showOverlay: true
      }));
      onVideoEnd?.();
    };

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const duration = video.duration;
      
      setState(prev => ({
        ...prev,
        currentTime: current,
        progressPercentage: duration > 0 ? (current / duration) * 100 : 0
      }));
      
      onTimeUpdate?.(current, duration);
    };

    const handleVolumeChange = () => {
      setState(prev => ({
        ...prev,
        volume: video.volume,
        isMuted: video.muted
      }));
    };

    const handleLoadStart = () => {
      setState(prev => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      setState(prev => ({ ...prev, isLoading: false }));
    };

    const handleError = () => {
      setState(prev => ({ 
        ...prev, 
        error: "Video failed to load",
        isLoading: false 
      }));
    };

    // Add event listeners
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [videoRef, onVideoEnd, onPlay, onPause, onTimeUpdate]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setState(prev => ({ 
        ...prev, 
        isFullscreen: !!document.fullscreenElement 
      }));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Track user interaction for unmuting
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted();
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };

    if (!state.hasUserInteracted) {
      document.addEventListener("click", handleUserInteraction);
      document.addEventListener("keydown", handleUserInteraction);
      document.addEventListener("touchstart", handleUserInteraction);

      return () => {
        document.removeEventListener("click", handleUserInteraction);
        document.removeEventListener("keydown", handleUserInteraction);
        document.removeEventListener("touchstart", handleUserInteraction);
      };
    }
  }, [state.hasUserInteracted, setUserInteracted]);

  const controls: VideoPlayerControls = {
    togglePlay,
    play,
    pause,
    restart,
    seekTo,
    seekToPercentage,
    setVolumeLevel,
    toggleMute,
    toggleFullscreen,
    setUserInteracted,
    resetPlayer,
  };

  return [state, controls];
};

// Utility function to format time - can be used outside the hook
export const formatVideoTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};