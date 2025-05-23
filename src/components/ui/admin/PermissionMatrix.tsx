import React from "react";
import { Role, Permission, SYSTEM_ROLES } from "@/lib/firebase/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

export const PermissionMatrix: React.FC = () => {
  const allPermissions: Permission[] = [
    "dashboard:read",
    "leads:read",
    "leads:write",
    "leads:delete",
    "stats:read",
    "content:read",
    "content:write",
    "settings:read",
    "settings:write",
    "users:read",
    "users:write",
    "users:delete",
  ];

  const roles: Role[] = ["super_admin", "admin", "crm_user", "viewer"];

  const hasRolePermission = (role: Role, permission: Permission): boolean => {
    return SYSTEM_ROLES[role]?.permissions.includes(permission) || false;
  };

  const formatPermission = (permission: Permission): string => {
    const [resource, action] = permission.split(":");
    return `${resource.charAt(0).toUpperCase() + resource.slice(1)} ${
      action.charAt(0).toUpperCase() + action.slice(1)
    }`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 font-medium">Permission</th>
                {roles.map((role) => (
                  <th key={role} className="text-center py-2 px-4 font-medium">
                    <div className="flex flex-col items-center">
                      <span className="text-xs capitalize">
                        {SYSTEM_ROLES[role]?.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allPermissions.map((permission) => (
                <tr key={permission} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 text-sm">
                    {formatPermission(permission)}
                  </td>
                  {roles.map((role) => (
                    <td key={role} className="py-2 px-4 text-center">
                      {hasRolePermission(role, permission) ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
