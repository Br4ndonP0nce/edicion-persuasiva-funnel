// Create a new file: src/lib/seo.ts
import { Metadata } from 'next'

export const defaultMetadata: Metadata = {
    title: {
      default: "Edición Persuasiva - Gana $2,000+ editando videos con pocos clientes",
      template: "%s | Edición Persuasiva"
    },
    description: "Para editores que quieran lograr más y cobrar mucho más. Aprende cómo ganar mínimo $2,000 dólares mensuales editando y con pocos clientes.",
    keywords: [
      "edición de video",
      "editor freelance",
      "ganar dinero editando",
      "edición persuasiva",
      "curso de edición",
      "video marketing",
      "freelancer español",
      "edición profesional"
    ],
    authors: [{ name: "Edición Persuasiva" }],
    creator: "Edición Persuasiva",
    publisher: "Edición Persuasiva",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: 'https://www.edicionpersuasiva.com',
      siteName: 'Edición Persuasiva',
      title: "Edición Persuasiva - Gana $2,000+ editando videos",
      description: "Aprende cómo ganar mínimo $2,000 dólares mensuales editando videos con pocos clientes.",
      images: [
        {
          url: '/image/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Edición Persuasiva | La academia de edicion con mas creadores en la comunidad hispana',
        },
      ],
    },
    
    category: 'education',
  }
  
  // Function to generate page-specific metadata
  export function generatePageMetadata(
    pageTitle: string, 
    pageDescription?: string,
    pageKeywords?: string[],
    ogImage?: string
  ): Metadata {
    return {
      title: pageTitle,
      description: pageDescription || defaultMetadata.description,
      keywords: pageKeywords ? [...(defaultMetadata.keywords as string[]), ...pageKeywords] : defaultMetadata.keywords,
      openGraph: {
        ...defaultMetadata.openGraph,
        title: pageTitle,
        description: pageDescription || defaultMetadata.description as string,
        images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: pageTitle }] : defaultMetadata.openGraph?.images,
      },
      twitter: {
        ...defaultMetadata.twitter,
        title: pageTitle,
        description: pageDescription || defaultMetadata.description as string,
        images: ogImage ? [ogImage] : defaultMetadata.twitter?.images,
      },
    }
  }
  
  export const routeMetadata = {
    home: generatePageMetadata(
      "Edición Persuasiva - Gana $2,000+ editando videos con pocos clientes",
      "Para editores que quieran lograr más y cobrar mucho más. Aprende cómo ganar mínimo $2,000 dólares mensuales editando y con pocos clientes.",
      ["curso edición video", "ganar dinero editando", "freelancer video"]
    ),
    
    clases: generatePageMetadata(
      "Clases Gratuitas de Edición de Video",
      "Accede a nuestras clases gratuitas y aprende técnicas de edición persuasiva que te ayudarán a conseguir más clientes y cobrar más.",
      ["clases gratis edición", "tutorial video", "masterclass edición"]
    ),
    
    join: generatePageMetadata(
      "Únete a Edición Persuasiva",
      "Solicita acceso a nuestro programa exclusivo y transforma tu carrera como editor de video.",
      ["unirse curso", "solicitar acceso", "programa edición"]
    ),
    
    hallOfFame: generatePageMetadata(
      "Hall of Fame - Mejores Videos de la Comunidad",
      "Descubre los mejores videos creados por nuestra comunidad de editores. Inspírate y comparte tu trabajo.",
      ["mejores videos", "comunidad editores", "hall of fame"]
    ),
    recursos: generatePageMetadata(
      "Recursos - Recursos gratuitos para potenciar tu contenido",
      "Accede a recursos gratuitos que te ayudarán a mejorar tus habilidades de edición y a potenciar tu contenido.",
      ["Recursos gratuitos", "Edicion persuasiva", "recursos edición video", "herramientas edición"]
    ),
  }