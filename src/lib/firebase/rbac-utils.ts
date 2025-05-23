import { UserProfile, Role, Permission, getUserProfile } from './rbac';
import { updateUserRole } from './rbac';
import { getAllUsers } from './rbac';

/**
 * Batch update multiple users' roles
 */
export const batchUpdateUserRoles = async (
  updates: Array<{ uid: string; role: Role }>
): Promise<void> => {
  const promises = updates.map(({ uid, role }) => updateUserRole(uid, role));
  await Promise.all(promises);
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role: Role): Promise<UserProfile[]> => {
  const allUsers = await getAllUsers();
  return allUsers.filter(user => user.role === role);
};

/**
 * Check if user can perform action on target user
 */
export const canManageUser = (
  currentUser: UserProfile, 
  targetUser: UserProfile
): boolean => {
  // Super admins can manage anyone except themselves
  if (currentUser.role === 'super_admin' && currentUser.uid !== targetUser.uid) {
    return true;
  }
  
  // Admins can manage CRM users and viewers
  if (currentUser.role === 'admin' && 
      ['crm_user', 'viewer'].includes(targetUser.role)) {
    return true;
  }
  
  return false;
};

/**
 * Get role hierarchy level (higher number = more permissions)
 */
export const getRoleLevel = (role: Role): number => {
  const levels = {
    'viewer': 1,
    'crm_user': 2,
    'admin': 3,
    'super_admin': 4
  };
  return levels[role] || 0;
};

/**
 * Check if role A can manage role B
 */
export const canRoleManageRole = (managerRole: Role, targetRole: Role): boolean => {
  return getRoleLevel(managerRole) > getRoleLevel(targetRole);
};

/**
 * Get available roles that current user can assign
 */
export const getAssignableRoles = (currentUserRole: Role): Role[] => {
  const currentLevel = getRoleLevel(currentUserRole);
  const allRoles: Role[] = ['viewer', 'crm_user', 'admin', 'super_admin'];
  
  return allRoles.filter(role => getRoleLevel(role) < currentLevel);
};

/**
 * Validate permission string format
 */
export const isValidPermission = (permission: string): permission is Permission => {
  const validPermissions: Permission[] = [
    'dashboard:read',
    'leads:read', 'leads:write', 'leads:delete',
    'stats:read',
    'content:read', 'content:write',
    'settings:read', 'settings:write',
    'users:read', 'users:write', 'users:delete'
  ];
  
  return validPermissions.includes(permission as Permission);
};

/**
 * Create audit log entry (extend as needed)
 */
export interface AuditLogEntry {
  id?: string;
  userId: string;
  action: string;
  targetUserId?: string;
  details: Record<string, any>;
  timestamp: any;
}

export const createAuditLog = async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> => {
  // Implementation would go here - add to an audit_logs collection
  console.log('Audit log:', {
    ...entry,
    timestamp: new Date().toISOString()
  });
};
