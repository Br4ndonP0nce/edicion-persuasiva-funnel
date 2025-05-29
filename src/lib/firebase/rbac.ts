// src/lib/firebase/rbac.ts - Updated with new permissions
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from './config';
import { User } from 'firebase/auth';

// Define all possible permissions in your system
export type Permission = 
  | 'dashboard:read'
  | 'leads:read' 
  | 'leads:write'
  | 'leads:delete'
  | 'sales:read'
  | 'sales:write'
  | 'sales:delete'
  | 'active_members:read'
  | 'active_members:write'
  | 'stats:read'
  | 'content:read'
  | 'content:write'
  | 'settings:read'
  | 'settings:write'
  | 'users:read'
  | 'users:write'
  | 'users:delete';

// Define roles with their permissions
export type Role = 'super_admin' | 'admin' | 'crm_user' | 'viewer';

export interface RoleDefinition {
  id: Role;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean; // Cannot be deleted
}

// System roles definition - UPDATED with new permissions
export const SYSTEM_ROLES: Record<Role, RoleDefinition> = {
  super_admin: {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Acceso completo a todas las funciones y configuraciones',
    permissions: [
      'dashboard:read',
      'leads:read', 'leads:write', 'leads:delete',
      'sales:read', 'sales:write', 'sales:delete',
      'active_members:read', 'active_members:write',
      'stats:read',
      'content:read', 'content:write',
      'settings:read', 'settings:write',
      'users:read', 'users:write', 'users:delete'
    ],
    isSystemRole: true
  },
  admin: {
    id: 'admin',
    name: 'Admin',
    description: 'Acceso completo a todas las funciones excepto gestión de usuarios',
    permissions: [
      'dashboard:read',
      'leads:read', 'leads:write', 'leads:delete',
      'sales:read', 'sales:write', 'sales:delete',
      'active_members:read', 'active_members:write',
      'stats:read',
      'content:read', 'content:write',
      'settings:read', 'settings:write'
    ],
    isSystemRole: true
  },
  crm_user: {
    id: 'crm_user',
    name: 'CRM User',
    description: 'Acceso a leads, ventas y estadísticas',
    permissions: [
      'dashboard:read',
      'leads:read', 'leads:write',
      'sales:read', 'sales:write', // CRM users can create and manage sales
      'stats:read'
    ],
    isSystemRole: true
  },
  viewer: {
    id: 'viewer',
    name: 'Viewer',
    description: 'Acceso solo de lectura a estadísticas y dashboard',
    permissions: [
      'dashboard:read',
      'stats:read'
    ],
    isSystemRole: true
  }
};

// User profile with role information
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: Role;
  permissions?: Permission[]; // Custom permissions that override role
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
  createdBy?: string; // Who created this user
  lastLoginAt?: any;
}

const USERS_COLLECTION = 'app_users';

/**
 * Get user profile with role and permissions
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Create or update user profile
 */
export const createUserProfile = async (
  uid: string, 
  userData: Partial<UserProfile>,
  createdByUid?: string
): Promise<void> => {
  try {
    console.log('🔧 createUserProfile called with:');
    console.log('   UID:', uid);
    console.log('   UserData:', userData);
    console.log('   Role in userData:', userData.role);
    console.log('   CreatedBy:', createdByUid);
    
    const userRef = doc(db, USERS_COLLECTION, uid);
    const existingUser = await getDoc(userRef);
    
    if (existingUser.exists()) {
      console.log('📝 Updating existing user');
      
      // Create update data with proper typing - FIXED TypeScript issue
      const updateData: Record<string, any> = {
        ...userData,
        updatedAt: serverTimestamp()
      };
      
      // Remove undefined values using Object.entries - FIXED TypeScript issue
      const cleanUpdateData: Record<string, any> = {};
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanUpdateData[key] = value;
        }
      });
      
      console.log('📤 Clean update data:', cleanUpdateData);
      await updateDoc(userRef, cleanUpdateData);
      console.log('✅ Updated existing user profile');
      
    } else {
      console.log('🆕 Creating new user profile');
      
      // Build new user data with explicit field assignment - FIXED role issue
      const newUserData: Record<string, any> = {
        uid: uid,
        email: userData.email || '',
        displayName: userData.displayName || '',
        role: userData.role || 'viewer', // CRITICAL: Use the provided role first
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      console.log('📦 Base user data built:', newUserData);
      console.log('🎯 Role assigned as:', newUserData.role);
      
      // Add optional fields only if they exist
      if (userData.permissions && userData.permissions.length > 0) {
        newUserData.permissions = userData.permissions;
        console.log('🔐 Added custom permissions:', userData.permissions);
      }
      
      if (createdByUid) {
        newUserData.createdBy = createdByUid;
        console.log('👤 Added createdBy:', createdByUid);
      }
      
      if (userData.lastLoginAt) {
        newUserData.lastLoginAt = userData.lastLoginAt;
      }
      
      // Final check before saving
      console.log('📤 Final data to be saved to Firestore:');
      console.log(JSON.stringify(newUserData, null, 2));
      console.log('🎯 FINAL ROLE CONFIRMATION:', newUserData.role);
      
      // Save to Firestore
      await setDoc(userRef, newUserData);
      console.log('✅ User profile saved to Firestore');
      
      // Verification step - read back what was saved
      console.log('🔍 Verifying what was actually saved...');
      const savedDoc = await getDoc(userRef);
      if (savedDoc.exists()) {
        const savedData = savedDoc.data();
        console.log('💾 Verification - Data read from Firestore:');
        console.log(JSON.stringify(savedData, null, 2));
        console.log('💾 Verification - Role in database:', savedData.role);
        
        // Alert if there's a role mismatch
        if (savedData.role !== userData.role) {
          console.error('🚨 CRITICAL: ROLE MISMATCH DETECTED!');
          console.error('   🎯 Expected role:', userData.role);
          console.error('   💾 Actual role in DB:', savedData.role);
          console.error('   📋 Full userData passed:', userData);
          console.error('   💿 Full data in DB:', savedData);
        } else {
          console.log('✅ SUCCESS: Role correctly saved as:', savedData.role);
        }
      } else {
        console.error('❌ ERROR: Could not read back the saved document!');
      }
    }
  } catch (error) {
    console.error('❌ Error in createUserProfile:', error);
    console.error('❌ Error details:', {
      uid,
      userData,
      createdByUid,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorCode: error instanceof Error && 'code' in error ? error.code : 'unknown'
    });
    throw error;
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);
    
    return snapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (uid: string, role: Role): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      role,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Deactivate user
 */
export const deactivateUser = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
};

/**
 * Delete user (hard delete)
 */
export const deleteUser = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Get effective permissions for a user
 */
export const getUserPermissions = (userProfile: UserProfile): Permission[] => {
  // If user has custom permissions, use those; otherwise use role permissions
  if (userProfile.permissions && userProfile.permissions.length > 0) {
    return userProfile.permissions;
  }
  
  const role = SYSTEM_ROLES[userProfile.role];
  return role ? role.permissions : [];
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (userProfile: UserProfile, permission: Permission): boolean => {
  if (!userProfile.isActive) return false;
  
  const permissions = getUserPermissions(userProfile);
  return permissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (userProfile: UserProfile, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userProfile, permission));
};

/**
 * Check if user has all specified permissions
 */
export const hasAllPermissions = (userProfile: UserProfile, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userProfile, permission));
};

/**
 * Get routes accessible by user based on permissions - UPDATED with new route
 */
export const getAccessibleRoutes = (userProfile: UserProfile): string[] => {
  const routes: string[] = [];
  const permissions = getUserPermissions(userProfile);
  
  // Always add dashboard if user has dashboard:read
  if (permissions.includes('dashboard:read')) {
    routes.push('/admin');
  }
  
  // Add leads if user has leads:read
  if (permissions.includes('leads:read')) {
    routes.push('/admin/leads');
  }
  
  // Add active members if user has active_members:read
  if (permissions.includes('active_members:read')) {
    routes.push('/admin/activos');
  }
  
  // Add stats if user has stats:read  
  if (permissions.includes('stats:read')) {
    routes.push('/admin/stats');
  }
  
  // Add content if user has content:read
  if (permissions.includes('content:read')) {
    routes.push('/admin/content');
  }
  
  // Add settings if user has settings:read
  if (permissions.includes('settings:read')) {
    routes.push('/admin/settings');
  }
  
  // Add users if user has users:read
  if (permissions.includes('users:read')) {
    routes.push('/admin/users');
  }
  
  return routes;
};

/**
 * Initialize default admin user (run once during setup)
 */
export const initializeDefaultAdmin = async (adminUser: User): Promise<void> => {
  try {
    const existingProfile = await getUserProfile(adminUser.uid);
    
    if (!existingProfile) {
      // Create admin profile with only defined values
      const adminData: Partial<UserProfile> = {
        email: adminUser.email || '',
        role: 'super_admin',
        isActive: true
      };
      
      // Only add displayName if it exists
      if (adminUser.displayName) {
        adminData.displayName = adminUser.displayName;
      }
      
      // Don't pass createdByUid since this is the initial admin
      await createUserProfile(adminUser.uid, adminData);
      console.log('Default admin user initialized');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing default admin:', error);
    throw error;
  }
};