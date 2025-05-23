// src/app/cleanup-admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { initializeDefaultAdmin } from "@/lib/firebase/rbac";

export default function CleanupAdminPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Step 1: Clean up Firestore database
  const handleCleanupFirestore = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("🧹 Starting Firestore cleanup...");

      // Clean up app_users collection
      const usersCollection = collection(db, "app_users");
      const userDocs = await getDocs(usersCollection);

      console.log(`Found ${userDocs.size} user profiles in Firestore`);

      for (const userDoc of userDocs.docs) {
        await deleteDoc(doc(db, "app_users", userDoc.id));
        console.log(`Deleted profile: ${userDoc.data().email}`);
      }

      setSuccess(
        `✅ Firestore cleanup complete! Deleted ${userDocs.size} user profiles.`
      );
      console.log("✅ Firestore cleanup complete");
    } catch (err: any) {
      console.error("❌ Cleanup error:", err);
      setError("❌ Cleanup failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Setup admin after manual auth cleanup
  const handleSetupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("🔐 Signing in as admin...");

      // Sign in with the admin account
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );

      console.log("✅ Successfully signed in");

      // Initialize as super admin
      await initializeDefaultAdmin(userCredential.user);

      setSuccess(`🎉 SUCCESS! Admin user initialized successfully!
        
User: ${userCredential.user.email}
UID: ${userCredential.user.uid}
Role: super_admin

You can now:
1. Delete this cleanup-admin folder
2. Access /admin with your credentials`);

      console.log("✅ Admin setup complete!");
    } catch (err: any) {
      console.error("❌ Setup error:", err);

      let errorMessage = "❌ Setup failed: ";

      switch (err.code) {
        case "auth/user-not-found":
          errorMessage +=
            "User not found. Please create the user in Firebase Console first.";
          break;
        case "auth/wrong-password":
          errorMessage += "Wrong password. Check your password.";
          break;
        case "auth/invalid-email":
          errorMessage += "Invalid email format.";
          break;
        case "auth/invalid-credential":
          errorMessage += "Invalid credentials. Check email and password.";
          break;
        default:
          errorMessage += err.message || "Unknown error";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-gray-900">
            🧹 Firebase Cleanup & Setup
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Fix auth/database conflicts and setup admin
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Step Indicator */}
          <div className="flex items-center space-x-4 mb-6">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
            >
              1
            </div>
            <div className="h-1 flex-1 bg-gray-300">
              <div
                className={`h-full bg-blue-500 transition-all ${
                  step >= 2 ? "w-full" : "w-0"
                }`}
              ></div>
            </div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
            >
              2
            </div>
            <div className="h-1 flex-1 bg-gray-300">
              <div
                className={`h-full bg-blue-500 transition-all ${
                  step >= 3 ? "w-full" : "w-0"
                }`}
              ></div>
            </div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 3 ? "bg-green-500 text-white" : "bg-gray-300"
              }`}
            >
              3
            </div>
          </div>

          {/* Step 1: Cleanup Firestore */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Step 1: Clean Firestore Database
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="font-medium text-yellow-800">What this does:</h3>
                <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                  <li>
                    Removes all user profiles from Firestore app_users
                    collection
                  </li>
                  <li>Eliminates conflicts between Auth and Database</li>
                  <li>Prepares for clean admin setup</li>
                </ul>
              </div>

              <button
                onClick={handleCleanupFirestore}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Cleaning..." : "🧹 Clean Firestore Database"}
              </button>

              {success && (
                <div className="bg-green-100 text-green-700 p-3 rounded-md text-sm">
                  {success}
                  <div className="mt-2">
                    <button
                      onClick={() => setStep(2)}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                    >
                      Next Step →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Manual Auth Cleanup Instructions */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Step 2: Clean Firebase Auth (Manual)
              </h2>
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                <h3 className="font-medium text-orange-800">
                  Manual steps required:
                </h3>
                <ol className="list-decimal list-inside text-sm text-orange-700 mt-2 space-y-2">
                  <li>
                    Go to{" "}
                    <a
                      href="https://console.firebase.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Firebase Console
                    </a>
                  </li>
                  <li>Navigate to Authentication → Users</li>
                  <li>
                    <strong>Delete ALL existing users</strong> (including
                    brandoncompany876@gmail.com, etc.)
                  </li>
                  <li>Click "Add User" to create your admin</li>
                  <li>
                    Email:{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      contacto@edicionpersuasiva.com
                    </code>
                  </li>
                  <li>Password: Choose a secure password</li>
                  <li>Come back here and proceed to Step 3</li>
                </ol>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  I've cleaned Auth manually →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Setup Admin */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Step 3: Setup Admin Profile
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-700">
                  Enter the credentials of the admin user you just created in
                  Firebase Console.
                </p>
              </div>

              <form onSubmit={handleSetupAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your secure password"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? "Setting up..." : "🚀 Setup Admin Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Success/Error Messages */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md text-sm whitespace-pre-line">
              {error}
            </div>
          )}

          {success && step === 3 && (
            <div className="bg-green-100 text-green-700 p-4 rounded-md text-sm whitespace-pre-line">
              {success}
            </div>
          )}

          {/* Debug Info */}
          <div className="text-xs text-gray-500 border-t pt-3">
            <strong>Debug Info:</strong>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>This process fixes auth/database sync issues</li>
              <li>Creates proper RBAC admin profile</li>
              <li>Eliminates the "email already in use" error</li>
              <li>Check browser console for detailed logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
