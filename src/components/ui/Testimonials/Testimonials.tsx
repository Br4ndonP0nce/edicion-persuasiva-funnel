// src/components/ui/Testimonials/Testimonials.tsx
"use client";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  MotionDiv,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";
import { motion } from "framer-motion";
import Image from "next/image";

const TestimonialsSection = () => {
  // Static content
  const content = {
    quote:
      "La mejor forma de editar bien y vivir bien de la edición es con un mentor que ya ha logrado lo que quieres lograr",
    testimony1_title: "$1,275 dólares mensuales de UN SOLO CLIENTE",
    testimony1_description:
      "para Santiago, un mes después de haber ingresado a la academia, más un cliente extra de $110 por video",
    testimony1_extra: "Todo, desde la bolsa de trabajo de la Academia",
    testimony1_image: "/image/testimonials/6.jpg",
    testimony2_title: "$1,000 dólares mensuales con UN SOLO CLIENTE",
    testimony2_extra: "$350 dólares por video con otro cliente",
    testimony2_description:
      "para Andrew quien ingresó a finales de enero y en febrero adquirió el cliente desde la bolsa de trabajo de la academia.",
    testimony2_image: "/image/testimonials/4.jpg",
    testimony3_title: "De no saber editar a cerrar su PRIMER CLIENTE",
    testimony3_description:
      "Alex ingresó sin haber tocado Premiere Pro o After Effects. Hoy ya recibe pagos y le han aumentado la paga por su nivel superior de edición",
    testimony3_quote:
      "Fíjate que ya me delegaron más clientes en este caso el esposo de Fernanda la clienta los mismos videos de Fer y los de Gert cliente de su agencia, quiero organizarme en eso!",
    testimony3_image: "/image/testimonials/8.jpg",
    testimony3_whatsapp: "/image/paola.jpg",
    cta_button: "Deseo Aplicar",
    cta_url: "join",
  };

  const containerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const glowVariant = {
    initial: { boxShadow: "0 0 10px 0px rgba(138, 43, 226, 0.4)" },
    hover: { boxShadow: "0 0 25px 5px rgba(138, 43, 226, 0.6)" },
  };


  return (
    <section className="py-16 bg-black relative">
      {/* Purple glow background effects */}
      <div className="absolute top-1/4 left-[10%] w-80 h-80 rounded-full bg-purple-600/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-[10%] w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />

      {/* Quote at the top */}
      <div className="container mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <p className="text-xl md:text-2xl lg:text-3xl text-white font-medium italic">
            "{content.quote}"
          </p>
        </motion.div>
      </div>

      {/* Centered container with explicit max width */}
      <motion.div
        className="mx-auto px-4 space-y-9"
        style={{ maxWidth: "960px" }} /* Explicit max width */
        variants={containerVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {/* First Testimonial - Santiago */}
        <motion.div variants={itemVariant} className="relative">
          <motion.div
            initial="initial"
            whileHover="hover"
            variants={glowVariant}
            className="bg-[#13111b]/90 backdrop-blur-sm rounded-lg border border-purple-900/50 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Left side - Discord conversation with constrained height */}
              <div className="w-full md:w-1/2 p-6">
                <div
                  className="rounded-lg overflow-hidden shadow-lg"
                  style={{ maxHeight: "400px" }}
                >
                  <div className="relative" style={{ height: "320px" }}>
                    <Image
                      src={content.testimony1_image}
                      alt="Santiago's Discord conversation"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Right side - Results summary */}
              <div className="w-full md:w-1/2 p-6 bg-[#1a1526] flex flex-col justify-center">
                <h3 className="text-purple-300 text-2xl md:text-3xl font-bold mb-4 heading-glow">
                  {content.testimony1_title}
                </h3>
                <p className="text-gray-300 mb-4">
                  {content.testimony1_description}
                </p>
                <p className="text-gray-300 mb-8">{content.testimony1_extra}</p>

                {/* Bolsa de trabajo tag */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center bg-gray-800/80 px-3 py-2 rounded-md self-start job-badge"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-300">#</span>
                      <span className="text-white">bolsa-de-trabajo</span>
                      <span className="text-purple-400">💼</span>
                    </div>
                    <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">
                      99
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Second Testimonial - Andrew */}
        <motion.div variants={itemVariant} className="relative">
          <motion.div
            initial="initial"
            whileHover="hover"
            variants={glowVariant}
            className="bg-[#13111b]/90 backdrop-blur-sm rounded-lg border border-purple-900/50 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Left side - Summary */}
              <div className="w-full md:w-1/2 p-6 bg-[#1a1526] flex flex-col justify-center order-2 md:order-1">
                <h3 className="text-purple-300 text-2xl md:text-3xl font-bold mb-2 heading-glow">
                  {content.testimony2_title}
                </h3>
                <div className="flex items-center mb-2">
                  <span className="text-2xl text-white">+</span>
                </div>
                <h3 className="text-purple-300 text-2xl md:text-3xl font-bold mb-4 heading-glow">
                  {content.testimony2_extra}
                </h3>
                <p className="text-gray-300">
                  {content.testimony2_description}
                </p>
              </div>

              {/* Right side - Discord conversation with constrained height */}
              <div className="w-full md:w-1/2 p-6 order-1 md:order-2">
                <div
                  className="rounded-lg overflow-hidden shadow-lg"
                  style={{ maxHeight: "400px" }}
                >
                  <div className="relative" style={{ height: "320px" }}>
                    <Image
                      src={content.testimony2_image}
                      alt="Andrew's Discord conversation"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Third Testimonial - Alex */}
        <motion.div variants={itemVariant} className="relative">
          <motion.div
            initial="initial"
            whileHover="hover"
            variants={glowVariant}
            className="bg-[#13111b]/90 backdrop-blur-sm rounded-lg border border-purple-900/50 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Left side - Discord conversation with constrained height */}
              <div className="w-full md:w-1/2 p-6">
                <div
                  className="rounded-lg overflow-hidden shadow-lg"
                  style={{ maxHeight: "400px" }}
                >
                  <div className="relative" style={{ height: "320px" }}>
                    <Image
                      src={content.testimony3_image}
                      alt="Alex's Discord conversation"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Right side - Results summary */}
              <div className="w-full md:w-1/2 p-6 bg-[#1a1526] flex flex-col justify-between">
                <div>
                  <h3 className="text-purple-300 text-2xl md:text-3xl font-bold mb-4 heading-glow">
                    {content.testimony3_title}
                  </h3>
                  <p className="text-gray-300 mb-6">
                    {content.testimony3_description}
                  </p>

                  <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                    <p className="text-gray-300 text-sm">
                      {content.testimony3_quote}
                      <span className="text-gray-500 italic">(editado)</span>
                    </p>
                  </div>
                </div>

                {/* WhatsApp message preview with constrained height */}
                <div className="mt-auto">
                  <div
                    className="rounded-lg overflow-hidden shadow-lg"
                    style={{ maxHeight: "500px" }}
                  >
                    <div className="relative" style={{ height: "360px" }}>
                      <Image
                        src={content.testimony3_whatsapp}
                        alt="Paola Herrera WhatsApp conversation"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <div className="mt-8 text-center">
            <Link href={content.cta_url || "join"}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-700 hover:bg-purple-600 text-white font-semibold text-base sm:text-lg py-4 px-8 rounded-md md:text-3xl"
                style={{
                  boxShadow: "0 0 10px rgba(138, 43, 226, 0.4)",
                }}
              >
                {content.cta_button}
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TestimonialsSection;
