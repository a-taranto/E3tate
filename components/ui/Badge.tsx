import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          backgroundColor: "var(--success-bg)",
          color: "var(--success)",
          border: "1px solid var(--success)",
          borderColor: "rgba(16, 185, 129, 0.2)",
        };
      case "warning":
        return {
          backgroundColor: "var(--warning-bg)",
          color: "var(--warning)",
          border: "1px solid var(--warning)",
          borderColor: "rgba(245, 158, 11, 0.2)",
        };
      case "error":
        return {
          backgroundColor: "var(--error-bg)",
          color: "var(--error)",
          border: "1px solid var(--error)",
          borderColor: "rgba(239, 68, 68, 0.2)",
        };
      case "info":
        return {
          backgroundColor: "var(--info-bg)",
          color: "var(--info)",
          border: "1px solid var(--info)",
          borderColor: "rgba(59, 130, 246, 0.2)",
        };
      default:
        return {
          backgroundColor: "var(--accent-dim)",
          color: "var(--accent)",
        };
    }
  };

  return (
    <span className={`badge ${className}`} style={getVariantStyles()}>
      {children}
    </span>
  );
}
