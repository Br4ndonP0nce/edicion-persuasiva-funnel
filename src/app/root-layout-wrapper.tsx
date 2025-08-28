"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

interface RootLayoutWrapperProps {
  children: ReactNode;
}

export default function RootLayoutWrapper({
  children,
}: RootLayoutWrapperProps) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}
