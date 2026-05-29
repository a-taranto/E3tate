"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { ArrowRight } from "lucide-react";
import { getEstatePosition, type EstatePosition } from "@/lib/model/computations";

const fmtAUD = (n: number) =>
  n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

// Shared net-position view: assets − liabilities = net estate, with each
// component deep-linking to its page. Net estate is the MetaLaw-correct figure
// (excludes joint-tenancy / joint accounts / super; includes digital assets) via
// getEstatePosition(). Re-renders on any store change.
export default function EstatePositionSummary({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [estate, setEstate] = useState<EstatePosition>({
    grossEstate: 0,
    totalLiabilities: 0,
    netEstate: 0,
  });

  useEffect(() => {
    const refresh = () => setEstate(getEstatePosition());
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-lg" style={{ color: "var(--text-primary)" }}>
          Estate Value
        </h3>
        <Button variant="ghost" size="sm" onClick={() => router.push("/my-estate/assets")}>
          Manage Assets
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
        <button
          onClick={() => router.push("/my-estate/assets")}
          className="text-left rounded-lg p-3 transition-colors hover:bg-accent-muted/50"
        >
          <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Assets</p>
          <p className="text-2xl font-semibold" style={{ color: "var(--success)" }}>
            {fmtAUD(estate.grossEstate)}
          </p>
        </button>
        <button
          onClick={() => router.push("/liabilities")}
          className="text-left rounded-lg p-3 transition-colors hover:bg-accent-muted/50"
        >
          <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>− Liabilities</p>
          <p className="text-2xl font-semibold" style={{ color: "var(--warning)" }}>
            {fmtAUD(estate.totalLiabilities)}
          </p>
        </button>
        <div className="rounded-lg p-3" style={{ backgroundColor: "var(--accent-dim)" }}>
          <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>= Net estate</p>
          <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
            {fmtAUD(estate.netEstate)}
          </p>
        </div>
      </div>
    </Card>
  );
}
