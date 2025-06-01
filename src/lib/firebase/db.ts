import { 
    collection, 
    addDoc, 
    updateDoc, 
    getDoc, 
    getDocs, 
    query, 
    where,
    orderBy,
    Timestamp,
    doc,
    serverTimestamp
  } from 'firebase/firestore';
  import { db } from './config';
  
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