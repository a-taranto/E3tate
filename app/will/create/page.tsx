"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { Card, Button, Input } from "@/components/ui";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  User,
  Users,
  Gift,
  Baby,
  Heart,
  FileText,
} from "lucide-react";
import type { WillTemplate } from "@/types";
import { logActivity } from "@/lib/activityLogger";

export default function CreateWillPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [willData, setWillData] = useState<Partial<WillTemplate>>({
    status: "draft",
    jurisdiction: "AU",
    residuaryBeneficiaries: [],
    specificBequests: [],
    hasMinorChildren: false,
    funeralPreference: "no_preference",
    version: 1,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  });

  const steps = [
    { number: 1, title: "About You", icon: User },
    { number: 2, title: "Executors", icon: User },
    { number: 3, title: "Beneficiaries", icon: Users },
    { number: 4, title: "Specific Gifts", icon: Gift },
    { number: 5, title: "Guardians", icon: Baby },
    { number: 6, title: "Final Wishes & Review", icon: Heart },
  ];

  const updateWillData = (field: string, value: any) => {
    setWillData((prev) => ({
      ...prev,
      [field]: value,
      lastModified: new Date().toISOString(),
    }));
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateWill = () => {
    // Save to localStorage
    localStorage.setItem("will_template", JSON.stringify({
      ...willData,
      status: "generated",
      generatedAt: new Date().toISOString(),
    }));

    logActivity(
      "Will Generated",
      "will",
      "Generated will from template",
      {
        field: "Will",
        newValue: "Generated",
      }
    );

    alert("Will generated successfully! In production, this would create a PDF.");
    router.push("/will");
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Create Will from Template"
        subtitle={`Step ${currentStep} of 6: ${steps[currentStep - 1].title}`}
      />
      <div className="container mx-auto px-8 py-8 max-w-4xl">
        {/* Legal Disclaimer */}
        <Card padding="sm" className="mb-6 border-l-4" style={{ borderLeftColor: "var(--warning)" }}>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: "var(--warning)" }} />
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              <strong>Legal Disclaimer:</strong> This template is for informational purposes only.
              Have a qualified attorney review your will before signing.
            </p>
          </div>
        </Card>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isComplete = step.number < currentStep;
              const isCurrent = step.number === currentStep;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isComplete
                          ? "bg-success"
                          : isCurrent
                          ? "bg-accent"
                          : "bg-border"
                      }`}
                      style={{
                        backgroundColor: isComplete
                          ? "var(--success)"
                          : isCurrent
                          ? "var(--accent)"
                          : "var(--border)",
                        color: isComplete || isCurrent ? "var(--text-inverse)" : "var(--text-muted)",
                      }}
                    >
                      {isComplete ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <p
                      className={`text-xs mt-2 text-center ${
                        isCurrent ? "font-semibold" : ""
                      }`}
                      style={{
                        color: isCurrent ? "var(--text-primary)" : "var(--text-secondary)",
                      }}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className="h-0.5 flex-1 -mt-8"
                      style={{
                        backgroundColor: isComplete ? "var(--success)" : "var(--border)",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card padding="lg" className="mb-6">
          {/* Step 1: About You */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                  About You
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Full Legal Name <span style={{ color: "var(--error)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="John Michael Doe"
                      value={willData.fullName || ""}
                      onChange={(e) => updateWillData("fullName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Date of Birth <span style={{ color: "var(--error)" }}>*</span>
                    </label>
                    <input
                      type="date"
                      className="input"
                      value={willData.dateOfBirth || ""}
                      onChange={(e) => updateWillData("dateOfBirth", e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Primary Address <span style={{ color: "var(--error)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="123 Main Street, City, State, ZIP"
                    value={willData.address || ""}
                    onChange={(e) => updateWillData("address", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Marital Status <span style={{ color: "var(--error)" }}>*</span>
                    </label>
                    <select
                      className="input"
                      value={willData.maritalStatus || ""}
                      onChange={(e) => updateWillData("maritalStatus", e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>
                  {willData.maritalStatus === "married" && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                        Spouse's Full Name
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Jane Marie Doe"
                        value={willData.spouseName || ""}
                        onChange={(e) => updateWillData("spouseName", e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Executors */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Executors
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  Your executor will manage your estate and ensure your wishes are carried out.
                  Choose someone you trust who is organized and financially responsible.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Primary Executor <span style={{ color: "var(--error)" }}>*</span>
                    </label>
                    <select
                      className="input"
                      value={willData.primaryExecutorId || ""}
                      onChange={(e) => updateWillData("primaryExecutorId", e.target.value)}
                    >
                      <option value="">Select from beneficiaries...</option>
                      <option value="beneficiary_1">John Smith (Spouse)</option>
                      <option value="beneficiary_2">Sarah Johnson (Child)</option>
                      <option value="add_new">+ Add New Executor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Alternate Executor (Optional)
                    </label>
                    <select
                      className="input"
                      value={willData.alternateExecutorId || ""}
                      onChange={(e) => updateWillData("alternateExecutorId", e.target.value)}
                    >
                      <option value="">Select from beneficiaries...</option>
                      <option value="beneficiary_1">John Smith (Spouse)</option>
                      <option value="beneficiary_2">Sarah Johnson (Child)</option>
                      <option value="add_new">+ Add New Executor</option>
                    </select>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      If your primary executor cannot serve, this person will take over
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Beneficiaries */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Residuary Estate Distribution
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  Your "residuary estate" is everything not specifically gifted. Allocate percentages to beneficiaries (must total 100%).
                </p>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-surface)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        John Smith (Spouse)
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="input w-20 text-center"
                          placeholder="0"
                          min="0"
                          max="100"
                        />
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>%</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-surface)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        Sarah Johnson (Child)
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="input w-20 text-center"
                          placeholder="0"
                          min="0"
                          max="100"
                        />
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>%</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    + Add Beneficiary
                  </Button>
                </div>
                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: "var(--warning-bg)" }}>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Total: <strong>0%</strong> (must equal 100%)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Specific Gifts */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Specific Bequests
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  Gift specific assets from your Vault to particular beneficiaries.
                </p>
                <div
                  className="text-center py-12 rounded-lg"
                  style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
                >
                  <Gift className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
                  <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                    No specific gifts added yet
                  </p>
                  <Button variant="primary">
                    + Add Gift from Vault
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Guardians */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                  Guardian for Minor Children
                </h3>
                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={willData.hasMinorChildren || false}
                      onChange={(e) => updateWillData("hasMinorChildren", e.target.checked)}
                    />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      I have children under 18 years old
                    </span>
                  </label>
                </div>
                {willData.hasMinorChildren && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                        Guardian Name <span style={{ color: "var(--error)" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Full name"
                        value={willData.guardianName || ""}
                        onChange={(e) => updateWillData("guardianName", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                          Relationship
                        </label>
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g., Sister, Brother"
                          value={willData.guardianRelationship || ""}
                          onChange={(e) => updateWillData("guardianRelationship", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                          Address
                        </label>
                        <input
                          type="text"
                          className="input"
                          placeholder="Guardian's address"
                          value={willData.guardianAddress || ""}
                          onChange={(e) => updateWillData("guardianAddress", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                      <p className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                        Alternate Guardian (Optional)
                      </p>
                      <input
                        type="text"
                        className="input"
                        placeholder="Alternate guardian name"
                        value={willData.alternateGuardianName || ""}
                        onChange={(e) => updateWillData("alternateGuardianName", e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Final Wishes & Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                  Final Wishes & Review
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Funeral Preference
                    </label>
                    <select
                      className="input"
                      value={willData.funeralPreference || "no_preference"}
                      onChange={(e) => updateWillData("funeralPreference", e.target.value)}
                    >
                      <option value="no_preference">No Preference</option>
                      <option value="burial">Burial</option>
                      <option value="cremation">Cremation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Special Instructions
                    </label>
                    <textarea
                      className="input"
                      rows={4}
                      placeholder="Any other instructions or wishes..."
                      value={willData.specialInstructions || ""}
                      onChange={(e) => updateWillData("specialInstructions", e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "var(--info-bg)" }}>
                  <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                    <strong>What happens next:</strong>
                  </p>
                  <ol className="text-sm space-y-2" style={{ color: "var(--text-secondary)" }}>
                    <li>1. We'll generate a PDF of your will</li>
                    <li>2. Review and download the document</li>
                    <li>3. Print and sign with 2 witnesses</li>
                    <li>4. Store the original safely and record its location</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {currentStep < 6 ? (
            <Button variant="primary" onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="primary" onClick={handleGenerateWill}>
              <FileText className="h-4 w-4" />
              Generate Will
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
