"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, FileUpload } from "@/components/ui";
import {
  ScrollText,
  Upload,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { mirrorWillToVault } from "@/lib/store";

export default function SetupWillPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<"upload" | "create" | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (!["pdf", "docx", "doc"].includes(ext || "")) {
      alert("Please upload a PDF or Word document");
      return;
    }

    setIsUploading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const willData = {
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        format: ext || "",
      };

      localStorage.setItem("uploaded_will", JSON.stringify(willData));

      // Mirror into the unified vault so the will appears and counts there.
      mirrorWillToVault({ fileName: file.name, format: ext });

      // Mark setup as complete
      handleCompleteSetup();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateFromTemplate = () => {
    router.push("/will/create");
  };

  const handleCompleteSetup = () => {
    // Mark step as complete
    const completedSteps = JSON.parse(localStorage.getItem("setup_completed_steps") || "[]");
    if (!completedSteps.includes("will")) {
      completedSteps.push("will");
      localStorage.setItem("setup_completed_steps", JSON.stringify(completedSteps));
    }

    // Mark overall setup as complete
    localStorage.setItem("setup_complete", "true");

    // Navigate to summary
    router.push("/my-estate/complete");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Your will
        </h2>
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          The final step: Upload your existing will or create one using our guided template.
        </p>
      </div>

      {/* Legal Disclaimer */}
      <Card
        padding="md"
        className="mb-6 border-l-4"
        style={{ borderLeftColor: "var(--warning)" }}
      >
        <div className="flex items-start gap-3">
          <AlertCircle
            className="h-5 w-5 flex-shrink-0 mt-0.5"
            style={{ color: "var(--warning)" }}
          />
          <div>
            <h4 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Legal Disclaimer
            </h4>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              This template is for informational purposes only and is not a substitute for legal
              advice. Laws vary by jurisdiction. We recommend having a qualified attorney review
              your will before signing.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Option A: Upload Existing Will */}
        <Card
          padding="lg"
          hover
          className="border-2"
          style={{ borderColor: selectedOption === "upload" ? "var(--accent)" : "var(--border)" }}
        >
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--accent)" }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Upload Existing Will
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Already have a will? Upload it here to store securely in your Vault
            </p>

            {selectedOption === "upload" ? (
              <>
                <FileUpload
                  onFilesSelected={handleFileUpload}
                  accept=".pdf,.docx,.doc"
                  maxFiles={1}
                  loading={isUploading}
                />
                <div className="mt-4 text-xs space-y-1" style={{ color: "var(--text-muted)" }}>
                  <p>✓ Encrypted storage</p>
                  <p>✓ Accessible only post-trigger</p>
                  <p>✓ Supports PDF & Word documents</p>
                </div>
              </>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setSelectedOption("upload")}
                className="w-full"
              >
                Select This Option
              </Button>
            )}
          </div>
        </Card>

        {/* Option B: Create from Template */}
        <Card
          padding="lg"
          hover
          className="border-2"
          style={{ borderColor: selectedOption === "create" ? "var(--accent)" : "var(--border)" }}
        >
          <div className="text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--accent)" }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Create from Template
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Use our guided wizard to create a legally-structured will in plain English
            </p>
            <Button variant="primary" onClick={handleCreateFromTemplate} className="w-full">
              <ScrollText className="h-4 w-4" />
              Start with Template
            </Button>
            <div className="mt-4 text-xs space-y-1" style={{ color: "var(--text-muted)" }}>
              <p>✓ Auto-links to Vault assets</p>
              <p>✓ Links existing beneficiaries</p>
              <p>✓ Export as PDF when done</p>
              <p>✓ Plain English, no legalese</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Skip Option */}
      <Card padding="md" className="mb-8" style={{ backgroundColor: "var(--info-bg)" }}>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "var(--info)" }} />
          <div className="flex-1">
            <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
              <strong>Don't have a will yet?</strong> You can skip this step and add it later from
              the Dashboard. However, we strongly recommend creating one soon.
            </p>
            <Button variant="ghost" size="sm" onClick={handleCompleteSetup}>
              Skip for now
            </Button>
          </div>
        </div>
      </Card>

    </div>
  );
}
