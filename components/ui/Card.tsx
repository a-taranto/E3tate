import { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export default function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  onClick,
  style,
}: CardProps) {
  const paddingStyles = {
    none: "p-0",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  // `hover` gives a subtle lift; only show the pointer cursor when the card is
  // actually clickable, so non-interactive cards don't fake an affordance (RC-C).
  const hoverStyle = hover
    ? `hover:shadow-md transition-all ${onClick ? "cursor-pointer" : ""}`
    : "";

  return (
    <div
      className={`card shadow-sm ${paddingStyles[padding]} ${hoverStyle} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
