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
  import { toJsDate } from '../utils';
  
  // Types for Hall of Fame data
  export interface VideoSubmission {
    id?: string;
    videoUrl: string;
    platform: 'youtube' | 'vimeo' | 'instagram' | 'facebook' | 'unknown';
    videoId?: string;
    authorId: string;
    authorUsername: string;
    authorAvatar: string;
    timestamp: string;
    votes: number;
    weekNumber: number;
    weekStart: string;
    weekEnd: string;
  }
  
  export interface LeaderboardUser {
    id: string;
    username: string;
    avatar: string;
    totalVotes: number;
    totalSubmissions: number;
    weeklyVotes: Record<number, number>;
    updatedAt: string;
  }
  
  export interface LeaderboardEntry {
    userId: string;
    username: string;
    avatar: string;
    votes: number;
    rank: number;
  }
  
  // Collection references
  const SUBMISSIONS_COLLECTION = 'hallOfFame_submissions';
  const USERS_COLLECTION = 'hallOfFame_users';
  
  // Get the current week number
  export function getCurrentWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 604800000;
    return Math.floor(diff / oneWeek) + 1;
  }
  
  // Get the current week's start and end date
  export function getCurrentWeekRange(): { start: Date, end: Date } {
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // Calculate the date of the previous Monday (or today if it's a Monday)
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    
    // Calculate the date of the upcoming Sunday (or today if it's a Sunday)
    const sunday = new Date(now);
    sunday.setDate(now.getDate() + (day === 0 ? 0 : 7 - day));
    sunday.setHours(23, 59, 59, 999);
    
    return { start: monday, end: sunday };
  }
  
  // Get weekly leaderboard
  export async function getWeeklyLeaderboard(weekNumber: number = getCurrentWeekNumber(), entriesLimit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const usersRef = collection(db, 'hallOfFame_users');
      const usersSnap = await getDocs(usersRef);
      
      const leaderboard: LeaderboardEntry[] = [];
      
      usersSnap.forEach((doc) => {
        const userData = doc.data() as LeaderboardUser;
        const weeklyVotes = userData.weeklyVotes?.[weekNumber] || 0;
        
        if (weeklyVotes > 0) {
          leaderboard.push({
            userId: userData.id,
            username: userData.username,
            avatar: userData.avatar,
            votes: weeklyVotes,
            rank: 0 // Will be set after sorting
          });
        }
      });
      
      // Sort by votes (descending)
      leaderboard.sort((a, b) => b.votes - a.votes);
      
      // Assign ranks
      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });
      
      // Limit to requested number of entries
      return leaderboard.slice(0, entriesLimit);
    } catch (error) {
      console.error('Error getting weekly leaderboard:', error);
      throw error;
    }
  }
  
  // Get all-time leaderboard
  export async function getAllTimeLeaderboard(entriesLimit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const usersRef = collection(db, 'hallOfFame_users');
      const usersSnap = await getDocs(query(usersRef, orderBy('totalVotes', 'desc'), firestoreLimit(entriesLimit)));
      
      const leaderboard: LeaderboardEntry[] = [];
      
      let rank = 1;
      usersSnap.forEach((doc) => {
        const userData = doc.data() as LeaderboardUser;
        
        leaderboard.push({
          userId: userData.id,
          username: userData.username,
          avatar: userData.avatar,
          votes: userData.totalVotes,
          rank: rank++
        });
      });
      
      return leaderboard;
    } catch (error) {
      console.error('Error getting all-time leaderboard:', error);
      throw error;
    }
  }
  
  // Get top submissions for a specific week
  export async function getWeekSubmissions(weekNumber: number = getCurrentWeekNumber(), entriesLimit: number = 10): Promise<VideoSubmission[]> {
    try {
      const submissionsRef = collection(db, SUBMISSIONS_COLLECTION);
      const q = query(
        submissionsRef,
        where('weekNumber', '==', weekNumber),
        orderBy('votes', 'desc'),
        firestoreLimit(entriesLimit)
      );
      
      const snapshot = await getDocs(q);
      const submissions: VideoSubmission[] = [];
      
      snapshot.forEach((doc) => {
        submissions.push({
          id: doc.id,
          ...doc.data() as Omit<VideoSubmission, 'id'>
        });
      });
      
      return submissions;
    } catch (error) {
      console.error('Error getting weekly submissions:', error);
      throw error;
    }
  }
  
  // Get a single user's submissions
  export async function getUserSubmissions(userId: string, limit: number = 10): Promise<VideoSubmission[]> {
    try {
      const submissionsRef = collection(db, SUBMISSIONS_COLLECTION);
      const q = query(
        submissionsRef,
        where('authorId', '==', userId),
        orderBy('timestamp', 'desc'),
        firestoreLimit(limit)
      );
      
      const snapshot = await getDocs(q);
      const submissions: VideoSubmission[] = [];
      
      snapshot.forEach((doc) => {
        submissions.push({
          id: doc.id,
          ...doc.data() as Omit<VideoSubmission, 'id'>
        });
      });
      
      return submissions;
    } catch (error) {
      console.error('Error getting user submissions:', error);
      throw error;
    }
  }
  
  // Get user profile data
  export async function getUserProfile(userId: string): Promise<LeaderboardUser | null> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as LeaderboardUser;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
  
  // Get available weeks (weeks that have submissions)
export async function getAvailableWeeks(): Promise<number[]> {
    try {
      const submissionsRef = collection(db, 'hallOfFame_submissions');
        const snapshot = await getDocs(submissionsRef);
      
        const weeks = new Set<number>();
      
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.weekNumber) {
                weeks.add(data.weekNumber);
            }
        });
      
        return Array.from(weeks).sort((a, b) => b - a); // Sort descending (newest first)
    } catch (error) {
        console.error('Error getting available weeks:', error);
        throw error;
    }
}