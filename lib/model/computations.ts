// Estate computations. The single canonical inventory is `estate_assets`
// (loadAssets) + `liabilities` (loadLiabilities) — the same data the asset/
// liability UIs edit, so net worth always reflects live edits. Net estate
// EXCLUDES assets that pass outside the will: superannuation (via BDBN) and
// anything flagged jointly owned (passes by survivorship).

import { getMinorChildren, loadAssets, loadLiabilities } from "@/lib/store";
import { loadSuperInsurance } from "./superInsurance";
import { loadDigitalRegister } from "./digitalRegister";

export interface EstatePosition {
  grossEstate: number;
  totalLiabilities: number;
  netEstate: number;
}

// Assets that form part of the estate: everything except superannuation
// (passes via BDBN) and jointly-owned assets (pass by survivorship).
function estateAssets() {
  return loadAssets().filter((a) => a.type !== "super" && !a.jointlyOwned);
}

export function getGrossEstate(): number {
  return estateAssets().reduce((s, a) => s + (a.estimatedValue || 0), 0);
}

export function getTotalLiabilities(): number {
  return loadLiabilities().reduce((s, l) => s + (l.balance || 0), 0);
}

export function getNetEstate(): number {
  return getGrossEstate() - getTotalLiabilities();
}

export function getEstatePosition(): EstatePosition {
  const grossEstate = getGrossEstate();
  const totalLiabilities = getTotalLiabilities();
  return { grossEstate, totalLiabilities, netEstate: grossEstate - totalLiabilities };
}

// Schedule 3 recommendation matrix (subset for M1).
export type TrustRecommendationLevel = "high" | "medium" | "low";
export interface TrustRecommendation {
  level: TrustRecommendationLevel;
  reasons: string[];
}

export function recommendTestamentaryTrust(): TrustRecommendation {
  const net = getNetEstate();
  const incomeAssets = loadAssets().some((a) =>
    ["real-property", "shares", "business"].includes(a.type)
  );
  const minorChildren = getMinorChildren().length > 0;

  const reasons: string[] = [];
  let level: TrustRecommendationLevel = "low";

  if (minorChildren && incomeAssets) {
    level = "high";
    reasons.push("Minor children will benefit from income-producing assets");
  }
  if (net >= 1_000_000) {
    level = "high";
    reasons.push("Large estate (≥ $1,000,000)");
  }
  if (level !== "high" && net >= 500_000) {
    level = "medium";
    reasons.push("Estate exceeds $500,000");
  }
  if (reasons.length === 0) reasons.push("Simple estate — a testamentary trust may not be necessary");
  return { level, reasons };
}

export type AlertSeverity = "info" | "warning" | "critical";
export interface EstateAlert {
  id: string;
  severity: AlertSeverity;
  message: string;
}

const DAY = 86_400_000;

// BDBN lapse + domain-renewal alerts (Schedule 2 / Schedule 4).
export function getEstateAlerts(): EstateAlert[] {
  const now = Date.now();
  const alerts: EstateAlert[] = [];

  loadSuperInsurance().super_funds.forEach((f) => {
    if (f.bdbn_in_place === "yes" && f.bdbn_expiry_date) {
      const exp = new Date(f.bdbn_expiry_date).getTime();
      if (isNaN(exp)) return;
      if (exp < now) {
        alerts.push({ id: `bdbn_lapsed_${f.id}`, severity: "critical", message: `BDBN for ${f.fund_name} has lapsed` });
      } else if (exp - now <= 90 * DAY) {
        alerts.push({ id: `bdbn_soon_${f.id}`, severity: "warning", message: `BDBN for ${f.fund_name} expires within 90 days` });
      }
    }
  });

  loadDigitalRegister().domains_ip.forEach((d) => {
    if (!d.renewal_date) return;
    const ren = new Date(d.renewal_date).getTime();
    if (!isNaN(ren) && ren - now <= 30 * DAY) {
      alerts.push({ id: `domain_renewal_${d.id}`, severity: "warning", message: `${d.asset} renews within 30 days` });
    }
  });

  return alerts;
}
