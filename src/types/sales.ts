// src/types/sales.ts
export interface PaymentProof {
    id: string;
    amount: number;
    imageUrl: string;
    uploadedAt: Date;
    uploadedBy: string; // uid of CRM user who uploaded
    description?: string;
  }
  
  export interface Sale {
    id?: string;
    leadId: string;
    saleUserId: string; // CRM user who made the sale
    product: 'acceso_curso' | 'others';
    paymentPlan: '1_pago' | '2_pagos' | '3_pagos' | 'custom';
    totalAmount: number;
    paidAmount: number;
    paymentProofs: PaymentProof[];
    
    // Access management
    accessGranted: boolean;
    accessStartDate: Date | null;
    accessEndDate: Date | null; // calculated as accessStartDate + 120 days
    exemptionGranted: boolean;
    exemptionReason?: string;
    exemptionGrantedBy?: string; // uid of admin who granted exemption
    
    // Tracking
    createdAt: Date;
    updatedAt: Date;
    statusHistory: SaleStatusHistory[];
  }
  
  export interface SaleStatusHistory {
    id: string;
    action: 'sale_created' | 'payment_added' | 'access_granted' | 'access_updated' | 'access_revoked' | 'exemption_granted';
    details: string;
    amount?: number;
    performedBy: string; // uid of user who performed action
    performedAt: Date;
  }
  
  // Payment plan configurations
  export const PAYMENT_PLANS = {
    '1_pago': { amount: 1000, payments: 1, label: '1 Solo Pago - $1,000' },
    '2_pagos': { amount: 1200, payments: 2, label: '2 Pagos - $1,200' },
    '3_pagos': { amount: 1300, payments: 3, label: '3 Pagos - $1,300' }
  } as const;
  
  // Helper functions
  export const calculateAccessEndDate = (startDate: Date): Date => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 120);
    return endDate;
  };
  
  export const hasMinimumPayment = (sale: Sale): boolean => {
    if (sale.exemptionGranted) return true;
    const minimumRequired = sale.totalAmount * 0.5; // 50%
    return sale.paidAmount >= minimumRequired;
  };
  
  export const isAccessActive = (sale: Sale): boolean => {
    if (!sale.accessGranted || !sale.accessStartDate || !sale.accessEndDate) return false;
    const now = new Date();
    return now >= sale.accessStartDate && now <= sale.accessEndDate;
  };
  
  export const getRemainingDays = (sale: Sale): number => {
    if (!sale.accessEndDate) return 0;
    const now = new Date();
    const diffTime = sale.accessEndDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };
  
  // Update Lead interface to include sale reference
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
    saleId?: string; // Reference to sale document
    createdAt?: any;
    updatedAt?: any;
    agentData?: any;
    notes?: string;
    assignedTo?: string;
    statusHistory?: LeadStatusHistory[];
  }
  
  export interface LeadStatusHistory {
    id: string;
    previousStatus: Lead['status'];
    newStatus: Lead['status'];
    details: string;
    performedBy: string;
    performedAt: Date;
  }