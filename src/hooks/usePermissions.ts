import { useAuth } from './useAuth';
import { Permission } from '@/lib/firebase/rbac';
import { useMemo } from 'react';

export const usePermissions = () => {
  const { userProfile, hasPermission, hasAnyPermission } = useAuth();

  const permissions = useMemo(() => ({
    // Navigation permissions
    canViewDashboard: hasPermission('dashboard:read'),
    canViewLeads: hasPermission('leads:read'),
    canEditLeads: hasPermission('leads:write'),
    canDeleteLeads: hasPermission('leads:delete'),
    canViewStats: hasPermission('stats:read'),
    canViewContent: hasPermission('content:read'),
    canEditContent: hasPermission('content:write'),
    canViewSettings: hasPermission('settings:read'),
    canEditSettings: hasPermission('settings:write'),
    canViewUsers: hasPermission('users:read'),
    canManageUsers: hasPermission('users:write'),
    canDeleteUsers: hasPermission('users:delete'),

    // Compound permissions
    isAdmin: hasAnyPermission(['users:write', 'settings:write']),
    isSuperAdmin: hasPermission('users:delete'),
    canManageContent: hasAnyPermission(['content:read', 'content:write']),
    canManageLeads: hasAnyPermission(['leads:read', 'leads:write']),

    // Role checks
    role: userProfile?.role,
    isActive: userProfile?.isActive || false,
    
    // Helper functions
    can: hasPermission,
    canAny: hasAnyPermission,
  }), [userProfile, hasPermission, hasAnyPermission]);

  return permissions;
};