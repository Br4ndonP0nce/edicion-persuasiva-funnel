// src/app/admin/users/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  getAllUsers,
  updateUserRole,
  deactivateUser,
  UserProfile,
  Role,
  SYSTEM_ROLES,
  createUserProfile,
} from "@/lib/firebase/rbac";
import {
  createUserAsAdminNoLogout,
  reAuthenticateAdmin,
} from "@/lib/firebase/admin-auth";
import { createUser } from "@/lib/firebase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  AlertCircle,
  CheckCircle,
  UserX,
} from "lucide-react";

export default function UsersPage() {
  const { userProfile, hasPermission } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showReAuthModal, setShowReAuthModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [newUserCreated, setNewUserCreated] = useState<string | null>(null);

  // New user form state
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
    displayName: "",
    role: "crm_user" as Role,
  });

  useEffect(() => {
    if (hasPermission("users:read")) {
      fetchUsers();
    }
  }, [hasPermission]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      console.log("🚀 ULTIMATE: Starting user creation process");
      console.log("📋 Form data:", newUserData);

      // Import the ultimate function
      const { createUserAsAdminNoLogout } = await import(
        "@/lib/firebase/admin-auth"
      );

      // Create user using the ultimate method (no logout!)
      const result = await createUserAsAdminNoLogout(
        newUserData.email,
        newUserData.password,
        newUserData.role,
        newUserData.displayName
      );

      if (result.success) {
        console.log("🎉 SUCCESS: User created without admin logout!");

        // Reset form
        setNewUserData({
          email: "",
          password: "",
          displayName: "",
          role: "crm_user",
        });
        setShowCreateForm(false);

        // Refresh the users list
        await fetchUsers();

        // Clear any previous errors
        setError(null);

        // Optional: Show success message
        console.log("✅ User creation completed successfully");
      } else {
        console.error("❌ User creation failed:", result.error);
        setError(result.error || "Failed to create user");
      }
    } catch (err: any) {
      console.error("❌ Error in handleCreateUser:", err);
      setError(err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };
  const handleReAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      if (!userProfile?.email) {
        throw new Error("Current user email not found");
      }

      const result = await reAuthenticateAdmin(
        userProfile.email,
        adminPassword
      );

      if (result.success) {
        console.log("✅ Admin re-authenticated successfully");
        setShowReAuthModal(false);
        setAdminPassword("");
        setNewUserCreated(null);

        // Refresh the users list
        await fetchUsers();

        // Show success message
        setError(null);
        // You could add a success state here if needed
      } else {
        setError(result.error || "Re-authentication failed");
      }
    } catch (err: any) {
      console.error("Error re-authenticating:", err);
      setError(err.message || "Re-authentication failed");
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await updateUserRole(userId, newRole);
      await fetchUsers(); // Refresh the list
    } catch (err) {
      console.error("Error updating user role:", err);
      setError("Failed to update user role");
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (confirm("Are you sure you want to deactivate this user?")) {
      try {
        await deactivateUser(userId);
        await fetchUsers(); // Refresh the list
      } catch (err) {
        console.error("Error deactivating user:", err);
        setError("Failed to deactivate user");
      }
    }
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800";
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "crm_user":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={["users:read"]}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>

          {hasPermission("users:write") && (
            <Button onClick={() => setShowCreateForm(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            {error}
          </div>
        )}

        {/* Create User Form */}
        {showCreateForm && hasPermission("users:write") && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={newUserData.email}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="displayName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Display Name
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={newUserData.displayName}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          displayName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Temporary Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={newUserData.password}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          password: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Role
                    </label>
                    <select
                      id="role"
                      value={newUserData.role}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          role: e.target.value as Role,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {Object.entries(SYSTEM_ROLES).map(([key, role]) => (
                        <option key={key} value={key}>
                          {role.name} - {role.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create User"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        {showReAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                ✅ User Created Successfully!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                To maintain security, please re-enter your admin password to
                continue managing users.
              </p>
              <form onSubmit={handleReAuthentication}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {creating ? "Signing In..." : "Continue as Admin"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReAuthModal(false);
                      setAdminPassword("");
                      window.location.reload(); // Force refresh to clear any auth issues
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Refresh Page
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-900">
                                {user.displayName?.charAt(0)?.toUpperCase() ||
                                  user.email?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.displayName || "No name"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasPermission("users:write") ? (
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user.uid, e.target.value as Role)
                            }
                            className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${getRoleBadgeColor(
                              user.role
                            )}`}
                            disabled={user.uid === userProfile?.uid} // Can't change own role
                          >
                            {Object.entries(SYSTEM_ROLES).map(([key, role]) => (
                              <option key={key} value={key}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {SYSTEM_ROLES[user.role]?.name || user.role}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.isActive ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-green-800 text-sm">
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <UserX className="h-4 w-4 text-red-500 mr-2" />
                              <span className="text-red-800 text-sm">
                                Inactive
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt
                          ? new Date(
                              user.createdAt.seconds * 1000
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {hasPermission("users:write") &&
                            user.uid !== userProfile?.uid && (
                              <>
                                {user.isActive && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleDeactivateUser(user.uid)
                                    }
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

// src/app/admin/unauthorized/page.tsx
