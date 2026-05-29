"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@/components/ui";
import { X } from "lucide-react";
import ServiceSelectionGrid from "@/components/setup/ServiceSelectionGrid";
import ServiceSetupForm from "@/components/setup/ServiceSetupForm";
import { getServiceById } from "@/lib/services";
import { saveServiceToVault } from "@/lib/vaultUtils";
import { loadBeneficiaries, type Beneficiary } from "@/lib/store";

export default function SetupOnlinePage() {
  // setupData keyed by serviceId is the source of truth for "configured" services.
  const [setupData, setSetupData] = useState<{ [serviceId: string]: any }>({});
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);

  useEffect(() => {
    setBeneficiaries(loadBeneficiaries());
    try {
      const saved = localStorage.getItem("setup_service_data");
      if (saved) setSetupData(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, []);

  const configuredIds = Object.keys(setupData);
  const activeService = activeServiceId ? getServiceById(activeServiceId) : null;

  const persist = (next: { [serviceId: string]: any }) => {
    setSetupData(next);
    localStorage.setItem("setup_service_data", JSON.stringify(next));
    // Keep the legacy selection key in sync with what's configured.
    localStorage.setItem("setup_selected_services", JSON.stringify(Object.keys(next)));
    // The Online section counts as done once at least one account is recorded.
    const steps = JSON.parse(localStorage.getItem("setup_completed_steps") || "[]");
    if (Object.keys(next).length > 0 && !steps.includes("online")) {
      steps.push("online");
      localStorage.setItem("setup_completed_steps", JSON.stringify(steps));
    }
  };

  const handleSaveService = (formData: any) => {
    if (!activeService) return;
    persist({ ...setupData, [activeService.id]: formData });
    // Create/update the linked Vault record so the account shows in the Vault.
    saveServiceToVault(activeService, formData);
    setActiveServiceId(null);
  };

  const closeModal = () => setActiveServiceId(null);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Your online life
        </h2>
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          Click a service to record your account details and what should happen to it. Use{" "}
          <strong>+ Add service</strong> in any category for anything not listed.
        </p>
      </div>

      <ServiceSelectionGrid configuredIds={configuredIds} onOpenService={setActiveServiceId} />

      {/* Per-service details modal */}
      {activeService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <Card padding="lg" className="max-w-3xl w-full my-8 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-1 rounded-md transition-colors hover:bg-accent-muted/40"
              style={{ color: "var(--text-muted)" }}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <ServiceSetupForm
              service={activeService}
              beneficiaries={beneficiaries}
              initialData={setupData[activeService.id]}
              onSave={handleSaveService}
              onSkip={closeModal}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
