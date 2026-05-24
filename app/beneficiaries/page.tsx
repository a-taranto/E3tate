"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, Button, Badge, StatusIndicator, Input } from "@/components/ui";
import { logActivity } from "@/lib/activityLogger";
import {
  UserPlus,
  Mail,
  Shield,
  Eye,
  MoreVertical,
  CheckCircle,
  Clock,
  Users,
  Check,
} from "lucide-react";
import { loadBeneficiaries, saveBeneficiaries, type Beneficiary } from "@/lib/store";
import { toast } from "@/components/ui/Toaster";
import ComingSoon from "@/components/ui/ComingSoon";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "beneficiary" as Beneficiary["role"],
    relationship: "",
  });

  // Load beneficiaries from the unified store (seeded + migrated on app boot).
  useEffect(() => {
    const refresh = () => {
      setBeneficiaries(loadBeneficiaries());
      setLoaded(true);
    };
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", email: "", role: "beneficiary", relationship: "" });
    setShowForm(true);
  };

  const openEdit = (person: Beneficiary) => {
    setEditingId(person.id);
    setForm({
      name: person.name,
      email: person.email,
      role: person.role,
      relationship: person.relationship || "",
    });
    setShowForm(true);
  };

  const submitForm = () => {
    if (!form.name.trim() || !isValidEmail(form.email)) return;
    let updated: Beneficiary[];
    if (editingId) {
      updated = beneficiaries.map((b) => (b.id === editingId ? { ...b, ...form } : b));
    } else {
      const newBeneficiary: Beneficiary = {
        id: Date.now().toString(),
        name: form.name,
        email: form.email,
        role: form.role,
        relationship: form.relationship,
        status: "pending",
        invitedDate: "Just now",
        recordsAccess: 0,
        scopeSummary: "To be configured",
      };
      updated = [...beneficiaries, newBeneficiary];
    }
    setBeneficiaries(updated);
    saveBeneficiaries(updated);
    logActivity(
      editingId ? "Beneficiary Updated" : "Beneficiary Added",
      "beneficiary",
      `${form.name} (${form.role})`
    );
    toast(editingId ? "Beneficiary updated" : "Beneficiary added");
    setShowForm(false);
    setEditingId(null);
  };

  const removeBeneficiary = (person: Beneficiary) => {
    if (!confirm(`Remove ${person.name} from your beneficiaries?`)) return;
    const updated = beneficiaries.filter((b) => b.id !== person.id);
    setBeneficiaries(updated);
    saveBeneficiaries(updated);
    logActivity("Beneficiary Removed", "beneficiary", person.name);
    toast(`${person.name} removed`, "info");
  };

  const roleConfig = {
    executor: {
      variant: "success" as const,
      description: "Can trigger execution and access all records",
    },
    beneficiary: {
      variant: "info" as const,
      description: "Receives designated records upon execution",
    },
    observer: {
      variant: "default" as const,
      description: "Limited visibility for legal or advisory purposes",
    },
    contact: {
      variant: "default" as const,
      description: "Trusted contact with no record access",
    },
  };

  const executorCount = beneficiaries.filter(b => b.role === "executor").length;
  const beneficiaryCount = beneficiaries.filter(b => b.role === "beneficiary").length;
  const pendingCount = beneficiaries.filter(b => b.status === "pending").length;

  return (
    <div>
      <Header
        title="Beneficiaries"
        subtitle="Manage executors, beneficiaries, and disclosure scopes"
        action={
          <Button variant="primary" onClick={openAdd}>
            <UserPlus className="h-4 w-4" />
            Invite Beneficiary
          </Button>
        }
      />


      {/* Add / Edit Beneficiary Form */}
      {showForm && (
        <Card className="mb-6" style={{ borderColor: "var(--accent)", borderWidth: "1px" }}>
          <h3 className="font-semibold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
            {editingId ? "Edit Beneficiary" : "Add Beneficiary"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Full Name *"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={form.email && !isValidEmail(form.email) ? "Enter a valid email address" : undefined}
              required
            />
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Role
              </label>
              <select
                className="input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Beneficiary["role"] })}
              >
                <option value="beneficiary">Beneficiary</option>
                <option value="executor">Executor</option>
                <option value="observer">Observer</option>
              </select>
            </div>
            <Input
              label="Relationship"
              placeholder="Spouse, Child, Friend…"
              value={form.relationship}
              onChange={(e) => setForm({ ...form, relationship: e.target.value })}
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={submitForm}
              disabled={!form.name.trim() || !isValidEmail(form.email)}
            >
              <Check className="h-4 w-4" />
              {editingId ? "Save Changes" : "Add Beneficiary"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-text-muted text-sm">Executors</p>
              <p className="text-2xl font-semibold">{executorCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Eye className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-text-muted text-sm">Beneficiaries</p>
              <p className="text-2xl font-semibold">{beneficiaryCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-text-muted text-sm">Pending Invites</p>
              <p className="text-2xl font-semibold">{pendingCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Role Legend */}
      <Card className="mb-6 bg-accent-muted/50 border-accent">
        <h3 className="font-medium mb-3">Role Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(roleConfig).map(([role, config]) => (
            <div key={role} className="flex items-start gap-3">
              <Badge variant={config.variant} className="mt-0.5 capitalize">
                {role}
              </Badge>
              <p className="text-sm text-text-secondary">{config.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Beneficiaries List */}
      <div className="space-y-3">
        {!loaded ? (
          <Card className="text-center py-12">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>
          </Card>
        ) : beneficiaries.length === 0 ? (
          <Card className="text-center py-12">
            <div className="mb-4">
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                style={{ backgroundColor: "var(--accent-dim)" }}
              >
                <Users className="h-8 w-8" style={{ color: "var(--accent)" }} />
              </div>
            </div>
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              No Beneficiaries Added Yet
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Add family members or trusted individuals who will receive access to your information.
            </p>
            <Button variant="primary" onClick={openAdd}>
              <UserPlus className="h-4 w-4" />
              Add Your First Beneficiary
            </Button>
          </Card>
        ) : (
          beneficiaries.map((person) => (
            <Card key={person.id} hover padding="none">
              <div className="p-5">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary-bg font-semibold text-lg">
                      {person.name.split(" ").map((n) => n[0]).join("")}
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg">{person.name}</h3>
                        <Badge
                          variant={roleConfig[person.role].variant}
                          className="capitalize"
                        >
                          {person.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <Mail className="h-3.5 w-3.5" />
                        {person.email}
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3">
                    {person.status === "accepted" ? (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Accepted
                      </div>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBeneficiary(person)}
                      title="Remove beneficiary"
                      aria-label="Remove beneficiary"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-text-muted mb-1">Invited</p>
                    <p className="text-sm">{person.invitedDate || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Records Access</p>
                    <p className="text-sm font-mono">{person.recordsAccess || 0} records</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-1">Disclosure Scope</p>
                    <p className="text-sm">{person.scopeSummary || "To be configured"}</p>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex gap-2 mt-4">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(person)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" disabled>
                    View Details
                    <ComingSoon />
                  </Button>
                  {person.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-accent"
                      onClick={() => {
                        logActivity("Invite Sent", "beneficiary", `Invitation sent to ${person.name}`);
                        toast(`Invitation sent to ${person.email}`);
                      }}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Send Invite
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
