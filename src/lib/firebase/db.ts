import { 
    collection, 
    addDoc, 
    updateDoc, 
    getDoc, 
    getDocs, 
    query, 
    where,
    orderBy,
    limit,
    Timestamp,
    doc,
    serverTimestamp,
    increment,
    deleteDoc
  } from 'firebase/firestore';
  import { db } from './config';
  import { AdLink, ClickEvent, AdLinkAnalytics, AdLinkStats } from '@/types/ad-links';
  
  // Types for our Firestore data
  export interface Lead {
    id?: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    level: string;
    software: string;
    clients: string;
    investment: string;
    why: string;
    status: 'lead' | 'onboarding' | 'sale' | 'rejected';
    saleId?: string; // Reference to sale document - FIXED: Added this property
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    agentData?: any; // Data from n8n agent processing
    notes?: string;
    assignedTo?: string;
    statusHistory?: LeadStatusHistory[]; // ADDED: Status history tracking
  }
  export interface LeadStatusHistory {
    id: string;
    previousStatus: Lead['status'];
    newStatus: Lead['status'];
    details: string;
    performedBy: string;
    performedAt: Timestamp;
  }
  // Collection references
  const LEADS_COLLECTION = 'leads';
  
  /**
   * Add a new lead to Firestore
   */
  export const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, LEADS_COLLECTION), {
        ...leadData,
        status: leadData.status || 'lead', // Default status
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding lead:', error);
      throw error;
    }
  };
  
  /**
   * Update a lead's status or data
   */
  export const updateLead = async (leadId: string, data: Partial<Lead>, performedBy?: string): Promise<void> => {
    try {
      const leadRef = doc(db, LEADS_COLLECTION, leadId);
      
      // If status is being updated, add to history
      if (data.status && performedBy) {
        const currentLead = await getDoc(leadRef);
        if (currentLead.exists()) {
          const currentData = currentLead.data() as Lead;
          const historyEntry: LeadStatusHistory = {
            id: `history_${Date.now()}`,
            previousStatus: currentData.status,
            newStatus: data.status,
            details: `Status updated from ${currentData.status} to ${data.status}`,
            performedBy,
            performedAt: Timestamp.fromDate(new Date()) // Use Timestamp.fromDate instead of serverTimestamp
          };
          
          data.statusHistory = [...(currentData.statusHistory || []), historyEntry];
        }
      }
      
      await updateDoc(leadRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  };
  
  /**
   * Get a single lead by ID
   */
  export const getLead = async (leadId: string): Promise<Lead | null> => {
    try {
      const leadRef = doc(db, LEADS_COLLECTION, leadId);
      const leadSnap = await getDoc(leadRef);
      
      if (leadSnap.exists()) {
        return { id: leadSnap.id, ...leadSnap.data() } as Lead;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting lead:', error);
      throw error;
    }
  };
  
  /**
   * Get all leads, optionally filtered by status
   */
  export const getLeads = async (status?: Lead['status']): Promise<Lead[]> => {
    try {
      let q = status
        ? query(
            collection(db, LEADS_COLLECTION), 
            where('status', '==', status),
            orderBy('createdAt', 'desc')
          )
        : query(
            collection(db, LEADS_COLLECTION),
            orderBy('createdAt', 'desc')
          );
      
      const querySnapshot = await getDocs(q);
      const leads: Lead[] = [];
      
      querySnapshot.forEach((doc) => {
        leads.push({ id: doc.id, ...doc.data() } as Lead);
      });
      
      return leads;
    } catch (error) {
      console.error('Error getting leads:', error);
      throw error;
    }
  };
  
  /**
   * Search leads by name or email
   */
  export const searchLeads = async (searchTerm: string): Promise<Lead[]> => {
    try {
      // Note: Firestore doesn't support native text search
      // For a small dataset, we can fetch all and filter client-side
      // For production, consider Algolia or similar search service
      
      const allLeads = await getLeads();
      const searchTermLower = searchTerm.toLowerCase();
      
      return allLeads.filter(lead => 
        lead.name.toLowerCase().includes(searchTermLower) ||
        lead.email.toLowerCase().includes(searchTermLower)
      );
    } catch (error) {
      console.error('Error searching leads:', error);
      throw error;
    }
};
  
//CMS
export interface ContentItem {
  id?: string;
  type: 'text' | 'image' | 'video';
  section: string; // E.g., 'hero', 'testimonials', 'benefits'
  key: string;     // E.g., 'title', 'subtitle', 'video_url'
  value: string;
  label: string;   // Human-readable label
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Collection reference
const CONTENT_COLLECTION = 'content';

// Get all content
export const getAllContent = async (): Promise<ContentItem[]> => {
  try {
    const q = query(
      collection(db, CONTENT_COLLECTION),
      orderBy('section'),
      orderBy('key')
    );
    
    const querySnapshot = await getDocs(q);
    const content: ContentItem[] = [];
    
    querySnapshot.forEach((doc) => {
      content.push({ id: doc.id, ...doc.data() } as ContentItem);
    });
    
    return content;
  } catch (error) {
    console.error('Error getting content:', error);
    throw error;
  }
};

// Get content by section
export const getContentBySection = async (section: string): Promise<ContentItem[]> => {
  try {
    const q = query(
      collection(db, CONTENT_COLLECTION),
      where('section', '==', section),
      orderBy('key')
    );
    
    const querySnapshot = await getDocs(q);
    const content: ContentItem[] = [];
    
    querySnapshot.forEach((doc) => {
      content.push({ id: doc.id, ...doc.data() } as ContentItem);
    });
    
    return content;
  } catch (error) {
    console.error('Error getting section content:', error);
    throw error;
  }
};

// Update content
export const updateContent = async (contentId: string, value: string): Promise<void> => {
  try {
    const contentRef = doc(db, CONTENT_COLLECTION, contentId);
    await updateDoc(contentRef, {
      value,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

// AD LINKS MODULE
const AD_LINKS_COLLECTION = 'ad_links';
const CLICK_EVENTS_COLLECTION = 'click_events';

/**
 * Create a new ad link
 */
export const createAdLink = async (adLinkData: Omit<AdLink, 'id' | 'createdAt' | 'updatedAt' | 'totalClicks' | 'uniqueClicks'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, AD_LINKS_COLLECTION), {
      ...adLinkData,
      totalClicks: 0,
      uniqueClicks: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating ad link:', error);
    throw error;
  }
};

/**
 * Get all ad links
 */
export const getAdLinks = async (isActive?: boolean): Promise<AdLink[]> => {
  try {
    let q = isActive !== undefined
      ? query(
          collection(db, AD_LINKS_COLLECTION), 
          where('isActive', '==', isActive),
          orderBy('createdAt', 'desc')
        )
      : query(
          collection(db, AD_LINKS_COLLECTION),
          orderBy('createdAt', 'desc')
        );
    
    const querySnapshot = await getDocs(q);
    const adLinks: AdLink[] = [];
    
    querySnapshot.forEach((doc) => {
      adLinks.push({ id: doc.id, ...doc.data() } as AdLink);
    });
    
    return adLinks;
  } catch (error) {
    console.error('Error getting ad links:', error);
    throw error;
  }
};

/**
 * Get ad link by ID
 */
export const getAdLink = async (linkId: string): Promise<AdLink | null> => {
  try {
    const linkRef = doc(db, AD_LINKS_COLLECTION, linkId);
    const linkSnap = await getDoc(linkRef);
    
    if (linkSnap.exists()) {
      return { id: linkSnap.id, ...linkSnap.data() } as AdLink;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting ad link:', error);
    throw error;
  }
};

/**
 * Get ad link by slug
 */
export const getAdLinkBySlug = async (slug: string): Promise<AdLink | null> => {
  try {
    const q = query(
      collection(db, AD_LINKS_COLLECTION), 
      where('slug', '==', slug),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as AdLink;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting ad link by slug:', error);
    throw error;
  }
};

/**
 * Update ad link
 */
export const updateAdLink = async (linkId: string, data: Partial<AdLink>): Promise<void> => {
  try {
    const linkRef = doc(db, AD_LINKS_COLLECTION, linkId);
    await updateDoc(linkRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating ad link:', error);
    throw error;
  }
};

/**
 * Soft delete ad link (deactivate)
 */
export const deactivateAdLink = async (linkId: string): Promise<void> => {
  try {
    const linkRef = doc(db, AD_LINKS_COLLECTION, linkId);
    await updateDoc(linkRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deactivating ad link:', error);
    throw error;
  }
};

/**
 * Hard delete ad link (permanent)
 */
export const deleteAdLink = async (linkId: string): Promise<void> => {
  try {
    const linkRef = doc(db, AD_LINKS_COLLECTION, linkId);
    await deleteDoc(linkRef);
  } catch (error) {
    console.error('Error deleting ad link:', error);
    throw error;
  }
};

/**
 * Check if slug is available
 */
export const isSlugAvailable = async (slug: string, excludeId?: string): Promise<boolean> => {
  try {
    let q = query(
      collection(db, AD_LINKS_COLLECTION), 
      where('slug', '==', slug)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return true;
    }
    
    // If we're updating an existing link, exclude it from the check
    if (excludeId) {
      return querySnapshot.docs.every(doc => doc.id === excludeId);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking slug availability:', error);
    throw error;
  }
};

/**
 * Record a click event
 */
export const recordClickEvent = async (clickData: Omit<ClickEvent, 'id' | 'timestamp'>): Promise<void> => {
  try {
    // Add the click event
    await addDoc(collection(db, CLICK_EVENTS_COLLECTION), {
      ...clickData,
      timestamp: serverTimestamp()
    });
    
    // Update link click counts
    const linkRef = doc(db, AD_LINKS_COLLECTION, clickData.linkId);
    const updateData: any = {
      totalClicks: increment(1),
      updatedAt: serverTimestamp()
    };
    
    // If this is a unique click, also increment unique clicks
    if (clickData.isUnique) {
      updateData.uniqueClicks = increment(1);
    }
    
    await updateDoc(linkRef, updateData);
  } catch (error) {
    console.error('Error recording click event:', error);
    throw error;
  }
};

/**
 * Get click events for a specific link
 */
export const getClickEvents = async (linkId: string, limitCount?: number): Promise<ClickEvent[]> => {
  try {
    // Build query conditionally to avoid TypeScript constraint type issues
    let q;
    
    if (limitCount) {
      q = query(
        collection(db, CLICK_EVENTS_COLLECTION),
        where('linkId', '==', linkId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, CLICK_EVENTS_COLLECTION),
        where('linkId', '==', linkId),
        orderBy('timestamp', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const clickEvents: ClickEvent[] = [];
    
    querySnapshot.forEach((doc) => {
      clickEvents.push({ id: doc.id, ...doc.data() } as ClickEvent);
    });
    
    return clickEvents;
  } catch (error) {
    console.error('Error getting click events:', error);
    throw error;
  }
};

/**
 * Get ad links analytics dashboard stats
 */
export const getAdLinksStats = async (): Promise<AdLinkStats> => {
  try {
    const [allLinks, recentClicksQuery] = await Promise.all([
      getAdLinks(),
      getDocs(query(
        collection(db, CLICK_EVENTS_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(10)
      ))
    ]);
    
    const activeLinks = allLinks.filter(link => link.isActive);
    const totalClicks = allLinks.reduce((sum, link) => sum + link.totalClicks, 0);
    const uniqueClicks = allLinks.reduce((sum, link) => sum + link.uniqueClicks, 0);
    
    // Top performing links (by total clicks)
    const topPerforming = [...allLinks]
      .sort((a, b) => b.totalClicks - a.totalClicks)
      .slice(0, 5);
    
    // Recent clicks
    const recentClicks: ClickEvent[] = [];
    recentClicksQuery.forEach((doc) => {
      recentClicks.push({ id: doc.id, ...doc.data() } as ClickEvent);
    });
    
    return {
      totalLinks: allLinks.length,
      activeLinks: activeLinks.length,
      totalClicks,
      uniqueClicks,
      topPerforming,
      recentClicks
    };
  } catch (error) {
    console.error('Error getting ad links stats:', error);
    throw error;
  }
};