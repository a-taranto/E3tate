"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { Landmark, Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import {
  loadLiabilities,
  addLiability,
  deleteLiability,
  type EstateLiability,
  type LiabilityKind,
} from "@/lib/store";

const KIND_LABELS: Record<LiabilityKind, string> = {
  mortgage: "Mortgage",
  loan: "Loan",
  "credit-card": "Credit Card",
  tax: "Tax",
  other: "Other",
};

const formatMoney = (n: number) =>
  n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

export default function SetupLiabilitiesPage() {
  const router = useRouter();
  const [liabilities, setLiabilities] = useState<EstateLiability[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ kind: "loan" as LiabilityKind, name: "", lender: "", balance: "" });

  useEffect(() => {
    const refresh = () => setLiabilities(loadLiabilities());
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  const submitForm = () => {
    if (!form.name.trim()) return;
    addLiability({
      id: Date.now().toString(),
      kind: form.kind,
      name: form.name.trim(),
      lender: form.lender.trim() || undefined,
      balance: form.balance ? Number(form.balance) : undefined,
    });
    setLiabilities(loadLiabilities());
    setForm({ kind: "loan", name: "", lender: "", balance: "" });
    setShowForm(false);
  };

  const remove = (id: string) => {
    deleteLiability(id);
    setLiabilities(loadLiabilities());
  };

  const handleContinue = () => {
    const completedSteps = JSON.parse(localStorage.getItem("setup_completed_steps") || "[]");
    if (!completedSteps.includes("liabilities")) {
      completedSteps.push("liabilities");
      localStorage.setItem("setup_completed_steps", JSON.stringify(completedSteps));
    }
    router.push("/my-estate/will");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Your liabilities
        </h2>
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          Record debts your executor must settle before distributing the estate. These reduce your net estate.
        </p>
      </div>

      {/* Count + Add */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {liabilities.length} {liabilities.length === 1 ? "liability" : "liabilities"} ·{" "}
          {formatMoney(liabilities.reduce((s, l) => s + (l.balance || 0), 0))}
        </p>
        <Button variant="primary" onClick={() => setShowForm((s) => !s)}>
          <Plus className="h-4 w-4" />
          Add Liability
        </Button>
      </div>

      {showForm && (
        <Card padding="lg" className="mb-6" style={{ borderColor: "var(--accent)", borderWidth: "1px" }}>
          <h3 className="font-semibold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
            Add Liability
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Type
              </label>
              <select
                className="input w-full"
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as LiabilityKind })}
              >
                {Object.entries(KIND_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Name *
              </label>
              <input
                className="input w-full"
                placeholder="e.g. Home Mortgage"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Lender
              </label>
              <input
                className="input w-full"
                placeholder="e.g. Commonwealth Bank"
                value={form.lender}
                onChange={(e) => setForm({ ...form, lender: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Outstanding Balance (AUD)
              </label>
              <input
                type="number"
                className="input w-full"
                placeholder="0"
                value={form.balance}
                onChange={(e) => setForm({ ...form, balance: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={submitForm} disabled={!form.name.trim()}>
              Add
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {liabilities.length === 0 ? (
        <Card padding="lg" className="mb-6">
          <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
            No liabilities added. If you have a mortgage, loans, credit cards, or tax owing, add them here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3 mb-6">
          {liabilities.map((l) => (
            <Card key={l.id} padding="md">
              <div className="flex items-center gap-4">
                <Landmark className="h-6 w-6 flex-shrink-0" style={{ color: "var(--warning)" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {l.name}
                    </h4>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-muted)" }}
                    >
                      {KIND_LABELS[l.kind]}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {l.lender || "—"}
                  </p>
                </div>
                <span className="text-sm font-semibold whitespace-nowrap" style={{ color: "var(--warning)" }}>
                  {l.balance != null ? formatMoney(l.balance) : "—"}
                </span>
                <Button variant="ghost" size="sm" onClick={() => remove(l.id)} aria-label={`Remove ${l.name}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
