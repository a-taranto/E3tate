// Schedule 1 — Asset and Liability Inventory.
// Field IDs mirror `02_schedule1_asset_and_liability_inventory.md` (the source
// of truth). Superannuation (§3) and life insurance (§5) are intentionally NOT
// stored here — they live in the Schedule 2 slice (super_insurance) and are
// presented as read-views, so there is a single underlying record.

import { readRaw, writeRaw } from "@/lib/store";

export type TitleType = "sole" | "joint_tenants" | "tenants_in_common";

export interface RealPropertyItem {
  id: string;
  property_address: string;
  title_type: TitleType;
  estimated_value_aud: number;
  mortgage_balance_aud: number;
}

export interface BankAccountItem {
  id: string;
  institution: string;
  account_type: "transaction" | "savings" | "term_deposit" | "offset" | "other";
  bsb?: string;
  account_number_last4?: string;
  approx_balance_aud: number;
  joint_account?: boolean;
}

export interface InvestmentItem {
  id: string;
  asset_description: string;
  platform_broker?: string;
  account_hin_number?: string;
  approx_value_aud: number;
}

export interface BusinessInterestItem {
  id: string;
  name: string;
  acn_or_abn?: string;
  nature_of_interest?: string;
  approx_value_aud: number;
  shareholders_agreement_exists?: boolean;
}

export interface VehicleItem {
  id: string;
  make_model_year: string;
  registration?: string;
  financed?: boolean;
  approx_value_aud: number;
}

export type OtherAssetClass =
  | "trust_interest"
  | "loan_receivable"
  | "collectible"
  | "jewellery"
  | "art"
  | "intellectual_property"
  | "other";

export interface OtherAssetItem {
  id: string;
  description: string;
  location_details?: string;
  approx_value_aud: number;
  asset_class?: OtherAssetClass;
}

export type LiabilityNature = "home_loan" | "credit_card" | "personal_loan" | "tax" | "other";

export interface LiabilityItem {
  id: string;
  creditor: string;
  nature_of_debt: LiabilityNature;
  account_reference?: string;
  outstanding_balance_aud: number;
  secured_against?: string; // id of a real_property / vehicle item
}

export interface KeyContactItem {
  id: string;
  role: "solicitor" | "accountant" | "financial_planner" | "gp" | "executor" | "funeral_director" | "other";
  name: string;
  firm?: string;
  phone_email?: string;
}

export interface EstateInventory {
  real_property: RealPropertyItem[];
  bank_accounts: BankAccountItem[];
  investments: InvestmentItem[];
  business_interests: BusinessInterestItem[];
  vehicles: VehicleItem[];
  other_assets: OtherAssetItem[];
  liabilities: LiabilityItem[];
  key_contacts: KeyContactItem[];
  updated_at?: string;
}

export type InventorySection = Exclude<keyof EstateInventory, "updated_at">;

const KEY = "estate_inventory";

const EMPTY: EstateInventory = {
  real_property: [],
  bank_accounts: [],
  investments: [],
  business_interests: [],
  vehicles: [],
  other_assets: [],
  liabilities: [],
  key_contacts: [],
};

export function loadInventory(): EstateInventory {
  if (typeof window === "undefined") return { ...EMPTY };
  return { ...EMPTY, ...(readRaw<EstateInventory>(KEY) || {}) };
}

export function saveInventory(inv: EstateInventory): void {
  writeRaw(KEY, { ...inv, updated_at: new Date().toISOString() });
}

type ItemOf<S extends InventorySection> = EstateInventory[S] extends (infer U)[] ? U : never;

// Add or replace (by id) an item in a section.
export function upsertInventoryItem<S extends InventorySection>(section: S, item: ItemOf<S>): EstateInventory {
  const inv = loadInventory();
  const list = [...(inv[section] as { id: string }[])];
  const idx = list.findIndex((x) => x.id === (item as { id: string }).id);
  if (idx >= 0) list[idx] = item as { id: string };
  else list.push(item as { id: string });
  const next = { ...inv, [section]: list } as EstateInventory;
  saveInventory(next);
  return next;
}

export function removeInventoryItem(section: InventorySection, id: string): EstateInventory {
  const inv = loadInventory();
  const list = (inv[section] as { id: string }[]).filter((x) => x.id !== id);
  const next = { ...inv, [section]: list } as EstateInventory;
  saveInventory(next);
  return next;
}
