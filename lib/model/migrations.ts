// One-time migrations populating the MetaLaw model from the existing slices.
// Idempotent (localStorage flag), mirroring migrateEstateAssetsV1. NON-destructive
// in M1: legacy `estate_assets`/`liabilities` are left in place so the current
// asset UI keeps working until the flows are migrated (M3); the inventory is a
// derived copy used by the new computations.

import {
  loadAssets,
  loadLiabilities,
  loadWill,
  saveWill,
  loadBeneficiaries,
  type EstateAsset,
  type LiabilityKind,
} from "@/lib/store";
import { loadInventory, saveInventory, type EstateInventory, type LiabilityNature } from "./inventory";
import { loadSuperInsurance, saveSuperInsurance } from "./superInsurance";
import { loadDigitalRegister, saveDigitalRegister } from "./digitalRegister";
import { templateToDoc } from "./will";

const uid = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const NATURE_BY_KIND: Record<LiabilityKind, LiabilityNature> = {
  mortgage: "home_loan",
  loan: "personal_loan",
  "credit-card": "credit_card",
  tax: "tax",
  other: "other",
};

// estate_assets + liabilities → Schedule 1 inventory (super → Schedule 2,
// digital → Schedule 4). Gift assignments (beneficiaryIds) stay on the legacy
// records and are re-captured as will specific-gifts later.
export function migrateInventoryV1(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("estate_inventory_v1") === "1") return;

  const assets = loadAssets(); // seeds demo data if absent
  const liabilities = loadLiabilities();
  const inv: EstateInventory = loadInventory();
  const sup = loadSuperInsurance();
  const dig = loadDigitalRegister();

  const val = (a: EstateAsset) => a.estimatedValue || 0;

  assets.forEach((a) => {
    switch (a.type) {
      case "real-property":
        inv.real_property.push({ id: uid("rp"), property_address: a.title, title_type: "sole", estimated_value_aud: val(a), mortgage_balance_aud: 0 });
        break;
      case "bank":
        inv.bank_accounts.push({ id: uid("ba"), institution: a.institution || a.title, account_type: "savings", approx_balance_aud: val(a) });
        break;
      case "shares":
        inv.investments.push({ id: uid("inv"), asset_description: a.title, platform_broker: a.institution, approx_value_aud: val(a) });
        break;
      case "business":
        inv.business_interests.push({ id: uid("bi"), name: a.title, approx_value_aud: val(a) });
        break;
      case "vehicle":
        inv.vehicles.push({ id: uid("veh"), make_model_year: a.title, approx_value_aud: val(a) });
        break;
      case "super":
        sup.super_funds.push({ id: uid("sf"), fund_name: a.title, fund_type: "industry", bdbn_in_place: "no", approx_balance_aud: val(a) });
        break;
      case "digital":
        dig.other.push({ id: uid("do"), asset_description: a.title, approx_value_aud: val(a), category: "other" });
        break;
      default: // personal-effect / ip / debt-owed / safe-contents / other
        inv.other_assets.push({ id: uid("oa"), description: a.title, location_details: a.description, approx_value_aud: val(a), asset_class: "other" });
    }
  });

  liabilities.forEach((l) => {
    inv.liabilities.push({
      id: uid("li"),
      creditor: l.lender || l.name,
      nature_of_debt: NATURE_BY_KIND[l.kind] ?? "other",
      account_reference: undefined,
      outstanding_balance_aud: l.balance || 0,
    });
  });

  saveInventory(inv);
  if (sup.super_funds.length) saveSuperInsurance(sup);
  if (dig.other.length) saveDigitalRegister(dig);
  localStorage.setItem("estate_inventory_v1", "1");
}

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

export function runModelMigrations(): void {
  migrateInventoryV1();
  migrateWillModelV1();
}
