"use client";

import Header from "@/components/layout/Header";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { Baby, Heart } from "lucide-react";
import { loadBeneficiaries, getMinorChildren, type Beneficiary } from "@/lib/store";
import { getEffectiveWillDoc, updateWillDoc } from "@/lib/model/will";
import type { WillFuneral } from "@/lib/model/willTypes";

export default function WishesPage() {
  const router = useRouter();
  const [people, setPeople] = useState<Beneficiary[]>([]);
  const [minorCount, setMinorCount] = useState(0);
  const [guardianId, setGuardianId] = useState("");
  const [funeral, setFuneral] = useState<WillFuneral>({ disposition: "no_preference" });

  useEffect(() => {
    const refresh = () => {
      setPeople(loadBeneficiaries());
      setMinorCount(getMinorChildren().length);
      const doc = getEffectiveWillDoc();
      const g = doc.guardians?.primary;
      const match = g ? loadBeneficiaries().find((p) => p.name === g.full_name) : undefined;
      setGuardianId(match?.id || "");
      setFuneral(doc.funeral || { disposition: "no_preference" });
    };
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  const guardianCandidates = people.filter((p) => p.role === "guardian" || p.role === "beneficiary");

  const saveGuardian = (id: string) => {
    setGuardianId(id);
    const p = people.find((x) => x.id === id);
    updateWillDoc({
      has_minor_children: minorCount > 0,
      guardians: p ? { primary: { personId: p.id, full_name: p.name, relationship: p.relationship, residential_address: p.residentialAddress } } : undefined,
    });
  };

  const saveFuneral = (patch: Partial<WillFuneral>) => {
    const next = { ...funeral, ...patch };
    setFuneral(next);
    updateWillDoc({ funeral: next });
  };

  return (
    <div>
      <Header
        title="Guardian & Wishes"
        subtitle="Appoint a guardian for minor children and record your funeral wishes."
      />

      {/* Guardian */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Baby className="h-6 w-6" style={{ color: "var(--accent)" }} />
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Guardian</h3>
        </div>
        {minorCount === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            You have no children under 18 recorded, so a guardian isn&apos;t required. Manage family on the{" "}
            <button onClick={() => router.push("/people")} className="underline" style={{ color: "var(--accent)" }}>People</button> page.
          </p>
        ) : (
          <>
            <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: "var(--warning-bg)" }}>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                You have {minorCount} child{minorCount === 1 ? "" : "ren"} under 18 — appoint a guardian.
              </p>
            </div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Primary Guardian</label>
            <select className="input w-full" value={guardianId} onChange={(e) => saveGuardian(e.target.value)}>
              <option value="">Select a person…</option>
              {guardianCandidates.map((p) => (
                <option key={p.id} value={p.id}>{p.name}{p.relationship ? ` (${p.relationship})` : ""}</option>
              ))}
            </select>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>People are managed on the People page.</p>
          </>
        )}
      </Card>

      {/* Funeral wishes */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="h-6 w-6" style={{ color: "var(--accent)" }} />
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Funeral &amp; Final Wishes</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Disposition preference</label>
            <select className="input w-full" value={funeral.disposition || "no_preference"} onChange={(e) => saveFuneral({ disposition: e.target.value as WillFuneral["disposition"] })}>
              <option value="no_preference">No preference</option>
              <option value="buried">Burial</option>
              <option value="cremated">Cremation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Preferred location (optional)</label>
            <input type="text" className="input w-full" placeholder="e.g. Rookwood Cemetery" value={funeral.preferred_location || ""} onChange={(e) => saveFuneral({ preferred_location: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Other wishes (optional)</label>
            <textarea className="input w-full" rows={3} placeholder="Religious/cultural observances, special instructions…" value={funeral.other_wishes || ""} onChange={(e) => saveFuneral({ other_wishes: e.target.value })} />
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Funeral wishes are not legally binding, but carry moral weight — they appear in your will.</p>
        </div>
      </Card>
    </div>
  );
}
