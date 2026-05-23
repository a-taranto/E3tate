"use client";

import { ServiceDefinition } from "@/lib/services";
import { Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ServiceCardProps {
  service: ServiceDefinition;
  selected: boolean;
  onToggle: () => void;
}

export default function ServiceCard({ service, selected, onToggle }: ServiceCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <button
      onClick={onToggle}
      className="relative w-full p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg"
      style={{
        borderColor: selected ? "var(--accent)" : "var(--border)",
      }}
    >
      {/* Selected Indicator */}
      {selected && (
        <div className="absolute top-2 right-2">
          <Check className="h-5 w-5" style={{ color: "var(--accent)" }} />
        </div>
      )}

      {/* Service Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
          {!imageError ? (
            <img
              src={service.logo}
              alt={service.name}
              className="w-10 h-10 object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-2xl font-bold"
              style={{ color: "var(--accent)" }}
            >
              {service.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Service Name */}
        <div className="text-center">
          <p
            className="text-sm font-medium"
            style={{ color: selected ? "var(--accent)" : "var(--text-primary)" }}
          >
            {service.name}
          </p>
        </div>
      </div>

      {/* Optional Badges */}
      <div className="flex flex-wrap gap-1 justify-center mt-2">
        {service.hasSubscription && (
          <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: "var(--warning)", color: "var(--warning)" }}>
            Paid
          </span>
        )}
        {service.has2FA && (
          <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: "var(--success)", color: "var(--success)" }}>
            2FA
          </span>
        )}
        {service.hasMemorialization && (
          <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: "var(--info)", color: "var(--info)" }}>
            Memorial
          </span>
        )}
      </div>
    </button>
  );
}
