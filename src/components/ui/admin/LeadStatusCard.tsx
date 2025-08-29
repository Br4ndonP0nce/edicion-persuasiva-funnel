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
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-700/50",
      },
      green: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-200 dark:border-green-700/50",
      },
      red: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-200 dark:border-red-700/50",
      },
      amber: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-700/50",
      },
      purple: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-700/50",
      },
    };

    return colorMap[color as keyof typeof colorMap]?.[type] || "";
  };

  return (
    <div
      className={`bg-card text-card-foreground overflow-hidden shadow rounded-lg border ${getColorClass(
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
            <dt className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-foreground">
                {count}
              </div>
              {subtitle && (
                <div className="ml-2 text-sm text-muted-foreground">{subtitle}</div>
              )}
            </dd>
          </div>
        </div>
      </div>
      <div className={`bg-muted/50 px-5 py-3 border-t border-border`}>
        <div className="text-sm">
          <a
            href="#"
            className={`font-medium ${getColorClass(
              "text"
            )} hover:opacity-75`}
          >
            Ver todos
          </a>
        </div>
      </div>
    </div>
  );
};

export default LeadStatusCard;
