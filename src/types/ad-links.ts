import { Timestamp } from 'firebase/firestore';

// Ad Link Types
export interface AdLink {
  id?: string;
  title: string;
  slug: string;
  description: string;
  targetUrl: string;
  linkType: 'course' | 'landing_page' | 'external' | 'resource';
  defaultRole?: string;
  targetCourse?: string;
  campaignName: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm?: string;
  utmContent?: string;
  expirationDate?: Timestamp;
  requireApproval: boolean;
  isActive: boolean;
  totalClicks: number;
  uniqueClicks: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
}

// Click Event Types
export interface ClickEvent {
  id?: string;
  linkId: string;
  timestamp: Timestamp;
  ip: string;
  userAgent: string;
  referrer: string;
  location: {
    country?: string;
    region?: string;
    city?: string;
  };
  utmParams: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  sessionId: string;
  isUnique: boolean;
}

// Form Types
export interface AdLinkFormData {
  title: string;
  slug: string;
  description: string;
  targetUrl: string;
  linkType: AdLink['linkType'];
  defaultRole?: string;
  targetCourse?: string;
  campaignName: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm?: string;
  utmContent?: string;
  expirationDate?: Date;
  requireApproval: boolean;
  isActive: boolean;
}

// Analytics Types
export interface AdLinkAnalytics {
  totalClicks: number;
  uniqueClicks: number;
  clicksByDay: { date: string; clicks: number }[];
  clicksByCountry: { country: string; clicks: number }[];
  clicksByReferrer: { referrer: string; clicks: number }[];
  clicksByDevice: { device: string; clicks: number }[];
  conversionRate?: number;
}

// Dashboard Stats
export interface AdLinkStats {
  totalLinks: number;
  activeLinks: number;
  totalClicks: number;
  uniqueClicks: number;
  topPerforming: AdLink[];
  recentClicks: ClickEvent[];
}

// Link validation
export interface SlugValidation {
  isValid: boolean;
  isAvailable: boolean;
  message: string;
}