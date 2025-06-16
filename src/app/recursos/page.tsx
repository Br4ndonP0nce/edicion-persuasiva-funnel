// src/app/recursos/page.tsx
"use client";

import React from "react";
import { VideoPreloadProvider } from "@/contexts/VideoPreloadContent";

import EnhancedPreloader from "@/components/ui/Preloader/EnhancedPreloader";
import { useState } from "react";
import RecursosSectionImproved from "@/components/Recursos/RecursosSection";

const RecursosPage = () => {
  const [showPreloader, setShowPreloader] = useState(true);

  // Configuration for this specific route
  const videoUrl =
    "https://d29v4wmhmft6s2.cloudfront.net/landingVideos/heroVideoCompressed.mp4";

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
  };

  return (
    <VideoPreloadProvider>
      <div className="min-h-screen bg-black">
        {showPreloader && (
          <EnhancedPreloader
            videoUrl={videoUrl}
            onComplete={handlePreloaderComplete}
            minDuration={1500}
            maxWaitTime={3000}
            continueInBackground={true}
            enableAutoplay={true}
          />
        )}

        {!showPreloader && <RecursosSectionImproved />}
      </div>
    </VideoPreloadProvider>
  );
};

export default RecursosPage;
