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
    createdAt?: any; // Firestore Timestamp
    updatedAt?: any; // Firestore Timestamp
    agentData?: any; // Data from n8n agent processing
    notes?: string;
    assignedTo?: string;
  }