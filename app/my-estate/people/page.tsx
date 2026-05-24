"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { Users, Plus, Trash2, ArrowRight, ArrowLeft, Shield, Heart } from "lucide-react";
import { loadBeneficiaries, saveBeneficiaries as persistBeneficiaries, type Beneficiary } from "@/lib/store";

export default function SetupPeoplePage() {
  const router = useRouter();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "beneficiary" as "executor" | "beneficiary",
    relationship: "",
  });

  // Load from the unified store (shared with the dashboard and /beneficiaries)
  useEffect(() => {
    const refresh = () => setBeneficiaries(loadBeneficiaries());
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  const saveBeneficiaries = (updated: Beneficiary[]) => {
    setBeneficiaries(updated);
    persistBeneficiaries(updated);
  };

  const handleAddOrUpdate = () => {
    if (!formData.name || !formData.email) return;

    if (editingId) {
      // Update existing
      const updated = beneficiaries.map((b) =>
        b.id === editingId
          ? { ...b, ...formData }
          : b
      );
      saveBeneficiaries(updated);
      setEditingId(null);
    } else {
      // Add new
      const newBeneficiary: Beneficiary = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        relationship: formData.relationship,
        status: "pending",
        addedAt: new Date().toISOString(),
      };
      saveBeneficiaries([...beneficiaries, newBeneficiary]);
    }

    // Reset form
    setFormData({ name: "", email: "", role: "beneficiary", relationship: "" });
    setShowAddForm(false);
  };

  const handleEdit = (beneficiary: Beneficiary) => {
    setFormData({
      name: beneficiary.name,
      email: beneficiary.email,
      role: beneficiary.role === "executor" ? "executor" : "beneficiary",
      relationship: beneficiary.relationship || "",
    });
    setEditingId(beneficiary.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    saveBeneficiaries(beneficiaries.filter((b) => b.id !== id));
  };

  const handleContinue = () => {
    // Mark step as complete
    const completedSteps = JSON.parse(localStorage.getItem("setup_completed_steps") || "[]");
    if (!completedSteps.includes("people")) {
      completedSteps.push("people");
      localStorage.setItem("setup_completed_steps", JSON.stringify(completedSteps));
    }

    // Navigate to next step
    router.push("/my-estate/online");
  };

  const executors = beneficiaries.filter((b) => b.role === "executor");
  const regularBeneficiaries = beneficiaries.filter((b) => b.role === "beneficiary");
  const hasExecutor = executors.length > 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Who are your people?
        </h2>
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          Add the executors and beneficiaries who will manage and inherit your digital legacy.
        </p>
      </div>

      {/* Executors Section */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6" style={{ color: "var(--accent)" }} />
            <div>
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Executors
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Trusted people who will manage your estate
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFormData({ name: "", email: "", role: "executor", relationship: "" });
              setEditingId(null);
              setShowAddForm(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Executor
          </Button>
        </div>

        {executors.length === 0 ? (
          <div
            className="text-center py-8 rounded-lg"
            style={{ backgroundColor: "var(--warning-bg)", borderLeft: "3px solid var(--warning)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--warning)" }}>
              You need at least one executor
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {executors.map((executor) => (
              <div
                key={executor.id}
                className="flex items-center justify-between p-4 rounded-lg border"
                style={{ borderColor: "var(--border)" }}
              >
                <div>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {executor.name}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {executor.email}
                    {executor.relationship && ` • ${executor.relationship}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(executor)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(executor.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Beneficiaries Section */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6" style={{ color: "var(--accent)" }} />
            <div>
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Beneficiaries
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                People who will inherit your assets and accounts
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setFormData({ name: "", email: "", role: "beneficiary", relationship: "" });
              setEditingId(null);
              setShowAddForm(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Beneficiary
          </Button>
        </div>

        {regularBeneficiaries.length === 0 ? (
          <div
            className="text-center py-8 rounded-lg"
            style={{ backgroundColor: "var(--info-bg)" }}
          >
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No beneficiaries added yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {regularBeneficiaries.map((beneficiary) => (
              <div
                key={beneficiary.id}
                className="flex items-center justify-between p-4 rounded-lg border"
                style={{ borderColor: "var(--border)" }}
              >
                <div>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {beneficiary.name}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {beneficiary.email}
                    {beneficiary.relationship && ` • ${beneficiary.relationship}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(beneficiary)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(beneficiary.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card padding="lg" className="max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              {editingId ? "Edit" : "Add"} {formData.role === "executor" ? "Executor" : "Beneficiary"}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  className="input w-full"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Relationship
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g., Spouse, Child, Friend"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                />
              </div>

              {!editingId && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Role *
                  </label>
                  <div className="flex gap-3">
                    <label className="flex-1">
                      <input
                        type="radio"
                        name="role"
                        value="executor"
                        checked={formData.role === "executor"}
                        onChange={(e) => setFormData({ ...formData, role: "executor" })}
                        className="sr-only"
                      />
                      <div
                        className="p-3 rounded-lg cursor-pointer text-center transition-colors border-2"
                        style={{
                          borderColor: formData.role === "executor" ? "var(--accent)" : "var(--border)",
                        }}
                      >
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          Executor
                        </span>
                      </div>
                    </label>
                    <label className="flex-1">
                      <input
                        type="radio"
                        name="role"
                        value="beneficiary"
                        checked={formData.role === "beneficiary"}
                        onChange={(e) => setFormData({ ...formData, role: "beneficiary" })}
                        className="sr-only"
                      />
                      <div
                        className="p-3 rounded-lg cursor-pointer text-center transition-colors border-2"
                        style={{
                          borderColor: formData.role === "beneficiary" ? "var(--accent)" : "var(--border)",
                        }}
                      >
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          Beneficiary
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
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
                disabled={!formData.name || !formData.email}
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
        <Button variant="ghost" onClick={() => router.push("/my-estate/about")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => router.push("/")}>
            Save & Exit
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!hasExecutor}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
