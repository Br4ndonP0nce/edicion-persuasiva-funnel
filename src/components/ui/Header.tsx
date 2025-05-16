"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position to add background opacity when scrolled
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-purple-950/90 backdrop-blur-sm py-2"
          : "bg-purple-950 py-3"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-center items-center">
        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/image/logo.jpg" // Your logo path
            alt="Edición Persuasiva"
            width={180}
            height={30}
            className="h-auto w-auto"
            priority
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
