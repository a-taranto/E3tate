// Schedule 4 — Digital Assets Register.
// Field IDs mirror `05_schedule4_digital_assets_register.md`. NO secrets are
// stored here (see secretGuard); items link to the encrypted Vault by
// vaultRecordId, which is where credentials actually live. Values from crypto /
// domains-IP / other (NFTs etc.) roll into the gross-estate calculation.

import { readRaw, writeRaw } from "@/lib/store";
import { scanForSecret } from "./secretGuard";

export type TwoFAMethod = "sms" | "authenticator_app" | "hardware_key" | "email" | "none";

export interface FinancialAccountItem {
  id: string;
  platform: string;
  account_type?: string;
  username_email?: string;
  twofa_method?: TwoFAMethod;
  access_instructions_location?: string; // secret-guarded
  vaultRecordId?: string;
}

export interface CryptoItem {
  id: string;
  asset_type: string; // BTC, ETH, …
  exchange_wallet?: string;
  approx_value_aud: number; // rolls into gross estate
  seed_phrase_key_location?: string; // LOCATION ONLY — secret-guarded
  notes?: string;
  vaultRecordId?: string;
}

export interface SocialMediaItem {
  id: string;
  platform: string;
  username_profile_url?: string;
  instruction: "close" | "memorialise" | "transfer";
  authorised_person_notes?: string;
}

export interface DomainIpItem {
  id: string;
  asset: string;
  registrar_platform?: string;
  approx_value_aud: number; // rolls into gross estate
  instructions_for_executor?: string;
  renewal_date?: string;
}

export type DigitalOtherCategory =
  | "loyalty_program"
  | "digital_content"
  | "gaming"
  | "nft"
  | "cloud_storage"
  | "email"
  | "online_business"
  | "other";

export interface DigitalOtherItem {
  id: string;
  asset_description: string;
  platform_provider?: string;
  approx_value_or_points?: string; // free text (AUD or points)
  approx_value_aud?: number; // optional numeric, rolls into gross estate when present
  instructions?: string;
  category?: DigitalOtherCategory;
}

export interface PasswordManager {
  application?: string;
  email_username?: string;
  master_password_location?: string; // secret-guarded
  recovery_emergency_access?: string;
}

export interface DigitalRegister {
  financial_accounts: FinancialAccountItem[];
  crypto: CryptoItem[];
  social_media: SocialMediaItem[];
  domains_ip: DomainIpItem[];
  password_manager: PasswordManager;
  other: DigitalOtherItem[];
  metadata: { last_updated?: string; updated_by?: string };
}

const KEY = "digital_register";

const EMPTY: DigitalRegister = {
  financial_accounts: [],
  crypto: [],
  social_media: [],
  domains_ip: [],
  password_manager: {},
  other: [],
  metadata: {},
};

export function loadDigitalRegister(): DigitalRegister {
  if (typeof window === "undefined") return { ...EMPTY };
  return { ...EMPTY, ...(readRaw<DigitalRegister>(KEY) || {}) };
}

export function saveDigitalRegister(value: DigitalRegister): void {
  writeRaw(KEY, { ...value, metadata: { ...value.metadata, last_updated: new Date().toISOString() } });
}

// Sum of digital assets that count toward the estate (crypto + domains/IP +
// any `other` with a numeric value). Social media / financial-account access
// are not assets of value themselves.
export function getDigitalAssetValue(reg: DigitalRegister = loadDigitalRegister()): number {
  const crypto = reg.crypto.reduce((s, c) => s + (c.approx_value_aud || 0), 0);
  const domains = reg.domains_ip.reduce((s, d) => s + (d.approx_value_aud || 0), 0);
  const other = reg.other.reduce((s, o) => s + (o.approx_value_aud || 0), 0);
  return crypto + domains + other;
}

// Fields that must never contain a raw secret. Returns the violations so a UI
// can block save (the Vault, not the register, holds real credentials).
export function findSecretViolations(
  reg: DigitalRegister = loadDigitalRegister()
): { path: string; reason: string }[] {
  const out: { path: string; reason: string }[] = [];
  const check = (path: string, value?: string) => {
    const scan = scanForSecret(value);
    if (!scan.ok) out.push({ path, reason: scan.reason! });
  };
  reg.financial_accounts.forEach((a, i) =>
    check(`financial_accounts[${i}].access_instructions_location`, a.access_instructions_location)
  );
  reg.crypto.forEach((c, i) => check(`crypto[${i}].seed_phrase_key_location`, c.seed_phrase_key_location));
  check("password_manager.master_password_location", reg.password_manager.master_password_location);
  return out;
}
