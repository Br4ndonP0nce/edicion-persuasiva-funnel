// src/app/admin/layout.tsx - Updated with RBAC and Theme Support
"use client";

import React, { ReactNode } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/ui/admin/DashboardLayout";
import { Toaster } from "sonner";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AuthProvider>
        <ProtectedRoute requiredPermissions={["dashboard:read"]}>
          <DashboardLayout>{children}</DashboardLayout>
          <Toaster />
        </ProtectedRoute>
      </AuthProvider>
    </ThemeProvider>
  );
}
