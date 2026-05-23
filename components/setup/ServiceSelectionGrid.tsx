"use client";

import { useState, useMemo } from "react";
import { SERVICE_CATEGORIES, SERVICES, ServiceDefinition, ServiceCategory } from "@/lib/services";
import ServiceCard from "./ServiceCard";
import { Button } from "@/components/ui";
import {
  Search,
  Plus,
  Mail,
  Users,
  Cloud,
  Film,
  Sparkles,
  DollarSign,
  Coins,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

// Map category IDs to Lucide icons
const CATEGORY_ICONS: Record<ServiceCategory, any> = {
  email: Mail,
  social: Users,
  cloud: Cloud,
  streaming: Film,
  ai: Sparkles,
  financial: DollarSign,
  crypto: Coins,
  shopping: ShoppingBag,
  productivity: Sparkles,
  gaming: Film,
};

interface ServiceSelectionGridProps {
  selectedServiceIds: string[];
  onToggleService: (serviceId: string) => void;
  onContinue: () => void;
}

export default function ServiceSelectionGrid({
  selectedServiceIds,
  onToggleService,
  onContinue,
}: ServiceSelectionGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return SERVICES;
    const query = searchQuery.toLowerCase();
    return SERVICES.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group filtered services by category
  const servicesByCategory = useMemo(() => {
    const grouped: Record<ServiceCategory, ServiceDefinition[]> = {
      email: [],
      social: [],
      cloud: [],
      streaming: [],
      ai: [],
      financial: [],
      crypto: [],
      shopping: [],
      productivity: [],
      gaming: [],
    };

    filteredServices.forEach((service) => {
      grouped[service.category].push(service);
    });

    return grouped;
  }, [filteredServices]);

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search services..."
            className="input pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Services Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-8 pb-24">
        {SERVICE_CATEGORIES.map((category) => {
          const categoryServices = servicesByCategory[category.id];
          if (categoryServices.length === 0) return null;

          const CategoryIcon = CATEGORY_ICONS[category.id];

          return (
            <div key={category.id}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                <CategoryIcon className="h-6 w-6" style={{ color: "var(--accent)" }} />
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    {category.label}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {categoryServices.length} service{categoryServices.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    selected={selectedServiceIds.includes(service.id)}
                    onToggle={() => onToggleService(service.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Add Custom Service Card */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Plus className="h-6 w-6" style={{ color: "var(--accent)" }} />
            <div>
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Custom Services
              </h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Add services not listed above
              </p>
            </div>
          </div>

          <button
            className="w-full md:w-auto p-6 rounded-xl border-2 border-dashed transition-all duration-200 hover:shadow-lg"
            style={{
              borderColor: "var(--border)",
            }}
            onClick={() => {
              // TODO: Open custom service dialog
              alert("Custom service creation coming soon!");
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <Plus className="h-8 w-8" style={{ color: "var(--accent)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Add Custom Service
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Fixed Bottom Bar - Selected Count & Continue */}
      <div
        className="fixed bottom-0 left-64 right-0 p-6 border-t backdrop-blur-sm"
        style={{
          borderColor: "var(--border)",
        }}
      >
        <div className="container mx-auto px-8 max-w-6xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {selectedServiceIds.length} service{selectedServiceIds.length !== 1 ? "s" : ""}{" "}
              selected
            </p>
            {selectedServiceIds.length > 0 && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                We'll guide you through setting up each one
              </p>
            )}
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={onContinue}
            disabled={selectedServiceIds.length === 0}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
