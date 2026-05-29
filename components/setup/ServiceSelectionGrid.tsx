"use client";

import { useState, useMemo, useEffect } from "react";
import { SERVICE_CATEGORIES, getAllServices, ServiceDefinition, ServiceCategory } from "@/lib/services";
import { addCustomService } from "@/lib/customServices";
import ServiceCard from "./ServiceCard";
import { Button } from "@/components/ui";
import {
  Search,
  Plus,
  Mail,
  Users,
  Cloud,
  Image as ImageIcon,
  Sparkles,
  DollarSign,
  Coins,
} from "lucide-react";

// Map category IDs to Lucide icons
const CATEGORY_ICONS: Record<ServiceCategory, any> = {
  email: Mail,
  social: Users,
  cloud: Cloud,
  photos: ImageIcon,
  ai: Sparkles,
  financial: DollarSign,
  crypto: Coins,
};

interface ServiceSelectionGridProps {
  configuredIds: string[]; // services that have details saved
  onOpenService: (serviceId: string) => void; // open the details modal
}

export default function ServiceSelectionGrid({
  configuredIds,
  onOpenService,
}: ServiceSelectionGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // Preset + custom services (custom only resolves client-side).
  const [services, setServices] = useState<ServiceDefinition[]>([]);
  // Per-category inline "add a service" form.
  const [addCategory, setAddCategory] = useState<ServiceCategory | null>(null);
  const [newServiceName, setNewServiceName] = useState("");

  useEffect(() => {
    setServices(getAllServices());
  }, []);

  // Scroll to the category section named in the URL hash (sidebar sub-menu).
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const t = setTimeout(scrollToHash, 60); // let the grid paint first
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      clearTimeout(t);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [services]);

  const searching = !!searchQuery.trim();

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!searching) return services;
    const query = searchQuery.toLowerCase();
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query)
    );
  }, [searchQuery, searching, services]);

  const submitNewService = (category: ServiceCategory) => {
    if (!newServiceName.trim()) return;
    const def = addCustomService(newServiceName, category);
    setServices(getAllServices());
    setNewServiceName("");
    setAddCategory(null);
    onOpenService(def.id); // open the details modal for the new service
  };

  // Group filtered services by category
  const servicesByCategory = useMemo(() => {
    const grouped: Record<ServiceCategory, ServiceDefinition[]> = {
      email: [],
      social: [],
      cloud: [],
      photos: [],
      ai: [],
      financial: [],
      crypto: [],
    };

    filteredServices.forEach((service) => {
      grouped[service.category]?.push(service);
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
          // When searching, hide categories with no matches; otherwise always
          // show the category so its "Add service" affordance is available.
          if (searching && categoryServices.length === 0) return null;

          const CategoryIcon = CATEGORY_ICONS[category.id];

          return (
            <section key={category.id} id={category.id} className="scroll-mt-6">
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

              {/* Service Cards Grid + per-category Add */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    selected={configuredIds.includes(service.id)}
                    onToggle={() => onOpenService(service.id)}
                  />
                ))}

                {addCategory === category.id ? (
                  <div
                    className="p-4 rounded-xl border-2 flex flex-col gap-2 justify-center"
                    style={{ borderColor: "var(--accent)" }}
                  >
                    <input
                      autoFocus
                      type="text"
                      className="input w-full text-sm"
                      placeholder={`${category.label} service name`}
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitNewService(category.id);
                        if (e.key === "Escape") { setAddCategory(null); setNewServiceName(""); }
                      }}
                    />
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={() => submitNewService(category.id)} disabled={!newServiceName.trim()}>
                        Add
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setAddCategory(null); setNewServiceName(""); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAddCategory(category.id); setNewServiceName(""); }}
                    className="p-4 rounded-xl border-2 border-dashed transition-all duration-200 hover:shadow-lg flex flex-col items-center justify-center gap-2 min-h-[120px]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <Plus className="h-7 w-7" style={{ color: "var(--accent)" }} />
                    <span className="text-xs font-medium text-center" style={{ color: "var(--text-secondary)" }}>
                      Add service
                    </span>
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
