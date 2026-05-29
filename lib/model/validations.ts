// Will validation + the dynamic requirements engine.
// Encodes the MetaLaw Part B `validations:` block as pure functions over the
// store, and builds the conditional requirements list that the readiness score
// + stepper consume (wired into the UI in a later milestone).

import { loadWill, loadProfile, getMinorChildren, ageFromDOB, loadBeneficiaries } from "@/lib/store";

export interface ValidationResult {
  id: string;
  ok: boolean;
  severity: "error" | "warning";
  message: string;
}

export function validateWill(): ValidationResult[] {
  const results: ValidationResult[] = [];
  const will = loadWill();
  const doc = will.doc ?? {};
  const profile = loadProfile();
  const people = loadBeneficiaries();

  // testator_age — ≥ 18 (s.5 exceptions aside)
  const age = ageFromDOB(profile.dateOfBirth);
  results.push({
    id: "testator_age",
    ok: age === undefined || age >= 18,
    severity: "error",
    message: "The testator must be at least 18 years old.",
  });

  // residuary_b_total — Option B shares must total 100%
  const res = doc.residuary;
  if (res?.option === "B") {
    const total = (res.optionB?.shares ?? []).reduce((s, x) => s + (x.share_percent || 0), 0);
    results.push({
      id: "residuary_b_total",
      ok: Math.round(total) === 100,
      severity: "error",
      message: `Residuary shares must total 100% (currently ${total}%).`,
    });
  }

  // vesting_age_range — Option A children vesting age 18–30
  if (res?.option === "A" && res.optionA?.children_vesting_age !== undefined) {
    const v = res.optionA.children_vesting_age;
    results.push({
      id: "vesting_age_range",
      ok: v >= 18 && v <= 30,
      severity: "error",
      message: "Children's vesting age must be between 18 and 30.",
    });
  }

  // guardian_conditional — minor children ⇒ a guardian is required
  if (getMinorChildren().length > 0) {
    const hasGuardian =
      people.some((p) => p.role === "guardian") || !!doc.guardians?.primary?.full_name;
    results.push({
      id: "guardian_conditional",
      ok: hasGuardian,
      severity: "error",
      message: "You have minor children — appoint a Guardian (Part B Clause 4).",
    });
  }

  // substitute_executor_required — strongly recommended
  results.push({
    id: "substitute_executor_required",
    ok: !!doc.executors?.substitute_1?.full_name,
    severity: "warning",
    message: "A substitute executor is strongly recommended.",
  });

  // witnesses_not_beneficiaries — a witness can't be a beneficiary
  const beneficiaryNames = new Set(
    people.filter((p) => p.role === "beneficiary").map((p) => p.name.trim().toLowerCase())
  );
  const w1 = doc.execution?.witness_1?.full_name?.trim().toLowerCase();
  const w2 = doc.execution?.witness_2?.full_name?.trim().toLowerCase();
  results.push({
    id: "witnesses_not_beneficiaries",
    ok: !(w1 && beneficiaryNames.has(w1)) && !(w2 && beneficiaryNames.has(w2)),
    severity: "error",
    message: "A witness must not be a beneficiary (or a beneficiary's spouse/partner).",
  });

  // forgive_debt_completeness
  const fd = doc.investments?.forgive_debt;
  if (fd?.enabled) {
    results.push({
      id: "forgive_debt_completeness",
      ok: !!fd.debtor_name && !!fd.amount_aud,
      severity: "error",
      message: "Forgiving a debt requires a debtor name and amount.",
    });
  }

  return results;
}

// A single unmet error blocks a valid will.
export function willErrors(): ValidationResult[] {
  return validateWill().filter((r) => !r.ok && r.severity === "error");
}

// The dynamic requirements list — base requirements plus conditional ones (e.g.
// a Guardian when there are minor children). Drives the readiness score and the
// stepper once wired in M3. `label` doubles as the deep-link key; `route` is the
// fix page.
export interface Requirement {
  id: string;
  label: string;
  required: boolean;
  satisfied: boolean;
  route: string;
  weight: number;
}

export function buildRequirements(): Requirement[] {
  const will = loadWill();
  const people = loadBeneficiaries();
  const reqs: Requirement[] = [
    {
      id: "will",
      label: "Will created or uploaded",
      required: true,
      satisfied: will.status === "generated" || will.status === "uploaded",
      route: "/will",
      weight: 25,
    },
    {
      id: "executor",
      label: "Executor appointed",
      required: true,
      satisfied: people.some((p) => p.role === "executor"),
      route: "/people",
      weight: 20,
    },
    {
      id: "beneficiaries",
      label: "Beneficiaries added",
      required: true,
      satisfied: people.some((p) => p.role === "beneficiary"),
      route: "/people",
      weight: 15,
    },
  ];

  if (getMinorChildren().length > 0) {
    reqs.push({
      id: "guardian",
      label: "Guardian appointed",
      required: true,
      satisfied: people.some((p) => p.role === "guardian") || !!will.doc?.guardians?.primary?.full_name,
      route: "/people",
      weight: 15,
    });
  }

  return reqs;
}
