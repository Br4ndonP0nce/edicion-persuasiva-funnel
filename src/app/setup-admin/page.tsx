// src/app/setup-admin/page.tsx - Direct Firestore setup
"use client";

import { useState, useEffect } from "react";
import { signIn, signOut } from "@/lib/firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

export default function SetupAdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);

    try {
      await signIn(loginData.email, loginData.password);
      setSuccess("✅ Logged in successfully!");
    } catch (error: any) {
      setError("❌ Login failed: " + (error.message || "Unknown error"));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCleanup = async () => {
    if (!user) {
      setError("Please log in first");
      return;
    }

    setIsCleaningUp(true);
    setError(null);

    try {
      const userRef = doc(db, "app_users", user.uid);
      await deleteDoc(userRef);
      setSuccess("✅ Cleaned up corrupted user data. Now try setup again.");
    } catch (error: any) {
      console.error("Cleanup error:", error);
      // If document doesn't exist, that's actually good
      if (error.code === "not-found") {
        setSuccess("✅ No corrupted data found. Ready for setup.");
      } else {
        setError("Cleanup failed: " + (error.message || "Unknown error"));
      }
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleSetup = async () => {
    if (!user) {
      setError("Please log in first");
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      // Create admin profile directly with only defined fields
      const adminProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "Admin",
        role: "super_admin",
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log("Creating admin profile:", adminProfile);

      // Create the document directly
      const userRef = doc(db, "app_users", user.uid);
      await setDoc(userRef, adminProfile);

      setSuccess(
        "🎉 SUCCESS! Admin initialized successfully! You can now delete this page and access /admin"
      );

      console.log("✅ Admin user created successfully");
    } catch (error: any) {
      console.error("Setup error details:", error);

      if (error.message?.includes("Unsupported field value: undefined")) {
        setError(
          "❌ Still getting undefined field error. Check the browser console for details."
        );
        console.error("Undefined field error - profile data:", {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
      } else {
        setError("❌ Setup failed: " + (error.message || "Unknown error"));
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setSuccess(null);
      setError(null);
      setLoginData({ email: "", password: "" });
    } catch (error: any) {
      setError("Logout failed: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-gray-900">🚀 Admin Setup</h1>
          <p className="text-sm text-gray-600 mt-1">Direct Firestore Setup</p>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-md text-sm">
              {success}
            </div>
          )}

          {!user ? (
            // Login Form
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="contacto@edicionpersuasiva.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoggingIn ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : (
            // Setup Interface
            <div className="space-y-4">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-md text-sm">
                <strong>Logged in as:</strong> {user.email}
                <br />
                <strong>User ID:</strong> {user.uid.substring(0, 8)}...
                <br />
                <strong>Display Name:</strong> {user.displayName || "None"}
              </div>

              <button
                onClick={handleCleanup}
                disabled={isCleaningUp}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50"
              >
                {isCleaningUp ? "Cleaning up..." : "🧹 Clean Up (Just in Case)"}
              </button>

              <button
                onClick={handleSetup}
                disabled={isInitializing}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {isInitializing
                  ? "Setting up..."
                  : "🔧 Initialize as Super Admin (Direct)"}
              </button>

              <button
                onClick={handleLogout}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
              >
                Logout
              </button>

              <div className="text-xs text-gray-500 text-center border-t pt-3">
                ⚠️ Delete this entire setup-admin folder after successful setup!
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 border-t pt-3">
            <strong>Debug Info:</strong>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>This version creates documents directly</li>
              <li>No complex profile creation logic</li>
              <li>Only defined fields are included</li>
              <li>Check browser console for detailed logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
