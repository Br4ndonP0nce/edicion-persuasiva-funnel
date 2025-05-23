import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Shield } from "lucide-react";

export const AccessControl: React.FC = () => {
  const { userProfile, hasPermission } = useAuth();

  if (!userProfile) return null;

  const permissions = [
    { key: "dashboard:read", label: "Dashboard Access" },
    { key: "leads:read", label: "View Leads" },
    { key: "leads:write", label: "Edit Leads" },
    { key: "leads:delete", label: "Delete Leads" },
    { key: "stats:read", label: "View Statistics" },
    { key: "content:read", label: "View Content" },
    { key: "content:write", label: "Edit Content" },
    { key: "settings:read", label: "View Settings" },
    { key: "settings:write", label: "Edit Settings" },
    { key: "users:read", label: "View Users" },
    { key: "users:write", label: "Manage Users" },
    { key: "users:delete", label: "Delete Users" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Your Access Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="capitalize">
              {userProfile.role.replace("_", " ")}
            </Badge>
            <Badge variant={userProfile.isActive ? "default" : "destructive"}>
              {userProfile.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{userProfile.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {permissions.map((permission) => (
            <div
              key={permission.key}
              className="flex items-center gap-2 text-sm"
            >
              {hasPermission(permission.key as any) ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-300" />
              )}
              <span
                className={
                  hasPermission(permission.key as any)
                    ? "text-gray-900"
                    : "text-gray-400"
                }
              >
                {permission.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
