// src/lib/firebase/sales.ts - UPDATED with access management functions
import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  addDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { Sale, PaymentProof, SaleStatusHistory, calculateAccessEndDate } from '@/types/sales';
import { updateLead } from './db';

const SALES_COLLECTION = 'sales';

/**
 * Create a new sale when lead status is updated to "sale"
 */
export const createSale = async (saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>): Promise<string> => {
  try {
    const batch = writeBatch(db);
    
    // Create initial status history
    const initialHistory: SaleStatusHistory = {
      id: `history_${Date.now()}`,
      action: 'sale_created',
      details: `Sale created for ${saleData.product} with ${saleData.paymentPlan}`,
      amount: saleData.totalAmount,
      performedBy: saleData.saleUserId,
      performedAt: new Date()
    };

    // Create sale document
    const saleRef = doc(collection(db, SALES_COLLECTION));
    const saleId = saleRef.id;
    
    const sale: Omit<Sale, 'id'> = {
      ...saleData,
      statusHistory: [initialHistory],
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any
    };

    batch.set(saleRef, sale);

    // Update lead with sale reference
    const leadRef = doc(db, 'leads', saleData.leadId);
    batch.update(leadRef, {
      saleId: saleId,
      status: 'sale',
      updatedAt: serverTimestamp()
    });

    await batch.commit();
    return saleId;
  } catch (error) {
    console.error('Error creating sale:', error);
    throw error;
  }
};

/**
 * Add payment proof and update sale
 */
export const addPaymentProof = async (
  saleId: string, 
  paymentProof: Omit<PaymentProof, 'id' | 'uploadedAt'>,
  performedBy: string
): Promise<void> => {
  try {
    const saleRef = doc(db, SALES_COLLECTION, saleId);
    const saleSnap = await getDoc(saleRef);
    
    if (!saleSnap.exists()) {
      throw new Error('Sale not found');
    }

    const sale = saleSnap.data() as Sale;
    
    // Create new payment proof
    const newProof: PaymentProof = {
      ...paymentProof,
      id: `proof_${Date.now()}`,
      uploadedAt: new Date()
    };

    // Update paid amount
    const newPaidAmount = sale.paidAmount + paymentProof.amount;
    
    // Create status history entry
    const historyEntry: SaleStatusHistory = {
      id: `history_${Date.now()}`,
      action: 'payment_added',
      details: `Payment of $${paymentProof.amount} added`,
      amount: paymentProof.amount,
      performedBy,
      performedAt: new Date()
    };

    // Update sale
    await updateDoc(saleRef, {
      paymentProofs: [...sale.paymentProofs, newProof],
      paidAmount: newPaidAmount,
      statusHistory: [...sale.statusHistory, historyEntry],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding payment proof:', error);
    throw error;
  }
};

/**
 * Grant access to course (admin/super_admin only)
 */
export const grantCourseAccess = async (
  saleId: string, 
  startDate: Date,
  grantedBy: string
): Promise<void> => {
  try {
    const saleRef = doc(db, SALES_COLLECTION, saleId);
    const endDate = calculateAccessEndDate(startDate);
    
    const historyEntry: SaleStatusHistory = {
      id: `history_${Date.now()}`,
      action: 'access_granted',
      details: `Course access granted from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      performedBy: grantedBy,
      performedAt: new Date()
    };

    const saleSnap = await getDoc(saleRef);
    if (!saleSnap.exists()) {
      throw new Error('Sale not found');
    }

    const sale = saleSnap.data() as Sale;

    await updateDoc(saleRef, {
      accessGranted: true,
      accessStartDate: Timestamp.fromDate(startDate),
      accessEndDate: Timestamp.fromDate(endDate),
      statusHistory: [...sale.statusHistory, historyEntry],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error granting course access:', error);
    throw error;
  }
};

/**
 * Update course access dates (admin/super_admin only)
 * NEW FUNCTION
 */
export const updateCourseAccess = async (
  saleId: string, 
  newStartDate: Date,
  updatedBy: string
): Promise<void> => {
  try {
    const saleRef = doc(db, SALES_COLLECTION, saleId);
    const newEndDate = calculateAccessEndDate(newStartDate);
    
    const historyEntry: SaleStatusHistory = {
      id: `history_${Date.now()}`,
      action: 'access_updated',
      details: `Course access updated: new period from ${newStartDate.toLocaleDateString()} to ${newEndDate.toLocaleDateString()}`,
      performedBy: updatedBy,
      performedAt: new Date()
    };

    const saleSnap = await getDoc(saleRef);
    if (!saleSnap.exists()) {
      throw new Error('Sale not found');
    }

    const sale = saleSnap.data() as Sale;

    await updateDoc(saleRef, {
      accessStartDate: Timestamp.fromDate(newStartDate),
      accessEndDate: Timestamp.fromDate(newEndDate),
      statusHistory: [...sale.statusHistory, historyEntry],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating course access:', error);
    throw error;
  }
};

/**
 * Revoke course access (admin/super_admin only)
 * NEW FUNCTION
 */
export const revokeCourseAccess = async (
  saleId: string,
  revokedBy: string,
  reason?: string
): Promise<void> => {
  try {
    const saleRef = doc(db, SALES_COLLECTION, saleId);
    
    const historyEntry: SaleStatusHistory = {
      id: `history_${Date.now()}`,
      action: 'access_revoked',
      details: `Course access revoked${reason ? `: ${reason}` : ''}`,
      performedBy: revokedBy,
      performedAt: new Date()
    };

    const saleSnap = await getDoc(saleRef);
    if (!saleSnap.exists()) {
      throw new Error('Sale not found');
    }

    const sale = saleSnap.data() as Sale;

    await updateDoc(saleRef, {
      accessGranted: false,
      accessStartDate: null,
      accessEndDate: null,
      statusHistory: [...sale.statusHistory, historyEntry],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error revoking course access:', error);
    throw error;
  }
};

/**
 * Grant exemption for payment requirements
 */
export const grantPaymentExemption = async (
  saleId: string,
  reason: string,
  grantedBy: string
): Promise<void> => {
  try {
    const saleRef = doc(db, SALES_COLLECTION, saleId);
    
    const historyEntry: SaleStatusHistory = {
      id: `history_${Date.now()}`,
      action: 'exemption_granted',
      details: `Payment exemption granted: ${reason}`,
      performedBy: grantedBy,
      performedAt: new Date()
    };

    const saleSnap = await getDoc(saleRef);
    if (!saleSnap.exists()) {
      throw new Error('Sale not found');
    }

    const sale = saleSnap.data() as Sale;

    await updateDoc(saleRef, {
      exemptionGranted: true,
      exemptionReason: reason,
      exemptionGrantedBy: grantedBy,
      statusHistory: [...sale.statusHistory, historyEntry],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error granting exemption:', error);
    throw error;
  }
};

/**
 * Get all sales (with filters)
 */
export const getSales = async (filters?: {
  leadId?: string;
  saleUserId?: string;
  product?: Sale['product'];
  accessGranted?: boolean;
}): Promise<Sale[]> => {
  try {
    let q = query(collection(db, SALES_COLLECTION), orderBy('createdAt', 'desc'));
    
    if (filters?.leadId) {
      q = query(q, where('leadId', '==', filters.leadId));
    }
    if (filters?.saleUserId) {
      q = query(q, where('saleUserId', '==', filters.saleUserId));
    }
    if (filters?.product) {
      q = query(q, where('product', '==', filters.product));
    }
    if (filters?.accessGranted !== undefined) {
      q = query(q, where('accessGranted', '==', filters.accessGranted));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
  } catch (error) {
    console.error('Error getting sales:', error);
    throw error;
  }
};

/**
 * Get sale by ID
 */
export const getSale = async (saleId: string): Promise<Sale | null> => {
  try {
    const saleRef = doc(db, SALES_COLLECTION, saleId);
    const saleSnap = await getDoc(saleRef);
    
    if (saleSnap.exists()) {
      return { id: saleSnap.id, ...saleSnap.data() } as Sale;
    }
    return null;
  } catch (error) {
    console.error('Error getting sale:', error);
    throw error;
  }
};

/**
 * Get sale by lead ID
 */
export const getSaleByLeadId = async (leadId: string): Promise<Sale | null> => {
  try {
    const q = query(collection(db, SALES_COLLECTION), where('leadId', '==', leadId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Sale;
    }
    return null;
  } catch (error) {
    console.error('Error getting sale by lead ID:', error);
    throw error;
  }
};

/**
 * Get active members (for /admin/activos route)
 * Returns leads with sales that meet minimum payment requirements
 */
export const getActiveMembers = async (): Promise<Array<Sale & { leadData: any }>> => {
  try {
    // Get all sales with "acceso_curso" product
    const salesQuery = query(
      collection(db, SALES_COLLECTION),
      where('product', '==', 'acceso_curso'),
      orderBy('createdAt', 'desc')
    );
    
    const salesSnapshot = await getDocs(salesQuery);
    const sales = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
    
    // Filter sales that meet minimum payment requirements
    const qualifiedSales = sales.filter(sale => {
      if (sale.exemptionGranted) return true;
      return sale.paidAmount >= (sale.totalAmount * 0.5);
    });
    
    // Get lead data for each qualified sale
    const activeMembersWithLeadData = await Promise.all(
      qualifiedSales.map(async (sale) => {
        const leadRef = doc(db, 'leads', sale.leadId);
        const leadSnap = await getDoc(leadRef);
        const leadData = leadSnap.exists() ? leadSnap.data() : null;
        
        return {
          ...sale,
          leadData
        };
      })
    );
    
    return activeMembersWithLeadData.filter(member => member.leadData !== null);
  } catch (error) {
    console.error('Error getting active members:', error);
    throw error;
  }
};