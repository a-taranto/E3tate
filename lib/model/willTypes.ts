// Part B — Last Will and Testament. Will-SPECIFIC choices only; identity
// (testator.*) comes from Profile and people from the Beneficiaries slice, both
// resolved at render time. Field shapes mirror
// `01_partB_last_will_and_testament_template.md`. Pure types (no runtime
// imports) so store.ts can reference WillDocument without an import cycle.

// A person named in the will. Prefer linking to a stored person by id; the
// name/address are what the document renders.
export interface WillPersonRef {
  personId?: string;
  full_name: string;
  residential_address?: string;
  relationship?: string;
}

export interface WillExecutors {
  primary?: WillPersonRef;
  substitute_1?: WillPersonRef;
  substitute_2_enabled?: boolean;
  substitute_2?: WillPersonRef;
  co_executors_act_jointly?: boolean; // default true
}

export interface WillGuardians {
  primary?: WillPersonRef;
  substitute?: WillPersonRef;
}

export interface SpecificGift {
  id: string;
  asset_description: string;
  beneficiary_full_name: string;
  relationship?: string;
  lapses_to_residue?: boolean; // default true
  substitute_beneficiary?: string;
  assetId?: string; // link to an inventory item (ademption check)
  beneficiaryId?: string;
}

export interface CashLegacy {
  id: string;
  amount_aud: number;
  recipient_full_name: string;
  relationship?: string;
  is_charity?: boolean;
  abn?: string;
}

export interface ResiduaryOptionA {
  spouse?: WillPersonRef;
  spouse_relationship?: "spouse" | "de_facto_partner" | "civil_partner";
  children_vesting_age?: number; // 18–30
  stirpital_substitution?: boolean; // default true
}

export interface ResiduaryShare {
  id: string;
  beneficiary_full_name: string;
  relationship?: string;
  share_percent: number;
  beneficiaryId?: string;
}

export interface WillResiduary {
  option?: "A" | "B";
  optionA?: ResiduaryOptionA;
  optionB?: { shares: ResiduaryShare[] };
}

export interface WillInvestments {
  includes_share_portfolio?: boolean;
  includes_private_company?: boolean;
  includes_investment_property?: boolean;
  includes_loans_receivable?: boolean;
  forgive_debt?: { enabled?: boolean; debtor_name?: string; amount_aud?: number };
  superannuation_bdbn_status?: "in_place" | "intend_to_make";
}

export interface WillFamilyHome {
  address?: string;
  folio_identifier?: string;
  beneficiary_full_name?: string;
  title_type?: "sole" | "tenants_in_common" | "joint_tenants";
}

export interface WillFuneral {
  disposition?: "buried" | "cremated" | "no_preference";
  preferred_location?: string;
  religious_or_cultural?: string;
  other_wishes?: string;
}

export interface WillWitness {
  full_name?: string;
  address?: string;
  occupation?: string;
  date_signed?: string;
}

export interface WillExecution {
  date?: string;
  city_suburb?: string;
  witness_1?: WillWitness;
  witness_2?: WillWitness;
}

export interface WillDocument {
  has_minor_children?: boolean;
  executors?: WillExecutors;
  guardians?: WillGuardians;
  specific_gifts?: SpecificGift[];
  cash_legacies?: CashLegacy[];
  residuary?: WillResiduary;
  investments?: WillInvestments;
  family_home?: WillFamilyHome;
  funeral?: WillFuneral;
  execution?: WillExecution;
}

// Part B Clause 11 — General Provisions (read-only constants surfaced to the UI
// and the document generator in M2).
export const WILL_CONSTANTS = {
  survivorship_period_days: 30,
  governing_law: "New South Wales, Australia",
  executor_commission_authority: "s.86 Probate and Administration Act 1898 (NSW)",
  trustee_act_reference: "Trustee Act 1925 (NSW)",
} as const;
