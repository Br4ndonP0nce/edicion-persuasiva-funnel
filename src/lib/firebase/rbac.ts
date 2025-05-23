// src/lib/firebase/rbac.ts
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
  
  // System roles definition
  export const SYSTEM_ROLES: Record<Role, RoleDefinition> = {
    super_admin: {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Full system access including user management',
      permissions: [
        'dashboard:read',
        'leads:read', 'leads:write', 'leads:delete',
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
      description: 'Full access except user management',
      permissions: [
        'dashboard:read',
        'leads:read', 'leads:write', 'leads:delete',
        'stats:read',
        'content:read', 'content:write',
        'settings:read', 'settings:write'
      ],
      isSystemRole: true
    },
    crm_user: {
      id: 'crm_user',
      name: 'CRM User',
      description: 'Access to leads and basic analytics',
      permissions: [
        'dashboard:read',
        'leads:read', 'leads:write',
        'stats:read'
      ],
      isSystemRole: true
    },
    viewer: {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to dashboard and stats',
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
      const userRef = doc(db, USERS_COLLECTION, uid);
      const existingUser = await getDoc(userRef);
      
      if (existingUser.exists()) {
        // Update existing user - only include defined values
        const updateData: any = {
          ...userData,
          updatedAt: serverTimestamp()
        };
        
        // Remove any undefined values
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) {
            delete updateData[key];
          }
        });
        
        await updateDoc(userRef, updateData);
      } else {
        // Create new user - only include defined values
        const newUserData: any = {
          uid,
          role: 'viewer', // Default role
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...userData
        };
        
        // Only add createdBy if it's defined
        if (createdByUid) {
          newUserData.createdBy = createdByUid;
        }
        
        // Remove any undefined values
        Object.keys(newUserData).forEach(key => {
          if (newUserData[key] === undefined) {
            delete newUserData[key];
          }
        });
        
        await setDoc(userRef, newUserData);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
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
   * Get routes accessible by user based on permissions
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