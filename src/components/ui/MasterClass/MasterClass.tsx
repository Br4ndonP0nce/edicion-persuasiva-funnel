"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const MasterClassSection: React.FC = () => {
  // Animation variants
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

  return (
    <div className="flex flex-col lg:flex-row w-full bg-black text-white">
      {/* Left side - Image */}
      <div className="w-full lg:w-1/2 relative min-h-[50vh] lg:min-h-screen">
        <Image
          src="/image/masterClass.jpg" // Replace with your actual image path
          alt="Diseño Sonoro - Edición Persuasiva"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay with text at the bottom */}
        {/*<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-6 lg:p-12">
          <p className="text-gray-300 text-sm sm:text-base mb-1 sm:mb-2">
            MasterClass Gratuita
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-2 sm:mb-4 tracking-wider">
            DISEÑO SONORO
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl">Edición Persuasiva</p>
        </div>*/}
      </div>

      {/* Right side - Content */}
      <div className="w-full lg:w-1/2 bg-purple-950 p-4 sm:p-6 lg:p-12 flex flex-col justify-center min-h-[50vh] lg:min-h-screen">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariant}
          className="flex flex-col h-full"
        >
          {/* Title and CTA */}
          <motion.div variants={itemVariant} className="mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 sm:mb-4">
              Clases gratis cada mes
            </h2>
            <p className="text-gray-300 text-base sm:text-lg mb-4 sm:mb-6 lg:mb-8">
              Aprende técnicas que nadie enseña en internet
            </p>
            <Link href="/clases">
              <span className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 sm:py-3 px-6 sm:px-8 rounded-full transition-colors text-sm sm:text-base">
                Ver las clases
              </span>
            </Link>
          </motion.div>

          {/* Testimonials */}
          <motion.div variants={itemVariant} className="mt-auto">
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* First column of testimonials */}
              <div className="space-y-4">
                <div className="bg-purple-900/60 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-full bg-purple-700">
                      {/* User avatar could go here */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <span className="font-medium text-sm sm:text-base">
                          Ariel Media Studio
                        </span>
                        <span className="text-xs sm:text-sm text-gray-400">
                          2 días ago
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-300 mt-1 line-clamp-3 sm:line-clamp-none">
                        ya vi el video por tercera vez.... lo vi con mucho
                        detenimiento.. y la verdad ese truco de aumentar o
                        disminuir la velocidad.. ya valío todo.. gracias muchas
                        gracias.. y lo aproveche al maximo...
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-900/60 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-full bg-purple-700">
                      {/* User avatar could go here */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <span className="font-medium text-sm sm:text-base">
                          Alejandro Rodriguez
                        </span>
                        <span className="text-xs sm:text-sm text-gray-400 truncate">
                          commented on Clase 1 - Diseño Sonoro Inmersivo • 1d
                          ago
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-300 mt-1 line-clamp-3 sm:line-clamp-none">
                        Gracias Diego, que video tan completo, he aprendido
                        muchísimo, los mejores 30 minutos invertidos en mi vida
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second column of testimonials - shown side by side on larger screens */}
              <div className="space-y-4 md:mt-0">
                <div className="bg-purple-900/60 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-full bg-purple-700">
                      <Image
                        src="/images/avatar-neta.jpg" // Replace with your actual image path
                        alt="Neta"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="font-medium text-sm sm:text-base">
                          Neta
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-300 mt-1 line-clamp-3 sm:line-clamp-none">
                        Neta te discutiste! Excelente pieza de contenido y
                        calidad... Inspiras man
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-900/60 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-full bg-purple-700">
                      {/* User avatar could go here */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 sm:line-clamp-none">
                        Wao, voy a la mitad del video y es como una bofetada de
                        realidad, muchas cosas que pasaba por alto. Literalmente
                        siento que me esta creciendo el cerebro, gracias BRO
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default MasterClassSection;
