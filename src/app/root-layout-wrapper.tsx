"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { ReactNode } from "react";

interface RootLayoutWrapperProps {
  children: ReactNode;
}

export default function RootLayoutWrapper({
  children,
}: RootLayoutWrapperProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
