"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button";

interface SlideOverPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: "md" | "lg" | "xl";
}

export default function SlideOverPanel({
  isOpen,
  onClose,
  title,
  children,
  width = "lg",
}: SlideOverPanelProps) {
  const widthClasses = {
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full ${widthClasses[width]} w-full z-50 transform transition-transform duration-300 ease-in-out shadow-lg`}
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {title}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6" style={{ backgroundColor: "var(--bg-primary)" }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
