import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ModernCardProps {
  title: string;
  description?: string;
  value?: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  gradient?: string;
  children?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  title,
  description,
  value,
  icon: Icon,
  iconColor = "text-red-500",
  gradient = "from-red-500 to-red-600",
  children,
  className = "",
  hoverable = true,
  onClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverable ? { y: -4, scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200 p-6
        ${hoverable ? "hover:shadow-lg cursor-pointer" : ""}
        ${onClick ? "cursor-pointer" : ""}
        transition-all duration-200
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className={`p-2 bg-gradient-to-r ${gradient} rounded-lg`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
        {value && (
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        )}
      </div>

      {/* Content */}
      {children && <div className="mt-4">{children}</div>}
    </motion.div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  gradient = "from-red-500 to-red-600",
}) => {
  const changeColors = {
    positive: "text-green-600 bg-green-50",
    negative: "text-red-600 bg-red-50",
    neutral: "text-gray-600 bg-gray-50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${changeColors[changeType]}`}
            >
              {change}
            </motion.span>
          )}
        </div>
        <div className={`p-3 bg-gradient-to-r ${gradient} rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

export default ModernCard;
