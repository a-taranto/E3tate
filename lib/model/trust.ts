// Schedule 3 — Testamentary Trust Provisions (optional will addendum).
// Field IDs mirror `04_schedule3_testamentary_trust_provisions.md`. When
// enabled, the M2 generator inserts these clauses between Part B Clause 7 and
// Clause 11. The recommendation logic lives in computations.ts.

import { readRaw, writeRaw } from "@/lib/store";

export type TrusteeOption = "A_primary_sole" | "B_primary_plus_co";
export type ChecklistStatus = "pending" | "in_progress" | "done";

export interface TrustChecklistItem {
  step: number;
  description: string;
  status: ChecklistStatus;
  completed_at?: string;
}

export interface TestamentaryTrust {
  enabled: boolean;
  acknowledged_warning: boolean; // must be true before enabling (forced warning)
  surname?: string;
  trust_name_override?: string;
  election_window_months: number; // source kit default 24
  initial_trustee_option?: TrusteeOption;
  co_trustee_name?: string; // required iff option B
  executor_checklist: TrustChecklistItem[];
  updated_at?: string;
}

// On-death implementation steps (Schedule 3 executor checklist).
export const TRUST_CHECKLIST_STEPS: string[] = [
  "Obtain a Grant of Probate for the estate.",
  "Consult a solicitor to prepare a Testamentary Trust Deed implementing these provisions.",
  "Apply for a Tax File Number and ABN for the Trust.",
  "Open a separate bank account in the name of the Trustee of the Trust.",
  "Transfer the relevant estate assets into the Trust.",
  "Register the Trust with the ATO.",
  "Engage an accountant to advise on income tax, CGT, and land tax implications.",
  "Note CGT on transfer (generally a 2-year exemption for estate assets) — seek tax advice.",
  "Prepare annual Trust tax returns (the Trust is a separate taxpayer).",
];

const KEY = "testamentary_trust";

function defaultChecklist(): TrustChecklistItem[] {
  return TRUST_CHECKLIST_STEPS.map((description, i) => ({ step: i + 1, description, status: "pending" }));
}

const EMPTY: TestamentaryTrust = {
  enabled: false,
  acknowledged_warning: false,
  election_window_months: 24,
  executor_checklist: defaultChecklist(),
};

export function loadTrust(): TestamentaryTrust {
  if (typeof window === "undefined") return { ...EMPTY, executor_checklist: defaultChecklist() };
  const raw = readRaw<TestamentaryTrust>(KEY);
  if (!raw) return { ...EMPTY, executor_checklist: defaultChecklist() };
  return {
    ...EMPTY,
    ...raw,
    executor_checklist: raw.executor_checklist?.length ? raw.executor_checklist : defaultChecklist(),
  };
}

export function saveTrust(patch: Partial<TestamentaryTrust>): TestamentaryTrust {
  const next = { ...loadTrust(), ...patch, updated_at: new Date().toISOString() };
  writeRaw(KEY, next);
  return next;
}
