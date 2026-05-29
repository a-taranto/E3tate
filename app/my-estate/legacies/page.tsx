"use client";

import { useEffect, useState } from "react";
import { Card, Button } from "@/components/ui";
import { Coins, Plus, Trash2 } from "lucide-react";
import { getEffectiveWillDoc, updateWillDoc } from "@/lib/model/will";
import type { CashLegacy } from "@/lib/model/willTypes";

const fmtAUD = (n: number) => n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

export default function CashLegaciesPage() {
  const [legacies, setLegacies] = useState<CashLegacy[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: "", recipient: "", relationship: "", isCharity: false, abn: "" });

  useEffect(() => {
    const refresh = () => setLegacies(getEffectiveWillDoc().cash_legacies ?? []);
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  const persist = (next: CashLegacy[]) => {
    setLegacies(next);
    updateWillDoc({ cash_legacies: next });
  };

  const add = () => {
    if (!form.recipient.trim() || !form.amount) return;
    persist([
      ...legacies,
      {
        id: `legacy-${Date.now()}`,
        amount_aud: Number(form.amount.replace(/[^0-9.]/g, "")) || 0,
        recipient_full_name: form.recipient.trim(),
        relationship: form.relationship.trim() || undefined,
        is_charity: form.isCharity,
        abn: form.isCharity ? form.abn.trim() || undefined : undefined,
      },
    ]);
    setForm({ amount: "", recipient: "", relationship: "", isCharity: false, abn: "" });
    setShowForm(false);
  };

  const remove = (id: string) => persist(legacies.filter((l) => l.id !== id));
  const total = legacies.reduce((s, l) => s + (l.amount_aud || 0), 0);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Cash Legacies</h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Fixed sums of money left to people or charities, paid before the residuary estate is distributed.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm((s) => !s)}><Plus className="h-4 w-4" />Add Legacy</Button>
      </div>

      {showForm && (
        <Card padding="lg" className="mb-6" style={{ borderColor: "var(--accent)", borderWidth: "1px" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Amount (AUD) *</label>
              <input type="text" inputMode="decimal" className="input w-full" placeholder="10000" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Recipient / Organisation *</label>
              <input type="text" className="input w-full" placeholder="Jane Doe or Red Cross" value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Relationship</label>
              <input type="text" className="input w-full" placeholder="Friend, nephew, charity…" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
            </div>
            <div>
              <label className="flex items-center gap-2 mt-8 cursor-pointer">
                <input type="checkbox" checked={form.isCharity} onChange={(e) => setForm({ ...form, isCharity: e.target.checked })} style={{ accentColor: "var(--accent)" }} className="w-5 h-5 rounded" />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>This is a registered charity</span>
              </label>
            </div>
            {form.isCharity && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>ABN</label>
                <input type="text" className="input w-full" placeholder="11 digits" value={form.abn} onChange={(e) => setForm({ ...form, abn: e.target.value })} />
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={add} disabled={!form.recipient.trim() || !form.amount}>Add</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {legacies.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No cash legacies yet.</p>
        </Card>
      ) : (
        <>
          <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>Total legacies: <strong>{fmtAUD(total)}</strong></p>
          <div className="space-y-3">
            {legacies.map((l) => (
              <Card key={l.id} padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Coins className="h-5 w-5" style={{ color: "var(--accent)" }} />
                    <div>
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>{fmtAUD(l.amount_aud)} to {l.recipient_full_name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{l.relationship || (l.is_charity ? "Charity" : "—")}{l.abn ? ` · ABN ${l.abn}` : ""}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => remove(l.id)} aria-label="Remove"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
