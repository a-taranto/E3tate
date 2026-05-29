// Schedule 2 — Superannuation and Life Insurance Summary.
// Canonical source for super funds (BDBN status) and life insurance. Field IDs
// mirror `03_schedule2_superannuation_and_insurance_summary.md`. These assets
// pass OUTSIDE the estate (BDBN / named beneficiary), so net-estate excludes
// them unless a BDBN nominates the estate.

import { readRaw, writeRaw } from "@/lib/store";

export type BdbnStatus = "yes" | "no" | "non_lapsing";
export type SuperFundType = "retail" | "industry" | "corporate" | "public_sector" | "smsf";

export interface SuperFundItem {
  id: string;
  fund_name: string;
  fund_abn?: string;
  member_number?: string;
  contact_number?: string;
  fund_type: SuperFundType;
  bdbn_in_place: BdbnStatus;
  bdbn_expiry_date?: string; // required iff bdbn_in_place === "yes"
  bdbn_beneficiaries?: string;
  bdbn_proportions?: string; // free text e.g. "50% estate, 50% spouse"
  approx_balance_aud: number;
  insurance_inside_super?: boolean;
}

export type InsuranceType =
  | "term_life"
  | "tpd"
  | "trauma"
  | "income_protection"
  | "whole_of_life"
  | "other";

export interface LifeInsuranceItem {
  id: string;
  insurer: string;
  policy_no?: string;
  type: InsuranceType;
  sum_insured_aud: number;
  beneficiary?: string; // if "estate", proceeds form part of the estate
  expiry_review_date?: string;
}

export type ReviewStatus = "ok" | "action_required" | "not_applicable";

export interface AnnualReviewItem {
  key: string;
  label: string;
  status: ReviewStatus;
  date_reviewed?: string;
  action_required?: string;
}

// Fixed checklist (Schedule 2 §C).
export const ANNUAL_REVIEW_ITEMS: { key: string; label: string }[] = [
  { key: "will_current", label: "Will is current and reflects my wishes" },
  { key: "bdbn_current", label: "BDBN(s) are current (not expired)" },
  { key: "beneficiaries_alive", label: "Named beneficiaries are still alive and correct" },
  { key: "life_insurance_adequate", label: "Life insurance cover is adequate and beneficiaries current" },
  { key: "schedule1_updated", label: "Asset and Liability Inventory (Schedule 1) updated" },
  { key: "schedule4_updated", label: "Digital Assets Register (Schedule 4) updated" },
  { key: "executor_contacts_current", label: "Executor and trustee contact details current" },
  { key: "epoa_current", label: "Enduring Power of Attorney current and registered" },
  { key: "new_assets_addressed", label: "New assets acquired and dealt with in Will" },
  { key: "family_structure_changes", label: "Changes to family structure (marriage/divorce/birth/death)" },
];

export interface SuperInsurance {
  super_funds: SuperFundItem[];
  life_insurance_external: LifeInsuranceItem[];
  annual_review: AnnualReviewItem[];
  review_completed_at?: string;
  updated_at?: string;
}

const KEY = "super_insurance";

function emptyReview(): AnnualReviewItem[] {
  return ANNUAL_REVIEW_ITEMS.map((i) => ({ key: i.key, label: i.label, status: "not_applicable" }));
}

const EMPTY: SuperInsurance = {
  super_funds: [],
  life_insurance_external: [],
  annual_review: emptyReview(),
};

export function loadSuperInsurance(): SuperInsurance {
  if (typeof window === "undefined") return { ...EMPTY, annual_review: emptyReview() };
  const raw = readRaw<SuperInsurance>(KEY);
  if (!raw) return { ...EMPTY, annual_review: emptyReview() };
  return { ...EMPTY, ...raw, annual_review: raw.annual_review?.length ? raw.annual_review : emptyReview() };
}

export function saveSuperInsurance(value: SuperInsurance): void {
  writeRaw(KEY, { ...value, updated_at: new Date().toISOString() });
}

export function upsertSuperFund(item: SuperFundItem): SuperInsurance {
  const s = loadSuperInsurance();
  const funds = [...s.super_funds];
  const idx = funds.findIndex((f) => f.id === item.id);
  if (idx >= 0) funds[idx] = item;
  else funds.push(item);
  const next = { ...s, super_funds: funds };
  saveSuperInsurance(next);
  return next;
}

export function upsertLifeInsurance(item: LifeInsuranceItem): SuperInsurance {
  const s = loadSuperInsurance();
  const list = [...s.life_insurance_external];
  const idx = list.findIndex((l) => l.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.push(item);
  const next = { ...s, life_insurance_external: list };
  saveSuperInsurance(next);
  return next;
}

// True when a fund's death benefit is directed to the estate (so it DOES count
// toward the estate value). Heuristic over the free-text BDBN fields.
export function superNominatesEstate(fund: SuperFundItem): boolean {
  const hay = `${fund.bdbn_beneficiaries ?? ""} ${fund.bdbn_proportions ?? ""}`.toLowerCase();
  return hay.includes("estate");
}
