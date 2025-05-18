"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthChange } from "@/lib/firebase/auth";
import DashboardLayout from "@/components/ui/admin/DashboardLayout";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setIsLoading(true);

      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);

        // Only redirect if we're not already on the login page
        if (pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // If not authenticated and not on login page, the useEffect will redirect
  if (!isAuthenticated && pathname !== "/admin/login") {
    return null;
  }

  // If on login page, just render children (the login form)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // If authenticated, render the dashboard layout with children
  return <DashboardLayout>{children}</DashboardLayout>;
}
