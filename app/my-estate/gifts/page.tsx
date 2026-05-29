"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { Gift, ArrowRight, Info } from "lucide-react";
import { loadAssets, loadBeneficiaries, type EstateAsset, type Beneficiary } from "@/lib/store";
import { getEffectiveWillDoc, updateWillDoc } from "@/lib/model/will";
import type { SpecificGift } from "@/lib/model/willTypes";

const fmtAUD = (n?: number) =>
  typeof n === "number" ? n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }) : "—";

export default function SpecificGiftsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<EstateAsset[]>([]);
  const [people, setPeople] = useState<Beneficiary[]>([]);
  const [gifts, setGifts] = useState<SpecificGift[]>([]);

  useEffect(() => {
    const refresh = () => {
      setAssets(loadAssets());
      setPeople(loadBeneficiaries().filter((b) => b.role === "beneficiary"));
      setGifts(getEffectiveWillDoc().specific_gifts ?? []);
    };
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  const giftFor = (assetId: string) => gifts.find((g) => g.assetId === assetId);

  const assign = (asset: EstateAsset, beneficiaryId: string) => {
    let next: SpecificGift[];
    if (!beneficiaryId) {
      next = gifts.filter((g) => g.assetId !== asset.id);
    } else {
      const person = people.find((p) => p.id === beneficiaryId);
      const gift: SpecificGift = {
        id: giftFor(asset.id)?.id || `gift-${asset.id}`,
        assetId: asset.id,
        asset_description: asset.title,
        beneficiaryId,
        beneficiary_full_name: person?.name || "",
        relationship: person?.relationship,
        lapses_to_residue: true,
      };
      next = [...gifts.filter((g) => g.assetId !== asset.id), gift];
    }
    setGifts(next);
    updateWillDoc({ specific_gifts: next });
  };

  const assignedCount = gifts.length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Specific Gifts</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Leave a specific asset to a particular person. Anything not gifted here falls into your residuary estate.
        </p>
      </div>

      <Card padding="md" className="mb-6 border-l-4" style={{ borderLeftColor: "var(--info)" }}>
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "var(--info)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Assets come from your <button onClick={() => router.push("/vault/assets")} className="underline" style={{ color: "var(--accent)" }}>Vault</button>.
            Recipients come from <button onClick={() => router.push("/people")} className="underline" style={{ color: "var(--accent)" }}>People</button> (beneficiaries).
          </p>
        </div>
      </Card>

      {assets.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>No assets yet — add them in your Vault.</p>
          <Button variant="primary" onClick={() => router.push("/vault/assets")}>Go to Assets <ArrowRight className="h-4 w-4" /></Button>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{assignedCount} of {assets.length} assets gifted</p>
          {assets.map((asset) => {
            const gift = giftFor(asset.id);
            return (
              <Card key={asset.id} padding="md">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Gift className="h-5 w-5 flex-shrink-0" style={{ color: gift ? "var(--accent)" : "var(--text-muted)" }} />
                    <div className="min-w-0">
                      <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{asset.title}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{fmtAUD(asset.estimatedValue)}{gift ? " · gifted" : " · falls to residuary"}</p>
                    </div>
                  </div>
                  <select
                    className="input w-48"
                    value={gift?.beneficiaryId || ""}
                    onChange={(e) => assign(asset, e.target.value)}
                  >
                    <option value="">Falls to residuary</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>Gift to {p.name}</option>
                    ))}
                  </select>
                </div>
              </Card>
            );
          })}
          {people.length === 0 && (
            <p className="text-sm" style={{ color: "var(--warning)" }}>Add beneficiaries on the People page to assign gifts.</p>
          )}
        </div>
      )}
    </div>
  );
}
