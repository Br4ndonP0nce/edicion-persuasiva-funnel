"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Generate grid items
  const gridItems = Array.from({ length: 50 }, (_, i) => (
    <motion.div
      key={i}
      className="h-10 w-10 bg-purple-600/10 rounded-sm"
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.1, 0.3, 0.1],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay: i * 0.02,
      }}
    />
  ));

  if (!loading) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.5, delay: 0.2 },
      }}
    >
      <div className="relative">
        <div className="grid grid-cols-10 gap-2 opacity-30">{gridItems}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.h1
              className="text-3xl font-bold text-purple-500 mb-2"
              animate={{
                color: ["#9333ea", "#ffffff", "#9333ea"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              EDICIÓN PERSUASIVA
            </motion.h1>
            <motion.div
              className="h-1 w-24 bg-gradient-to-r from-purple-600 to-purple-400 mx-auto rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 100 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Preloader;
