"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { PieChart, Info } from "lucide-react";
import { loadBeneficiaries, type Beneficiary } from "@/lib/store";
import { getEffectiveWillDoc, updateWillDoc } from "@/lib/model/will";
import type { ResiduaryShare } from "@/lib/model/willTypes";

export default function ResiduaryPage() {
  const router = useRouter();
  const [people, setPeople] = useState<Beneficiary[]>([]);
  const [shares, setShares] = useState<Record<string, number>>({});

  useEffect(() => {
    const refresh = () => {
      const ppl = loadBeneficiaries().filter((b) => b.role === "beneficiary");
      setPeople(ppl);
      const existing = getEffectiveWillDoc().residuary?.optionB?.shares ?? [];
      const map: Record<string, number> = {};
      existing.forEach((s) => {
        if (s.beneficiaryId) map[s.beneficiaryId] = s.share_percent;
      });
      setShares(map);
    };
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  const total = Object.values(shares).reduce((s, n) => s + (n || 0), 0);

  const setShare = (id: string, value: string) => {
    const digits = value.replace(/[^0-9.]/g, "");
    setShares((prev) => {
      const next = { ...prev };
      if (digits === "") delete next[id];
      else next[id] = Number(digits);
      return next;
    });
  };

  const save = () => {
    const sharesArr: ResiduaryShare[] = people
      .filter((p) => shares[p.id] != null)
      .map((p) => ({
        id: `res-${p.id}`,
        beneficiaryId: p.id,
        beneficiary_full_name: p.name,
        relationship: p.relationship,
        share_percent: shares[p.id],
      }));
    updateWillDoc({ residuary: { option: "B", optionB: { shares: sharesArr } } });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Residuary Estate</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Everything left after debts, gifts, and cash legacies. Split it among your beneficiaries — the shares must total 100%.
        </p>
      </div>

      {people.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>Add beneficiaries first.</p>
          <Button variant="primary" onClick={() => router.push("/people")}>Go to People</Button>
        </Card>
      ) : (
        <Card padding="lg">
          <div className="space-y-3">
            {people.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <PieChart className="h-5 w-5 flex-shrink-0" style={{ color: "var(--accent)" }} />
                  <div className="min-w-0">
                    <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.relationship || "Beneficiary"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input type="text" inputMode="decimal" className="input w-20 text-right" placeholder="0" value={shares[p.id] ?? ""} onChange={(e) => setShare(p.id, e.target.value)} />
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-medium" style={{ color: total === 100 ? "var(--success)" : "var(--warning)" }}>
              Total: {total}% {total === 100 ? "✓" : "(must equal 100%)"}
            </p>
            <Button variant="primary" onClick={save}>Save Residuary</Button>
          </div>
        </Card>
      )}

      <Card padding="md" className="mt-6 border-l-4" style={{ borderLeftColor: "var(--info)" }}>
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "var(--info)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            A beneficiary who doesn&apos;t survive you by 30 days is treated as having predeceased you; their share falls back into the residue.
          </p>
        </div>
      </Card>
    </div>
  );
}
