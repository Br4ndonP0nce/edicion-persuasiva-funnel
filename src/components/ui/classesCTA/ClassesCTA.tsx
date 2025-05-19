// src/components/ui/classesCTA/ClassesCTA.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getContentBySection } from "@/lib/firebase/db";

const ClassesCTA = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for CMS content
  const [content, setContent] = useState<Record<string, string>>({
    heading: "ACCEDE A LA ACADEMIA DE EDICION PERSUASIVA",
    subheading: "La academia de edición MÁS COMPLETA de habla hispana",
    module1: "MÓDULO COGNITIVO",
    module2: "MÓDULO PRÁCTICO",
    module3: "CIERRES DE VENTAS",
    poster_image: "/image/hero-poster.jpg",
    cta_button: "Deseo acceder hoy",
    cta_url: "join",
  });

  // Fetch content from Firebase
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const contentItems = await getContentBySection("classes_cta");

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
        console.error("Error fetching classes CTA content:", err);
        // Keep default content on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  if (isLoading) {
    return (
      <div className="bg-black min-h-[300px] text-white overflow-hidden p-6 relative flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-[600px] text-white overflow-hidden p-6 relative">
      {/* Background gradient effects */}
      <div className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="absolute bottom-[5%] right-[10%] w-56 h-56 rounded-full bg-purple-600/10 blur-3xl" />

      {/* Content container */}
      <div className="relative z-10">
        {/* Main heading */}
        <div className="text-center mb-3 flex flex-col items-center">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white leading-tight">
            {content.heading}
          </h1>
        </div>

        {/* Module buttons */}
        <div className="text-center mb-6">
          <div className="text-purple-300 text-xs sm:text-sm md:text-xl font-medium">
            {content.subheading}
          </div>
        </div>

        {/* Video player */}
        <div className="mx-auto rounded-lg overflow-hidden border border-gray-800 shadow-2xl max-w-xl">
          <div className="relative">
            {/* Video with dark overlay */}
            <div className="relative aspect-video bg-gray-900">
              {/* Video background - studio setup */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{
                  backgroundImage: `url('${
                    content.poster_image ||
                    "https://images.unsplash.com/photo-1598550476439-6847785fcea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                  }')`,
                }}
              />

              {/* Centered logo with glow effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wider"
                  style={{
                    textShadow:
                      "0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(138, 43, 226, 0.3)",
                  }}
                >
                  {content.logo_text || "EDICIÓN PERSUASIVA"}
                </div>
              </div>

              {/* Small subtitle below logo */}
              <div className="absolute bottom-12 left-0 right-0 flex justify-center">
                <div className="text-white/80 text-xs tracking-wider">
                  {content.subtitle || "Edición Persuasiva • Diego Hernández"}
                </div>
              </div>

              {/* Video controls */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-2 bg-black/80">
                {/* Play button and timestamp */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-6 h-6 flex items-center justify-center hover:bg-purple-700/50 rounded-full transition-colors"
                  >
                    {isPlaying ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                  <span className="text-white text-xs">01:17</span>
                </div>

                {/* Right side controls */}
                <div className="flex items-center space-x-2">
                  <button className="text-white hover:text-purple-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0l-2.828 2.828m2.828-2.828a5 5 0 017.072 0m-9.9-2.828a9 9 0 0112.728 0M3 3l3.546 3.546m0 0a9 9 0 0112.728 0M3 3l3.546 3.546"
                      />
                    </svg>
                  </button>
                  <button className="text-white hover:text-purple-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  <button className="text-white hover:text-purple-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                  <button className="text-white hover:text-purple-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Progress bar at the bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                <div className="h-full bg-purple-600 w-[20%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Application button */}
        <div className="mt-8 text-center">
          <Link href={content.cta_url || "join"}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-700 hover:bg-purple-600 text-white font-semibold text-base md:text-2xl sm:text-lg py-4 px-8 rounded-md"
              style={{
                boxShadow: "0 0 10px rgba(138, 43, 226, 0.4)",
              }}
            >
              {content.cta_button}
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClassesCTA;
