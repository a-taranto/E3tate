// Estate computations (Schedule 1 computed fields + Schedule 2/3 alerts).
// Net estate correctly EXCLUDES assets that pass outside the will — joint
// tenancies and joint accounts (survivorship) and superannuation (BDBN) unless
// a BDBN nominates the estate — and INCLUDES digital assets of value. This
// supersedes the simplistic store.getEstateSummary (wired into the UI in M3).

import { getMinorChildren } from "@/lib/store";
import { loadInventory } from "./inventory";
import { loadSuperInsurance, superNominatesEstate } from "./superInsurance";
import { loadDigitalRegister, getDigitalAssetValue } from "./digitalRegister";

export interface EstatePosition {
  grossEstate: number;
  totalLiabilities: number;
  netEstate: number;
}

export function getGrossEstate(): number {
  const inv = loadInventory();
  const property = inv.real_property
    .filter((p) => p.title_type !== "joint_tenants") // JT passes by survivorship
    .reduce((s, p) => s + (p.estimated_value_aud || 0), 0);
  const bank = inv.bank_accounts
    .filter((b) => !b.joint_account)
    .reduce((s, b) => s + (b.approx_balance_aud || 0), 0);
  const investments = inv.investments.reduce((s, i) => s + (i.approx_value_aud || 0), 0);
  const business = inv.business_interests.reduce((s, b) => s + (b.approx_value_aud || 0), 0);
  const vehicles = inv.vehicles.reduce((s, v) => s + (v.approx_value_aud || 0), 0);
  const other = inv.other_assets.reduce((s, o) => s + (o.approx_value_aud || 0), 0);

  // Super passes outside the estate unless a BDBN nominates the estate.
  const superToEstate = loadSuperInsurance()
    .super_funds.filter(superNominatesEstate)
    .reduce((s, f) => s + (f.approx_balance_aud || 0), 0);

  return property + bank + investments + business + vehicles + other + superToEstate + getDigitalAssetValue();
}

export function getTotalLiabilities(): number {
  return loadInventory().liabilities.reduce((s, l) => s + (l.outstanding_balance_aud || 0), 0);
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
  const inv = loadInventory();
  const incomeAssets =
    inv.investments.length > 0 || inv.real_property.length > 0 || inv.business_interests.length > 0;
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
