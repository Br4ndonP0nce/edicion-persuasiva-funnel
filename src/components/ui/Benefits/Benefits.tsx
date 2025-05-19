// src/components/ui/Benefits/Benefits.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { StaggerContainer, fadeInUp } from "../motion";
import { getContentBySection } from "@/lib/firebase/db";

interface ContentItem {
  id?: string;
  key: string;
  section: string;
  type: string;
  value: string;
  label?: string;
}

const BenefitsSection = () => {
  // State for CMS content
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [benefits, setBenefits] = useState<string[]>([
    "Acceso a 8 cursos de edición, marca personal y ventas",
    "Acceso a más de 150 lecciones detalladas",
    "Acceso a material descargable para realizar ejercicios",
    "Sesiones en vivo cada semana para resolver dudas",
    "Masterclasses nuevas cada mes",
    "Acceso a grabaciones de todas las masterclasses anteriores",
    "Acceso a una comunidad de Discord de editores",
    "Acceso a un drive lleno de recursos descargables (sonidos y gráficos)",
    "90 días de seguimiento personalizado con chat privado",
    "Bolsa de trabajo para adquirir clientes nuevos cada mes",
  ]);

  // Fetch content from Firebase
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const contentItems = await getContentBySection("benefits");

        // Create a map for easy access to content values
        const contentMap: Record<string, string> = {};
        contentItems.forEach((item) => {
          contentMap[item.key] = item.value;
        });

        setContent(contentMap);

        // Process benefits from CMS
        const benefitKeys = Object.keys(contentMap)
          .filter((key) => key.startsWith("benefit"))
          .sort((a, b) => {
            // Sort by numerical order (benefit1, benefit2, etc.)
            const numA = parseInt(a.replace("benefit", "")) || 0;
            const numB = parseInt(b.replace("benefit", "")) || 0;
            return numA - numB;
          });

        // If we have benefits in the CMS, use those; otherwise keep defaults
        if (benefitKeys.length > 0) {
          const benefitsList = benefitKeys.map((key) => contentMap[key]);
          setBenefits(benefitsList);
        }
      } catch (err) {
        console.error("Error fetching benefits content:", err);
        // Keep default benefits on error
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
      <section className="py-20 !bg-black relative flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </section>
    );
  }

  return (
    <section className="py-20 !bg-black relative">
      {/* Animated background dots */}

      {/* Purple glow effects in background */}

      <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
        {/* Title with purple glow */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold purple-text-glow">
            {content.heading || "¿Qué obtendrás dentro de Edición Persuasiva?"}
          </h2>
        </motion.div>

        {/* Benefits list with bullet points */}
        <div className="flex flex-col items-start">
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-white text-lg md:text-xl mx-auto pl-0"
          >
            {benefits.map((benefit, index) => (
              <motion.li
                key={index}
                variants={fadeInUp}
                className="flex items-start"
              >
                <span className="text-white flex-shrink-0 mr-3 text-2xl">
                  •
                </span>
                <span>{benefit}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
