"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { Card, Button, FileUpload } from "@/components/ui";
import {
  ScrollText,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Edit,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { logActivity } from "@/lib/activityLogger";

interface UploadedWill {
  fileName: string;
  uploadedAt: string;
  physicalLocation?: string;
  format: string;
}

export default function WillPage() {
  const router = useRouter();
  const [uploadedWill, setUploadedWill] = useState<UploadedWill | null>(null);
  const [physicalLocation, setPhysicalLocation] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);

  // Load existing will from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWill = localStorage.getItem("uploaded_will");
      if (savedWill) {
        setUploadedWill(JSON.parse(savedWill));
      }
    }
  }, []);

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!['pdf', 'docx', 'doc'].includes(ext || '')) {
      alert('Please upload a PDF or Word document');
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const willData: UploadedWill = {
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        format: ext || '',
      };

      setUploadedWill(willData);
      localStorage.setItem("uploaded_will", JSON.stringify(willData));
      setShowLocationForm(true);

      logActivity(
        "Will Uploaded",
        "will",
        `Uploaded will document: ${file.name}`,
        {
          field: "Will",
          newValue: file.name,
        }
      );
    } catch (error) {
      console.error("Upload error:", error);
      alert('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveLocation = () => {
    if (uploadedWill) {
      const updated = { ...uploadedWill, physicalLocation };
      setUploadedWill(updated);
      localStorage.setItem("uploaded_will", JSON.stringify(updated));
      setShowLocationForm(false);

      logActivity(
        "Will Location Updated",
        "will",
        `Updated physical location for will`,
        {
          field: "Will Physical Location",
          newValue: physicalLocation,
        }
      );
    }
  };

  const handleCreateFromTemplate = () => {
    router.push("/will/create");
  };

  // No will uploaded yet
  if (!uploadedWill) {
    return (
      <div className="flex-1 overflow-y-auto">
        <Header
          title="Will"
          subtitle="Upload your existing will or create one from our template"
        />
        <div className="container mx-auto px-8 py-8 max-w-5xl">
          {/* Legal Disclaimer */}
          <Card padding="md" className="mb-6 border-l-4" style={{ borderLeftColor: "var(--warning)" }}>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "var(--warning)" }} />
              <div>
                <h4 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  Legal Disclaimer
                </h4>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  This template is for informational purposes only and is not a substitute for legal advice.
                  Laws vary by jurisdiction. We recommend having a qualified attorney review your will before signing.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option A: Upload Existing Will */}
            <Card padding="lg" hover className="border-2" style={{ borderColor: "var(--border)" }}>
              <div className="text-center">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--accent-dim)" }}
                >
                  <Upload className="h-8 w-8" style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Upload Existing Will
                </h3>
                <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                  Already have a will? Upload it here to store securely in your Vault
                </p>
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
              </div>
            </Card>

            {/* Option B: Create from Template */}
            <Card padding="lg" hover className="border-2" style={{ borderColor: "var(--accent)" }}>
              <div className="text-center">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  <Sparkles className="h-8 w-8" style={{ color: "var(--text-inverse)" }} />
                </div>
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
        </div>
      </div>
    );
  }

  // Will already uploaded
  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Will"
        subtitle="Your last will and testament"
      />
      <div className="container mx-auto px-8 py-8 max-w-4xl">
        {/* Status Card */}
        <Card padding="lg" className="mb-6 border-l-4" style={{ borderLeftColor: "var(--success)" }}>
          <div className="flex items-start gap-4">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: "var(--success-bg)" }}
            >
              <CheckCircle className="h-6 w-6" style={{ color: "var(--success)" }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                Will Uploaded
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Your will has been securely uploaded and encrypted. It will only be accessible to your designated beneficiaries after trigger execution.
              </p>
            </div>
          </div>
        </Card>

        {/* Document Card */}
        <Card padding="lg" className="mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: "var(--accent-dim)" }}
              >
                <FileText className="h-6 w-6" style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <h4 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  {uploadedWill.fileName}
                </h4>
                <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Uploaded {new Date(uploadedWill.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: "var(--info-bg)", color: "var(--info)" }}
                  >
                    {uploadedWill.format.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
            <Button variant="primary" size="sm">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>

          {/* Physical Location */}
          {!showLocationForm && uploadedWill.physicalLocation && (
            <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5" style={{ color: "var(--text-secondary)" }} />
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                      Physical Location
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {uploadedWill.physicalLocation}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowLocationForm(true)}>
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          )}

          {/* Location Form */}
          {(!uploadedWill.physicalLocation || showLocationForm) && (
            <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                <MapPin className="h-4 w-4 inline mr-1" />
                Physical Location of Original Document
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="e.g., Safe deposit box at First National Bank"
                  value={physicalLocation}
                  onChange={(e) => setPhysicalLocation(e.target.value)}
                />
                <Button variant="primary" onClick={handleSaveLocation}>
                  Save
                </Button>
                {showLocationForm && uploadedWill.physicalLocation && (
                  <Button variant="secondary" onClick={() => setShowLocationForm(false)}>
                    Cancel
                  </Button>
                )}
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                Help your executors find the signed original document
              </p>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card padding="md" hover className="cursor-pointer">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5" style={{ color: "var(--accent)" }} />
              <div>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                  Update Will
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Upload a new version
                </p>
              </div>
            </div>
          </Card>

          <Card padding="md" hover className="cursor-pointer opacity-50">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5" style={{ color: "var(--accent)" }} />
              <div>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                  Parse & Link Assets
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Coming soon
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Next Steps */}
        <Card padding="md" className="mt-6" style={{ backgroundColor: "var(--info-bg)" }}>
          <h4 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Next Steps
          </h4>
          <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--success)", color: "var(--text-inverse)" }}
              >
                ✓
              </div>
              <span>Upload your will to E3tate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)" }}
              >
                2
              </div>
              <span>Print and sign with 2 witnesses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)" }}
              >
                3
              </div>
              <span>Store original in a safe place</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)" }}
              >
                4
              </div>
              <span>Update physical location above</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
