// src/components/ui/YoutubeVideo/Youtube.tsx
"use client";

import React from "react";
import { YouTubeEmbed } from "@next/third-parties/google";
import { motion } from "framer-motion";

const YoutubeSection: React.FC = () => {
  // Static content
  const content = {
    video_id: "PZNaH57y6YE",
    description: "Aprende más con mis videos de Edición Persuasiva en Youtube",
  };


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
