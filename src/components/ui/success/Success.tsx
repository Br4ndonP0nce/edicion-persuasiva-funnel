// src/components/ui/success/Success.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getContentBySection } from "@/lib/firebase/db";

const SuccessSection = () => {
  const [isLoading, setIsLoading] = useState(true);
  // Default discord images
  const [discordImages, setDiscordImages] = useState([
    // Left column
    "/image/testimonials/7.jpg",
    "/image/testimonials/2.jpg",

    // Middle column
    "/image/testimonials/10.jpg",
    "/image/testimonials/1.jpg",
    "/image/testimonials/9.jpg",

    // Right column
    "/image/testimonials/3.jpg",
    "/image/testimonials/5.jpg",
  ]);

  // State for CMS content
  const [content, setContent] = useState<Record<string, string>>({});

  // Fetch content from Firebase
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const contentItems = await getContentBySection("success");

        if (contentItems.length > 0) {
          // Create a content map
          const contentMap: Record<string, string> = {};
          contentItems.forEach((item) => {
            contentMap[item.key] = item.value;
          });

          setContent(contentMap);

          // Update discord images if we have them in CMS
          const updatedImages = [...discordImages];
          let hasChanges = false;

          for (let i = 0; i < updatedImages.length; i++) {
            const imageKey = `image${i + 1}`;
            if (contentMap[imageKey]) {
              updatedImages[i] = contentMap[imageKey];
              hasChanges = true;
            }
          }

          if (hasChanges) {
            setDiscordImages(updatedImages);
          }
        }
      } catch (err) {
        console.error("Error fetching success content:", err);
        // Keep default content on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-black relative flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-black relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 flex items-center justify-center">
        {/* 
              Simple responsive grid:
              - On desktop (md and up): 3 columns
              - On mobile: single column 
            */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column images */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-lg overflow-hidden shadow-lg"
            >
              <Image
                src={discordImages[0]}
                alt="Discord message"
                width={500}
                height={300}
                className="w-full h-auto"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-lg overflow-hidden shadow-lg"
            >
              <Image
                src={discordImages[1]}
                alt="Discord message"
                width={500}
                height={400}
                className="w-full h-auto"
              />
            </motion.div>
          </div>

          {/* Middle column images */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-lg overflow-hidden shadow-lg"
            >
              <Image
                src={discordImages[2]}
                alt="Discord message"
                width={500}
                height={200}
                className="w-full h-auto"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-lg overflow-hidden shadow-lg"
            >
              <Image
                src={discordImages[3]}
                alt="Discord message"
                width={500}
                height={200}
                className="w-full h-auto"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="rounded-lg overflow-hidden shadow-lg"
            >
              <Image
                src={discordImages[4]}
                alt="Discord message"
                width={500}
                height={300}
                className="w-full h-auto"
              />
            </motion.div>
          </div>

          {/* Right column images */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="rounded-lg overflow-hidden shadow-lg"
            >
              <Image
                src={discordImages[5]}
                alt="Discord message"
                width={500}
                height={350}
                className="w-full h-auto"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="rounded-lg overflow-hidden shadow-lg"
            >
              <Image
                src={discordImages[6]}
                alt="Discord message"
                width={500}
                height={200}
                className="w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessSection;
