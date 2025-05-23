// src/components/auth/ProtectedRoute.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Permission } from "@/lib/firebase/rbac";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requireAll = false,
  fallbackPath = "/admin/unauthorized",
}) => {
  const { user, userProfile, loading, hasPermission, hasAnyPermission } =
    useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/admin/login");
        return;
      }

      if (!userProfile || !userProfile.isActive) {
        router.push("/admin/unauthorized");
        return;
      }

      if (requiredPermissions.length > 0) {
        const hasAccess = requireAll
          ? requiredPermissions.every((permission) => hasPermission(permission))
          : hasAnyPermission(requiredPermissions);

        if (!hasAccess) {
          router.push(fallbackPath);
          return;
        }
      }
    }
  }, [
    user,
    userProfile,
    loading,
    requiredPermissions,
    requireAll,
    fallbackPath,
    router,
    hasPermission,
    hasAnyPermission,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user || !userProfile || !userProfile.isActive) {
    return null;
  }

  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? requiredPermissions.every((permission) => hasPermission(permission))
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      return null;
    }
  }

  return <>{children}</>;
};
