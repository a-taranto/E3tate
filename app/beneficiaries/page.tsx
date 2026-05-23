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
  X,
  Check,
  AlertCircle,
} from "lucide-react";

interface Beneficiary {
  id: string | number;
  name: string;
  email: string;
  role: "executor" | "beneficiary" | "observer";
  status: "accepted" | "pending" | "draft";
  invitedDate?: string;
  recordsAccess?: number;
  scopeSummary?: string;
  relationship?: string;
}

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [pendingBeneficiaries, setPendingBeneficiaries] = useState<Beneficiary[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Load beneficiaries from localStorage
  useEffect(() => {
    // Load existing beneficiaries
    const saved = localStorage.getItem("beneficiariesList");
    if (saved) {
      setBeneficiaries(JSON.parse(saved));
    } else {
      // Initialize with mock data
      const mockData = [
        {
          id: 1,
          name: "Sarah Johnson",
          email: "sarah.j@example.com",
          role: "executor" as const,
          status: "accepted" as const,
          invitedDate: "3 months ago",
          recordsAccess: 18,
          scopeSummary: "Full vault access + execution rights",
        },
        {
          id: 2,
          name: "Michael Kim",
          email: "michael.k@example.com",
          role: "executor" as const,
          status: "accepted" as const,
          invitedDate: "2 months ago",
          recordsAccess: 18,
          scopeSummary: "Full vault access + execution rights",
        },
      ];
      setBeneficiaries(mockData);
      localStorage.setItem("beneficiariesList", JSON.stringify(mockData));
    }

    // Check for pending beneficiaries from profile page
    const pending = localStorage.getItem("pendingBeneficiaries");
    if (pending) {
      const pendingData = JSON.parse(pending);
      setPendingBeneficiaries(pendingData);
      setShowConfirmation(true);
    }
  }, []);

  const updatePendingBeneficiary = (id: string, field: string, value: string) => {
    setPendingBeneficiaries(pendingBeneficiaries.map(b =>
      b.id === id ? { ...b, [field]: value } : b
    ));
  };

  const removePendingBeneficiary = (id: string) => {
    setPendingBeneficiaries(pendingBeneficiaries.filter(b => b.id !== id));
  };

  const confirmBeneficiaries = () => {
    // Validate all have emails
    const missingEmails = pendingBeneficiaries.filter(b => !b.email || !b.email.trim());
    if (missingEmails.length > 0) {
      alert("Please add email addresses for all beneficiaries before confirming.");
      return;
    }

    // Add to beneficiaries list with proper status
    const confirmedBeneficiaries = pendingBeneficiaries.map(b => ({
      ...b,
      status: "pending" as const,
      invitedDate: "Just now",
      recordsAccess: 0,
      scopeSummary: "To be configured",
    }));

    const updatedList = [...beneficiaries, ...confirmedBeneficiaries];
    setBeneficiaries(updatedList);
    localStorage.setItem("beneficiariesList", JSON.stringify(updatedList));

    // Log activity
    logActivity(
      "Beneficiaries Added",
      "beneficiaries",
      `Added ${confirmedBeneficiaries.length} family member(s) as beneficiaries`,
      {
        field: "Beneficiaries",
        newValue: confirmedBeneficiaries.map(b => b.name).join(", ")
      }
    );

    // Clear pending
    localStorage.removeItem("pendingBeneficiaries");
    setPendingBeneficiaries([]);
    setShowConfirmation(false);
  };

  const cancelConfirmation = () => {
    localStorage.removeItem("pendingBeneficiaries");
    setPendingBeneficiaries([]);
    setShowConfirmation(false);
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
          <Button variant="primary">
            <UserPlus className="h-4 w-4" />
            Invite Beneficiary
          </Button>
        }
      />

      {/* Confirmation Section for Pending Beneficiaries */}
      {showConfirmation && pendingBeneficiaries.length > 0 && (
        <Card className="mb-6" style={{
          backgroundColor: "var(--accent-dim)",
          borderColor: "var(--accent)",
          borderWidth: "2px"
        }}>
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--accent)", color: "var(--text-inverse)" }}>
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                Confirm Family Members as Beneficiaries
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Review and add contact information for your family members. You can configure their access permissions after adding them.
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {pendingBeneficiaries.map((beneficiary) => (
              <Card key={beneficiary.id} style={{ backgroundColor: "var(--bg-primary)" }}>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full font-semibold text-lg"
                    style={{ background: "var(--accent-gradient)", color: "var(--text-inverse)" }}>
                    {beneficiary.name.split(" ").map((n) => n[0]).join("")}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {beneficiary.name}
                        </h4>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                          Relationship: {beneficiary.relationship}
                        </p>
                      </div>
                      <button
                        onClick={() => removePendingBeneficiary(beneficiary.id as string)}
                        className="p-1 hover:bg-hover rounded"
                        style={{ color: "var(--text-muted)" }}
                        title="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Email Address *"
                        type="email"
                        placeholder="example@email.com"
                        value={beneficiary.email}
                        onChange={(e) => updatePendingBeneficiary(beneficiary.id as string, "email", e.target.value)}
                        required
                      />
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                          Role
                        </label>
                        <select
                          className="input"
                          value={beneficiary.role}
                          onChange={(e) => updatePendingBeneficiary(beneficiary.id as string, "role", e.target.value)}
                        >
                          <option value="beneficiary">Beneficiary</option>
                          <option value="executor">Executor</option>
                          <option value="observer">Observer</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Access permissions can be configured after adding</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <Button
              variant="primary"
              onClick={confirmBeneficiaries}
              disabled={pendingBeneficiaries.some(b => !b.email || !b.email.trim())}
            >
              <Check className="h-4 w-4" />
              Confirm & Add {pendingBeneficiaries.length} Beneficiar{pendingBeneficiaries.length === 1 ? 'y' : 'ies'}
            </Button>
            <Button
              variant="ghost"
              onClick={cancelConfirmation}
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
        {beneficiaries.length === 0 ? (
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
            <Button variant="primary">
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
                    <Button variant="ghost" size="sm">
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
                  <Button variant="secondary" size="sm">
                    Edit Scope
                  </Button>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                  {person.status === "pending" && (
                    <Button variant="ghost" size="sm" className="text-accent">
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
