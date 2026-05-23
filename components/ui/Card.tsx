import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  onClick,
}: CardProps) {
  const paddingStyles = {
    none: "p-0",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  const hoverStyle = hover ? "hover:shadow-md transition-all cursor-pointer" : "";

  return (
    <div
      className={`card shadow-sm ${paddingStyles[padding]} ${hoverStyle} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
