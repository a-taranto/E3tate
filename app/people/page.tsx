"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, Button, Badge, Input } from "@/components/ui";
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
  Trash2,
  X,
  FileText,
} from "lucide-react";
import {
  loadBeneficiaries,
  saveBeneficiaries,
  loadVaultRecords,
  getRecordsForPerson,
  getPersonAccess,
  recordDisclosedTo,
  setRecordDisclosure,
  isChildRelationship,
  type Beneficiary,
  type VaultRecord,
} from "@/lib/store";
import { toast } from "@/components/ui/Toaster";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

type FormState = {
  name: string;
  email: string;
  role: Beneficiary["role"];
  relationship: string;
  residentialAddress: string;
  dateOfBirth: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  role: "beneficiary",
  relationship: "",
  residentialAddress: "",
  dateOfBirth: "",
};

const roleConfig: Record<Beneficiary["role"], { variant: "success" | "info" | "default" | "warning"; description: string }> = {
  executor: { variant: "success", description: "Can trigger execution and access all records" },
  beneficiary: { variant: "info", description: "Receives designated records upon execution" },
  observer: { variant: "default", description: "Limited visibility for legal or advisory purposes" },
  contact: { variant: "default", description: "Trusted contact with no record access" },
  trustee: { variant: "info", description: "Holds assets in trust (e.g. for minors) until they pass on" },
  guardian: { variant: "warning", description: "Cares for any minor children" },
};

export default function PeoplePage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [vaultRecords, setVaultRecords] = useState<VaultRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [mode, setMode] = useState<null | "add" | "edit" | "view">(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      setBeneficiaries(loadBeneficiaries());
      setVaultRecords(loadVaultRecords());
      setLoaded(true);
    };
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  const activePerson = beneficiaries.find((b) => b.id === activeId) || null;

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setActiveId(null);
    setMode("add");
  };
  const openEdit = (p: Beneficiary) => {
    setForm({
      name: p.name,
      email: p.email || "",
      role: p.role,
      relationship: p.relationship || "",
      residentialAddress: p.residentialAddress || "",
      dateOfBirth: p.dateOfBirth || "",
    });
    setActiveId(p.id);
    setMode("edit");
    setMenuOpenId(null);
  };
  const openView = (p: Beneficiary) => {
    setActiveId(p.id);
    setMode("view");
    setMenuOpenId(null);
  };
  const closeModal = () => {
    setMode(null);
    setActiveId(null);
    setForm(EMPTY_FORM);
  };

  const emailOk = !form.email.trim() || isValidEmail(form.email);
  const canSave = form.name.trim() && emailOk;

  const submitForm = () => {
    if (!canSave) return;
    const patch = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      relationship: form.relationship.trim() || undefined,
      residentialAddress: form.residentialAddress.trim() || undefined,
      dateOfBirth: isChildRelationship(form.relationship) ? form.dateOfBirth || undefined : undefined,
    };
    let updated: Beneficiary[];
    if (mode === "edit" && activeId) {
      updated = beneficiaries.map((b) => (b.id === activeId ? { ...b, ...patch } : b));
    } else {
      updated = [
        ...beneficiaries,
        {
          id: Date.now().toString(),
          status: "pending",
          invitedDate: "Just now",
          ...patch,
        } as Beneficiary,
      ];
    }
    setBeneficiaries(updated);
    saveBeneficiaries(updated);
    logActivity(mode === "edit" ? "Person Updated" : "Person Added", "beneficiary", `${patch.name} (${patch.role})`);
    toast(mode === "edit" ? "Person updated" : "Person added");
    closeModal();
  };

  const removePerson = (p: Beneficiary) => {
    setMenuOpenId(null);
    if (!confirm(`Remove ${p.name} from your people?`)) return;
    const updated = beneficiaries.filter((b) => b.id !== p.id);
    setBeneficiaries(updated);
    saveBeneficiaries(updated);
    logActivity("Person Removed", "beneficiary", p.name);
    toast(`${p.name} removed`, "info");
  };

  const toggleRecordAccess = (record: VaultRecord, person: Beneficiary) => {
    setRecordDisclosure(record.id, person, !recordDisclosedTo(record, person));
    setVaultRecords(loadVaultRecords());
  };

  const executorCount = beneficiaries.filter((b) => b.role === "executor").length;
  const beneficiaryCount = beneficiaries.filter((b) => b.role === "beneficiary").length;
  const pendingCount = beneficiaries.filter((b) => b.status === "pending").length;

  return (
    <div>
      <Header
        title="People"
        subtitle="Everyone in your estate — executors, trustees, guardians, beneficiaries, and contacts"
        action={
          <Button variant="primary" onClick={openAdd}>
            <UserPlus className="h-4 w-4" />
            Add Person
          </Button>
        }
      />

      {/* Stats */}
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

      {/* Role legend */}
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

      {/* People list */}
      <div className="space-y-3">
        {!loaded ? (
          <Card className="text-center py-12">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>
          </Card>
        ) : beneficiaries.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: "var(--accent-dim)" }}>
              <Users className="h-8 w-8" style={{ color: "var(--accent)" }} />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No People Added Yet</h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Add the executors, beneficiaries, guardians, family, and trusted contacts involved in your estate.
            </p>
            <Button variant="primary" onClick={openAdd}>
              <UserPlus className="h-4 w-4" />
              Add Your First Person
            </Button>
          </Card>
        ) : (
          beneficiaries.map((person) => {
            const access = getPersonAccess(person);
            return (
              <Card key={person.id} hover padding="none">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary-bg font-semibold text-lg">
                        {person.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">{person.name}</h3>
                          <Badge variant={roleConfig[person.role].variant} className="capitalize">
                            {person.role}
                          </Badge>
                          {person.relationship && (
                            <span className="text-sm text-text-muted">{person.relationship}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                          <Mail className="h-3.5 w-3.5" />
                          {person.email || "No email"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {person.status === "accepted" ? (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          Accepted
                        </div>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}

                      {/* Delete */}
                      <Button variant="ghost" size="sm" onClick={() => removePerson(person)} title="Remove" aria-label={`Remove ${person.name}`}>
                        <Trash2 className="h-4 w-4" style={{ color: "var(--error)" }} />
                      </Button>

                      {/* Overflow menu */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMenuOpenId(menuOpenId === person.id ? null : person.id)}
                          aria-label="More actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {menuOpenId === person.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                            <div
                              className="absolute right-0 mt-1 w-44 rounded-lg border shadow-lg z-20 py-1"
                              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
                            >
                              <MenuItem icon={FileText} label="View details" onClick={() => openView(person)} />
                              <MenuItem icon={Check} label="Edit" onClick={() => openEdit(person)} />
                              {person.status === "pending" && (
                                <MenuItem
                                  icon={Mail}
                                  label="Send invite"
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    logActivity("Invite Sent", "beneficiary", `Invitation sent to ${person.name}`);
                                    toast(`Invitation sent to ${person.email || person.name}`);
                                  }}
                                />
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details row — Records Access opens the View Details modal */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-text-muted mb-1">Invited</p>
                      <p className="text-sm">{person.invitedDate || "—"}</p>
                    </div>
                    <button className="text-left" onClick={() => openView(person)}>
                      <p className="text-xs text-text-muted mb-1">Records Access</p>
                      <p className="text-sm font-mono" style={{ color: "var(--accent)" }}>
                        {access.count} record{access.count === 1 ? "" : "s"} →
                      </p>
                    </button>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Disclosure Scope</p>
                      <p className="text-sm">{access.scopeLabel}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="secondary" size="sm" onClick={() => openView(person)}>
                      View Details
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(person)}>
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Add / Edit modal */}
      {(mode === "add" || mode === "edit") && (
        <Modal title={mode === "edit" ? "Edit Person" : "Add Person"} onClose={closeModal}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input label="Full Name *" placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input
              label="Email Address"
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={form.email && !isValidEmail(form.email) ? "Enter a valid email address" : undefined}
            />
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Role</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Beneficiary["role"] })}>
                <option value="beneficiary">Beneficiary</option>
                <option value="executor">Executor</option>
                <option value="trustee">Trustee</option>
                <option value="guardian">Guardian</option>
                <option value="observer">Observer</option>
                <option value="contact">Contact</option>
              </select>
            </div>
            <Input label="Relationship to me" placeholder="Spouse, Child, Friend…" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
            <div className="md:col-span-2">
              <Input label="Residential Address" placeholder="42 Park Ave, Sydney NSW 2000" value={form.residentialAddress} onChange={(e) => setForm({ ...form, residentialAddress: e.target.value })} />
            </div>
            {isChildRelationship(form.relationship) && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Date of Birth</label>
                <input type="date" className="input w-full" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>A child under 18 requires a guardian in your will.</p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={submitForm} disabled={!canSave}>
              <Check className="h-4 w-4" />
              {mode === "edit" ? "Save Changes" : "Add Person"}
            </Button>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
          </div>
        </Modal>
      )}

      {/* View Details modal — person summary + record access editor */}
      {mode === "view" && activePerson && (
        <Modal title={activePerson.name} onClose={closeModal}>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={roleConfig[activePerson.role].variant} className="capitalize">{activePerson.role}</Badge>
            {activePerson.relationship && <span className="text-sm text-text-muted">{activePerson.relationship}</span>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-sm">
            <Detail label="Email" value={activePerson.email} />
            <Detail label="Residential address" value={activePerson.residentialAddress} />
            <Detail label="Disclosure scope" value={getPersonAccess(activePerson).scopeLabel} />
            {activePerson.dateOfBirth && <Detail label="Date of birth" value={activePerson.dateOfBirth} />}
          </div>

          <h4 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Record access</h4>
          {activePerson.role === "executor" ? (
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
              As an executor, {activePerson.name} can access <strong>all {vaultRecords.length} vault records</strong> and trigger execution.
            </p>
          ) : activePerson.role === "contact" ? (
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
              Contacts have no record access. Change their role to grant access.
            </p>
          ) : (
            <>
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                Tick the records {activePerson.name} should be able to access.
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {vaultRecords.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No vault records yet.</p>
                ) : (
                  vaultRecords.map((rec) => {
                    const on = recordDisclosedTo(rec, activePerson);
                    return (
                      <label key={rec.id} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2" style={{ borderColor: on ? "var(--accent)" : "var(--border)" }}>
                        <input type="checkbox" checked={on} onChange={() => toggleRecordAccess(rec, activePerson)} className="w-5 h-5 rounded" style={{ accentColor: "var(--accent)" }} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{rec.title}</p>
                          <p className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{rec.type}{rec.institution ? ` · ${rec.institution}` : ""}</p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </>
          )}

          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={() => openEdit(activePerson)}>
              <Check className="h-4 w-4" />
              Edit person
            </Button>
            <Button variant="ghost" onClick={closeModal}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick }: { icon: typeof Check; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-accent-muted/40"
      style={{ color: "var(--text-primary)" }}
    >
      <Icon className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
      {label}
    </button>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className="text-sm" style={{ color: "var(--text-primary)" }}>{value || "—"}</p>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <Card padding="lg" className="max-w-2xl w-full my-8 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md transition-colors hover:bg-accent-muted/40" style={{ color: "var(--text-muted)" }} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}
