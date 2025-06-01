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

// Initial content data for seeding - comprehensive list for all sections
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
    value: 'https://firebasestorage.googleapis.com/v0/b/edicion-persuasiva.firebasestorage.app/o/public%2Fvideos%2FheroVideoCompressed.mp4?alt=media&token=38d812a1-fece-46c3-805b-8980b8aa0bad',
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
    key: 'quote',
    type: 'text',
    value: 'La mejor forma de editar bien y vivir bien de la edición es con un mentor que ya ha logrado lo que quieres lograr',
    label: 'Main Quote'
  },
  {
    section: 'testimonials',
    key: 'testimony1_title',
    type: 'text',
    value: '$1,275 dólares mensuales de UN SOLO CLIENTE',
    label: 'Testimony 1 Title'
  },
  {
    section: 'testimonials',
    key: 'testimony1_description',
    type: 'text',
    value: 'para Santiago, un mes después de haber ingresado a la academia, más un cliente extra de $110 por video',
    label: 'Testimony 1 Description'
  },
  {
    section: 'testimonials',
    key: 'testimony1_extra',
    type: 'text',
    value: 'Todo, desde la bolsa de trabajo de la Academia',
    label: 'Testimony 1 Extra Info'
  },
  {
    section: 'testimonials',
    key: 'testimony1_image',
    type: 'image',
    value: '/image/testimonials/6.jpg',
    label: 'Testimony 1 Image'
  },
  {
    section: 'testimonials',
    key: 'testimony2_title',
    type: 'text',
    value: '$1,000 dólares mensuales con UN SOLO CLIENTE',
    label: 'Testimony 2 Title'
  },
  {
    section: 'testimonials',
    key: 'testimony2_extra',
    type: 'text',
    value: '$350 dólares por video con otro cliente',
    label: 'Testimony 2 Extra Info'
  },
  {
    section: 'testimonials',
    key: 'testimony2_description',
    type: 'text',
    value: 'para Andrew quien ingresó a finales de enero y en febrero adquirió el cliente desde la bolsa de trabajo de la academia.',
    label: 'Testimony 2 Description'
  },
  {
    section: 'testimonials',
    key: 'testimony2_image',
    type: 'image',
    value: '/image/testimonials/4.jpg',
    label: 'Testimony 2 Image'
  },
  {
    section: 'testimonials',
    key: 'testimony3_title',
    type: 'text',
    value: 'De no saber editar a cerrar su PRIMER CLIENTE',
    label: 'Testimony 3 Title'
  },
  {
    section: 'testimonials',
    key: 'testimony3_description',
    type: 'text',
    value: 'Alex ingresó sin haber tocado Premiere Pro o After Effects. Hoy ya recibe pagos y le han aumentado la paga por su nivel superior de edición',
    label: 'Testimony 3 Description'
  },
  {
    section: 'testimonials',
    key: 'testimony3_quote',
    type: 'text',
    value: 'Fíjate que ya me delegaron más clientes en este caso el esposo de Fernanda la clienta los mismos videos de Fer y los de Gert cliente de su agencia, quiero organizarme en eso!',
    label: 'Testimony 3 Quote'
  },
  {
    section: 'testimonials',
    key: 'testimony3_image',
    type: 'image',
    value: '/image/testimonials/8.jpg',
    label: 'Testimony 3 Image'
  },
  {
    section: 'testimonials',
    key: 'testimony3_whatsapp',
    type: 'image',
    value: '/image/paola.jpg',
    label: 'Testimony 3 WhatsApp Image'
  },
  {
    section: 'testimonials',
    key: 'cta_button',
    type: 'text',
    value: 'Deseo Aplicar',
    label: 'CTA Button Text'
  },
  {
    section: 'testimonials',
    key: 'cta_url',
    type: 'text',
    value: 'join',
    label: 'CTA Button URL'
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
  {
    section: 'benefits',
    key: 'benefit3',
    type: 'text',
    value: 'Acceso a material descargable para realizar ejercicios',
    label: 'Benefit 3'
  },
  {
    section: 'benefits',
    key: 'benefit4',
    type: 'text',
    value: 'Sesiones en vivo cada semana para resolver dudas',
    label: 'Benefit 4'
  },
  {
    section: 'benefits',
    key: 'benefit5',
    type: 'text',
    value: 'Masterclasses nuevas cada mes',
    label: 'Benefit 5'
  },
  {
    section: 'benefits',
    key: 'benefit6',
    type: 'text',
    value: 'Acceso a grabaciones de todas las masterclasses anteriores',
    label: 'Benefit 6'
  },
  {
    section: 'benefits',
    key: 'benefit7',
    type: 'text',
    value: 'Acceso a una comunidad de Discord de editores',
    label: 'Benefit 7'
  },
  {
    section: 'benefits',
    key: 'benefit8',
    type: 'text',
    value: 'Acceso a un drive lleno de recursos descargables (sonidos y gráficos)',
    label: 'Benefit 8'
  },
  {
    section: 'benefits',
    key: 'benefit9',
    type: 'text',
    value: '90 días de seguimiento personalizado con chat privado',
    label: 'Benefit 9'
  },
  {
    section: 'benefits',
    key: 'benefit10',
    type: 'text',
    value: 'Bolsa de trabajo para adquirir clientes nuevos cada mes',
    label: 'Benefit 10'
  },

  // Success Section (Image Testimonials)
  {
    section: 'success',
    key: 'image1',
    type: 'image',
    value: '/image/testimonials/7.jpg',
    label: 'Success Image 1'
  },
  {
    section: 'success',
    key: 'image2',
    type: 'image',
    value: '/image/testimonials/2.jpg',
    label: 'Success Image 2'
  },
  {
    section: 'success',
    key: 'image3',
    type: 'image',
    value: '/image/testimonials/10.jpg',
    label: 'Success Image 3'
  },
  {
    section: 'success',
    key: 'image4',
    type: 'image',
    value: '/image/testimonials/1.jpg',
    label: 'Success Image 4'
  },
  {
    section: 'success',
    key: 'image5',
    type: 'image',
    value: '/image/testimonials/9.jpg',
    label: 'Success Image 5'
  },
  {
    section: 'success',
    key: 'image6',
    type: 'image',
    value: '/image/testimonials/3.jpg',
    label: 'Success Image 6'
  },
  {
    section: 'success',
    key: 'image7',
    type: 'image',
    value: '/image/testimonials/5.jpg',
    label: 'Success Image 7'
  },

  // Mentor Section
  {
    section: 'mentor',
    key: 'heading',
    type: 'text',
    value: 'Soy Diego Hernández y seré tu mentor por los próximos 90 días',
    label: 'Mentor Heading'
  },
  {
    section: 'mentor',
    key: 'subheading',
    type: 'text',
    value: 'Aprende Gratis Del Canal de Edición',
    label: 'Mentor Subheading'
  },
  {
    section: 'mentor',
    key: 'subheading2',
    type: 'text',
    value: 'Con Más Vistas De Habla Hispana',
    label: 'Mentor Subheading 2'
  },
  {
    section: 'mentor',
    key: 'profile_image',
    type: 'image',
    value: '/image/pfp.jpeg',
    label: 'Mentor Profile Image'
  },
  {
    section: 'mentor',
    key: 'video1_id',
    type: 'video',
    value: 'jVwSSDqCjns',
    label: 'Video 1 ID'
  },
  {
    section: 'mentor',
    key: 'video1_title',
    type: 'text',
    value: 'Manipulo sus emociones | Cómo m...',
    label: 'Video 1 Title'
  },
  {
    section: 'mentor',
    key: 'video1_type',
    type: 'text',
    value: 'EDICIÓN INMERSIVA',
    label: 'Video 1 Type'
  },
  {
    section: 'mentor',
    key: 'video2_id',
    type: 'video',
    value: 'bn46IZeRHb0',
    label: 'Video 2 ID'
  },
  {
    section: 'mentor',
    key: 'video2_title',
    type: 'text',
    value: 'Ojalá me hubieran enseñado a edit...',
    label: 'Video 2 Title'
  },
  {
    section: 'mentor',
    key: 'video2_type',
    type: 'text',
    value: 'EDICIÓN PERSUASIVA',
    label: 'Video 2 Type'
  },
  {
    section: 'mentor',
    key: 'video3_id',
    type: 'video',
    value: 'NAcwqVcVDws',
    label: 'Video 3 ID'
  },
  {
    section: 'mentor',
    key: 'video3_title',
    type: 'text',
    value: 'Aprender esto me ahorró años | Có...',
    label: 'Video 3 Title'
  },
  {
    section: 'mentor',
    key: 'video3_type',
    type: 'text',
    value: 'EDICIÓN VELOZ',
    label: 'Video 3 Type'
  },

  // Free Classes Section
  {
    section: 'free_classes',
    key: 'heading',
    type: 'text',
    value: 'CONVIÉRTETE EN UN EDITOR IRREMPLAZABLE',
    label: 'Free Classes Heading'
  },
  {
    section: 'free_classes',
    key: 'subheading',
    type: 'text',
    value: 'Da click en una imagen para mirar la clase',
    label: 'Free Classes Subheading'
  },
  {
    section: 'free_classes',
    key: 'class1_title',
    type: 'text',
    value: 'DISEÑO SONORO',
    label: 'Class 1 Title'
  },
  {
    section: 'free_classes',
    key: 'class1_subtitle',
    type: 'text',
    value: 'MasterClass Gratuita',
    label: 'Class 1 Subtitle'
  },
  {
    section: 'free_classes',
    key: 'class1_image',
    type: 'image',
    value: '/image/masterClass.jpg',
    label: 'Class 1 Image'
  },
  {
    section: 'free_classes',
    key: 'class1_link',
    type: 'text',
    value: 'https://www.loom.com/share/813297adae3341f492320bd0813cb116?sid=da517b64-4b7a-4b41-a36b-b1237a8f5b90',
    label: 'Class 1 Link'
  },
  {
    section: 'free_classes',
    key: 'class2_title',
    type: 'text',
    value: 'PERSUASIÓN 1',
    label: 'Class 2 Title'
  },
  {
    section: 'free_classes',
    key: 'class2_subtitle',
    type: 'text',
    value: 'MasterClass Gratuita',
    label: 'Class 2 Subtitle'
  },
  {
    section: 'free_classes',
    key: 'class2_image',
    type: 'image',
    value: '/image/persuasion1.jpg',
    label: 'Class 2 Image'
  },
  {
    section: 'free_classes',
    key: 'class2_link',
    type: 'text',
    value: 'https://www.loom.com/share/ca66e5aaba7b4ebcb75d77ad596502bf?sid=e5b2a4bb-9bb5-46ee-9936-853c1839f9b0',
    label: 'Class 2 Link'
  },
  {
    section: 'free_classes',
    key: 'class3_title',
    type: 'text',
    value: 'ESCAPA DEL TAYLORISMO',
    label: 'Class 3 Title'
  },
  {
    section: 'free_classes',
    key: 'class3_subtitle',
    type: 'text',
    value: 'MasterClass Gratuita',
    label: 'Class 3 Subtitle'
  },
  {
    section: 'free_classes',
    key: 'class3_image',
    type: 'image',
    value: '/image/persuasion2.jpg',
    label: 'Class 3 Image'
  },
  {
    section: 'free_classes',
    key: 'class3_link',
    type: 'text',
    value: 'https://www.loom.com/share/454f7ba87dc4497d9188aa8999a5807f?sid=f5beca92-747c-4222-b3c0-d5374ad52263',
    label: 'Class 3 Link'
  },

  // MasterClass Section
  {
    section: 'masterclass',
    key: 'heading',
    type: 'text',
    value: 'Clases gratis cada mes',
    label: 'MasterClass Heading'
  },
  {
    section: 'masterclass',
    key: 'subheading',
    type: 'text',
    value: 'Aprende técnicas que nadie enseña en internet',
    label: 'MasterClass Subheading'
  },
  {
    section: 'masterclass',
    key: 'cta_text',
    type: 'text',
    value: 'Ver las clases',
    label: 'CTA Button Text'
  },
  {
    section: 'masterclass',
    key: 'cta_url',
    type: 'text',
    value: '/clases',
    label: 'CTA Button URL'
  },
  {
    section: 'masterclass',
    key: 'image',
    type: 'image',
    value: '/image/masterClass.jpg',
    label: 'MasterClass Main Image'
  },
  {
    section: 'masterclass',
    key: 'testimonial1_text',
    type: 'text',
    value: 'ya vi el video por tercera vez.... lo vi con mucho detenimiento.. y la verdad ese truco de aumentar o disminuir la velocidad.. ya valío todo.. gracias muchas gracias.. y lo aproveche al maximo...',
    label: 'Testimonial 1 Text'
  },
  {
    section: 'masterclass',
    key: 'testimonial1_author',
    type: 'text',
    value: 'Ariel Media Studio',
    label: 'Testimonial 1 Author'
  },
  {
    section: 'masterclass',
    key: 'testimonial1_time',
    type: 'text',
    value: '2 días ago',
    label: 'Testimonial 1 Time'
  },

  // Youtube Section
  {
    section: 'youtube',
    key: 'video_id',
    type: 'video',
    value: 'PZNaH57y6YE',
    label: 'YouTube Video ID'
  },
  {
    section: 'youtube',
    key: 'description',
    type: 'text',
    value: 'Aprende más con mis videos de Edición Persuasiva en Youtube',
    label: 'YouTube Description'
  },

  // Classes CTA Section
  {
    section: 'classes_cta',
    key: 'heading',
    type: 'text',
    value: 'ACCEDE A LA ACADEMIA DE EDICION PERSUASIVA',
    label: 'CTA Heading'
  },
  {
    section: 'classes_cta',
    key: 'subheading',
    type: 'text',
    value: 'La academia de edición MÁS COMPLETA de habla hispana',
    label: 'CTA Subheading'
  },
  {
    section: 'classes_cta',
    key: 'poster_image',
    type: 'image',
    value: '/image/hero-poster.jpg',
    label: 'Background Image'
  },
  {
    section: 'classes_cta',
    key: 'logo_text',
    type: 'text',
    value: 'EDICIÓN PERSUASIVA',
    label: 'Logo Text'
  },
  {
    section: 'classes_cta',
    key: 'subtitle',
    type: 'text',
    value: 'Edición Persuasiva • Diego Hernández',
    label: 'Subtitle'
  },
  {
    section: 'classes_cta',
    key: 'cta_button',
    type: 'text',
    value: 'Deseo acceder hoy',
    label: 'CTA Button Text'
  },
  {
    section: 'classes_cta',
    key: 'cta_url',
    type: 'text',
    value: 'join',
    label: 'CTA Button URL'
  }
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