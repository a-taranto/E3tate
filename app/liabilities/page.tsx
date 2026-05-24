"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { Card, Button, Input } from "@/components/ui";
import { Landmark, Plus, Trash2, Check } from "lucide-react";
import {
  loadLiabilities,
  saveLiabilities,
  type EstateLiability,
  type LiabilityKind,
} from "@/lib/store";
import { logActivity } from "@/lib/activityLogger";
import { toast } from "@/components/ui/Toaster";

const KIND_LABELS: Record<LiabilityKind, string> = {
  mortgage: "Mortgage",
  loan: "Loan",
  "credit-card": "Credit Card",
  tax: "Tax",
  other: "Other",
};

const formatMoney = (n: number) =>
  n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

export default function LiabilitiesPage() {
  const [liabilities, setLiabilities] = useState<EstateLiability[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    kind: "loan" as LiabilityKind,
    name: "",
    lender: "",
    balance: "",
  });

  useEffect(() => {
    const refresh = () => {
      setLiabilities(loadLiabilities());
      setLoaded(true);
    };
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  const total = liabilities.reduce((sum, l) => sum + (l.balance || 0), 0);

  const submitForm = () => {
    if (!form.name.trim()) return;
    const newLiability: EstateLiability = {
      id: Date.now().toString(),
      kind: form.kind,
      name: form.name.trim(),
      lender: form.lender.trim() || undefined,
      balance: form.balance ? Number(form.balance) : undefined,
    };
    const updated = [...liabilities, newLiability];
    setLiabilities(updated);
    saveLiabilities(updated);
    logActivity("Liability Added", "system", `${form.name} (${KIND_LABELS[form.kind]})`);
    toast("Liability added");
    setForm({ kind: "loan", name: "", lender: "", balance: "" });
    setShowForm(false);
  };

  const remove = (l: EstateLiability) => {
    if (!confirm(`Remove ${l.name}?`)) return;
    const updated = liabilities.filter((x) => x.id !== l.id);
    setLiabilities(updated);
    saveLiabilities(updated);
    logActivity("Liability Removed", "system", l.name);
    toast(`${l.name} removed`, "info");
  };

  return (
    <div>
      <Header
        title="Liabilities"
        subtitle="Debts your executor will settle before distributing the estate"
        action={
          <Button variant="primary" onClick={() => setShowForm((s) => !s)}>
            <Plus className="h-4 w-4" />
            Add Liability
          </Button>
        }
      />

      {/* Summary */}
      <Card className="mb-6 border-l-4" style={{ borderLeftColor: "var(--warning)" }}>
        <div className="flex items-center gap-4">
          <Landmark className="h-8 w-8" style={{ color: "var(--warning)" }} />
          <div>
            <p className="text-text-muted text-sm">Total Liabilities</p>
            <p className="text-3xl font-semibold">{formatMoney(total)}</p>
            <p className="text-xs text-text-muted mt-1">
              {liabilities.length} liabilit{liabilities.length === 1 ? "y" : "ies"}
            </p>
          </div>
        </div>
      </Card>

      {/* Add form */}
      {showForm && (
        <Card className="mb-6" style={{ borderColor: "var(--accent)", borderWidth: "1px" }}>
          <h3 className="font-semibold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
            Add Liability
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Type
              </label>
              <select
                className="input"
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
            <Input
              label="Name *"
              placeholder="e.g., Home Mortgage"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Lender"
              placeholder="e.g., Commonwealth Bank"
              value={form.lender}
              onChange={(e) => setForm({ ...form, lender: e.target.value })}
            />
            <Input
              label="Outstanding Balance (AUD)"
              type="number"
              placeholder="0"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={submitForm} disabled={!form.name.trim()}>
              <Check className="h-4 w-4" />
              Add Liability
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* List */}
      <div className="space-y-3">
        {!loaded ? (
          <Card className="text-center py-12">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Loading…
            </p>
          </Card>
        ) : liabilities.length === 0 ? (
          <Card className="text-center py-12">
            <div
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
              style={{ backgroundColor: "var(--accent-dim)" }}
            >
              <Landmark className="h-8 w-8" style={{ color: "var(--accent)" }} />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              No liabilities yet
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Record debts so your executor can settle them before distribution.
            </p>
            <Button variant="primary" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Add Your First Liability
            </Button>
          </Card>
        ) : (
          liabilities.map((l) => (
            <Card key={l.id} hover padding="none">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "var(--accent-dim)" }}
                  >
                    <Landmark className="h-6 w-6" style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{l.name}</h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-muted)" }}
                      >
                        {KIND_LABELS[l.kind]}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted">{l.lender || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-semibold font-mono">
                    {l.balance != null ? formatMoney(l.balance) : "—"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(l)}
                    aria-label={`Remove ${l.name}`}
                    style={{ color: "var(--error)" }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
