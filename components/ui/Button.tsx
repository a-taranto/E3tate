import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles = "btn inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger: "bg-red-600 text-white hover:bg-red-700 border-0",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
