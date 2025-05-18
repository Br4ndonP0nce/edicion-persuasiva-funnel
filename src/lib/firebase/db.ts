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
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    agentData?: any; // Data from n8n agent processing
    notes?: string;
    assignedTo?: string;
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
  export const updateLead = async (leadId: string, data: Partial<Lead>): Promise<void> => {
    try {
      const leadRef = doc(db, LEADS_COLLECTION, leadId);
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