"use client";

import { useEffect, useState } from "react";
import { Card, Button } from "@/components/ui";
import { Landmark, AlertTriangle } from "lucide-react";
import { recommendTestamentaryTrust, type TrustRecommendation } from "@/lib/model/computations";

// Schedule 3 — surfaces the testamentary-trust recommendation when the estate
// warrants one (net > $500k, minor children + income assets, etc.). Read-only;
// enabling the trust provisions is warning-gated in the (future) trust flow.
export default function TrustRecommendationCard({ className = "" }: { className?: string }) {
  const [rec, setRec] = useState<TrustRecommendation>({ level: "low", reasons: [] });

  useEffect(() => {
    const refresh = () => setRec(recommendTestamentaryTrust());
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  if (rec.level === "low") return null;

  const high = rec.level === "high";

  return (
    <Card className={`${className} border-l-4`} style={{ borderLeftColor: high ? "var(--warning)" : "var(--info)" }}>
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: high ? "var(--warning-bg)" : "var(--info-bg)" }}>
          <Landmark className="h-6 w-6" style={{ color: high ? "var(--warning)" : "var(--info)" }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-lg" style={{ color: "var(--text-primary)" }}>
              Consider a Testamentary Trust
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium uppercase"
              style={{ backgroundColor: high ? "var(--warning-bg)" : "var(--info-bg)", color: high ? "var(--warning)" : "var(--info)" }}
            >
              {high ? "Strongly recommended" : "Worth considering"}
            </span>
          </div>
          <ul className="text-sm mb-3 space-y-1" style={{ color: "var(--text-secondary)" }}>
            {rec.reasons.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
          <div className="flex items-start gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              Testamentary trusts have significant legal and tax complexity. Have a qualified NSW solicitor review the
              provisions before including them.
            </span>
          </div>
          <Button variant="ghost" size="sm" className="mt-2" disabled title="Trust setup flow coming soon">
            Learn about trust provisions
          </Button>
        </div>
      </div>
    </Card>
  );
}
