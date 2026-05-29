"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { toast } from "@/components/ui/Toaster";
import { Landmark, AlertTriangle, ShieldCheck, Scale, Check, ArrowRight } from "lucide-react";
import { loadProfile, loadBeneficiaries, type Beneficiary } from "@/lib/store";
import {
  loadTrust,
  saveTrust,
  TRUST_CHECKLIST_STEPS,
  type TestamentaryTrust,
} from "@/lib/model/trust";
import { recommendTestamentaryTrust, type TrustRecommendation } from "@/lib/model/computations";

const surnameFromName = (full?: string) => {
  const parts = (full || "").trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : "";
};

export default function TestamentaryTrustPage() {
  const router = useRouter();
  const [form, setForm] = useState<TestamentaryTrust | null>(null);
  const [rec, setRec] = useState<TrustRecommendation>({ level: "low", reasons: [] });
  const [people, setPeople] = useState<Beneficiary[]>([]);
  const [defaultSurname, setDefaultSurname] = useState("");

  useEffect(() => {
    setForm(loadTrust());
    setPeople(loadBeneficiaries());
    setDefaultSurname(surnameFromName(loadProfile().fullName));
    const refresh = () => setRec(recommendTestamentaryTrust());
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  if (!form) return null;

  // Write a patch through to the store and keep local state in sync.
  const update = (patch: Partial<TestamentaryTrust>) => setForm(saveTrust(patch));

  const toggleAcknowledge = (ack: boolean) =>
    // Un-acknowledging also disables — the warning gate must hold.
    update(ack ? { acknowledged_warning: true } : { acknowledged_warning: false, enabled: false });

  const toggleEnabled = (on: boolean) => {
    if (on && !form.acknowledged_warning) return;
    update({ enabled: on });
  };

  const toggleStep = (step: number) =>
    update({
      executor_checklist: form.executor_checklist.map((it) =>
        it.step === step
          ? { ...it, status: it.status === "done" ? "pending" : "done", completed_at: it.status === "done" ? undefined : new Date().toISOString() }
          : it
      ),
    });

  const effectiveSurname = (form.surname || defaultSurname).trim();
  const trustNamePreview =
    form.trust_name_override?.trim() ||
    (effectiveSurname ? `${effectiveSurname} Family Testamentary Trust` : "[Surname] Family Testamentary Trust");
  const high = rec.level === "high";
  const trusteeCandidates = people.filter((p) => p.role === "trustee" || p.role === "executor");

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Testamentary Trust
        </h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          An optional addendum that holds part of your estate in a discretionary trust instead of
          distributing it outright — used for asset protection and tax-effective provision for family.
        </p>
      </div>

      {/* Recommendation */}
      {rec.level !== "low" && (
        <Card className="mb-6 border-l-4" style={{ borderLeftColor: high ? "var(--warning)" : "var(--info)" }}>
          <div className="flex items-start gap-3">
            <Landmark className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: high ? "var(--warning)" : "var(--info)" }} />
            <div>
              <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                {high ? "Strongly recommended for your situation" : "Worth considering for your situation"}
              </p>
              <ul className="text-sm space-y-0.5" style={{ color: "var(--text-secondary)" }}>
                {rec.reasons.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Mandatory warning + acknowledgement (the gate) */}
      <Card className="mb-6 border-l-4" style={{ borderLeftColor: "var(--warning)" }}>
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "var(--warning)" }} />
          <div>
            <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Before you enable this
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Testamentary trust provisions carry significant legal and tax complexity. Using them
              without proper legal advice risks provisions that fail to achieve their intended tax or
              asset-protection purpose. They are intended only where your net estate is likely to
              exceed $500,000, your beneficiaries include minors or persons with creditor/relationship
              risk, and you hold income-producing assets. Meta Law strongly recommends a qualified NSW
              solicitor review (and if needed redraft) these provisions for your circumstances.
            </p>
          </div>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-5 h-5 rounded mt-0.5"
            style={{ accentColor: "var(--accent)" }}
            checked={form.acknowledged_warning}
            onChange={(e) => toggleAcknowledge(e.target.checked)}
          />
          <span className="text-sm" style={{ color: "var(--text-primary)" }}>
            I understand the complexity and risks, and I will seek legal advice before relying on these
            provisions.
          </span>
        </label>
      </Card>

      {/* Enable toggle */}
      <Card className="mb-6">
        <label className={`flex items-center justify-between gap-4 ${form.acknowledged_warning ? "cursor-pointer" : "opacity-60"}`}>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 flex-shrink-0" style={{ color: form.enabled ? "var(--success)" : "var(--text-muted)" }} />
            <div>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                Include testamentary trust provisions in my will
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {form.acknowledged_warning
                  ? "Adds the Schedule 3 clauses after your residuary estate."
                  : "Acknowledge the warning above to enable this."}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            className="w-6 h-6 rounded"
            style={{ accentColor: "var(--accent)" }}
            disabled={!form.acknowledged_warning}
            checked={form.enabled}
            onChange={(e) => toggleEnabled(e.target.checked)}
          />
        </label>
      </Card>

      {/* Configuration — only when enabled */}
      {form.enabled && (
        <>
          <Card className="mb-6">
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Trust details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    Family surname
                  </label>
                  <input
                    className="input w-full"
                    placeholder={defaultSurname || "e.g. Morgan"}
                    value={form.surname ?? ""}
                    onChange={(e) => update({ surname: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    Trust name override (optional)
                  </label>
                  <input
                    className="input w-full"
                    placeholder={trustNamePreview}
                    value={form.trust_name_override ?? ""}
                    onChange={(e) => update({ trust_name_override: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Each trust will be named <strong>{trustNamePreview}</strong>.
              </p>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Election window (months from Grant of Probate)
                </label>
                <input
                  type="number"
                  className="input w-full sm:w-48"
                  value={form.election_window_months}
                  onChange={(e) => update({ election_window_months: Number(e.target.value) || 24 })}
                />
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  The kit default is 24 months. Change only on advice.
                </p>
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Initial trustee
            </h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              Who controls each trust at the outset. If a primary beneficiary is a minor, choose the
              co-trustee option (or an independent trustee).
            </p>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg" style={{ backgroundColor: form.initial_trustee_option !== "B_primary_plus_co" ? "var(--accent-dim)" : "var(--bg-surface)" }}>
                <input
                  type="radio"
                  name="trusteeOption"
                  className="mt-1"
                  style={{ accentColor: "var(--accent)" }}
                  checked={form.initial_trustee_option !== "B_primary_plus_co"}
                  onChange={() => update({ initial_trustee_option: "A_primary_sole" })}
                />
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Primary beneficiary as sole trustee
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Each beneficiary controls their own trust (simplest; best for capable adults).
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg" style={{ backgroundColor: form.initial_trustee_option === "B_primary_plus_co" ? "var(--accent-dim)" : "var(--bg-surface)" }}>
                <input
                  type="radio"
                  name="trusteeOption"
                  className="mt-1"
                  style={{ accentColor: "var(--accent)" }}
                  checked={form.initial_trustee_option === "B_primary_plus_co"}
                  onChange={() => update({ initial_trustee_option: "B_primary_plus_co" })}
                />
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Primary beneficiary plus a co-trustee
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Adds oversight — required where a beneficiary is a minor.
                  </p>
                </div>
              </label>

              {form.initial_trustee_option === "B_primary_plus_co" && (
                <div className="pl-3">
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    Co-trustee
                  </label>
                  {trusteeCandidates.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {trusteeCandidates.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => update({ co_trustee_name: p.name })}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: form.co_trustee_name === p.name ? "var(--accent)" : "var(--bg-surface)",
                            color: form.co_trustee_name === p.name ? "var(--text-inverse)" : "var(--text-secondary)",
                          }}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    className="input w-full"
                    placeholder="Co-trustee's full name"
                    value={form.co_trustee_name ?? ""}
                    onChange={(e) => update({ co_trustee_name: e.target.value })}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* On-death executor checklist */}
          <Card className="mb-6">
            <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              What your executor will do on your death
            </h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              The trust is created by a solicitor-prepared deed after death. These steps are recorded so
              your executor has a checklist.
            </p>
            <div className="space-y-2">
              {form.executor_checklist.map((it) => (
                <label
                  key={it.step}
                  className="flex items-start gap-3 cursor-pointer p-2 rounded-lg"
                  style={{ backgroundColor: "var(--bg-surface)" }}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded mt-0.5"
                    style={{ accentColor: "var(--success)" }}
                    checked={it.status === "done"}
                    onChange={() => toggleStep(it.step)}
                  />
                  <span
                    className="text-sm"
                    style={{
                      color: it.status === "done" ? "var(--text-muted)" : "var(--text-primary)",
                      textDecoration: it.status === "done" ? "line-through" : "none",
                    }}
                  >
                    {it.step}. {it.description}
                  </span>
                </label>
              ))}
            </div>
          </Card>

          {/* Tax note + solicitor CTA */}
          <Card className="mb-6 border-l-4" style={{ borderLeftColor: "var(--info)" }}>
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
              <strong>Tax note:</strong> income distributed from a testamentary trust to a minor is taxed
              at ordinary individual marginal rates as “excepted trust income” (s.102AG ITAA 1936), not
              the penalty minor rates — often a significant saving on investment income. Obtain annual
              tax advice to optimise distributions.
            </p>
            <Button variant="secondary" size="sm" onClick={() => toast("Solicitor review is coming soon — we'll connect you with a NSW estate-planning solicitor.", "info")}>
              <Scale className="h-4 w-4" />
              Request review by a solicitor
            </Button>
          </Card>

          <Card className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" style={{ color: "var(--success)" }} />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  These provisions now appear in your will after the residuary estate.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => router.push("/will")}>
                View in will <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
