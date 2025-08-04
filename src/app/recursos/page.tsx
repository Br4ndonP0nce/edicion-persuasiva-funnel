// src/app/recursos/page.tsx
"use client";

import React from "react";

import RecursosSectionImproved from "@/components/Recursos/RecursosSection";

const RecursosPage = () => {
  // Configuration for this specific route
  const videoUrl = "/video/heroVideo.mp4";

  return (
    <div className="min-h-screen bg-black">
      <RecursosSectionImproved />
    </div>
  );
};

export default RecursosPage;
