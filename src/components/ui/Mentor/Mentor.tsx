"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { YouTubeEmbed } from "@next/third-parties/google";
const MentorSection = () => {
  // State to track which video might be playing
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // YouTube video data with thumbnails
  const youtubeVideos = [
    {
      id: "jVwSSDqCjns", // Replace with actual YouTube video ID
      title: "Manipulo sus emociones | Cómo m...",
      type: "EDICIÓN INMERSIVA",
      color: "text-amber-400",
      thumbnail: "/images/video-thumbnails/inmersiva.jpg", // Replace with actual thumbnail path
    },
    {
      id: "bn46IZeRHb0", // Replace with actual YouTube video ID
      title: "Ojalá me hubieran enseñado a edit...",
      type: "EDICIÓN PERSUASIVA",
      color: "text-white",
      thumbnail: "/images/video-thumbnails/persuasiva.jpg", // Replace with actual thumbnail path
    },
    {
      id: "NAcwqVcVDws", // Replace with actual YouTube video ID
      title: "Aprender esto me ahorró años | Có...",
      type: "EDICIÓN VELOZ",
      color: "text-yellow-300",
      thumbnail: "/images/video-thumbnails/veloz.jpg", // Replace with actual thumbnail path
    },
  ];

  // Handle clicking on a video thumbnail
  const handleVideoClick = (videoId: string) => {
    setPlayingVideo(videoId);
    // In a real implementation, you might open a modal or redirect to YouTube
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        {/* Mentor profile section */}
        <div className="flex flex-col items-center justify-center">
          {/* Diego's image */}
          <div className="mb-6 w-40 h-40 sm:w-48 sm:h-48 overflow-hidden">
            <Image
              src="/image/pfp.jpeg"
              alt="Diego Hernández"
              width={192}
              height={192}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Mentor text */}
          <h2 className="text-xl sm:text-2xl md:text-3xl text-white font-medium text-center">
            Soy Diego Hernández y seré tu mentor por los próximos 90 días
          </h2>
        </div>

        {/* YouTube videos section */}
        <div className="max-w-6xl mx-auto mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {youtubeVideos.map((video, index) => (
              <div
                key={video.id}
                className="rounded-lg overflow-hidden shadow-xl"
              >
                {/* Next.js YouTube Embed - super simple! */}
                <div className="relative">
                  <YouTubeEmbed videoid={video.id} params="controls=1&rel=0" />

                  {/* Add the type label overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 py-6 pointer-events-none">
                    <div
                      className={`font-bold text-xl text-center ${
                        video.type === "EDICIÓN INMERSIVA"
                          ? "text-amber-400"
                          : video.type === "EDICIÓN PERSUASIVA"
                          ? "text-white"
                          : "text-yellow-300"
                      }`}
                    >
                      {video.type}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Channel text */}
          <div className="text-center mt-16">
            <h3 className="text-2xl text-white font-medium">
              Aprende Gratis Del Canal de Edición
            </h3>
            <p className="text-xl text-white font-medium mt-2">
              Con Más Vistas De Habla Hispana
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentorSection;
