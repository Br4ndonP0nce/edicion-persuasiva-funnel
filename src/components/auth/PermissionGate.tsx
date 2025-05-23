// src/components/auth/PermissionGate.tsx
"use client";

import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Permission } from "@/lib/firebase/rbac";

interface PermissionGateProps {
  children: ReactNode;
  permissions: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permissions,
  requireAll = false,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission } = useAuth();

  const hasAccess = requireAll
    ? permissions.every((permission) => hasPermission(permission))
    : hasAnyPermission(permissions);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
