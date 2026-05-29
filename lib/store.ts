// Single source of truth for vault records and beneficiaries.
//
// Before this module, every screen computed its own answer to "how many
// records / beneficiaries do I have" from a different localStorage key (see
// AUDIT.md §RC-A). This module owns two canonical keys — `vault_records` and
// `beneficiaries` — and a one-time migration that absorbs the legacy keys.
//
// Type vocabulary (lowercase 4 primary + 4 legacy) is intentionally preserved
// here; collapsing 6→4 is a separate concern (AUDIT.md Phase 2). This module
// only normalizes *case/shape* so every screen reads the same array.

import type { WillTemplate } from "@/types";
import type { WillDocument } from "@/lib/model/willTypes";

// ---------------------------------------------------------------------------
// Canonical types
// ---------------------------------------------------------------------------

// The 4 primary categories. Legacy 6-category types are collapsed into these on
// read and by a one-time data rewrite (see toPrimaryType / migrateCategoriesV2).
export type VaultType = "documents" | "wallets" | "credentials" | "accounts";

export type VaultScope = "full" | "executor" | "specific";

export interface VaultRecord {
  id: string;
  title: string;
  type: VaultType;
  subtype?: string;
  category?: "personal" | "business";
  source?: "profile" | "vault" | "setup";
  description?: string;
  institution?: string;
  beneficiaries: string[]; // names, IDs, or tokens like "All Beneficiaries"
  scope?: VaultScope;
  encrypted: boolean;
  profileLinked?: boolean;
  fileType?: string;
  fileSize?: string; // display string, e.g. "2.4 MB"
  createdAt: string; // ISO or display string
  lastModified: string; // display string, e.g. "2 hours ago"

  // Service-first passthrough (records created from service setup)
  serviceId?: string;
  hasCredentials?: boolean;
  wish?: {
    action: string;
    transferTo?: string;
    legacyContact?: string;
    instructions?: string;
  };
  subscription?: { cost?: string; plan?: string };

  metadata?: Record<string, any>; // also carries uploaded-file blobs: metadata.file
}

export type BeneficiaryRole =
  | "executor"
  | "beneficiary"
  | "observer"
  | "contact"
  | "trustee"
  | "guardian";
export type BeneficiaryStatus = "accepted" | "confirmed" | "pending" | "draft";

export interface Beneficiary {
  id: string;
  name: string;
  email: string;
  role: BeneficiaryRole;
  status: BeneficiaryStatus;
  relationship?: string; // "Relationship to me" — used in the will document
  residentialAddress?: string; // used in the will for executors/guardians
  invitedDate?: string;
  recordsAccess?: number;
  scopeSummary?: string;
  addedAt?: string;
}

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------

const VAULT_KEY = "vault_records";
const BENEFICIARIES_KEY = "beneficiaries";
const MIGRATION_FLAG = "store_migrated_v1";
const CATEGORIES_V2_FLAG = "store_cat_v2";

// Legacy keys absorbed then deleted by the migration.
const LEGACY_VAULT_KEYS = [
  "profileAssets",
  "profileAccounts",
  "profileIdentities",
  "vaultCredentials",
  "uploadedDocuments",
  "vaultRecords", // a stray camelCase key referenced by the old vault delete handler
];
const LEGACY_BENEFICIARY_KEYS = [
  "beneficiariesList",
  "setup_beneficiaries",
  "pendingBeneficiaries",
];

const VALID_TYPES: VaultType[] = ["documents", "wallets", "credentials", "accounts"];

// Legacy → primary mapping. The 6→4 migration collapses every legacy type into
// one of the four primary categories — Identity folds into Documents, crypto
// Assets become Wallets, Financial logins become Credentials, Instructions
// become Documents. Applied on read (normalizeRecord) and as a one-time rewrite
// of stored data (migrateCategoriesV2).
const LEGACY_TO_PRIMARY: Record<string, VaultType> = {
  identity: "documents",
  financial: "credentials",
  assets: "wallets",
  instructions: "documents",
};

export function toPrimaryType(type: string): VaultType {
  const t = (type || "").toLowerCase();
  return LEGACY_TO_PRIMARY[t] || (VALID_TYPES.includes(t as VaultType) ? (t as VaultType) : "documents");
}

// Exported so the lib/model/* schedule slices reuse the same write-notify
// channel. (store.ts never imports lib/model/*, so there is no import cycle.)
export const dispatchUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("store-updated"));
  }
};

// ---------------------------------------------------------------------------
// Low-level read/write
// ---------------------------------------------------------------------------

export function readRaw<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// Persist + notify `store-updated` listeners. The canonical write path for the
// lib/model/* slices (mirrors what the in-file slices do inline).
export function writeRaw<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  dispatchUpdate();
}

// Whole-number age from a date string (ISO or parseable); undefined if blank/
// unparseable. Age is always derived — never stored — so it can't go stale.
export function ageFromDOB(dob?: string): number | undefined {
  if (!dob) return undefined;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

// ---------------------------------------------------------------------------
// Normalization (handles both the old types/index.ts shape and the old vault
// page shape so a single array can hold records from any source)
// ---------------------------------------------------------------------------

function bytesToDisplay(size: number): string {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / 1024).toFixed(1)} KB`;
}

function normalizeRecord(r: any): VaultRecord {
  const validType = toPrimaryType(r?.type ?? "documents");

  const fileSize =
    typeof r?.fileSize === "number" ? bytesToDisplay(r.fileSize) : r?.fileSize;

  return {
    ...r,
    id: String(r?.id ?? `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    title: r?.title ?? "Untitled record",
    type: validType,
    beneficiaries: Array.isArray(r?.beneficiaries) ? r.beneficiaries : [],
    encrypted: r?.encrypted !== false,
    fileSize,
    createdAt: r?.createdAt ? String(r.createdAt) : new Date().toISOString().split("T")[0],
    lastModified:
      r?.lastModified ?? (r?.updatedAt ? "Recently" : r?.createdAt ? String(r.createdAt) : "Recently"),
  };
}

function normalizeBeneficiary(b: any): Beneficiary {
  const role = String(b?.role ?? "beneficiary").toLowerCase();
  const validRole = (["executor", "beneficiary", "observer", "contact", "trustee", "guardian"].includes(role)
    ? role
    : "beneficiary") as BeneficiaryRole;

  const status = String(b?.status ?? "pending").toLowerCase();
  const validStatus = (["accepted", "confirmed", "pending", "draft"].includes(status)
    ? status
    : "pending") as BeneficiaryStatus;

  return {
    ...b,
    id: String(b?.id ?? `ben-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    name: b?.name ?? "Unnamed",
    email: b?.email ?? "",
    role: validRole,
    status: validStatus,
  };
}

// ---------------------------------------------------------------------------
// Public API — vault records
// ---------------------------------------------------------------------------

export function loadVaultRecords(): VaultRecord[] {
  if (typeof window === "undefined") return [];
  runStorageMigration();
  migrateCategoriesV2();
  const raw = readRaw<any[]>(VAULT_KEY);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeRecord);
}

export function saveVaultRecords(records: VaultRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VAULT_KEY, JSON.stringify(records));
  dispatchUpdate();
}

export function addVaultRecord(record: VaultRecord): VaultRecord[] {
  const updated = [...loadVaultRecords(), normalizeRecord(record)];
  saveVaultRecords(updated);
  return updated;
}

export function updateVaultRecord(id: string, patch: Partial<VaultRecord>): VaultRecord[] {
  const updated = loadVaultRecords().map((r) => (r.id === id ? { ...r, ...patch } : r));
  saveVaultRecords(updated);
  return updated;
}

export function deleteVaultRecord(id: string): VaultRecord[] {
  const updated = loadVaultRecords().filter((r) => r.id !== id);
  saveVaultRecords(updated);
  return updated;
}

// Insert or update by id (update if a record with the same id exists).
export function upsertVaultRecord(record: VaultRecord): VaultRecord[] {
  const existing = loadVaultRecords();
  const normalized = normalizeRecord(record);
  const idx = existing.findIndex((r) => r.id === normalized.id);
  const updated =
    idx >= 0
      ? existing.map((r) => (r.id === normalized.id ? { ...r, ...normalized } : r))
      : [...existing, normalized];
  saveVaultRecords(updated);
  return updated;
}

// Mirror an uploaded will into the vault so it appears and counts there. Closes
// the gap where will uploads only wrote their own `uploaded_will` key. Falls back
// to a blob-less record if storing the file data would exceed the storage quota.
export function mirrorWillToVault(will: { fileName: string; format?: string; data?: string }): void {
  if (typeof window === "undefined") return;
  const base: VaultRecord = {
    id: "uploaded-will",
    title: "Last Will and Testament",
    type: "documents",
    description: `Will document: ${will.fileName}`,
    beneficiaries: ["Executor Only"],
    scope: "executor",
    encrypted: true,
    source: "vault",
    fileType: (will.format || "file").toUpperCase(),
    createdAt: new Date().toISOString().split("T")[0],
    lastModified: "Recently",
  };
  try {
    upsertVaultRecord(
      will.data ? { ...base, metadata: { file: { name: will.fileName, data: will.data } } } : base
    );
  } catch {
    try {
      upsertVaultRecord(base);
    } catch {
      /* storage quota exceeded — skip the vault mirror */
    }
  }
}

// ---------------------------------------------------------------------------
// Public API — beneficiaries
// ---------------------------------------------------------------------------

export function loadBeneficiaries(): Beneficiary[] {
  if (typeof window === "undefined") return [];
  runStorageMigration();
  const raw = readRaw<any[]>(BENEFICIARIES_KEY);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeBeneficiary);
}

export function saveBeneficiaries(beneficiaries: Beneficiary[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BENEFICIARIES_KEY, JSON.stringify(beneficiaries));
  dispatchUpdate();
}

// ---------------------------------------------------------------------------
// Derived selectors — the numbers every screen must agree on
// ---------------------------------------------------------------------------

export interface VaultStats {
  totalRecords: number;
  primaryCategoryCount: number;
}

export function getVaultStats(): VaultStats {
  const records = loadVaultRecords();
  const primary = new Set(records.map((r) => toPrimaryType(r.type)));
  return { totalRecords: records.length, primaryCategoryCount: primary.size };
}

export interface BeneficiaryStats {
  total: number;
  executors: number;
  beneficiaries: number;
  observers: number;
  pending: number;
}

export function getBeneficiaryStats(): BeneficiaryStats {
  const b = loadBeneficiaries();
  return {
    total: b.length,
    executors: b.filter((x) => x.role === "executor").length,
    beneficiaries: b.filter((x) => x.role === "beneficiary").length,
    observers: b.filter((x) => x.role === "observer").length,
    pending: b.filter((x) => x.status === "pending").length,
  };
}

// ---------------------------------------------------------------------------
// Seed data (preserves the prototype's existing demo content, now in one place)
// ---------------------------------------------------------------------------

function seedVaultRecords(): VaultRecord[] {
  const today = new Date().toISOString().split("T")[0];
  return [
    { id: "1", title: "Primary Bank Account", type: "credentials", description: "Main checking account details", beneficiaries: ["Sarah J.", "Michael K."], scope: "full", encrypted: true, source: "vault", createdAt: "2024-01-15", lastModified: "2 hours ago" },
    { id: "2", title: "Property Deed - 123 Main St", type: "documents", description: "Original deed for primary residence", beneficiaries: ["Sarah J.", "Michael K.", "Emma L."], scope: "full", encrypted: true, source: "vault", fileType: "PDF", fileSize: "2.4 MB", createdAt: "2024-06-15", lastModified: "2 weeks ago" },
    { id: "3", title: "Birth Certificate", type: "documents", description: "Certified copy", beneficiaries: ["Executor Only"], scope: "executor", encrypted: true, source: "vault", fileType: "PDF", fileSize: "856 KB", createdAt: "2024-03-10", lastModified: "3 months ago" },
    { id: "4", title: "Marriage Certificate", type: "documents", description: "Official marriage certificate", beneficiaries: ["Sarah J."], scope: "specific", encrypted: true, source: "vault", fileType: "PDF", fileSize: "1.1 MB", createdAt: "2024-03-10", lastModified: "3 months ago" },
    { id: "5", title: "Social Security Card", type: "documents", beneficiaries: ["Executor Only"], scope: "executor", encrypted: true, source: "vault", createdAt: "2024-02-20", lastModified: "1 week ago" },
    { id: "6", title: "Investment Portfolio Access", type: "credentials", beneficiaries: ["Sarah J."], scope: "specific", encrypted: true, source: "vault", createdAt: "2024-08-05", lastModified: "5 days ago" },
    { id: "7", title: "Final Wishes & Arrangements", type: "documents", description: "End-of-life wishes, medical directives, and final messages", beneficiaries: ["All Beneficiaries"], scope: "full", encrypted: true, source: "profile", profileLinked: true, createdAt: "2024-01-01", lastModified: "1 month ago" },
    { id: "8", title: "Cryptocurrency Wallets", type: "wallets", beneficiaries: ["Sarah J."], scope: "specific", encrypted: true, source: "vault", createdAt: "2024-07-20", lastModified: "3 days ago" },
  ];
}

function seedBeneficiaries(): Beneficiary[] {
  return [
    { id: "1", name: "Sarah Johnson", email: "sarah.j@example.com", role: "executor", status: "accepted", relationship: "Spouse", invitedDate: "3 months ago", recordsAccess: 18, scopeSummary: "Full vault access + execution rights" },
    { id: "2", name: "Michael Kim", email: "michael.k@example.com", role: "executor", status: "accepted", relationship: "Brother", invitedDate: "2 months ago", recordsAccess: 18, scopeSummary: "Full vault access + execution rights" },
    { id: "3", name: "Emma Lewis", email: "emma.lewis@example.com", role: "beneficiary", status: "accepted", relationship: "Daughter", invitedDate: "1 month ago", recordsAccess: 12, scopeSummary: "Receives designated records" },
  ];
}

// ---------------------------------------------------------------------------
// Migration of legacy keys → canonical keys (one-time, idempotent)
// ---------------------------------------------------------------------------

const DOC_TYPE_LABELS: Record<string, string> = {
  will: "Last Will and Testament",
  insurance: "Life Insurance Policy",
  deeds: "Property Deed",
  birth: "Birth Certificate",
  marriage: "Marriage Certificate",
  passport: "Passport",
  military: "Military Records (DD-214)",
  other: "Other Important Document",
};

function recordsFromProfileAssets(raw: any[]): VaultRecord[] {
  const labels: Record<string, string> = { home: "Home/Property", crypto: "Cryptocurrency", car: "Vehicle", cash: "Cash Holdings" };
  return (raw || []).map((a) => ({
    id: `asset-${a.id}`,
    title: a.name,
    type: (a.type === "crypto" ? "wallets" : "documents") as VaultType,
    description: a.description || `${labels[a.type] || a.type}${a.value ? ` - Value: $${a.value}` : ""}`,
    beneficiaries: ["All Beneficiaries"],
    scope: "full" as VaultScope,
    encrypted: true,
    source: "profile" as const,
    profileLinked: true,
    createdAt: new Date().toISOString().split("T")[0],
    lastModified: "From Profile",
  }));
}

function recordsFromProfileAccounts(raw: any[]): VaultRecord[] {
  const labels: Record<string, string> = { savings: "Savings Account", checking: "Checking/Transaction Account", credit: "Credit Card", mortgage: "Mortgage Account", offset: "Offset Account", term: "Term Deposit", investment: "Investment Account" };
  return (raw || [])
    .filter((acc) => acc.type !== "digital")
    .map((acc) => {
      const typeLabel = acc.accountType ? labels[acc.accountType] || acc.accountType : acc.type;
      return {
        id: `account-${acc.id}`,
        title: acc.name,
        type: "credentials" as VaultType,
        description: `${typeLabel}${acc.institution ? ` - ${acc.institution}` : ""}${acc.accountNumber ? ` (${acc.accountNumber})` : ""}`,
        beneficiaries: ["All Beneficiaries"],
        scope: "full" as VaultScope,
        encrypted: true,
        source: "profile" as const,
        profileLinked: true,
        createdAt: new Date().toISOString().split("T")[0],
        lastModified: "From Profile",
      };
    });
}

function recordsFromVaultCredentials(raw: any[]): VaultRecord[] {
  return (raw || []).map((cred) => ({
    id: String(cred.id),
    title: cred.title,
    type: "credentials" as VaultType,
    description: `${cred.institution || cred.accountType}${cred.username ? ` - ${cred.username}` : ""}`,
    beneficiaries: ["All Beneficiaries"],
    scope: "full" as VaultScope,
    encrypted: true,
    source: "profile" as const,
    profileLinked: true,
    createdAt: cred.createdAt ? String(cred.createdAt).split("T")[0] : new Date().toISOString().split("T")[0],
    lastModified: "From Profile",
  }));
}

function recordsFromProfileIdentities(raw: any[]): VaultRecord[] {
  const labels: Record<string, string> = { ssn: "Social Security Number", license: "Driver's License", medicare: "Medicare Card", passport: "Passport" };
  return (raw || []).map((identity) => ({
    id: `identity-${identity.id}`,
    title: labels[identity.type] || identity.type,
    type: "documents" as VaultType,
    description: `Document Number: ${identity.number}${identity.expiryDate ? ` - Expires: ${identity.expiryDate}` : ""}`,
    beneficiaries: ["Executor Only"],
    scope: "executor" as VaultScope,
    encrypted: true,
    source: "profile" as const,
    profileLinked: true,
    createdAt: new Date().toISOString().split("T")[0],
    lastModified: "From Profile",
  }));
}

function recordsFromUploadedDocuments(raw: Record<string, any>): VaultRecord[] {
  const out: VaultRecord[] = [];
  Object.entries(raw || {}).forEach(([docType, fileData]: [string, any]) => {
    if (fileData && fileData.name) {
      out.push({
        id: `uploaded-${docType}`,
        title: DOC_TYPE_LABELS[docType] || docType,
        type: "documents",
        description: `Uploaded: ${fileData.name}`,
        beneficiaries: ["All Beneficiaries"],
        scope: "full",
        encrypted: true,
        source: "vault",
        fileType: fileData.type?.split("/")[1]?.toUpperCase() || "FILE",
        fileSize: typeof fileData.size === "number" ? bytesToDisplay(fileData.size) : undefined,
        createdAt: new Date().toISOString().split("T")[0],
        lastModified: "Recently",
        metadata: { file: fileData }, // base64 blob kept on the record so viewing works
      });
    }
  });
  return out;
}

export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
}

let migrationRan = false;

export function runStorageMigration(): void {
  if (typeof window === "undefined") return;
  if (migrationRan) return;
  if (localStorage.getItem(MIGRATION_FLAG) === "1") {
    migrationRan = true;
    return;
  }

  // --- Vault records ---
  const existing = (readRaw<any[]>(VAULT_KEY) || []).map(normalizeRecord);
  const migrated: VaultRecord[] = [
    ...existing,
    ...recordsFromProfileAssets(readRaw<any[]>("profileAssets") || []),
    ...recordsFromProfileAccounts(readRaw<any[]>("profileAccounts") || []),
    ...recordsFromVaultCredentials(readRaw<any[]>("vaultCredentials") || []),
    ...recordsFromProfileIdentities(readRaw<any[]>("profileIdentities") || []),
    ...recordsFromUploadedDocuments(readRaw<Record<string, any>>("uploadedDocuments") || {}),
  ];
  const vaultResult = dedupeById(migrated);
  localStorage.setItem(VAULT_KEY, JSON.stringify(vaultResult.length > 0 ? vaultResult : seedVaultRecords()));

  // --- Beneficiaries ---
  const bens: Beneficiary[] = [
    ...(readRaw<any[]>(BENEFICIARIES_KEY) || []),
    ...(readRaw<any[]>("beneficiariesList") || []),
    ...(readRaw<any[]>("setup_beneficiaries") || []),
    ...(readRaw<any[]>("pendingBeneficiaries") || []),
  ].map(normalizeBeneficiary);
  const benResult = dedupeById(bens);
  localStorage.setItem(
    BENEFICIARIES_KEY,
    JSON.stringify(benResult.length > 0 ? benResult : seedBeneficiaries())
  );

  // --- Clean up legacy keys ---
  [...LEGACY_VAULT_KEYS, ...LEGACY_BENEFICIARY_KEYS].forEach((k) => localStorage.removeItem(k));

  localStorage.setItem(MIGRATION_FLAG, "1");
  migrationRan = true;
}

let categoriesV2Ran = false;

// One-time rewrite of any legacy 6-category types already stored under
// `vault_records` into the 4 primary categories. Reads already normalize via
// toPrimaryType, so this just keeps persisted data clean for existing users.
export function migrateCategoriesV2(): void {
  if (typeof window === "undefined") return;
  if (categoriesV2Ran) return;
  if (localStorage.getItem(CATEGORIES_V2_FLAG) === "1") {
    categoriesV2Ran = true;
    return;
  }
  const raw = readRaw<any[]>(VAULT_KEY);
  if (Array.isArray(raw)) {
    const rewritten = raw.map((r) => ({ ...r, type: toPrimaryType(r?.type ?? "documents") }));
    localStorage.setItem(VAULT_KEY, JSON.stringify(rewritten));
  }
  localStorage.setItem(CATEGORIES_V2_FLAG, "1");
  categoriesV2Ran = true;
}

// ---------------------------------------------------------------------------
// App settings & execution status (shared by Settings, Triggers, Dashboard)
// ---------------------------------------------------------------------------

export type ExecutionStatus = "armed" | "disarmed";

export interface AppSettings {
  checkInFrequency: number; // days between proof-of-life check-ins
  inactivityTrigger: number; // days without check-in before release
  notifyCheckIn: boolean;
  notifyActivity: boolean;
  executionStatus: ExecutionStatus;
  triggersEnabled: Record<string, boolean>; // trigger id -> enabled
  lastCheckIn?: string; // ISO timestamp of the last proof-of-life check-in
}

const SETTINGS_KEY = "app_settings";

export const DEFAULT_SETTINGS: AppSettings = {
  checkInFrequency: 30,
  inactivityTrigger: 90,
  notifyCheckIn: true,
  notifyActivity: true,
  executionStatus: "armed",
  triggersEnabled: { "1": true, "2": true, "3": false },
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const raw = readRaw<Partial<AppSettings>>(SETTINGS_KEY);
  return {
    ...DEFAULT_SETTINGS,
    ...(raw || {}),
    triggersEnabled: { ...DEFAULT_SETTINGS.triggersEnabled, ...(raw?.triggersEnabled || {}) },
  };
}

export function saveSettings(patch: Partial<AppSettings>): AppSettings {
  const next = { ...loadSettings(), ...patch };
  if (typeof window !== "undefined") {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    dispatchUpdate();
  }
  return next;
}

export interface CheckInStatus {
  nextDate: string; // localized display date of the next required check-in
  daysRemaining: number; // negative when overdue
  overdue: boolean;
}

// Derives the next proof-of-life check-in from the last check-in + cadence.
// Treats "never checked in" as a check-in today, so a fresh user sees a full window.
export function getCheckInStatus(): CheckInStatus {
  const s = loadSettings();
  const last = s.lastCheckIn ? new Date(s.lastCheckIn) : new Date();
  const next = new Date(last);
  next.setDate(next.getDate() + s.checkInFrequency);
  const daysRemaining = Math.ceil((next.getTime() - Date.now()) / 86_400_000);
  return {
    nextDate: next.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
    daysRemaining,
    overdue: daysRemaining < 0,
  };
}

export function checkIn(): AppSettings {
  return saveSettings({ lastCheckIn: new Date().toISOString() });
}

// ---------------------------------------------------------------------------
// Liabilities — debts the executor must settle before distributing the estate.
// A new pillar (see _refs/OVERVIEW.md §1.2). Stored under its own key.
// ---------------------------------------------------------------------------

export type LiabilityKind = "mortgage" | "loan" | "credit-card" | "tax" | "other";

export interface EstateLiability {
  id: string;
  kind: LiabilityKind;
  name: string;
  lender?: string;
  balance?: number; // current outstanding balance, in dollars
  notes?: string;
}

const LIABILITIES_KEY = "liabilities";

function seedLiabilities(): EstateLiability[] {
  return [
    { id: "1", kind: "mortgage", name: "Home Mortgage", lender: "Commonwealth Bank", balance: 420000 },
    { id: "2", kind: "credit-card", name: "Visa Credit Card", lender: "Westpac", balance: 3200 },
  ];
}

export function loadLiabilities(): EstateLiability[] {
  if (typeof window === "undefined") return [];
  const raw = readRaw<EstateLiability[]>(LIABILITIES_KEY);
  if (!Array.isArray(raw)) {
    const seed = seedLiabilities();
    localStorage.setItem(LIABILITIES_KEY, JSON.stringify(seed));
    return seed;
  }
  return raw;
}

export function saveLiabilities(items: EstateLiability[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LIABILITIES_KEY, JSON.stringify(items));
  dispatchUpdate();
}

export function addLiability(item: EstateLiability): EstateLiability[] {
  const updated = [...loadLiabilities(), item];
  saveLiabilities(updated);
  return updated;
}

export function deleteLiability(id: string): EstateLiability[] {
  const updated = loadLiabilities().filter((l) => l.id !== id);
  saveLiabilities(updated);
  return updated;
}

export function getTotalLiabilities(): number {
  return loadLiabilities().reduce((sum, l) => sum + (l.balance || 0), 0);
}

// ---------------------------------------------------------------------------
// Estate assets — the value/ownership inventory (Phase A2).
//
// A different concern from the vault: the vault answers "where is it / how do
// I get in" (documents, wallets, credentials, accounts); an EstateAsset answers
// "what is it worth / who inherits it". The two live ALONGSIDE each other —
// where an asset has custody material already in the vault (a crypto wallet's
// seed phrase, a bank login), link to it via `vaultRecordId` rather than
// duplicating. Net estate (A3) = Σ asset values − Σ liabilities.
// ---------------------------------------------------------------------------

export type EstateAssetType =
  | "real-property"
  | "vehicle"
  | "personal-effect"
  | "bank"
  | "shares"
  | "super"
  | "business"
  | "ip"
  | "debt-owed"
  | "safe-contents"
  | "digital"
  | "other";

export interface EstateAsset {
  id: string;
  type: EstateAssetType;
  title: string;
  description?: string;
  estimatedValue?: number; // dollar value, used for net-estate totals
  institution?: string; // bank / fund / registry, where relevant
  beneficiaryIds: string[]; // who inherits (Phase B will formalize gifts)
  beneficiaryShares?: Record<string, number>; // beneficiaryId → % share of this asset
  vaultRecordId?: string; // link to the vault record holding access/custody
  source?: "setup" | "manual";
  createdAt?: string; // ISO
  lastModified?: string; // ISO
}

const ASSETS_KEY = "estate_assets";
const ASSETS_MIGRATION_FLAG = "estate_assets_migrated_v1";

// Map the legacy ad-hoc asset types (from the my-estate wizard) onto the
// first-class union. Crypto becomes a `digital` asset — and is the canonical
// case for linking to a vault `wallets` record via `vaultRecordId`.
function mapLegacyAssetType(t: unknown): EstateAssetType {
  switch (t) {
    case "property":
      return "real-property";
    case "vehicle":
      return "vehicle";
    case "bank":
      return "bank";
    case "super":
      return "super";
    case "crypto":
      return "digital";
    default:
      return "other";
  }
}

// Legacy `estimatedValue` was free text ("$500,000", "1.5 BTC"). Pull out the
// numeric part so net estate can sum it; non-numeric/crypto-unit entries become
// undefined (the user can set a dollar figure in the typed form).
function parseAssetValue(v: unknown): number | undefined {
  if (typeof v === "number") return isFinite(v) ? v : undefined;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.]/g, ""));
    return isNaN(n) ? undefined : n;
  }
  return undefined;
}

function mapLegacyAsset(a: any): EstateAsset {
  return {
    id: String(a?.id ?? `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    type: mapLegacyAssetType(a?.type),
    title: a?.title ?? "Untitled asset",
    description: a?.description,
    estimatedValue: parseAssetValue(a?.estimatedValue),
    beneficiaryIds: Array.isArray(a?.beneficiaryIds) ? a.beneficiaryIds : [],
    source: "setup",
  };
}

function seedAssets(): EstateAsset[] {
  return [
    { id: "1", type: "real-property", title: "Family Home", estimatedValue: 850000, beneficiaryIds: [], source: "setup" },
    { id: "2", type: "bank", title: "ANZ Everyday Savings", institution: "ANZ", estimatedValue: 45000, beneficiaryIds: [], source: "setup" },
    { id: "3", type: "super", title: "AustralianSuper", institution: "AustralianSuper", estimatedValue: 185000, beneficiaryIds: [], source: "setup" },
    { id: "4", type: "vehicle", title: "Toyota Camry", estimatedValue: 28000, beneficiaryIds: [], source: "setup" },
  ];
}

let assetsMigrationRan = false;

// One-time absorb of the legacy `setup_assets` key (the ad-hoc, string-valued
// shape the my-estate wizard wrote before assets were first-class) into the
// typed `estate_assets` slice. Idempotent; runs on first read and at boot.
export function migrateEstateAssetsV1(): void {
  if (typeof window === "undefined") return;
  if (assetsMigrationRan) return;
  if (localStorage.getItem(ASSETS_MIGRATION_FLAG) === "1") {
    assetsMigrationRan = true;
    return;
  }
  const legacy = readRaw<any[]>("setup_assets");
  if (Array.isArray(legacy) && legacy.length > 0 && !readRaw<any[]>(ASSETS_KEY)) {
    const migrated = dedupeById(legacy.map(mapLegacyAsset));
    localStorage.setItem(ASSETS_KEY, JSON.stringify(migrated));
  }
  localStorage.removeItem("setup_assets");
  localStorage.setItem(ASSETS_MIGRATION_FLAG, "1");
  assetsMigrationRan = true;
}

export function loadAssets(): EstateAsset[] {
  if (typeof window === "undefined") return [];
  migrateEstateAssetsV1();
  const raw = readRaw<EstateAsset[]>(ASSETS_KEY);
  if (!Array.isArray(raw)) {
    const seed = seedAssets();
    localStorage.setItem(ASSETS_KEY, JSON.stringify(seed));
    return seed;
  }
  return raw;
}

export function saveAssets(items: EstateAsset[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ASSETS_KEY, JSON.stringify(items));
  dispatchUpdate();
}

export function addAsset(item: EstateAsset): EstateAsset[] {
  const now = new Date().toISOString();
  const updated = [...loadAssets(), { ...item, createdAt: item.createdAt ?? now, lastModified: now }];
  saveAssets(updated);
  return updated;
}

export function updateAsset(id: string, patch: Partial<EstateAsset>): EstateAsset[] {
  const updated = loadAssets().map((a) =>
    a.id === id ? { ...a, ...patch, lastModified: new Date().toISOString() } : a
  );
  saveAssets(updated);
  return updated;
}

export function deleteAsset(id: string): EstateAsset[] {
  const updated = loadAssets().filter((a) => a.id !== id);
  saveAssets(updated);
  return updated;
}

export function getTotalAssets(): number {
  return loadAssets().reduce((sum, a) => sum + (a.estimatedValue || 0), 0);
}

// ---------------------------------------------------------------------------
// Net estate (Phase A3) — the headline figure: what's left for beneficiaries
// after the executor settles debts. Σ assets − Σ liabilities.
// ---------------------------------------------------------------------------

export interface EstateSummary {
  totalAssets: number;
  totalLiabilities: number;
  netEstate: number;
}

export function getEstateSummary(): EstateSummary {
  const totalAssets = getTotalAssets();
  const totalLiabilities = getTotalLiabilities();
  return { totalAssets, totalLiabilities, netEstate: totalAssets - totalLiabilities };
}

// ---------------------------------------------------------------------------
// Profile — the person behind the estate (name, DOB, address, marital status).
// Entered once in setup (my-estate/about) and reused by the will wizard and the
// Profile page. Canonical key stays `setup_personal_info` so the Sidebar and the
// existing setup screen keep reading the same record (no migration needed).
// ---------------------------------------------------------------------------

export interface Dependent {
  id: string;
  name: string;
  dateOfBirth?: string; // ISO; age is derived via ageFromDOB, never stored
}

// The testator record (MetaLaw Part B `testator.*`). Single source for identity
// across setup, the Profile page, the will document, and the sidebar.
export interface Profile {
  fullName?: string;
  dateOfBirth?: string;
  address?: string;
  maritalStatus?: "single" | "married" | "divorced" | "widowed" | "";
  spouseName?: string;
  occupation?: string; // Part B testator.occupation
  hasPriorWill?: boolean; // testator.has_prior_will → revocation warning
  contemplatedMarriage?: boolean; // testator.contemplated_marriage → s.12 language
  children?: Dependent[]; // drives the guardian requirement (Part B Clause 4)
}

const PROFILE_KEY = "setup_personal_info";

export function loadProfile(): Profile {
  if (typeof window === "undefined") return {};
  return readRaw<Profile>(PROFILE_KEY) || {};
}

export function saveProfile(patch: Partial<Profile>): Profile {
  const next = { ...loadProfile(), ...patch };
  if (typeof window !== "undefined") {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    dispatchUpdate();
  }
  return next;
}

// Children under 18 — drives the guardian requirement (Part B Clause 4 /
// validation `guardian_conditional`).
export function getMinorChildren(): Dependent[] {
  return (loadProfile().children ?? []).filter((c) => {
    const age = ageFromDOB(c.dateOfBirth);
    return age !== undefined && age < 18;
  });
}

// ---------------------------------------------------------------------------
// Will — one canonical record reconciling three legacy flows that never agreed
// (AUDIT P1-16): `uploaded_will` (upload), `will_template` (template wizard),
// and `will-current-draft-id`/`will-draft-*` (the builder). Every reader — the
// readiness score, the Will page, the dashboard — asks getWillStatus()/hasWill()
// here; each writer (upload, template, builder) populates this one record.
// ---------------------------------------------------------------------------

export type WillStatus = "none" | "draft" | "generated" | "uploaded";
export type WillSource = "template" | "upload" | "builder";

export interface StoredWill {
  status: WillStatus;
  source?: WillSource;
  updatedAt: string; // ISO
  // template-generated wills (app/will/create) — legacy shape, kept until the
  // will UI is migrated to `doc` in a later milestone.
  template?: Partial<WillTemplate>;
  // Part B model (MetaLaw NSW). Canonical will-choices going forward; populated
  // by migrateWillModelV1 from `template`.
  doc?: WillDocument;
  generatedAt?: string;
  // uploaded wills (app/will upload)
  fileName?: string;
  format?: string;
  data?: string; // base64 data URL, for download
  physicalLocation?: string;
  uploadedAt?: string;
  // builder drafts (app/will/builder) — rich WillData stays under will-draft-{id}
  draftId?: string;
}

const WILL_KEY = "will";
const WILL_MIGRATION_FLAG = "will_migrated_v1";
const NO_WILL: StoredWill = { status: "none", updatedAt: "" };

let willMigrationRan = false;

// Idempotent one-time fold of the three legacy will keys into `will`.
export function migrateWillV1(): void {
  if (typeof window === "undefined") return;
  if (willMigrationRan) return;
  if (localStorage.getItem(WILL_MIGRATION_FLAG) === "1") {
    willMigrationRan = true;
    return;
  }
  if (!readRaw<StoredWill>(WILL_KEY)) {
    const uploaded = readRaw<any>("uploaded_will");
    const template = readRaw<any>("will_template");
    const draftId = readRaw<string>("will-current-draft-id");
    let record: StoredWill | null = null;
    if (uploaded) {
      record = {
        status: "uploaded",
        source: "upload",
        updatedAt: uploaded.uploadedAt || new Date().toISOString(),
        fileName: uploaded.fileName,
        format: uploaded.format,
        data: uploaded.data,
        physicalLocation: uploaded.physicalLocation,
        uploadedAt: uploaded.uploadedAt,
      };
    } else if (template) {
      record = {
        status: template.status === "generated" ? "generated" : "draft",
        source: "template",
        updatedAt: template.lastModified || new Date().toISOString(),
        template,
        generatedAt: template.generatedAt,
      };
    } else if (draftId) {
      record = { status: "draft", source: "builder", updatedAt: new Date().toISOString(), draftId };
    }
    if (record) localStorage.setItem(WILL_KEY, JSON.stringify(record));
  }
  // template/upload keys are fully absorbed; the builder keeps its own working
  // draft under will-draft-* so we leave those in place.
  localStorage.removeItem("uploaded_will");
  localStorage.removeItem("will_template");
  localStorage.setItem(WILL_MIGRATION_FLAG, "1");
  willMigrationRan = true;
}

export function loadWill(): StoredWill {
  if (typeof window === "undefined") return NO_WILL;
  migrateWillV1();
  const raw = readRaw<StoredWill>(WILL_KEY);
  return raw && raw.status ? raw : NO_WILL;
}

export function saveWill(patch: Partial<StoredWill>): StoredWill {
  const next: StoredWill = { ...loadWill(), ...patch, updatedAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    localStorage.setItem(WILL_KEY, JSON.stringify(next));
    dispatchUpdate();
  }
  return next;
}

export function clearWill(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WILL_KEY, JSON.stringify(NO_WILL));
  dispatchUpdate();
}

export function getWillStatus(): WillStatus {
  return loadWill().status;
}

// A *completed* will (generated or uploaded) — a draft in progress doesn't yet
// count toward readiness.
export function hasWill(): boolean {
  const s = loadWill().status;
  return s === "generated" || s === "uploaded";
}
