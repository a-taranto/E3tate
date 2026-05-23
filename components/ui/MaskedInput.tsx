"use client";

import { useState, InputHTMLAttributes, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

interface MaskedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={isVisible ? "text" : "password"}
            className={`input pr-12 ${error ? "border-red-500 focus:ring-red-500" : ""} ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {error && (
          <p className="mt-1 text-sm" style={{ color: "var(--error)" }}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

MaskedInput.displayName = "MaskedInput";

export default MaskedInput;
