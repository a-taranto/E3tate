"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { Card, Button } from "@/components/ui";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Download,
  ArrowRight,
  Shield,
  X,
} from "lucide-react";
import { logActivity } from "@/lib/activityLogger";
import {
  loadBeneficiaries,
  loadProfile,
  loadWill,
  saveWill,
  mirrorWillToVault,
  getMinorChildren,
  type Beneficiary,
} from "@/lib/store";
import { getEffectiveWillDoc, updateWillDoc } from "@/lib/model/will";
import { validateWill, type ValidationResult } from "@/lib/model/validations";
import { renderWillText } from "@/lib/willRenderer";
import { toast } from "@/components/ui/Toaster";

const fmtAUD = (n: number) => n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

export default function ReviewWillPage() {
  const router = useRouter();
  const [people, setPeople] = useState<Beneficiary[]>([]);
  const [primaryId, setPrimaryId] = useState("");
  const [substituteId, setSubstituteId] = useState("");
  const [issues, setIssues] = useState<ValidationResult[]>([]);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [tick, setTick] = useState(0); // re-derive summary after edits

  useEffect(() => {
    const refresh = () => {
      setPeople(loadBeneficiaries());
      const doc = getEffectiveWillDoc();
      setPrimaryId(doc.executors?.primary?.personId || "");
      setSubstituteId(doc.executors?.substitute_1?.personId || "");
      setIssues(validateWill());
      setTick((t) => t + 1);
    };
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  const executors = people.filter((b) => b.role === "executor");
  const doc = getEffectiveWillDoc();
  void tick;

  const refStore = () => {
    setIssues(validateWill());
    setTick((t) => t + 1);
  };

  const toRef = (id: string) => {
    const p = people.find((x) => x.id === id);
    return p ? { personId: p.id, full_name: p.name, relationship: p.relationship, residential_address: p.residentialAddress } : undefined;
  };

  const setExecutors = (primary: string, substitute: string) => {
    setPrimaryId(primary);
    setSubstituteId(substitute);
    updateWillDoc({
      executors: {
        primary: toRef(primary),
        substitute_1: toRef(substitute),
        co_executors_act_jointly: true,
      },
    });
    refStore();
  };

  const errors = issues.filter((i) => !i.ok && i.severity === "error");
  const warnings = issues.filter((i) => !i.ok && i.severity === "warning");

  const profile = loadProfile();
  const residuaryShares = doc.residuary?.optionB?.shares ?? [];
  const residuaryTotal = residuaryShares.reduce((s, x) => s + (x.share_percent || 0), 0);
  const gifts = doc.specific_gifts ?? [];
  const legacies = doc.cash_legacies ?? [];
  const minorChildren = getMinorChildren().length;
  const hasGuardian = !!doc.guardians?.primary?.full_name || people.some((p) => p.role === "guardian");

  const summary: { label: string; value: string; ok: boolean; route: string }[] = [
    { label: "About you (testator)", value: profile.fullName || "Incomplete", ok: !!profile.fullName, route: "/profile" },
    { label: "Executor", value: doc.executors?.primary?.full_name || "Not appointed", ok: !!doc.executors?.primary?.full_name, route: "/people" },
    { label: "Residuary estate", value: residuaryShares.length ? `${residuaryTotal}% allocated` : "Not set", ok: residuaryShares.length > 0 && residuaryTotal === 100, route: "/my-estate/residuary" },
    { label: "Specific gifts", value: gifts.length ? `${gifts.length} gift${gifts.length === 1 ? "" : "s"}` : "None", ok: true, route: "/my-estate/gifts" },
    { label: "Cash legacies", value: legacies.length ? `${fmtAUD(legacies.reduce((s, l) => s + (l.amount_aud || 0), 0))}` : "None", ok: true, route: "/my-estate/legacies" },
    ...(minorChildren > 0
      ? [{ label: "Guardian (minor children)", value: hasGuardian ? "Appointed" : "Required", ok: hasGuardian, route: "/my-estate/wishes" }]
      : []),
    { label: "Funeral wishes", value: doc.funeral?.disposition && doc.funeral.disposition !== "no_preference" ? doc.funeral.disposition : "No preference", ok: true, route: "/my-estate/wishes" },
  ];

  const handleGenerate = () => {
    const now = new Date().toISOString();
    saveWill({ status: "generated", source: "template", generatedAt: now });
    mirrorWillToVault({ fileName: "Created from template" });
    logActivity("Will Generated", "will", "Generated will from estate details");
    toast("Will generated and saved to your account");
    router.push("/will");
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Review &amp; Generate Your Will" subtitle="Built from your estate details — review, then generate the document" />
      <div className="container mx-auto px-8 py-8 max-w-4xl">
        <Card padding="sm" className="mb-6 border-l-4" style={{ borderLeftColor: "var(--warning)" }}>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: "var(--warning)" }} />
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              <strong>Legal Disclaimer:</strong> Informational only. Have a qualified NSW solicitor review your will before signing.
            </p>
          </div>
        </Card>

        {/* Validation issues */}
        {(errors.length > 0 || warnings.length > 0) && (
          <Card padding="md" className="mb-6 border-l-4" style={{ borderLeftColor: errors.length ? "var(--error)" : "var(--warning)" }}>
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Before you generate</h3>
            <ul className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {errors.map((e) => (
                <li key={e.id}>• {e.message}</li>
              ))}
              {warnings.map((w) => (
                <li key={w.id} style={{ color: "var(--text-muted)" }}>• {w.message}</li>
              ))}
            </ul>
          </Card>
        )}

        {/* Executors — the one will-specific choice (who is primary vs substitute) */}
        <Card padding="lg" className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6" style={{ color: "var(--accent)" }} />
            <div>
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Executor &amp; Trustee</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Who administers your estate (also acts as Trustee).</p>
            </div>
          </div>
          {executors.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--warning)" }}>
              No executors yet. Add a person with the Executor role on the{" "}
              <button onClick={() => router.push("/people")} className="underline" style={{ color: "var(--accent)" }}>People</button> page.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Primary Executor</label>
                <select className="input w-full" value={primaryId} onChange={(e) => setExecutors(e.target.value, substituteId)}>
                  <option value="">Select…</option>
                  {executors.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Substitute Executor</label>
                <select className="input w-full" value={substituteId} onChange={(e) => setExecutors(primaryId, e.target.value)}>
                  <option value="">Select…</option>
                  {executors.filter((p) => p.id !== primaryId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
          )}
        </Card>

        {/* Summary checklist */}
        <Card padding="lg" className="mb-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Your will at a glance</h3>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {summary.map((row) => (
              <button
                key={row.label}
                onClick={() => router.push(row.route)}
                className="w-full flex items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-accent-muted/30 rounded px-2"
              >
                <div className="flex items-center gap-3">
                  {row.ok ? (
                    <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: "var(--success)" }} />
                  ) : (
                    <span className="h-4 w-4 rounded-full border flex-shrink-0" style={{ borderColor: "var(--warning)" }} />
                  )}
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{row.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>{row.value}</span>
                  <ArrowRight className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <Button variant="secondary" onClick={() => setPreviewText(renderWillText())}>
            <FileText className="h-4 w-4" />
            Preview document
          </Button>
          <Button variant="primary" onClick={handleGenerate}>
            <CheckCircle className="h-4 w-4" />
            Generate Will
          </Button>
        </div>
      </div>

      {/* Preview modal */}
      {previewText !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card padding="lg" className="max-w-3xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Will preview</h3>
              <button onClick={() => setPreviewText(null)} aria-label="Close" className="p-1 rounded-md hover:bg-accent-muted/40" style={{ color: "var(--text-muted)" }}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <pre className="overflow-auto text-xs whitespace-pre-wrap flex-1 p-4 rounded-lg" style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-secondary)", fontFamily: "ui-monospace, monospace" }}>
              {previewText}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}
