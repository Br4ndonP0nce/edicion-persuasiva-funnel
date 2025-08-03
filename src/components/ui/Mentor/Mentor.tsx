// src/components/ui/Mentor/Mentor.tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { YouTubeEmbed } from "@next/third-parties/google";

const MentorSection = () => {
  // Static content
  const content = {
    heading: "Soy Diego Hernández y seré tu mentor por los próximos 90 días",
    subheading: "Aprende Gratis Del Canal de Edición",
    subheading2: "Con Más Vistas De Habla Hispana",
    profile_image: "/image/pfp.jpeg",
  };

  // YouTube video data with thumbnails
  const youtubeVideos = [
    {
      id: "jVwSSDqCjns",
      title: "Manipulo sus emociones | Cómo m...",
      type: "EDICIÓN INMERSIVA",
      color: "text-amber-400",
      thumbnail: "/image/masterClass.jpg",
    },
    {
      id: "bn46IZeRHb0",
      title: "Ojalá me hubieran enseñado a edit...",
      type: "EDICIÓN PERSUASIVA",
      color: "text-white",
      thumbnail: "/image/persuasion1.jpg",
    },
    {
      id: "NAcwqVcVDws",
      title: "Aprender esto me ahorró años | Có...",
      type: "EDICIÓN VELOZ",
      color: "text-yellow-300",
      thumbnail: "/image/persuasion2.jpg",
    },
  ];


  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        {/* Mentor profile section */}
        <div className="flex flex-col items-center justify-center">
          {/* Diego's image */}
          <div className="mb-6 w-40 h-40 sm:w-48 sm:h-48 overflow-hidden">
            <Image
              src={content.profile_image}
              alt="Diego Hernández"
              width={192}
              height={192}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Mentor text */}
          <h2 className="text-xl sm:text-2xl md:text-3xl text-white font-medium text-center">
            {content.heading}
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
              {content.subheading}
            </h3>
            <p className="text-xl text-white font-medium mt-2">
              {content.subheading2}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentorSection;
