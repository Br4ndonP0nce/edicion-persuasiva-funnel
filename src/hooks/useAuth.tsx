// src/hooks/useAuth.ts
"use client";

import { useState, useEffect, useContext, createContext } from "react";
import type { ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import {
  getUserProfile,
  createUserProfile,
  UserProfile,
  Permission,
  hasPermission,
  hasAnyPermission,
  getAccessibleRoutes,
} from "@/lib/firebase/rbac";

// Define the context type
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  getAccessibleRoutes: () => string[];
  refreshProfile: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error("Error refreshing user profile:", error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          let profile = await getUserProfile(firebaseUser.uid);

          if (!profile) {
            // Only auto-create profile if we're NOT on the setup page
            const isSetupPage =
              window.location.pathname.includes("setup-admin");

            if (!isSetupPage) {
              await createUserProfile(firebaseUser.uid, {
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "",
                role: "viewer",
              });
              profile = await getUserProfile(firebaseUser.uid);
            }
          }

          setUserProfile(profile);
        } catch (error) {
          console.error("Error loading user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Wrapper functions
  const checkPermission = (permission: Permission): boolean => {
    if (!userProfile) return false;
    return hasPermission(userProfile, permission);
  };

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!userProfile) return false;
    return hasAnyPermission(userProfile, permissions);
  };

  const getUserRoutes = (): string[] => {
    if (!userProfile) return [];
    return getAccessibleRoutes(userProfile);
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    getAccessibleRoutes: getUserRoutes,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
