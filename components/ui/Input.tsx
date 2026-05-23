import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`input ${error ? "border-red-500 focus:ring-red-500" : ""} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
