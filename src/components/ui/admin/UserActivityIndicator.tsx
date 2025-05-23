import React from "react";
import { UserProfile } from "@/lib/firebase/rbac";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface UserActivityIndicatorProps {
  user: UserProfile;
  showLastLogin?: boolean;
}

export const UserActivityIndicator: React.FC<UserActivityIndicatorProps> = ({
  user,
  showLastLogin = false,
}) => {
  const getStatusColor = () => {
    if (!user.isActive) return "bg-red-100 text-red-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusIcon = () => {
    if (!user.isActive) return <XCircle className="h-3 w-3" />;
    return <CheckCircle className="h-3 w-3" />;
  };

  const formatLastLogin = (timestamp: any) => {
    if (!timestamp) return "Never";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${getStatusColor()} flex items-center gap-1`}>
        {getStatusIcon()}
        {user.isActive ? "Active" : "Inactive"}
      </Badge>

      {showLastLogin && (
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatLastLogin(user.lastLoginAt)}
        </span>
      )}
    </div>
  );
};
