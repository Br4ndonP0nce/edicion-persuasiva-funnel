import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  query, 
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './config';

// Types for the new win system
export interface WinCategory {
  id: 'learning' | 'brand' | 'results' | 'monetization';
  name: string;
  emoji: string;
  points: number;
  description: string;
}

export interface UserProfile {
  discordId: string;
  username: string;
  displayName: string;
  portfolioUrl?: string;
  socialMediaUrl?: string;
  totalPoints: number;
  monthlyPoints: Record<string, number>;
  level: string;
  joinedAt: string;
  lastActive: string;
}

export interface WinSubmission {
  id: string;
  userId: string;
  username: string;
  userDisplayName?: string;
  category: 'learning' | 'brand' | 'results' | 'monetization';
  points: number;
  evidenceType: 'image' | 'video' | 'link' | 'drive_file';
  evidenceUrl: string;
  evidencePreview?: string;
  platform?: string;
  fileName?: string;
  fileSize?: number;
  status: 'pending' | 'approved' | 'rejected';
  hallOfFameSelected: boolean;
  monthCycle: string;
  timestamp: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  // Legacy data for backward compatibility
  legacyData?: {
    weekNumber?: number;
    votes?: number;
  };
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string;
  portfolioUrl?: string;
  points: number;
  level: string;
  rank: number;
}

// Win categories configuration
export const WIN_CATEGORIES: Record<string, WinCategory> = {
  'learning': {
    id: 'learning',
    name: 'Aprendizaje',
    emoji: '🎓',
    points: 10,
    description: 'Ejercicios del curso, módulos completados'
  },
  'brand': {
    id: 'brand',
    name: 'Marca Personal',
    emoji: '📢',
    points: 20,
    description: 'Contenido en redes sobre tu aprendizaje'
  },
  'results': {
    id: 'results',
    name: 'Resultados',
    emoji: '🚀',
    points: 40,
    description: 'Visibilidad, interacciones, seguidores'
  },
  'monetization': {
    id: 'monetization',
    name: 'Monetización',
    emoji: '💰',
    points: 100,
    description: 'Clientes cerrados, ventas, proyectos'
  }
};

// Level system
export const LEVEL_SYSTEM = {
  'Aprendiz Creativo': { min: 0, max: 99, color: '#8B5CF6' },
  'Editor en Acción': { min: 100, max: 199, color: '#06B6D4' },
  'Influencer': { min: 200, max: 299, color: '#10B981' },
  'Conquistador Visual': { min: 300, max: 499, color: '#F59E0B' },
  'Master Persuasivo': { min: 500, max: Infinity, color: '#EF4444' }
};

// Helper functions
export function getCurrentMonthCycle(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

export function getMonthName(monthCycle: string): string {
  const [year, month] = monthCycle.split('-');
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

export function getUserLevel(totalPoints: number): string {
  for (const [levelName, levelData] of Object.entries(LEVEL_SYSTEM)) {
    if (totalPoints >= levelData.min && totalPoints <= levelData.max) {
      return levelName;
    }
  }
  return 'Aprendiz Creativo';
}

export function getLevelColor(level: string): string {
  return LEVEL_SYSTEM[level as keyof typeof LEVEL_SYSTEM]?.color || '#8B5CF6';
}

export function getProgressToNextLevel(totalPoints: number): { current: number; next: number; percentage: number } {
  for (const [levelName, levelData] of Object.entries(LEVEL_SYSTEM)) {
    if (totalPoints >= levelData.min && totalPoints <= levelData.max) {
      if (levelData.max === Infinity) {
        return { current: totalPoints, next: totalPoints, percentage: 100 };
      }
      const progress = totalPoints - levelData.min;
      const total = levelData.max - levelData.min + 1;
      return {
        current: progress,
        next: total,
        percentage: Math.round((progress / total) * 100)
      };
    }
  }
  return { current: 0, next: 100, percentage: 0 };
}

// API wrapper functions (using the webhook endpoints)
const API_BASE = '/api/webhook/hall-of-fame/';

export async function getLeaderboard(
  type: 'monthly' | 'alltime' = 'monthly',
  monthCycle?: string,
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  try {
    const params = new URLSearchParams({
      action: 'leaderboard',
      type,
      limit: limit.toString()
    });
    
    if (type === 'monthly' && monthCycle) {
      params.append('month', monthCycle);
    }
    
    const response = await fetch(`${API_BASE}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.leaderboard || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

export async function getHallOfFameSubmissions(limit: number = 20): Promise<WinSubmission[]> {
  try {
    const params = new URLSearchParams({
      action: 'submissions',
      type: 'hall_of_fame',
      limit: limit.toString()
    });
    
    const response = await fetch(`${API_BASE}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.submissions || [];
  } catch (error) {
    console.error('Error fetching hall of fame submissions:', error);
    return [];
  }
}

export async function getRecentSubmissions(
  monthCycle?: string,
  limit: number = 20
): Promise<WinSubmission[]> {
  try {
    const params = new URLSearchParams({
      action: 'submissions',
      type: 'recent',
      limit: limit.toString()
    });
    
    if (monthCycle) {
      params.append('month', monthCycle);
    }
    
    const response = await fetch(`${API_BASE}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.submissions || [];
  } catch (error) {
    console.error('Error fetching recent submissions:', error);
    return [];
  }
}

export async function getUserSubmissions(userId: string, limit: number = 10): Promise<WinSubmission[]> {
  try {
    const params = new URLSearchParams({
      action: 'submissions',
      type: 'user',
      userId,
      limit: limit.toString()
    });
    
    const response = await fetch(`${API_BASE}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.submissions || [];
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    return [];
  }
}

export async function getUserProfile(userId: string): Promise<{ profile: UserProfile; recentSubmissions: WinSubmission[] } | null> {
  try {
    const params = new URLSearchParams({
      action: 'user_profile',
      userId
    });
    
    const response = await fetch(`${API_BASE}?${params}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      profile: data.profile,
      recentSubmissions: data.recentSubmissions || []
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function getAvailableMonths(): Promise<string[]> {
  try {
    // Get submissions to find available months
    const submissions = await getRecentSubmissions(undefined, 100);
    const months = new Set<string>();
    
    submissions.forEach(submission => {
      if (submission.monthCycle) {
        months.add(submission.monthCycle);
      }
    });
    
    // Add current month if not present
    months.add(getCurrentMonthCycle());
    
    return Array.from(months).sort().reverse(); // Most recent first
  } catch (error) {
    console.error('Error fetching available months:', error);
    return [getCurrentMonthCycle()];
  }
}

export async function getAdminQueue(status: 'pending' | 'approved' | 'rejected' = 'pending', limit: number = 50): Promise<WinSubmission[]> {
  try {
    const params = new URLSearchParams({
      action: 'admin_queue',
      status,
      limit: limit.toString()
    });
    
    const response = await fetch(`${API_BASE}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.queue || [];
  } catch (error) {
    console.error('Error fetching admin queue:', error);
    return [];
  }
}

// Legacy support functions (for backward compatibility)
export async function getWeeklyLeaderboard(weekNumber: number = getCurrentWeekNumber(), entriesLimit: number = 10): Promise<LeaderboardEntry[]> {
  // Convert to monthly leaderboard for now
  return getLeaderboard('monthly', getCurrentMonthCycle(), entriesLimit);
}

export async function getAllTimeLeaderboard(entriesLimit: number = 10): Promise<LeaderboardEntry[]> {
  return getLeaderboard('alltime', undefined, entriesLimit);
}

export async function getWeekSubmissions(weekNumber: number = getCurrentWeekNumber(), entriesLimit: number = 10): Promise<WinSubmission[]> {
  // Convert to recent submissions for current month
  return getRecentSubmissions(getCurrentMonthCycle(), entriesLimit);
}

export function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.floor(diff / oneWeek) + 1;
}

export function getCurrentWeekRange(): { start: Date, end: Date } {
  const now = new Date();
  const day = now.getDay();
  
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + (day === 0 ? 0 : 7 - day));
  sunday.setHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
}

// Utility functions for rendering
export function renderSubmissionPreview(submission: WinSubmission): { component: string; props: any } {
  const category = WIN_CATEGORIES[submission.category];
  
  switch (submission.evidenceType) {
    case 'image':
      return {
        component: 'image',
        props: {
          src: submission.evidencePreview || submission.evidenceUrl,
          alt: `${category.name} por ${submission.username}`,
          className: 'w-full h-full object-cover rounded-md'
        }
      };
      
    case 'video':
      if (submission.platform === 'youtube' && submission.evidenceUrl.includes('youtube.com')) {
        const videoId = submission.evidenceUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
        return {
          component: 'youtube',
          props: {
            videoId,
            title: `${category.name} por ${submission.username}`
          }
        };
      }
      return {
        component: 'link',
        props: {
          href: submission.evidenceUrl,
          title: `Ver ${category.name}`,
          platform: submission.platform
        }
      };
      
    case 'drive_file':
      return {
        component: 'drive',
        props: {
          src: submission.evidencePreview || `https://drive.google.com/thumbnail?id=${submission.evidenceUrl.match(/[-\w]{25,}/)}&sz=w400-h300`,
          href: submission.evidenceUrl,
          fileName: submission.fileName,
          title: `${category.name} por ${submission.username}`
        }
      };
      
    default:
      return {
        component: 'link',
        props: {
          href: submission.evidenceUrl,
          title: `Ver ${category.name}`,
          platform: submission.platform || 'external'
        }
      };
  }
}