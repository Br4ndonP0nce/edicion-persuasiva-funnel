"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MotionDiv,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";
import { motion } from "framer-motion";
import Image from "next/image";

const SuccessSection = () => {
  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="py-16 bg-black relative">
      {/* Purple glow in background */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
      <div className="absolute bottom-1/2 right-1/4 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="container mx-auto px-4">
        {/* Simple flex row with 3 column divs */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column */}
          <div className="flex-1 flex flex-col space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/image/testimonials/7.jpg"
                alt="Andrew Discord message"
                width={400}
                height={300}
                className="w-full rounded-lg"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Image
                src="/image/testimonials/2.jpg"
                alt="David video message"
                width={400}
                height={400}
                className="w-full rounded-lg"
              />
            </motion.div>
          </div>

          {/* Middle column */}
          <div className="flex-1 flex flex-col space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Image
                src="/image/testimonials/10.jpg"
                alt="Alex Netflix comment"
                width={400}
                height={200}
                className="w-full rounded-lg"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Image
                src="/image/testimonials/1.jpg"
                alt="Carlos message"
                width={400}
                height={200}
                className="w-full rounded-lg"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Image
                src="/image/testimonials/9.jpg"
                alt="Bolsa de trabajo channel"
                width={400}
                height={300}
                className="w-full rounded-lg"
              />
            </motion.div>
          </div>

          {/* Right column */}
          <div className="flex-1 flex flex-col space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Image
                src="/image/testimonials/3.jpg"
                alt="Andrés YouTube comment"
                width={400}
                height={350}
                className="w-full rounded-lg"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Image
                src="/image/testimonials/5.jpg"
                alt="David reply"
                width={400}
                height={200}
                className="w-full rounded-lg"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessSection;
