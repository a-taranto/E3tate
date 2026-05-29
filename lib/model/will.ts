// Will runtime helpers: convert the legacy template shape to the Part B
// WillDocument and expose the "effective" doc (the stored doc, or a live
// conversion of the legacy template) so a will renders even if it was created
// after migrateWillModelV1 ran.

import { loadWill, saveWill, loadBeneficiaries, type Beneficiary } from "@/lib/store";
import type { WillTemplate } from "@/types";
import type { WillDocument } from "./willTypes";

const rid = () => Math.random().toString(36).slice(2, 9);

export function templateToDoc(t: Partial<WillTemplate>, people: Beneficiary[]): WillDocument {
  const nameOf = (id?: string) => (id ? people.find((p) => p.id === id)?.name : undefined);
  const relOf = (id?: string) => (id ? people.find((p) => p.id === id)?.relationship : undefined);
  const addrOf = (id?: string) => (id ? people.find((p) => p.id === id)?.residentialAddress : undefined);
  const disposition =
    t.funeralPreference === "burial" ? "buried" : t.funeralPreference === "cremation" ? "cremated" : "no_preference";

  return {
    has_minor_children: t.hasMinorChildren,
    executors: {
      primary: t.primaryExecutorId
        ? { personId: t.primaryExecutorId, full_name: nameOf(t.primaryExecutorId) || "", relationship: relOf(t.primaryExecutorId), residential_address: addrOf(t.primaryExecutorId) }
        : undefined,
      substitute_1: t.alternateExecutorId
        ? { personId: t.alternateExecutorId, full_name: nameOf(t.alternateExecutorId) || "", relationship: relOf(t.alternateExecutorId), residential_address: addrOf(t.alternateExecutorId) }
        : undefined,
      co_executors_act_jointly: true,
    },
    guardians: t.guardianName
      ? { primary: { full_name: t.guardianName, relationship: t.guardianRelationship, residential_address: t.guardianAddress } }
      : undefined,
    residuary:
      t.residuaryBeneficiaries && t.residuaryBeneficiaries.length > 0
        ? {
            option: "B",
            optionB: {
              shares: t.residuaryBeneficiaries.map((r) => ({
                id: rid(),
                beneficiaryId: r.beneficiaryId,
                beneficiary_full_name: nameOf(r.beneficiaryId) || "",
                relationship: relOf(r.beneficiaryId),
                share_percent: r.percentage,
              })),
            },
          }
        : undefined,
    funeral: { disposition, other_wishes: t.specialInstructions },
  };
}

// The will choices to render: the stored Part B doc, or a live conversion of the
// legacy template, or empty.
export function getEffectiveWillDoc(): WillDocument {
  const will = loadWill();
  if (will.doc) return will.doc;
  if (will.template) return templateToDoc(will.template, loadBeneficiaries());
  return {};
}

// Merge a patch into the stored will doc (the disposition views write here).
// Seeds doc from the effective doc so legacy-template wills aren't clobbered.
export function updateWillDoc(patch: Partial<WillDocument>): WillDocument {
  const current = getEffectiveWillDoc();
  const next = { ...current, ...patch };
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { saveWill } = require("@/lib/store") as typeof import("@/lib/store");
  saveWill({ doc: next });
  return next;
}
