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
  Clock,
  Plus,
  Globe,
  Paperclip,
} from "lucide-react";
import { logActivity } from "@/lib/activityLogger";
import {
  loadWill,
  saveWill,
  mirrorWillToVault,
  loadBeneficiaries,
  type StoredWill,
  type Beneficiary,
} from "@/lib/store";
import { getWillRender, includedClauses, type WillRender } from "@/lib/willRenderer";
import { downloadWillPdf } from "@/lib/willPdf";
import { downloadAssetInventoryPdf, downloadDigitalRegisterPdf } from "@/lib/annexures";

// Each will clause links to where its content is provided/edited — the relevant
// My Estate disposition view, People, or the Vault inventory.
// (revocation / trustee-powers / general-provisions are boilerplate — no edit.)
const CLAUSE_EDIT: Record<string, string> = {
  executor: "/people",
  "trustee-powers": "/people",
  residuary: "/my-estate/residuary",
  "testamentary-trust": "/my-estate/trust",
  "specific-gifts": "/my-estate/gifts",
  "cash-legacies": "/my-estate/legacies",
  guardian: "/my-estate/wishes",
  investments: "/vault/assets",
  "family-home": "/vault/assets",
  "digital-assets": "/my-estate/digital",
  funeral: "/my-estate/wishes",
};

export default function WillPage() {
  const router = useRouter();
  const [will, setWill] = useState<StoredWill>({ status: "none", updatedAt: "" });
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [physicalLocation, setPhysicalLocation] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  // Lets the user choose a new will without destroying the current one until saved.
  const [replacing, setReplacing] = useState(false);
  const [render, setRender] = useState<WillRender | null>(null);

  useEffect(() => {
    const refresh = () => {
      setWill(loadWill());
      setRender(getWillRender());
    };
    refresh();
    setBeneficiaries(loadBeneficiaries());
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  const beneficiaryName = (id?: string) =>
    beneficiaries.find((b) => b.id === id)?.name || "—";

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

      // Read the file as a data URL so it can be downloaded later.
      const data = await new Promise<string | undefined>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      });

      const uploadedAt = new Date().toISOString();
      try {
        saveWill({ status: "uploaded", source: "upload", fileName: file.name, format: ext, data, uploadedAt });
      } catch {
        // File too large for localStorage — keep metadata only.
        saveWill({ status: "uploaded", source: "upload", fileName: file.name, format: ext, data: undefined, uploadedAt });
      }
      // Mirror into the unified vault so the will appears and counts there.
      mirrorWillToVault({ fileName: file.name, format: ext, data });
      setReplacing(false);
      setShowLocationForm(true);

      logActivity("Will Uploaded", "will", `Uploaded will document: ${file.name}`, {
        field: "Will",
        newValue: file.name,
      });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveLocation = () => {
    saveWill({ physicalLocation });
    setShowLocationForm(false);
    logActivity("Will Location Updated", "will", "Updated physical location for will", {
      field: "Will Physical Location",
      newValue: physicalLocation,
    });
  };

  const handleCreateFromTemplate = () => router.push("/will/create");

  // -------------------------------------------------------------------------
  // Choose-a-will view (status "none", or user is replacing an existing will)
  // -------------------------------------------------------------------------
  const isGenerated = will.status === "generated";
  const isUploaded = will.status === "uploaded";
  // Has the user provided substantive content (beyond always-on boilerplate)?
  // "Started a will" = a deliberate disposition choice exists. Excludes
  // always-on boilerplate and the auto-derived digital-assets clause (which is
  // complete whenever the Vault has any accounts).
  const hasContent = render
    ? render.clauses.some(
        (c) =>
          !["revocation", "trustee-powers", "general-provisions", "digital-assets"].includes(c.id) &&
          c.complete
      )
    : false;
  // Show the upload/create choice only when there's nothing to preview yet.
  const showOptions = replacing || (!isGenerated && !isUploaded && !hasContent);

  if (showOptions) {
    return (
      <div>
        <Header title="Will" subtitle="Upload your existing will or create one from our template" />
        <div>
          {replacing && (
            <div className="mb-6">
              <Button variant="ghost" size="sm" onClick={() => setReplacing(false)}>
                ← Back to current will
              </Button>
            </div>
          )}
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--accent-dim)" }}>
                  <Upload className="h-8 w-8" style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Upload Existing Will
                </h3>
                <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                  Already have a will? Upload it here to store securely in your Vault
                </p>
                <FileUpload onFilesSelected={handleFileUpload} accept=".pdf,.docx,.doc" maxFiles={1} loading={isUploading} />
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "var(--accent-gradient)" }}>
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
                  <p>✓ Prefilled from your profile</p>
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

  // -------------------------------------------------------------------------
  // Document view — a generated will, or a live DRAFT preview built from your
  // estate details (My Estate disposition + Vault inventory).
  // -------------------------------------------------------------------------
  if (render && !isUploaded) {
    return (
      <div>
        <Header
          title="Will"
          subtitle={isGenerated ? "Your last will and testament" : "Draft preview — built from your estate details"}
        />
        <div>
          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            {isGenerated ? (
              <div className="flex items-center gap-2 text-sm" style={{ color: "var(--success)" }}>
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>Will saved — print &amp; sign with two witnesses to make it valid.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm" style={{ color: "var(--warning)" }}>
                <Clock className="h-5 w-5 flex-shrink-0" />
                <span>Draft — not yet generated. Keep editing in My Estate, then review &amp; generate to finalise.</span>
              </div>
            )}
            <div className="flex gap-2">
              {isGenerated ? (
                <>
                  <Button variant="primary" size="sm" onClick={downloadWillPdf}>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => router.push("/will/create")}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setReplacing(true)}>
                    <Upload className="h-4 w-4" />
                    Replace
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="primary" size="sm" onClick={() => router.push("/will/create")}>
                    <CheckCircle className="h-4 w-4" />
                    Review &amp; Generate
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setReplacing(true)}>
                    <Upload className="h-4 w-4" />
                    Upload instead
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Annexures — printable companion schedules generated from the Vault,
              to attach to the signed paper Will (the document references them). */}
          <Card padding="lg" className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Paperclip className="h-5 w-5 flex-shrink-0" style={{ color: "var(--accent)" }} />
              <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Annexures to attach to your printed Will
              </h3>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Generated from your Vault. Print these and keep them with the signed Will — it refers
              to them. They contain no passwords or secrets.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between gap-3 rounded-lg p-3" style={{ backgroundColor: "var(--bg-surface)" }}>
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    Asset &amp; Liability Inventory
                  </span>
                </div>
                <Button variant="secondary" size="sm" onClick={downloadAssetInventoryPdf}>
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg p-3" style={{ backgroundColor: "var(--bg-surface)" }}>
                <div className="flex items-center gap-2 min-w-0">
                  <Globe className="h-4 w-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    Digital Assets Register
                  </span>
                </div>
                <Button variant="secondary" size="sm" onClick={downloadDigitalRegisterPdf}>
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </Card>

          <WillDocumentBody render={render} />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Uploaded
  // -------------------------------------------------------------------------
  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Will" subtitle="Your last will and testament" />
      <div>
        <Card padding="lg" className="mb-6 border-l-4" style={{ borderLeftColor: "var(--success)" }}>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--success-bg)" }}>
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

        <Card padding="lg" className="mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--accent-dim)" }}>
                <FileText className="h-6 w-6" style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <h4 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  {will.fileName}
                </h4>
                <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Uploaded {will.uploadedAt ? new Date(will.uploadedAt).toLocaleDateString() : ""}</span>
                  </div>
                  <div className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "var(--info-bg)", color: "var(--info)" }}>
                    {(will.format || "").toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              disabled={!will.data}
              title={will.data ? undefined : "Original file not stored"}
              onClick={() => {
                if (!will.data) return;
                const a = document.createElement("a");
                a.href = will.data;
                a.download = will.fileName || "will";
                a.click();
              }}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>

          {!showLocationForm && will.physicalLocation && (
            <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5" style={{ color: "var(--text-secondary)" }} />
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                      Physical Location
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {will.physicalLocation}
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

          {(!will.physicalLocation || showLocationForm) && (
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
                {showLocationForm && will.physicalLocation && (
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card padding="md" hover className="cursor-pointer" onClick={() => setReplacing(true)}>
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

          <Card padding="md" className="opacity-50">
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
      </div>
    </div>
  );
}

// The will document + section navigator. Shared by the generated view and the
// live draft preview.
function WillDocumentBody({ render }: { render: WillRender }) {
  const router = useRouter();
  const included = includedClauses(render);
  const numberOf = (id: string) => included.findIndex((c) => c.id === id) + 1;

  const scrollToClause = (id: string) => {
    const el = document.getElementById(`clause-${id}`);
    if (!el) return;
    let p: HTMLElement | null = el.parentElement;
    while (p) {
      const oy = getComputedStyle(p).overflowY;
      if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight) {
        p.scrollTo({ top: el.getBoundingClientRect().top - p.getBoundingClientRect().top + p.scrollTop - 16, behavior: "smooth" });
        return;
      }
      p = p.parentElement;
    }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex gap-8 items-start">
      {/* The document */}
      <Card padding="lg" className="flex-1 min-w-0">
        <div className="text-center mb-8 pb-6 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-2xl font-bold tracking-wide" style={{ color: "var(--text-primary)" }}>
            LAST WILL AND TESTAMENT
          </h2>
          <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
            of {render.testator.name}, of {render.testator.address}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Born {render.testator.dob} · {render.testator.occupation}
          </p>
        </div>

        <div className="space-y-8">
          {render.clauses.map((c) => {
            const inDoc = !c.optional || c.complete;
            return (
              <section key={c.id} id={`clause-${c.id}`} className="scroll-mt-6">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-semibold" style={{ color: inDoc ? "var(--text-primary)" : "var(--text-muted)" }}>
                      {inDoc ? `${numberOf(c.id)}. ` : ""}
                      {c.heading}
                    </h3>
                    {c.optional && !c.complete && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-muted)" }}
                      >
                        Optional — not added
                      </span>
                    )}
                  </div>
                  {CLAUSE_EDIT[c.id] && (
                    <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={() => router.push(CLAUSE_EDIT[c.id])}>
                      {c.complete ? (
                        <>
                          <Edit className="h-4 w-4" />
                          Edit
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Add
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {c.lines.length > 0 ? (
                  <div className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {c.lines.map((line, i) => (line === "" ? <div key={i} className="h-1" /> : <p key={i}>{line}</p>))}
                  </div>
                ) : (
                  <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
                    Nothing added yet — this clause will be omitted from your will.
                  </p>
                )}
              </section>
            );
          })}

          <section id="clause-execution" className="scroll-mt-6 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Execution</h3>
            <div className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              <p>Signed by the testator in the presence of two witnesses present at the same time.</p>
              <p>Testator: {render.testator.name} · Date: {render.execution.date} · Place: {render.execution.city}</p>
              <p>Witness 1: {render.execution.witness1} · Witness 2: {render.execution.witness2}</p>
            </div>
          </section>
        </div>
      </Card>

      {/* Section navigator */}
      <nav className="w-56 flex-shrink-0 sticky top-4 hidden lg:block">
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--text-muted)" }}>Sections</p>
        <ul className="space-y-1">
          {render.clauses.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => scrollToClause(c.id)}
                className="w-full flex items-center gap-2 text-left text-sm rounded-md px-2 py-1.5 transition-colors hover:bg-accent-muted/40"
                style={{ color: "var(--text-secondary)" }}
              >
                {c.complete ? (
                  <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: "var(--success)" }} />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border flex-shrink-0" style={{ borderColor: c.optional ? "var(--text-muted)" : "var(--warning)" }} />
                )}
                <span className="truncate">{c.heading}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => scrollToClause("execution")}
              className="w-full flex items-center gap-2 text-left text-sm rounded-md px-2 py-1.5 transition-colors hover:bg-accent-muted/40"
              style={{ color: "var(--text-secondary)" }}
            >
              <span className="h-3.5 w-3.5 rounded-full border flex-shrink-0" style={{ borderColor: "var(--text-muted)" }} />
              <span className="truncate">Execution</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
