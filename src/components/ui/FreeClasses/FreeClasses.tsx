"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface MasterClassCard {
  id: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  link: string;
}

const FreeClassesSection: React.FC = () => {
  // Sample masterclass data
  const masterclasses: MasterClassCard[] = [
    {
      id: "diseno-sonoro",
      title: "DISEÑO SONORO",
      subtitle: "MasterClass Gratuita",
      imageSrc: "/image/MasterClass.jpg",
      link: "https://www.loom.com/share/813297adae3341f492320bd0813cb116?sid=da517b64-4b7a-4b41-a36b-b1237a8f5b90",
    },
    {
      id: "persuasion",
      title: "PERSUASIÓN 1",
      subtitle: "MasterClass Gratuita",
      imageSrc: "/image/persuasion1.jpg",
      link: "https://www.loom.com/share/ca66e5aaba7b4ebcb75d77ad596502bf?sid=e5b2a4bb-9bb5-46ee-9936-853c1839f9b0",
    },
    {
      id: "escapa-taylorismo",
      title: "ESCAPA DEL TAYLORISMO",
      subtitle: "MasterClass Gratuita",
      imageSrc: "/image/persuasion2.jpg",
      link: "https://www.loom.com/share/454f7ba87dc4497d9188aa8999a5807f?sid=f5beca92-747c-4222-b3c0-d5374ad52263",
    },
  ];

  // Animation variants
  const containerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
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
    <div className="w-full bg-purple-950 py-16 px-4 sm:px-6 md:px-8 relative">
      {/* Background elements - position relative to this section */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Optional subtle background gradient patterns */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-800/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-purple-700/10 blur-3xl rounded-full"></div>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariant}
        className="max-w-7xl mx-auto"
      >
        {/* Section Header */}
        <motion.div
          className="text-center mb-10 sm:mb-16"
          variants={itemVariant}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 glow-text">
            CONVIÉRTETE EN UN EDITOR IRREMPLAZABLE
          </h2>
          <p className="text-purple-300 text-lg md:text-xl">
            Da click en una imagen para mirar la clase
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {masterclasses.map((masterclass) => (
            <motion.div
              key={masterclass.id}
              variants={itemVariant}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className="aspect-square"
            >
              <Link href={masterclass.link} className="block w-full h-full">
                <div className="relative w-full h-full overflow-hidden rounded-lg shadow-xl border border-purple-800/30 bg-black">
                  {/* Image */}
                  <Image
                    src={masterclass.imageSrc}
                    alt={masterclass.title}
                    fill
                    className="object-cover"
                  />

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20"></div>

                  {/* Text overlay with positioning */}
                  <div className="absolute inset-0 flex flex-col p-6">
                    {/* Top text */}
                    <div className="text-center mb-4">
                      <p className="text-white/90 text-sm sm:text-base">
                        {masterclass.subtitle}
                      </p>
                    </div>

                    {/* Middle text */}
                    <div className="flex-grow flex items-center justify-center">
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wider text-center">
                        {masterclass.title}
                      </h3>
                    </div>

                    {/* Bottom text */}
                    <div className="text-right mt-4">
                      <p className="text-white/60 text-xs">
                        Edición Persuasiva
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FreeClassesSection;
