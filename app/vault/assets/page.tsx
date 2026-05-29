"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { Card, Button } from "@/components/ui";
import {
  Home,
  Car,
  Gem,
  Building2,
  TrendingUp,
  DollarSign,
  Briefcase,
  Lightbulb,
  HandCoins,
  Vault,
  Bitcoin,
  Package,
  Umbrella,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Info,
  Link2,
} from "lucide-react";
import {
  loadAssets,
  addAsset,
  updateAsset,
  deleteAsset,
  loadBeneficiaries,
  saveBeneficiaries,
  loadVaultRecords,
  addVaultRecord,
  updateVaultRecord,
  type EstateAsset,
  type EstateAssetType,
  type Beneficiary,
  type VaultRecord,
  type VaultType,
} from "@/lib/store";
import { type FieldDef } from "@/components/digital/RegisterSection";

// The full first-class asset catalog (Phase A2). Each tile doubles as a
// quick-add affordance and as the type picker inside the form.
const ASSET_TYPES: {
  type: EstateAssetType;
  label: string;
  description: string;
  icon: typeof Home;
  color: string;
}[] = [
  { type: "real-property", label: "Real Property", description: "Homes, land, investment properties", icon: Home, color: "#10B981" },
  { type: "bank", label: "Bank Account", description: "Cheque, savings, term deposits", icon: Building2, color: "#8B5CF6" },
  { type: "super", label: "Superannuation", description: "Super funds, pensions", icon: DollarSign, color: "#F59E0B" },
  { type: "life-insurance", label: "Life Insurance", description: "Term life, TPD, trauma cover", icon: Umbrella, color: "#0D9488" },
  { type: "shares", label: "Shares & Investments", description: "Listed shares, managed funds", icon: TrendingUp, color: "#0EA5E9" },
  { type: "vehicle", label: "Vehicle", description: "Cars, motorcycles, boats", icon: Car, color: "#3B82F6" },
  { type: "digital", label: "Digital / Crypto", description: "Cryptocurrency, online wallets", icon: Bitcoin, color: "#F97316" },
  { type: "business", label: "Business Interest", description: "Companies, partnerships", icon: Briefcase, color: "#6366F1" },
  { type: "personal-effect", label: "Personal Effects", description: "Jewellery, art, collectibles", icon: Gem, color: "#EC4899" },
  { type: "ip", label: "Intellectual Property", description: "Royalties, patents, trademarks", icon: Lightbulb, color: "#EAB308" },
  { type: "debt-owed", label: "Debt Owed to You", description: "Loans receivable", icon: HandCoins, color: "#14B8A6" },
  { type: "safe-contents", label: "Safe Contents", description: "Safe deposit, stored valuables", icon: Vault, color: "#64748B" },
  { type: "other", label: "Other", description: "Anything else of value", icon: Package, color: "#94A3B8" },
];

const typeMeta = (t: EstateAssetType) =>
  ASSET_TYPES.find((x) => x.type === t) ?? ASSET_TYPES[ASSET_TYPES.length - 1];

// Type-specific detail fields (stored in EstateAsset.details) so the Asset &
// Liability Inventory annexure can carry the same particulars as the MetaLaw
// Schedule 1 — BSB, BDBN status, policy numbers, registration, etc. Types not
// listed here just use the common title / institution / value fields.
const ASSET_DETAIL_FIELDS: Partial<Record<EstateAssetType, FieldDef[]>> = {
  "real-property": [
    {
      key: "ownership",
      label: "Ownership",
      type: "select",
      half: true,
      options: [
        { value: "sole", label: "Sole" },
        { value: "joint_tenants", label: "Joint tenants" },
        { value: "tenants_in_common", label: "Tenants in common" },
      ],
    },
    { key: "title_reference", label: "Title reference / Lot-Plan", half: true, placeholder: "e.g. 12/SP54321" },
  ],
  bank: [
    { key: "bsb", label: "BSB", half: true, placeholder: "e.g. 012-345" },
    { key: "account_number", label: "Account number", half: true },
    { key: "account_type", label: "Account type", half: true, placeholder: "e.g. Savings, Term deposit" },
  ],
  super: [
    { key: "member_number", label: "Member number", half: true },
    {
      key: "bdbn_status",
      label: "Binding nomination (BDBN)",
      type: "select",
      half: true,
      options: [
        { value: "yes", label: "Yes (lapsing)" },
        { value: "non_lapsing", label: "Non-lapsing" },
        { value: "no", label: "None" },
      ],
    },
    { key: "bdbn_expiry", label: "BDBN expiry", half: true, placeholder: "e.g. 2027-06-30" },
    { key: "nominated_beneficiary", label: "Nominated beneficiary", half: true },
  ],
  "life-insurance": [
    { key: "policy_number", label: "Policy number", half: true },
    {
      key: "policy_type",
      label: "Type",
      type: "select",
      half: true,
      options: [
        { value: "term_life", label: "Term life" },
        { value: "tpd", label: "TPD" },
        { value: "trauma", label: "Trauma" },
        { value: "income_protection", label: "Income protection" },
        { value: "whole_of_life", label: "Whole of life" },
        { value: "other", label: "Other" },
      ],
    },
    { key: "sum_insured", label: "Sum insured (AUD)", type: "number", half: true },
    { key: "nominated_beneficiary", label: "Nominated beneficiary", half: true, placeholder: "e.g. Estate, spouse" },
  ],
  shares: [
    { key: "registry_hin", label: "Registry / HIN / SRN", half: true },
    { key: "holding", label: "Holding", half: true, placeholder: "e.g. 500 CBA shares" },
  ],
  business: [
    { key: "abn", label: "ABN / ACN", half: true },
    { key: "ownership_pct", label: "Your ownership %", half: true, placeholder: "e.g. 50%" },
    { key: "entity_type", label: "Entity type", half: true, placeholder: "e.g. Pty Ltd, partnership" },
  ],
  vehicle: [
    { key: "make_model", label: "Make & model", half: true, placeholder: "e.g. Toyota Camry" },
    { key: "registration", label: "Registration", half: true },
    { key: "year", label: "Year", half: true },
  ],
};

const fmtAUD = (n?: number) =>
  typeof n === "number"
    ? n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 })
    : null;

const EMPTY_FORM: Partial<EstateAsset> = {
  type: "real-property",
  title: "",
  description: "",
  estimatedValue: undefined,
  institution: "",
  beneficiaryIds: [],
  beneficiaryShares: {},
  details: {},
  vaultRecordId: undefined,
};

export default function SetupAssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<EstateAsset[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [vaultRecords, setVaultRecords] = useState<VaultRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<EstateAsset>>(EMPTY_FORM);
  // Inline "create a new vault record" from the asset form
  const [creatingVault, setCreatingVault] = useState(false);
  const [newVault, setNewVault] = useState<{ title: string; type: VaultType }>({ title: "", type: "credentials" });
  // Inline "add a beneficiary" from the asset form
  const [addingBeneficiary, setAddingBeneficiary] = useState(false);
  const [newBeneficiary, setNewBeneficiary] = useState({ name: "", email: "", relationship: "", residentialAddress: "" });

  const resetSubforms = () => {
    setCreatingVault(false);
    setNewVault({ title: "", type: "credentials" });
    setAddingBeneficiary(false);
    setNewBeneficiary({ name: "", email: "", relationship: "", residentialAddress: "" });
  };

  // Only actual beneficiaries can inherit an asset (executors/guardians manage,
  // they don't inherit by virtue of their role).
  const beneficiaryPeople = beneficiaries.filter((b) => b.role === "beneficiary");

  useEffect(() => {
    const refresh = () => setAssets(loadAssets());
    refresh();
    setBeneficiaries(loadBeneficiaries());
    setVaultRecords(loadVaultRecords());
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  const openAdd = (type: EstateAssetType = "real-property") => {
    setFormData({ ...EMPTY_FORM, type });
    setEditingId(null);
    resetSubforms();
    setShowAddForm(true);
  };

  const handleEdit = (asset: EstateAsset) => {
    setFormData({ ...asset });
    setEditingId(asset.id);
    resetSubforms();
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    resetSubforms();
  };

  const handleAddBeneficiary = () => {
    if (!newBeneficiary.name.trim()) return;
    const b: Beneficiary = {
      id: `ben-${Date.now()}`,
      name: newBeneficiary.name.trim(),
      email: newBeneficiary.email.trim(),
      role: "beneficiary",
      status: "pending",
      relationship: newBeneficiary.relationship.trim() || undefined,
      residentialAddress: newBeneficiary.residentialAddress.trim() || undefined,
    };
    const updated = [...loadBeneficiaries(), b];
    saveBeneficiaries(updated);
    setBeneficiaries(updated);
    setFormData((prev) => ({ ...prev, beneficiaryIds: [...(prev.beneficiaryIds || []), b.id] }));
    setNewBeneficiary({ name: "", email: "", relationship: "", residentialAddress: "" });
    setAddingBeneficiary(false);
  };

  const handleSave = () => {
    if (!formData.title?.trim()) return;
    const assetId = editingId ?? Date.now().toString();

    // Resolve the linked vault record, creating one if requested, and keep the
    // link bidirectional (vault record stores the asset id, asset stores the
    // vault id).
    let vaultRecordId = formData.vaultRecordId;
    if (creatingVault && newVault.title.trim()) {
      const vid = `vault-${Date.now()}`;
      addVaultRecord({
        id: vid,
        title: newVault.title.trim(),
        type: newVault.type,
        description: `Access/custody for asset: ${formData.title.trim()}`,
        beneficiaries: [],
        encrypted: true,
        source: "vault",
        createdAt: new Date().toISOString().split("T")[0],
        lastModified: "Just now",
        metadata: { assetId },
      });
      vaultRecordId = vid;
    } else if (vaultRecordId) {
      const rec = loadVaultRecords().find((r) => r.id === vaultRecordId);
      if (rec) updateVaultRecord(vaultRecordId, { metadata: { ...(rec.metadata || {}), assetId } });
    }

    // Keep only shares for currently-assigned beneficiaries.
    const ids = formData.beneficiaryIds ?? [];
    const shares: Record<string, number> = {};
    for (const [id, pct] of Object.entries(formData.beneficiaryShares ?? {})) {
      if (ids.includes(id) && typeof pct === "number") shares[id] = pct;
    }

    // Keep only detail fields that belong to the chosen type and have a value
    // (so changing type doesn't carry stale particulars).
    const detailKeys = new Set((ASSET_DETAIL_FIELDS[formData.type ?? "other"] ?? []).map((f) => f.key));
    const details: Record<string, string> = {};
    for (const [k, v] of Object.entries(formData.details ?? {})) {
      if (detailKeys.has(k) && String(v).trim()) details[k] = String(v).trim();
    }

    if (editingId) {
      updateAsset(editingId, { ...formData, beneficiaryShares: shares, details, vaultRecordId });
    } else {
      addAsset({
        id: assetId,
        type: formData.type ?? "other",
        title: formData.title.trim(),
        description: formData.description,
        estimatedValue: formData.estimatedValue,
        institution: formData.institution,
        jointlyOwned: formData.jointlyOwned,
        details,
        beneficiaryIds: ids,
        beneficiaryShares: shares,
        vaultRecordId,
        source: "manual",
      });
    }
    setAssets(loadAssets());
    setVaultRecords(loadVaultRecords());
    closeForm();
  };

  const handleDelete = (id: string) => {
    deleteAsset(id);
    setAssets(loadAssets());
  };

  const toggleBeneficiary = (beneficiaryId: string) => {
    setFormData((prev) => {
      const assigned = prev.beneficiaryIds?.includes(beneficiaryId);
      const shares = { ...(prev.beneficiaryShares || {}) };
      if (assigned) delete shares[beneficiaryId];
      return {
        ...prev,
        beneficiaryIds: assigned
          ? prev.beneficiaryIds!.filter((id) => id !== beneficiaryId)
          : [...(prev.beneficiaryIds || []), beneficiaryId],
        beneficiaryShares: shares,
      };
    });
  };

  const setBeneficiaryShare = (beneficiaryId: string, value: string) => {
    const digits = value.replace(/[^0-9.]/g, "");
    setFormData((prev) => {
      const shares = { ...(prev.beneficiaryShares || {}) };
      if (digits === "") delete shares[beneficiaryId];
      else shares[beneficiaryId] = Number(digits);
      return { ...prev, beneficiaryShares: shares };
    });
  };

  // Sum of assigned shares — shown as a soft hint (a single asset may go 100%
  // to one person or be split).
  const shareTotal = (formData.beneficiaryIds ?? []).reduce(
    (sum, id) => sum + (formData.beneficiaryShares?.[id] ?? 0),
    0
  );

  return (
    <div>
      <Header
        title="Your assets"
        subtitle="Record what you own and what it's worth. This drives your net estate and, later, who inherits each item."
      />

      {/* Count + Add */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {assets.length} {assets.length === 1 ? "asset" : "assets"}
        </p>
        <Button variant="primary" onClick={() => openAdd()}>
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Assets List */}
      {assets.length === 0 ? (
        <Card padding="lg" className="mb-6">
          <p className="text-sm text-center mb-5" style={{ color: "var(--text-muted)" }}>
            No assets added yet. Pick a category to get started.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ASSET_TYPES.map(({ type, label, icon: Icon, color }) => (
              <button
                key={type}
                onClick={() => openAdd(type)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-lg hover:border-accent"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
              >
                <Icon className="h-6 w-6" style={{ color }} />
                <span className="text-xs font-medium text-center leading-tight" style={{ color: "var(--text-primary)" }}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <div className="space-y-3 mb-6">
          {assets.map((asset) => {
            const meta = typeMeta(asset.type);
            const AssetIcon = meta.icon;
            // Only people with the beneficiary role inherit — guards against
            // stale executor ids left in older assets' beneficiaryIds.
            const assignedBeneficiaries = beneficiaries.filter(
              (b) => b.role === "beneficiary" && asset.beneficiaryIds.includes(b.id)
            );
            // The asset is the hub: show every vault record linked to it — its
            // account/credentials and any documents — so crypto (or a bank
            // account) reads as one asset with its access + papers attached.
            const linkedRecords = vaultRecords.filter(
              (r) => r.metadata?.assetId === asset.id || (!!asset.vaultRecordId && r.id === asset.vaultRecordId)
            );

            return (
              <Card key={asset.id} padding="md">
                <div className="flex items-start gap-4">
                  <AssetIcon className="h-6 w-6 flex-shrink-0" style={{ color: meta.color }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {asset.title}
                        </h4>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {meta.label}
                          {asset.institution ? ` · ${asset.institution}` : ""}
                        </p>
                      </div>
                      {fmtAUD(asset.estimatedValue) && (
                        <span
                          className="text-sm font-semibold whitespace-nowrap"
                          style={{ color: "var(--success)" }}
                        >
                          {fmtAUD(asset.estimatedValue)}
                        </span>
                      )}
                    </div>

                    {asset.description && (
                      <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                        {asset.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-2">
                      {assignedBeneficiaries.map((b) => {
                        const pct = asset.beneficiaryShares?.[b.id];
                        return (
                          <span
                            key={b.id}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)" }}
                          >
                            → {b.name}
                            {typeof pct === "number" ? ` (${pct}%)` : ""}
                          </span>
                        );
                      })}
                      {linkedRecords.map((rec) => (
                        <button
                          key={rec.id}
                          onClick={() => router.push(rec.type === "documents" ? "/vault" : "/vault/online")}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors hover:opacity-80"
                          style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
                          title={rec.type === "documents" ? "Linked document" : "Linked account / access"}
                        >
                          <Link2 className="h-3 w-3" />
                          {rec.title}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(asset)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(asset.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Guidance */}
      <Card padding="md" className="mb-6 border-l-4" style={{ borderLeftColor: "var(--info)" }}>
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "var(--info)" }} />
          <div>
            <h4 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Assets vs. your vault
            </h4>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              An asset records <strong>what something is worth and who inherits it</strong>. Your vault holds
              the <strong>access</strong> — a crypto wallet&apos;s recovery phrase, a bank login. Where the two
              meet, link the asset to its vault record so your executor can find both.
            </p>
          </div>
        </div>
      </Card>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card padding="lg" className="max-w-2xl w-full my-8">
            <h3 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              {editingId ? "Edit" : "Add"} Asset
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Asset Type *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {ASSET_TYPES.map(({ type, label, icon: Icon, color }) => (
                    <label key={type} className="cursor-pointer">
                      <input
                        type="radio"
                        name="assetType"
                        value={type}
                        checked={formData.type === type}
                        onChange={() => setFormData({ ...formData, type })}
                        className="sr-only"
                      />
                      <div
                        className="p-2 rounded-lg flex flex-col items-center gap-1 transition-colors border-2 h-full"
                        style={{ borderColor: formData.type === type ? "var(--accent)" : "var(--border)" }}
                      >
                        <Icon className="h-5 w-5" style={{ color }} />
                        <span className="text-[11px] font-medium text-center leading-tight" style={{ color: "var(--text-primary)" }}>
                          {label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Title / Name *
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g. Family Home, Toyota Camry, ANZ Savings"
                  value={formData.title ?? ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Institution / Provider
                  </label>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="e.g. ANZ, AustralianSuper"
                    value={formData.institution ?? ""}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Estimated Value (AUD)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="input w-full"
                    placeholder="e.g. 500000"
                    value={formData.estimatedValue ?? ""}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9.]/g, "");
                      setFormData({ ...formData, estimatedValue: digits === "" ? undefined : Number(digits) });
                    }}
                  />
                </div>
              </div>

              {(ASSET_DETAIL_FIELDS[(formData.type ?? "other") as EstateAssetType]?.length ?? 0) > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Details
                    <span className="font-normal" style={{ color: "var(--text-muted)" }}> — appear on your Asset & Liability Inventory</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ASSET_DETAIL_FIELDS[(formData.type ?? "other") as EstateAssetType]!.map((f) => {
                      const val = formData.details?.[f.key] ?? "";
                      const onChange = (v: string) =>
                        setFormData((prev) => ({ ...prev, details: { ...(prev.details ?? {}), [f.key]: v } }));
                      return (
                        <div key={f.key}>
                          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                            {f.label}
                          </label>
                          {f.type === "select" ? (
                            <select className="input w-full" value={val} onChange={(e) => onChange(e.target.value)}>
                              <option value="">Select…</option>
                              {f.options?.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              className="input w-full"
                              type={f.type === "number" ? "number" : "text"}
                              placeholder={f.placeholder}
                              value={val}
                              onChange={(e) => onChange(e.target.value)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Description (Optional)
                </label>
                <textarea
                  className="input w-full"
                  rows={2}
                  placeholder="Additional details..."
                  value={formData.description ?? ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded"
                  style={{ accentColor: "var(--accent)" }}
                  checked={formData.jointlyOwned ?? false}
                  onChange={(e) => setFormData({ ...formData, jointlyOwned: e.target.checked })}
                />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Jointly owned (passes outside the estate by survivorship — excluded from net estate)
                </span>
              </label>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Link to a Vault Record (Optional)
                </label>
                <select
                  className="input w-full"
                  value={creatingVault ? "__new__" : formData.vaultRecordId ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "__new__") {
                      setCreatingVault(true);
                      setFormData({ ...formData, vaultRecordId: undefined });
                    } else {
                      setCreatingVault(false);
                      setFormData({ ...formData, vaultRecordId: v || undefined });
                    }
                  }}
                >
                  <option value="">None</option>
                  {vaultRecords.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} — {r.type}
                    </option>
                  ))}
                  <option value="__new__">+ Create a new vault record…</option>
                </select>

                {creatingVault && (
                  <div className="mt-3 p-3 rounded-lg border-2 space-y-3" style={{ borderColor: "var(--accent)" }}>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="Vault record title (e.g. ANZ login, Ledger wallet)"
                      value={newVault.title}
                      onChange={(e) => setNewVault({ ...newVault, title: e.target.value })}
                    />
                    <select
                      className="input w-full"
                      value={newVault.type}
                      onChange={(e) => setNewVault({ ...newVault, type: e.target.value as VaultType })}
                    >
                      <option value="credentials">Credentials / login</option>
                      <option value="wallets">Wallet / keys</option>
                      <option value="documents">Document</option>
                      <option value="accounts">Account</option>
                    </select>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Creates a linked record in your Vault. Add the actual access details (passwords, keys) in the Vault.
                    </p>
                  </div>
                )}

                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Where the access/custody for this asset is stored. The link works both ways.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Assign to Beneficiaries
                </label>
                {beneficiaryPeople.length === 0 && !addingBeneficiary ? (
                  <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
                    No beneficiaries yet — add one below.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {beneficiaryPeople.map((b) => {
                      const checked = formData.beneficiaryIds?.includes(b.id) ?? false;
                      return (
                        <div
                          key={b.id}
                          className="flex items-center gap-3 p-3 rounded-lg transition-colors border-2"
                          style={{ borderColor: checked ? "var(--accent)" : "var(--border)" }}
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleBeneficiary(b.id)}
                              className="w-5 h-5 rounded"
                              style={{ accentColor: "var(--accent)" }}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                                {b.name}
                              </p>
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {b.relationship || "Beneficiary"}
                              </p>
                            </div>
                          </label>
                          {checked && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <input
                                type="text"
                                inputMode="decimal"
                                className="input w-16 text-right"
                                placeholder="%"
                                value={formData.beneficiaryShares?.[b.id] ?? ""}
                                onChange={(e) => setBeneficiaryShare(b.id, e.target.value)}
                                aria-label={`${b.name}'s share`}
                              />
                              <span className="text-sm" style={{ color: "var(--text-muted)" }}>%</span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {(formData.beneficiaryIds?.length ?? 0) > 0 && shareTotal > 0 && (
                      <p
                        className="text-xs text-right"
                        style={{ color: shareTotal === 100 ? "var(--success)" : "var(--text-muted)" }}
                      >
                        Total assigned: {shareTotal}%{shareTotal !== 100 ? " (typically 100%)" : ""}
                      </p>
                    )}
                  </div>
                )}

                {addingBeneficiary ? (
                  <div className="mt-3 p-3 rounded-lg border-2 space-y-3" style={{ borderColor: "var(--accent)" }}>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="Beneficiary's full name"
                      value={newBeneficiary.name}
                      onChange={(e) => setNewBeneficiary({ ...newBeneficiary, name: e.target.value })}
                    />
                    <input
                      type="email"
                      className="input w-full"
                      placeholder="Email (optional)"
                      value={newBeneficiary.email}
                      onChange={(e) => setNewBeneficiary({ ...newBeneficiary, email: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="Relationship to me (e.g. Daughter)"
                      value={newBeneficiary.relationship}
                      onChange={(e) => setNewBeneficiary({ ...newBeneficiary, relationship: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="Residential address (optional)"
                      value={newBeneficiary.residentialAddress}
                      onChange={(e) => setNewBeneficiary({ ...newBeneficiary, residentialAddress: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={handleAddBeneficiary} disabled={!newBeneficiary.name.trim()}>
                        Add &amp; assign
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setAddingBeneficiary(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => setAddingBeneficiary(true)}>
                    <Plus className="h-4 w-4" />
                    Add beneficiary
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={closeForm} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!formData.title?.trim()}
                className="flex-1"
              >
                {editingId ? "Update" : "Add"}
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
