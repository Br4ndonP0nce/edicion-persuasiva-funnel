// src/components/ui/Mentor/Mentor.tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { YouTubeEmbed } from "@next/third-parties/google";
import { getContentBySection } from "@/lib/firebase/db";

const MentorSection = () => {
  // State to track which video might be playing
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // State for CMS content
  const [content, setContent] = useState<Record<string, string>>({
    heading: "Soy Diego Hernández y seré tu mentor por los próximos 90 días",
    subheading: "Aprende Gratis Del Canal de Edición",
    subheading2: "Con Más Vistas De Habla Hispana",
    profile_image: "/image/pfp.jpeg",
  });
  const [isLoading, setIsLoading] = useState(true);

  // YouTube video data with thumbnails
  const [youtubeVideos, setYoutubeVideos] = useState([
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
  ]);

  // Fetch content from Firebase
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const contentItems = await getContentBySection("mentor");

        if (contentItems.length > 0) {
          // Create a content map
          const contentMap: Record<string, string> = {};
          contentItems.forEach((item) => {
            contentMap[item.key] = item.value;
          });

          // Update state with values from CMS, keeping defaults for missing items
          setContent((prevContent) => ({
            ...prevContent,
            ...contentMap,
          }));

          // Update YouTube videos if we have CMS data for them
          const updatedVideos = [...youtubeVideos];
          let hasChanges = false;

          for (let i = 0; i < updatedVideos.length; i++) {
            const prefix = `video${i + 1}_`;
            if (
              contentMap[`${prefix}id`] ||
              contentMap[`${prefix}title`] ||
              contentMap[`${prefix}type`]
            ) {
              hasChanges = true;
              updatedVideos[i] = {
                ...updatedVideos[i],
                id: contentMap[`${prefix}id`] || updatedVideos[i].id,
                title: contentMap[`${prefix}title`] || updatedVideos[i].title,
                type: contentMap[`${prefix}type`] || updatedVideos[i].type,
                color: contentMap[`${prefix}color`] || updatedVideos[i].color,
                thumbnail:
                  contentMap[`${prefix}thumbnail`] ||
                  updatedVideos[i].thumbnail,
              };
            }
          }

          if (hasChanges) {
            setYoutubeVideos(updatedVideos);
          }
        }
      } catch (err) {
        console.error("Error fetching mentor content:", err);
        // Keep default content on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 bg-black flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        {/* Mentor profile section */}
        <div className="flex flex-col items-center justify-center">
          {/* Diego's image */}
          <div className="mb-6 w-40 h-40 sm:w-48 sm:h-48 overflow-hidden">
            <Image
              src={content.profile_image || "/image/pfp.jpeg"}
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
