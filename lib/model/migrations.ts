// One-time migrations populating the MetaLaw model from the existing slices.
// Idempotent (localStorage flag), mirroring migrateEstateAssetsV1. NON-destructive
// in M1: legacy `estate_assets`/`liabilities` are left in place so the current
// asset UI keeps working until the flows are migrated (M3); the inventory is a
// derived copy used by the new computations.

import {
  loadWill,
  saveWill,
  loadProfile,
  saveProfile,
  loadBeneficiaries,
  saveBeneficiaries,
  isChildRelationship,
  type Beneficiary,
} from "@/lib/store";
import { templateToDoc } from "./will";

// StoredWill.template (Partial<WillTemplate>) → StoredWill.doc (Part B model).
// Best-effort; builder-source wills are left for a later milestone.
export function migrateWillModelV1(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("will_model_v1") === "1") return;

  const will = loadWill();
  if (!will.doc && will.source !== "builder" && will.template) {
    saveWill({ doc: templateToDoc(will.template, loadBeneficiaries()) });
  }

  localStorage.setItem("will_model_v1", "1");
}

// profile.children + profile.spouseName → first-class People entries, so family
// members can be assigned gifts/legacies and the guardian rule reads them from
// People. Idempotent; leaves marital status on the profile.
export function migrateFamilyToPeopleV1(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("family_to_people_v1") === "1") return;

  const profile = loadProfile();
  const people = loadBeneficiaries();
  const additions: Beneficiary[] = [];

  // Children → People (relationship "child", carry DOB for the guardian rule).
  (profile.children ?? []).forEach((c) => {
    if (!c.name?.trim()) return;
    const exists = people.some((p) => isChildRelationship(p.relationship) && p.name === c.name);
    if (exists) return;
    additions.push({
      id: `person-child-${c.id}`,
      name: c.name,
      email: "",
      role: "beneficiary",
      status: "draft",
      relationship: "child",
      dateOfBirth: c.dateOfBirth,
    });
  });

  // Spouse → People (relationship "spouse"), if named and not already present.
  if (profile.spouseName?.trim()) {
    const exists = people.some(
      (p) => (p.relationship || "").toLowerCase() === "spouse" || p.name === profile.spouseName
    );
    if (!exists) {
      additions.push({
        id: `person-spouse-${Date.now()}`,
        name: profile.spouseName,
        email: "",
        role: "beneficiary",
        status: "draft",
        relationship: "spouse",
      });
    }
  }

  if (additions.length > 0) saveBeneficiaries([...people, ...additions]);
  // Family now lives in People; drop the profile copy of children.
  if (profile.children) saveProfile({ children: [] });
  localStorage.setItem("family_to_people_v1", "1");
}

export function runModelMigrations(): void {
  migrateWillModelV1();
  migrateFamilyToPeopleV1();
}
