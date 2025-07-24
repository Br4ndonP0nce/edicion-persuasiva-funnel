// src/lib/features/announcements.ts
export interface FeatureAnnouncement {
  id: string;
  title: string;
  description: string;
  features: string[];
  version: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  targetRoles?: string[]; // Optional: target specific roles
  imageUrl?: string; // Optional: feature screenshot
  videoUrl?: string; // Optional: demo video
  ctaText?: string; // Call to action text
  ctaUrl?: string; // Call to action URL
}

// Define your announcements here
export const FEATURE_ANNOUNCEMENTS: FeatureAnnouncement[] = [
 
  {
    id: 'lead-month-sorting',
    title: 'FEATURE: 📊Filtrado de leads por mes ',
    description: 'Como saben en menos de 3 meses de trabajo con este CRM hemos llegado a los +400 leads 🎉 , y es por eso que hemos implementado un nuevo filtro para que puedan ver los leads por mes.',
    features: [
      'Filtrado de leads por mes',
      'Exportado de leads por mes',

    ],
    version: '2.0.8',
    date: '2025-07-23',
    priority: 'medium',
    ctaText: 'Entendido!',
    ctaUrl: ''
  }
];

// Storage key for tracking viewed announcements
const VIEWED_ANNOUNCEMENTS_KEY = 'ep_viewed_announcements';

export const getViewedAnnouncements = (): string[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(VIEWED_ANNOUNCEMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const markAnnouncementAsViewed = (announcementId: string): void => {
  if (typeof window === 'undefined') return;
  
  const viewed = getViewedAnnouncements();
  if (!viewed.includes(announcementId)) {
    viewed.push(announcementId);
    localStorage.setItem(VIEWED_ANNOUNCEMENTS_KEY, JSON.stringify(viewed));
  }
};

export const getUnviewedAnnouncements = (userRole?: string): FeatureAnnouncement[] => {
  const viewed = getViewedAnnouncements();
  
  return FEATURE_ANNOUNCEMENTS.filter(announcement => {
    // Check if not viewed
    const notViewed = !viewed.includes(announcement.id);
    
    // Check role targeting
    const roleMatches = !announcement.targetRoles || 
      !userRole || 
      announcement.targetRoles.includes(userRole);
    
    return notViewed && roleMatches;
  }).sort((a, b) => {
    // Sort by priority and date
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

export const resetViewedAnnouncements = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(VIEWED_ANNOUNCEMENTS_KEY);
};