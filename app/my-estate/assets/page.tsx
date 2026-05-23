"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import {
  Home,
  Car,
  Building2,
  Coins,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  CheckCircle,
  Info,
} from "lucide-react";
import type { Beneficiary } from "@/types";

interface Asset {
  id: string;
  type: "property" | "vehicle" | "bank" | "super" | "crypto";
  title: string;
  description?: string;
  estimatedValue?: string;
  beneficiaryIds: string[];
}

const ASSET_TYPES = [
  {
    type: "property",
    label: "Property",
    description: "Homes, land, investment properties",
    icon: Home,
    color: "#10B981"
  },
  {
    type: "vehicle",
    label: "Vehicle",
    description: "Cars, motorcycles, boats",
    icon: Car,
    color: "#3B82F6"
  },
  {
    type: "bank",
    label: "Bank Account",
    description: "Checking, savings, term deposits",
    icon: Building2,
    color: "#8B5CF6"
  },
  {
    type: "super",
    label: "Superannuation",
    description: "Super funds, pension accounts",
    icon: DollarSign,
    color: "#F59E0B"
  },
  {
    type: "crypto",
    label: "Cryptocurrency",
    description: "Bitcoin, Ethereum, exchange accounts",
    icon: Coins,
    color: "#F97316"
  },
];

export default function SetupAssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [vaultAssets, setVaultAssets] = useState<Asset[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Asset>>({
    type: "property",
    title: "",
    description: "",
    estimatedValue: "",
    beneficiaryIds: [],
  });

  // Load saved data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAssets = localStorage.getItem("setup_assets");
      if (savedAssets) {
        setAssets(JSON.parse(savedAssets));
      }

      const savedBeneficiaries = localStorage.getItem("setup_beneficiaries");
      if (savedBeneficiaries) {
        setBeneficiaries(JSON.parse(savedBeneficiaries));
      }

      // Load existing assets from vault
      const vaultRecords = localStorage.getItem("vault_records");
      if (vaultRecords) {
        const records = JSON.parse(vaultRecords);
        // Filter for asset-related records
        const assetRecords = records.filter((r: any) =>
          r.type === "Assets" || r.type === "Financial"
        ).map((r: any) => ({
          id: r.id,
          type: r.subtype || "property",
          title: r.title,
          description: r.description,
          estimatedValue: r.metadata?.value || r.metadata?.balance,
          beneficiaryIds: r.beneficiaries || [],
        }));
        setVaultAssets(assetRecords);
      }
    }
  }, []);

  const saveAssets = (updated: Asset[]) => {
    setAssets(updated);
    localStorage.setItem("setup_assets", JSON.stringify(updated));
  };

  const handleAddOrUpdate = () => {
    if (!formData.title) return;

    if (editingId) {
      const updated = assets.map((a) =>
        a.id === editingId ? { ...a, ...formData } as Asset : a
      );
      saveAssets(updated);
      setEditingId(null);
    } else {
      const newAsset: Asset = {
        id: Date.now().toString(),
        type: formData.type || "property",
        title: formData.title || "",
        description: formData.description,
        estimatedValue: formData.estimatedValue,
        beneficiaryIds: formData.beneficiaryIds || [],
      };
      saveAssets([...assets, newAsset]);
    }

    setFormData({
      type: "property",
      title: "",
      description: "",
      estimatedValue: "",
      beneficiaryIds: [],
    });
    setShowAddForm(false);
  };

  const handleEdit = (asset: Asset) => {
    setFormData(asset);
    setEditingId(asset.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    saveAssets(assets.filter((a) => a.id !== id));
  };

  const handleContinue = () => {
    const completedSteps = JSON.parse(localStorage.getItem("setup_completed_steps") || "[]");
    if (!completedSteps.includes("assets")) {
      completedSteps.push("assets");
      localStorage.setItem("setup_completed_steps", JSON.stringify(completedSteps));
    }
    router.push("/my-estate/will");
  };

  const toggleBeneficiary = (beneficiaryId: string) => {
    setFormData((prev) => ({
      ...prev,
      beneficiaryIds: prev.beneficiaryIds?.includes(beneficiaryId)
        ? prev.beneficiaryIds.filter((id) => id !== beneficiaryId)
        : [...(prev.beneficiaryIds || []), beneficiaryId],
    }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Your assets
        </h2>
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          Add your major assets and assign beneficiaries to each one.
        </p>
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {ASSET_TYPES.map(({ type, label, description, icon: Icon, color }) => (
          <button
            key={type}
            onClick={() => {
              setFormData({
                type: type as any,
                title: "",
                description: "",
                estimatedValue: "",
                beneficiaryIds: [],
              });
              setEditingId(null);
              setShowAddForm(true);
            }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-lg hover:border-accent"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
          >
            <Icon className="h-7 w-7 mb-1" style={{ color }} />
            <span className="text-sm font-medium text-center" style={{ color: "var(--text-primary)" }}>
              {label}
            </span>
            <p className="text-xs text-center leading-tight" style={{ color: "var(--text-muted)" }}>
              {description}
            </p>
          </button>
        ))}
      </div>

      {/* Existing Vault Assets */}
      {vaultAssets.length > 0 && (
        <Card padding="md" className="mb-6 border-l-4" style={{ borderLeftColor: "var(--success)" }}>
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "var(--success)" }} />
            <div>
              <h4 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                You've already added {vaultAssets.length} {vaultAssets.length === 1 ? "asset" : "assets"}
              </h4>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                These assets are already in your Vault. You can edit them or add new ones below.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {vaultAssets.map((asset) => {
              const assetType = ASSET_TYPES.find((t) => t.type === asset.type);
              const AssetIcon = assetType?.icon || Home;
              const assignedBeneficiaries = beneficiaries.filter((b) =>
                asset.beneficiaryIds?.includes(b.id)
              );

              return (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{ borderColor: "var(--border)" }}
                >
                  <AssetIcon className="h-5 w-5 flex-shrink-0" style={{ color: assetType?.color || "var(--accent)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {asset.title}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {assignedBeneficiaries.length > 0
                        ? `→ ${assignedBeneficiaries.map(b => b.name).join(", ")}`
                        : "No beneficiary assigned"}
                    </p>
                  </div>
                  {asset.estimatedValue && (
                    <span className="text-sm font-semibold whitespace-nowrap" style={{ color: "var(--success)" }}>
                      {asset.estimatedValue}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Guidance Info */}
      <Card padding="md" className="mb-6 border-l-4" style={{ borderLeftColor: "var(--info)" }}>
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "var(--info)" }} />
          <div>
            <h4 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              What assets should I add?
            </h4>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Focus on major assets like property, vehicles, bank accounts, superannuation, and cryptocurrency.
              You can assign beneficiaries to each asset to specify who should receive them.
            </p>
          </div>
        </div>
      </Card>

      {/* Assets List */}
      {assets.length === 0 ? (
        <Card padding="lg" className="mb-6">
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {vaultAssets.length > 0
                ? "Add more assets or continue to the next step."
                : "No assets added yet. Click a button above to get started."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3 mb-6">
          {assets.map((asset) => {
            const assetType = ASSET_TYPES.find((t) => t.type === asset.type);
            const AssetIcon = assetType?.icon || Home;
            const assignedBeneficiaries = beneficiaries.filter((b) =>
              asset.beneficiaryIds.includes(b.id)
            );

            return (
              <Card key={asset.id} padding="md">
                <div className="flex items-start gap-4">
                  <AssetIcon className="h-6 w-6 flex-shrink-0" style={{ color: assetType?.color || "var(--accent)" }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {asset.title}
                        </h4>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {assetType?.label}
                        </p>
                      </div>
                      {asset.estimatedValue && (
                        <span
                          className="text-sm font-semibold whitespace-nowrap"
                          style={{ color: "var(--success)" }}
                        >
                          {asset.estimatedValue}
                        </span>
                      )}
                    </div>

                    {asset.description && (
                      <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                        {asset.description}
                      </p>
                    )}

                    {assignedBeneficiaries.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {assignedBeneficiaries.map((b) => (
                          <span
                            key={b.id}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: "var(--accent-dim)",
                              color: "var(--accent)",
                            }}
                          >
                            → {b.name}
                          </span>
                        ))}
                      </div>
                    )}

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
                <div className="grid grid-cols-3 gap-2">
                  {ASSET_TYPES.map(({ type, label, icon: Icon, color }) => (
                    <label key={type} className="cursor-pointer">
                      <input
                        type="radio"
                        name="assetType"
                        value={type}
                        checked={formData.type === type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="sr-only"
                      />
                      <div
                        className="p-3 rounded-lg flex flex-col items-center gap-1 transition-colors border-2"
                        style={{
                          borderColor: formData.type === type ? "var(--accent)" : "var(--border)",
                        }}
                      >
                        <Icon className="h-6 w-6" style={{ color }} />
                        <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                          {label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Title/Name *
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., Family Home, Toyota Camry, ANZ Savings"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Description (Optional)
                </label>
                <textarea
                  className="input w-full"
                  rows={2}
                  placeholder="Additional details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Estimated Value (Optional)
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., $500,000 or 1.5 BTC"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Assign to Beneficiaries
                </label>
                {beneficiaries.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    No beneficiaries added yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {beneficiaries.map((b) => (
                      <label
                        key={b.id}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border-2"
                        style={{
                          borderColor: formData.beneficiaryIds?.includes(b.id) ? "var(--accent)" : "var(--border)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.beneficiaryIds?.includes(b.id)}
                          onChange={() => toggleBeneficiary(b.id)}
                          className="w-5 h-5 rounded"
                          style={{ accentColor: "var(--accent)" }}
                        />
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                            {b.name}
                          </p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {b.relationship || b.role}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddOrUpdate}
                disabled={!formData.title}
                className="flex-1"
              >
                {editingId ? "Update" : "Add"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => router.push("/my-estate/online")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => router.push("/")}>
            Save & Exit
          </Button>
          <Button variant="primary" onClick={handleContinue}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
