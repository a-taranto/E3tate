"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { User, MapPin, Calendar, Heart, ArrowRight } from "lucide-react";

interface PersonalInfo {
  fullName: string;
  address: string;
  dateOfBirth: string;
  maritalStatus: "single" | "married" | "divorced" | "widowed" | "";
  spouseName?: string;
}

export default function SetupAboutPage() {
  const router = useRouter();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    address: "",
    dateOfBirth: "",
    maritalStatus: "",
    spouseName: "",
  });

  // Load saved data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("setup_personal_info");
      if (saved) {
        setPersonalInfo(JSON.parse(saved));
      }
    }
  }, []);

  const updateField = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    // Save to localStorage
    localStorage.setItem("setup_personal_info", JSON.stringify(personalInfo));

    // Mark step as complete
    const completedSteps = JSON.parse(localStorage.getItem("setup_completed_steps") || "[]");
    if (!completedSteps.includes("about")) {
      completedSteps.push("about");
      localStorage.setItem("setup_completed_steps", JSON.stringify(completedSteps));
    }

    // Navigate to next step
    router.push("/my-estate/people");
  };

  const isValid = personalInfo.fullName && personalInfo.address && personalInfo.dateOfBirth && personalInfo.maritalStatus;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Tell us about yourself
        </h2>
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          This information helps us create your legal documents and personalize your experience.
        </p>
      </div>

      {/* Personal Information */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6" style={{ color: "var(--accent)" }} />
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Basic Information
          </h3>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Full Legal Name <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="John Michael Smith"
              value={personalInfo.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Date of Birth <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: "var(--text-muted)" }} />
              <input
                type="date"
                className="input w-full pl-10"
                value={personalInfo.dateOfBirth}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Residential Address <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5" style={{ color: "var(--text-muted)" }} />
              <textarea
                className="input w-full pl-10"
                rows={3}
                placeholder="123 Main Street&#10;Apartment 4B&#10;Sydney NSW 2000, Australia"
                value={personalInfo.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Marital Status */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-6 w-6" style={{ color: "var(--accent)" }} />
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Marital Status
          </h3>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
              Current Status <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "single", label: "Single" },
                { value: "married", label: "Married" },
                { value: "divorced", label: "Divorced" },
                { value: "widowed", label: "Widowed" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors border-2"
                  style={{
                    borderColor: personalInfo.maritalStatus === option.value
                        ? "var(--accent)"
                        : "var(--border)",
                  }}
                >
                  <input
                    type="radio"
                    name="maritalStatus"
                    value={option.value}
                    checked={personalInfo.maritalStatus === option.value}
                    onChange={(e) => updateField("maritalStatus", e.target.value)}
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {personalInfo.maritalStatus === "married" && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Spouse's Full Name
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="Jane Doe Smith"
                value={personalInfo.spouseName || ""}
                onChange={(e) => updateField("spouseName", e.target.value)}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Info Card */}
      <Card padding="md" className="mb-8 border-l-4" style={{ borderLeftColor: "var(--info)" }}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          <strong>Privacy Notice:</strong> Your personal information is encrypted and stored securely. It's only used to generate legal documents and will never be shared with third parties.
        </p>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button variant="ghost" onClick={() => router.push("/")}>
          Save & Exit
        </Button>
        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={!isValid}
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
