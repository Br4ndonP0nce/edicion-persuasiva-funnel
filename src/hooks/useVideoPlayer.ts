// src/hooks/useVideoPlayer.ts
import { useState, useRef, useEffect, useCallback } from 'react';

interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  progressPercentage: number;
  isLoading: boolean;
  isBuffering: boolean;
  canPlay: boolean;
  error: string | null;
  loadProgress: number;
}

interface VideoPlayerActions {
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  handleProgressBarClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

interface UseVideoPlayerOptions {
  autoPreload?: boolean;
  preloadStrategy?: 'auto' | 'metadata' | 'none';
  onCanPlay?: () => void;
  onError?: (error: string) => void;
  onLoadProgress?: (progress: number) => void;
}

export const useVideoPlayer = (
  options: UseVideoPlayerOptions = {}
): [VideoPlayerState, VideoPlayerActions, React.RefObject<HTMLVideoElement | null>, React.RefObject<HTMLDivElement | null>] => {
  
  const {
    autoPreload = true,
    preloadStrategy = 'auto',
    onCanPlay,
    onError,
    onLoadProgress
  } = options;

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    progressPercentage: 0,
    isLoading: true,
    isBuffering: false,
    canPlay: false,
    error: null,
    loadProgress: 0,
  });

  // Format time helper
  const formatTime = useCallback((timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Video event handlers
  const handleLoadStart = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setState(prev => ({ 
      ...prev, 
      duration: videoRef.current!.duration,
      isLoading: false 
    }));
  }, []);

  const handleCanPlay = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      canPlay: true, 
      isLoading: false,
      isBuffering: false 
    }));
    onCanPlay?.();
  }, [onCanPlay]);

  const handleCanPlayThrough = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      canPlay: true, 
      isLoading: false,
      isBuffering: false 
    }));
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    
    setState(prev => ({
      ...prev,
      currentTime: current,
      progressPercentage: duration > 0 ? (current / duration) * 100 : 0,
      isBuffering: false
    }));
  }, []);

  const handleProgress = useCallback(() => {
    if (!videoRef.current) return;
    
    const buffered = videoRef.current.buffered;
    const duration = videoRef.current.duration;
    
    if (buffered.length > 0 && duration > 0) {
      const loadProgress = (buffered.end(buffered.length - 1) / duration) * 100;
      setState(prev => ({ ...prev, loadProgress }));
      onLoadProgress?.(loadProgress);
    }
  }, [onLoadProgress]);

  const handleWaiting = useCallback(() => {
    setState(prev => ({ ...prev, isBuffering: true }));
  }, []);

  const handlePlaying = useCallback(() => {
    setState(prev => ({ ...prev, isBuffering: false }));
  }, []);

  const handleError = useCallback((e: Event) => {
    const video = e.target as HTMLVideoElement;
    const error = video.error;
    let errorMessage = 'An error occurred while loading the video';
    
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = 'Video loading was aborted';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error occurred while loading video';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = 'Video decoding error';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video format not supported';
          break;
      }
    }
    
    setState(prev => ({ 
      ...prev, 
      error: errorMessage, 
      isLoading: false,
      isBuffering: false 
    }));
    onError?.(errorMessage);
  }, [onError]);

  const handleEnded = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  // Actions
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (state.isPlaying) {
      videoRef.current.pause();
    } else {
      const playPromise = videoRef.current.play();
      
      // Handle play promise for better error handling
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing video:', error);
          setState(prev => ({ 
            ...prev, 
            error: 'Failed to play video. Please try again.',
            isPlaying: false 
          }));
        });
      }
    }

    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, [state.isPlaying]);

  const setCurrentTime = useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.volume = volume;
    setState(prev => ({ 
      ...prev, 
      volume, 
      isMuted: volume === 0 
    }));
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;

    const newMutedState = !state.isMuted;
    videoRef.current.muted = newMutedState;
    setState(prev => ({ ...prev, isMuted: newMutedState }));
  }, [state.isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
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

  const handleProgressBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;

    videoRef.current.currentTime = clickPosition * state.duration;
  }, [state.duration]);

  // Effect to setup video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Add event listeners
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);

    // Set preload strategy
    video.preload = preloadStrategy;

    // Cleanup
    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
    };
  }, [
    handleLoadStart,
    handleLoadedMetadata,
    handleCanPlay,
    handleCanPlayThrough,
    handleTimeUpdate,
    handleProgress,
    handleWaiting,
    handlePlaying,
    handleError,
    handleEnded,
    preloadStrategy
  ]);

  // Effect to handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setState(prev => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Effect to handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement !== videoRef.current) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlay, toggleMute, toggleFullscreen]);

  const actions: VideoPlayerActions = {
    togglePlay,
    setCurrentTime,
    setVolume,
    toggleMute,
    toggleFullscreen,
    handleProgressBarClick,
  };

  return [state, actions, videoRef, containerRef];
};