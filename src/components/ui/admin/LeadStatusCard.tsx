import React from "react";
import {
  Users,
  RefreshCw,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";

interface LeadStatusCardProps {
  title: string;
  count: number | string;
  icon: string;
  color: string;
  subtitle?: string;
}

const LeadStatusCard: React.FC<LeadStatusCardProps> = ({
  title,
  count,
  icon,
  color,
  subtitle,
}) => {
  const getIcon = () => {
    const iconProps = { className: `h-6 w-6 ${getColorClass("text")}` };

    switch (icon) {
      case "users":
        return <Users {...iconProps} />;
      case "refresh-cw":
        return <RefreshCw {...iconProps} />;
      case "check-circle":
        return <CheckCircle {...iconProps} />;
      case "x-circle":
        return <XCircle {...iconProps} />;
      case "dollar-sign":
        return <DollarSign {...iconProps} />;
      case "trending-up":
        return <TrendingUp {...iconProps} />;
      default:
        return <Users {...iconProps} />;
    }
  };

  const getColorClass = (type: "bg" | "text" | "border") => {
    const colorMap = {
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-600",
        border: "border-green-200",
      },
      red: {
        bg: "bg-red-100",
        text: "text-red-600",
        border: "border-red-200",
      },
      amber: {
        bg: "bg-amber-100",
        text: "text-amber-600",
        border: "border-amber-200",
      },
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-600",
        border: "border-purple-200",
      },
    };

    return colorMap[color as keyof typeof colorMap]?.[type] || "";
  };

  return (
    <div
      className={`bg-white overflow-hidden shadow rounded-lg border ${getColorClass(
        "border"
      )}`}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div
            className={`flex-shrink-0 rounded-md p-3 ${getColorClass("bg")}`}
          >
            {getIcon()}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {count}
              </div>
              {subtitle && (
                <div className="ml-2 text-sm text-gray-500">{subtitle}</div>
              )}
            </dd>
          </div>
        </div>
      </div>
      <div className={`bg-gray-50 px-5 py-3 ${getColorClass("border")}`}>
        <div className="text-sm">
          <a
            href="#"
            className={`font-medium ${getColorClass(
              "text"
            )} hover:text-opacity-75`}
          >
            Ver todos
          </a>
        </div>
      </div>
    </div>
  );
};

export default LeadStatusCard;
