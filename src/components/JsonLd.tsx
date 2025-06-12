// src/components/JsonLd.tsx - Enhanced version
"use client";

import { useEffect } from "react";

interface JsonLdProps {
  data: Record<string, any>;
}

export default function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      // Cleanup function to remove script when component unmounts
      try {
        document.head.removeChild(script);
      } catch (e) {
        // Script might already be removed
      }
    };
  }, [data]);

  return null;
}

// Schema.org structured data generators
export const createOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Edición Persuasiva",
  url: "https://www.edicionpersuasiva.com",
  logo: "https://www.edicionpersuasiva.com/images/logo.png",
  description:
    "Curso especializado en edición de video persuasiva para freelancers",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "Spanish",
  },
  sameAs: [
    "https://www.instagram.com/edicionpersuasiva",
    "https://www.youtube.com/@edicionpersuasiva",
  ],
});

export const createWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Edición Persuasiva",
  url: "https://www.edicionpersuasiva.com",
  description: "Curso de edición de video persuasiva para freelancers",
  inLanguage: "es",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.edicionpersuasiva.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
});

export const createCourseSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Edición Persuasiva",
  description:
    "Aprende técnicas avanzadas de edición de video para conseguir más clientes y cobrar más como freelancer",
  provider: {
    "@type": "Organization",
    name: "Edición Persuasiva",
    url: "https://www.edicionpersuasiva.com",
  },
  courseMode: "online",
  inLanguage: "es",
  offers: {
    "@type": "Offer",
    category: "education",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  educationalLevel: "intermediate",
  about: [
    "Video Editing",
    "Freelancing",
    "Digital Marketing",
    "Content Creation",
  ],
});

export const createBreadcrumbSchema = (
  items: Array<{ name: string; url: string }>
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const createFAQSchema = (
  faqs: Array<{ question: string; answer: string }>
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});

export const createVideoSchema = (videoData: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: videoData.name,
  description: videoData.description,
  thumbnailUrl: videoData.thumbnailUrl,
  uploadDate: videoData.uploadDate,
  duration: videoData.duration,
  contentUrl: videoData.contentUrl,
  embedUrl: videoData.embedUrl,
  publisher: {
    "@type": "Organization",
    name: "Edición Persuasiva",
    logo: {
      "@type": "ImageObject",
      url: "https://www.edicionpersuasiva.com/images/logo.png",
    },
  },
});
