"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { Card, Button } from "@/components/ui";
import { Globe, Download, ArrowRight, KeyRound, Bitcoin, Pencil, Check, X } from "lucide-react";
import { loadVaultRecords, loadAssets, type VaultRecord, type EstateAsset } from "@/lib/store";
import {
  loadDigitalRegister,
  saveDigitalRegister,
  getDigitalAssetValue,
  type DigitalRegister,
  type PasswordManager,
} from "@/lib/model/digitalRegister";
import { scanForSecret } from "@/lib/model/secretGuard";
import { downloadDigitalRegisterPdf } from "@/lib/annexures";

const fmtAUD = (n: number) =>
  n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

// The Digital Asset Register is a COMPILED VIEW, not a separate place to type.
// Online accounts come from Accounts & Online; digital assets of value come from
// Assets; the only thing captured here is the password manager (the master key,
// which isn't an account or an asset). This avoids duplicating the same item
// across the Register, Accounts, and Assets.
export default function DigitalRegisterPage() {
  const router = useRouter();
  const [reg, setReg] = useState<DigitalRegister | null>(null);
  const [accounts, setAccounts] = useState<VaultRecord[]>([]);
  const [digitalAssets, setDigitalAssets] = useState<EstateAsset[]>([]);
  const [pmEditing, setPmEditing] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setReg(loadDigitalRegister());
      setAccounts(
        loadVaultRecords().filter(
          (r) => r.serviceId || r.type === "accounts" || r.type === "credentials" || r.type === "wallets"
        )
      );
      setDigitalAssets(loadAssets().filter((a) => a.type === "digital" || a.type === "ip"));
    };
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  if (!reg) return null;

  // Any legacy entries captured in the old editable register (kept visible, but
  // capture now lives in Accounts & Online / Assets).
  const legacy = [
    ...reg.financial_accounts.map((x) => x.platform),
    ...reg.crypto.map((x) => x.asset_type),
    ...reg.social_media.map((x) => x.platform),
    ...reg.domains_ip.map((x) => x.asset),
    ...reg.other.map((x) => x.asset_description),
  ].filter(Boolean);

  const digitalValue = getDigitalAssetValue(reg) + digitalAssets.reduce((s, a) => s + (a.estimatedValue || 0), 0);

  return (
    <div>
      <Header
        title="Digital Asset Register"
        subtitle="A compiled record of your online accounts and digital assets, and how to access them — download it as an annexure to keep with your printed will."
        action={
          <Button variant="primary" size="sm" onClick={downloadDigitalRegisterPdf}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        }
      />

      {/* No-secrets reminder + where capture lives */}
      <Card padding="md" className="mb-6 border-l-4" style={{ borderLeftColor: "var(--info)" }}>
        <div className="flex items-start gap-3">
          <KeyRound className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "var(--info)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            This register is compiled from your{" "}
            <button onClick={() => router.push("/vault/online")} className="underline" style={{ color: "var(--accent)" }}>
              Accounts &amp; Online
            </button>{" "}
            and{" "}
            <button onClick={() => router.push("/vault/assets")} className="underline" style={{ color: "var(--accent)" }}>
              Assets
            </button>
            . Add or edit items there — this page never stores passwords or seed phrases, only where access lives.
          </p>
        </div>
      </Card>

      {/* Online accounts (from Accounts & Online) */}
      <Card padding="lg" className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Online accounts {accounts.length > 0 && <span style={{ color: "var(--text-muted)" }}>({accounts.length})</span>}
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/vault/online")}>
            Manage <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        {accounts.length === 0 ? (
          <p className="text-sm py-1" style={{ color: "var(--text-muted)" }}>
            No accounts yet — add them under Accounts &amp; Online.
          </p>
        ) : (
          <div className="space-y-2">
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: "var(--bg-surface)" }}>
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>{a.title}</span>
                <span className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{a.subtype || a.type}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Digital assets of value (from Assets) */}
      <Card padding="lg" className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Crypto &amp; digital assets {digitalAssets.length > 0 && <span style={{ color: "var(--text-muted)" }}>({digitalAssets.length})</span>}
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/vault/assets")}>
            Manage <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        {digitalAssets.length === 0 ? (
          <p className="text-sm py-1" style={{ color: "var(--text-muted)" }}>
            No digital assets of value yet — add crypto or IP under Assets.
          </p>
        ) : (
          <div className="space-y-2">
            {digitalAssets.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: "var(--bg-surface)" }}>
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>{a.title}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{a.estimatedValue != null ? fmtAUD(a.estimatedValue) : "—"}</span>
              </div>
            ))}
          </div>
        )}
        {digitalValue > 0 && (
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            Digital assets of value: <strong>{fmtAUD(digitalValue)}</strong> (counted in your net estate via Assets).
          </p>
        )}
      </Card>

      {/* Password manager — the one thing captured here (the master key) */}
      <PasswordManagerCard
        value={reg.password_manager}
        editing={pmEditing}
        setEditing={setPmEditing}
        onSave={(pm) => {
          saveDigitalRegister({ ...reg, password_manager: pm });
          setReg(loadDigitalRegister());
          setPmEditing(false);
        }}
      />

      {/* Legacy register entries, if any were captured in the old editor */}
      {legacy.length > 0 && (
        <Card padding="md" className="mb-4 border-l-4" style={{ borderLeftColor: "var(--warning)" }}>
          <p className="text-sm mb-1" style={{ color: "var(--text-primary)" }}>
            Earlier register entries
          </p>
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            These were added in the old register. Re-add them under Accounts &amp; Online or Assets so they stay in one place.
          </p>
          <div className="flex flex-wrap gap-2">
            {legacy.map((l, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-secondary)" }}>
                {l}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// Password manager is a single record (the master key to everything), so it gets
// a dedicated inline form. It's the only item the register captures directly.
function PasswordManagerCard({
  value,
  editing,
  setEditing,
  onSave,
}: {
  value: PasswordManager;
  editing: boolean;
  setEditing: (b: boolean) => void;
  onSave: (pm: PasswordManager) => void;
}) {
  const [form, setForm] = useState<PasswordManager>(value);
  const [error, setError] = useState("");

  const start = () => {
    setForm(value);
    setError("");
    setEditing(true);
  };
  const save = () => {
    const scan = scanForSecret(form.master_password_location);
    if (!scan.ok) {
      setError(scan.reason!);
      return;
    }
    onSave({
      application: form.application?.trim() || undefined,
      email_username: form.email_username?.trim() || undefined,
      master_password_location: form.master_password_location?.trim() || undefined,
      recovery_emergency_access: form.recovery_emergency_access?.trim() || undefined,
    });
  };

  const set = (k: keyof PasswordManager, v: string) => setForm((s) => ({ ...s, [k]: v }));
  const isSet = value.application || value.email_username || value.master_password_location;

  return (
    <Card padding="lg" className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 flex-shrink-0" style={{ color: "var(--accent)" }} />
          <div>
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Password manager
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              The master key your executor needs — location only, never the password
            </p>
          </div>
        </div>
        {!editing && (
          <Button variant="secondary" size="sm" onClick={start}>
            <Pencil className="h-4 w-4" />
            {isSet ? "Edit" : "Add"}
          </Button>
        )}
      </div>

      {editing ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Application</label>
              <input className="input w-full" placeholder="e.g. 1Password" value={form.application || ""} onChange={(e) => set("application", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Account email / username</label>
              <input className="input w-full" value={form.email_username || ""} onChange={(e) => set("email_username", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Where the master password is kept (location only)</label>
              <input className={`input w-full${error ? " border-red-400" : ""}`} placeholder="e.g. Sealed letter with solicitor" value={form.master_password_location || ""} onChange={(e) => set("master_password_location", e.target.value)} />
              {error && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{error}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Recovery / emergency access</label>
              <textarea className="input w-full" rows={2} value={form.recovery_emergency_access || ""} onChange={(e) => set("recovery_emergency_access", e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={save}>
              <Check className="h-4 w-4" />
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ) : isSet ? (
        <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "var(--bg-surface)" }}>
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>{value.application || "Password manager"}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {[value.email_username, value.master_password_location].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
      ) : (
        <p className="text-sm py-1" style={{ color: "var(--text-muted)" }}>Not recorded yet.</p>
      )}
    </Card>
  );
}
