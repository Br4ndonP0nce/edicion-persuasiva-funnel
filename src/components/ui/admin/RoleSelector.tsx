import React from "react";
import { Role, SYSTEM_ROLES } from "@/lib/firebase/rbac";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Eye, Settings } from "lucide-react";

interface RoleSelectorProps {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
  showDescription?: boolean;
}

const getRoleIcon = (role: Role) => {
  switch (role) {
    case "super_admin":
      return <Settings className="h-4 w-4" />;
    case "admin":
      return <Shield className="h-4 w-4" />;
    case "crm_user":
      return <Users className="h-4 w-4" />;
    case "viewer":
      return <Eye className="h-4 w-4" />;
    default:
      return <Eye className="h-4 w-4" />;
  }
};

const getRoleColor = (role: Role) => {
  switch (role) {
    case "super_admin":
      return "bg-red-100 text-red-800 border-red-200";
    case "admin":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "crm_user":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "viewer":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  showDescription = false,
}) => {
  return (
    <div className="space-y-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Role)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
      >
        {Object.entries(SYSTEM_ROLES).map(([key, role]) => (
          <option key={key} value={key}>
            {role.name}
          </option>
        ))}
      </select>

      {showDescription && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            {getRoleIcon(value)}
            <Badge className={getRoleColor(value)}>
              {SYSTEM_ROLES[value]?.name}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {SYSTEM_ROLES[value]?.description}
          </p>
          <div className="text-xs text-gray-500">
            <strong>Permissions:</strong>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {SYSTEM_ROLES[value]?.permissions.map((permission) => (
                <span key={permission} className="bg-white px-2 py-1 rounded">
                  {permission}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
