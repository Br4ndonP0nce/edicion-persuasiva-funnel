// src/components/ui/success/Success.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const SuccessSection = () => {
  // Static discord images
  const discordImages = [
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
  ];


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
