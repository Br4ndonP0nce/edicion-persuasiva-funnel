import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
import { Timestamp as FirestoreTimestamp } from 'firebase/firestore';

// Helper function to safely convert any timestamp-like value to a Date
export function toJsDate(timestamp: FirestoreTimestamp | Date | number | string | null | undefined): Date | null {
  if (!timestamp) return null;
  
  if (timestamp instanceof Date) return timestamp;
  
  // Firestore Timestamp
  if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // Try to create a Date from the value
  try {
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    return new Date();
  } catch (e) {
    console.error("Failed to convert to date:", timestamp);
    return null;
  }
}