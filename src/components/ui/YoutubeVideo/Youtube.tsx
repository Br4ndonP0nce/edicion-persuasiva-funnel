// src/components/ui/YoutubeVideo/Youtube.tsx
"use client";

import React, { useEffect, useState } from "react";
import { YouTubeEmbed } from "@next/third-parties/google";
import { motion } from "framer-motion";
import { getContentBySection } from "@/lib/firebase/db";

const YoutubeSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  // State for CMS content
  const [content, setContent] = useState<Record<string, string>>({
    video_id: "PZNaH57y6YE",
    description: "Aprende más con mis videos de Edición Persuasiva en Youtube",
  });

  // Fetch content from Firebase
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const contentItems = await getContentBySection("youtube");

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
        }
      } catch (err) {
        console.error("Error fetching youtube content:", err);
        // Keep default content on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full bg-black py-16 sm:py-20 px-4 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black py-16 sm:py-20 px-4 flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto">
        {/* YouTube Video with glow effect border */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-lg overflow-hidden shadow-[0_0_15px_rgba(138,43,226,0.3)]"
        >
          <YouTubeEmbed videoid={content.video_id} params="controls=1&rel=0" />
        </motion.div>

        {/* Text below video */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-gray-300 mt-6 sm:mt-8 text-lg sm:text-xl"
        >
          {content.description}
        </motion.p>
      </div>
    </div>
  );
};

export default YoutubeSection;
