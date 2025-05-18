// src/lib/firebase/seed.ts

import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

// Define the structure of content items
interface SeedContentItem {
  section: string;
  key: string;
  type: 'text' | 'image' | 'video';
  value: string;
  label: string;
}

// Initial content data for seeding
const initialContent: SeedContentItem[] = [
  // Hero Section
  {
    section: 'hero',
    key: 'subtitle',
    type: 'text',
    value: 'Para editores que quieran lograr más y cobrar mucho más',
    label: 'Subtitle Text'
  },
  {
    section: 'hero',
    key: 'headline',
    type: 'text',
    value: 'Cómo ganar mínimo $2,000 dólares mensuales editando y con pocos clientes',
    label: 'Main Headline'
  },
  {
    section: 'hero',
    key: 'module1',
    type: 'text',
    value: 'MÓDULO COGNITIVO',
    label: 'Module 1 Name'
  },
  {
    section: 'hero',
    key: 'module2',
    type: 'text',
    value: 'MÓDULO PRÁCTICO',
    label: 'Module 2 Name'
  },
  {
    section: 'hero',
    key: 'module3',
    type: 'text',
    value: 'CIERRES DE VENTAS',
    label: 'Module 3 Name'
  },
  {
    section: 'hero',
    key: 'video_url',
    type: 'video',
    value: 'https://storage.googleapis.com/edicionpersuasiva/mainVSL.mp4',
    label: 'Main Video URL'
  },
  {
    section: 'hero',
    key: 'poster_url',
    type: 'image',
    value: '/image/hero-poster.jpg',
    label: 'Video Poster Image'
  },
  {
    section: 'hero',
    key: 'cta_button',
    type: 'text',
    value: 'Deseo Aplicar',
    label: 'Call-to-Action Button Text'
  },
  {
    section: 'hero',
    key: 'cta_url',
    type: 'text',
    value: 'join',
    label: 'Call-to-Action Button URL'
  },

  // Testimonials Section
  {
    section: 'testimonials',
    key: 'heading',
    type: 'text',
    value: 'La mejor forma de editar bien y vivir bien de la edición es con un mentor que ya ha logrado lo que quieres lograr',
    label: 'Testimonials Heading'
  },
  {
    section: 'testimonials',
    key: 'cta_button',
    type: 'text',
    value: 'Deseo Aplicar',
    label: 'Testimonials CTA Button Text'
  },
  
  // Benefits Section
  {
    section: 'benefits',
    key: 'heading',
    type: 'text',
    value: '¿Qué obtendrás dentro de Edición Persuasiva?',
    label: 'Benefits Heading'
  },
  {
    section: 'benefits',
    key: 'benefit1',
    type: 'text',
    value: 'Acceso a 8 cursos de edición, marca personal y ventas',
    label: 'Benefit 1'
  },
  {
    section: 'benefits',
    key: 'benefit2',
    type: 'text',
    value: 'Acceso a más de 150 lecciones detalladas',
    label: 'Benefit 2'
  },
  // Add more benefits as needed...

  // Video Content Section
  {
    section: 'videos',
    key: 'youtube_main',
    type: 'video',
    value: 'PZNaH57y6YE',
    label: 'Main YouTube Video ID'
  },
  {
    section: 'videos',
    key: 'youtube_1',
    type: 'video',
    value: 'jVwSSDqCjns',
    label: 'YouTube Video 1 ID'
  },
  {
    section: 'videos',
    key: 'youtube_2',
    type: 'video',
    value: 'bn46IZeRHb0',
    label: 'YouTube Video 2 ID'
  },
  {
    section: 'videos',
    key: 'youtube_3',
    type: 'video',
    value: 'NAcwqVcVDws',
    label: 'YouTube Video 3 ID'
  },

  // Add more sections as needed...
];

/**
 * Seeds the content collection with initial data if it doesn't exist
 */
export const seedContent = async (): Promise<{ added: number, existing: number }> => {
  try {
    const stats = { added: 0, existing: 0 };
    const CONTENT_COLLECTION = 'content';

    // Process each content item
    for (const item of initialContent) {
      // Check if this content item already exists
      const q = query(
        collection(db, CONTENT_COLLECTION),
        where('section', '==', item.section),
        where('key', '==', item.key)
      );
      
      const existingDocs = await getDocs(q);
      
      if (existingDocs.empty) {
        // Add the content item if it doesn't exist
        await addDoc(collection(db, CONTENT_COLLECTION), {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        stats.added++;
      } else {
        stats.existing++;
      }
    }

    console.log(`Content seeding complete: ${stats.added} items added, ${stats.existing} already existed`);
    return stats;
  } catch (error) {
    console.error('Error seeding content:', error);
    throw error;
  }
};