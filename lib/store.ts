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

export type BeneficiaryRole = "executor" | "beneficiary" | "observer" | "contact";
export type BeneficiaryStatus = "accepted" | "confirmed" | "pending" | "draft";

export interface Beneficiary {
  id: string;
  name: string;
  email: string;
  role: BeneficiaryRole;
  status: BeneficiaryStatus;
  relationship?: string;
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

const dispatchUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("store-updated"));
  }
};

// ---------------------------------------------------------------------------
// Low-level read/write
// ---------------------------------------------------------------------------

function readRaw<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
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
  const validRole = (["executor", "beneficiary", "observer", "contact"].includes(role)
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
    description: `Uploaded will: ${will.fileName}`,
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

function dedupeById<T extends { id: string }>(items: T[]): T[] {
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
