"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ServiceSelectionGrid from "@/components/setup/ServiceSelectionGrid";
import ServiceSetupForm from "@/components/setup/ServiceSetupForm";
import ServiceSetupSummary from "@/components/setup/ServiceSetupSummary";
import { getServiceById } from "@/lib/services";
import type { Beneficiary, VaultRecord } from "@/types";

export default function SetupOnlinePage() {
  const router = useRouter();
  const [step, setStep] = useState<"select" | "setup" | "summary">("select");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [setupData, setSetupData] = useState<{ [serviceId: string]: any }>({});
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  // Load saved data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBeneficiaries = localStorage.getItem("setup_beneficiaries");
      if (savedBeneficiaries) {
        setBeneficiaries(JSON.parse(savedBeneficiaries));
      }

      const savedSelection = localStorage.getItem("setup_selected_services");
      if (savedSelection) {
        setSelectedServiceIds(JSON.parse(savedSelection));
      }

      const savedSetupData = localStorage.getItem("setup_service_data");
      if (savedSetupData) {
        setSetupData(JSON.parse(savedSetupData));
      }
    }
  }, []);

  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      const updated = prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId];

      localStorage.setItem("setup_selected_services", JSON.stringify(updated));
      return updated;
    });
  };

  const handleStartSetup = () => {
    setStep("setup");
    setCurrentServiceIndex(0);
  };

  const handleServiceSave = (formData: any) => {
    const currentServiceId = selectedServiceIds[currentServiceIndex];
    const updated = {
      ...setupData,
      [currentServiceId]: formData,
    };
    setSetupData(updated);
    localStorage.setItem("setup_service_data", JSON.stringify(updated));

    // Move to next service or finish
    if (currentServiceIndex < selectedServiceIds.length - 1) {
      setCurrentServiceIndex(currentServiceIndex + 1);
    } else {
      handleFinishSetup();
    }
  };

  const handleServiceSkip = () => {
    // Move to next service or finish
    if (currentServiceIndex < selectedServiceIds.length - 1) {
      setCurrentServiceIndex(currentServiceIndex + 1);
    } else {
      handleFinishSetup();
    }
  };

  const handleFinishSetup = () => {
    // Mark step as complete
    const completedSteps = JSON.parse(localStorage.getItem("setup_completed_steps") || "[]");
    if (!completedSteps.includes("online")) {
      completedSteps.push("online");
      localStorage.setItem("setup_completed_steps", JSON.stringify(completedSteps));
    }

    // Show summary
    setStep("summary");
  };

  const handleContinueToAssets = () => {
    // Navigate to next step
    router.push("/my-estate/assets");
  };

  const handleAddMoreServices = () => {
    // Go back to selection
    setStep("select");
  };

  const handleBack = () => {
    if (step === "summary") {
      // Can't go back from summary
      return;
    } else if (step === "setup" && currentServiceIndex > 0) {
      setCurrentServiceIndex(currentServiceIndex - 1);
    } else if (step === "setup") {
      setStep("select");
    } else {
      router.push("/people");
    }
  };

  const currentService = step === "setup" && selectedServiceIds[currentServiceIndex]
    ? getServiceById(selectedServiceIds[currentServiceIndex])
    : null;

  return (
    <div className="max-w-5xl mx-auto">
      {step === "select" ? (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Your online life
            </h2>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              Select the online services and accounts you use. We'll help you set up wishes for each one.
            </p>
          </div>

          <ServiceSelectionGrid
            selectedServiceIds={selectedServiceIds}
            onToggleService={handleToggleService}
            onContinue={selectedServiceIds.length > 0 ? handleStartSetup : handleFinishSetup}
          />

          {/* Back button (fixed at bottom, left side) */}
          <div className="fixed bottom-6 left-72 z-40">
            <Button variant="ghost" onClick={() => router.push("/my-estate/people")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </>
      ) : step === "summary" ? (
        <ServiceSetupSummary
          serviceIds={selectedServiceIds}
          setupData={setupData}
          onContinue={handleContinueToAssets}
          onAddMore={handleAddMoreServices}
        />
      ) : (
        <>
          {currentService && (
            <>
              <div className="mb-8">
                <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
                  <ArrowLeft className="h-4 w-4" />
                  {currentServiceIndex > 0 ? "Previous Service" : "Back to Selection"}
                </Button>
                <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  Setup {currentService.name}
                </h2>
                <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
                  Tell us about your {currentService.name} account and what should happen to it.
                </p>
              </div>

              <ServiceSetupForm
                service={currentService}
                beneficiaries={beneficiaries}
                currentIndex={currentServiceIndex}
                totalServices={selectedServiceIds.length}
                onSave={handleServiceSave}
                onSkip={handleServiceSkip}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
