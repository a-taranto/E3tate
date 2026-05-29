"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import {
  Globe,
  Download,
  ArrowRight,
  Landmark,
  Bitcoin,
  Share2,
  Globe2,
  KeyRound,
  Boxes,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { loadVaultRecords, type VaultRecord } from "@/lib/store";
import {
  loadDigitalRegister,
  saveDigitalRegister,
  getDigitalAssetValue,
  type DigitalRegister,
  type PasswordManager,
} from "@/lib/model/digitalRegister";
import { scanForSecret } from "@/lib/model/secretGuard";
import { downloadDigitalRegisterPdf } from "@/lib/annexures";
import RegisterSection, { type FieldDef, type RegisterItem } from "@/components/digital/RegisterSection";

const fmtAUD = (n: number) =>
  n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

const genId = () => `${Date.now()}-${Math.round(Math.random() * 1e6)}`;

// Array sections of the register, declaratively. Keys/labels mirror the model
// (digitalRegister.ts). Location/secret fields are flagged secretGuarded.
const TWO_FA_OPTS = [
  { value: "authenticator_app", label: "Authenticator app" },
  { value: "sms", label: "SMS" },
  { value: "hardware_key", label: "Hardware key" },
  { value: "email", label: "Email" },
  { value: "none", label: "None" },
];

const FINANCIAL_FIELDS: FieldDef[] = [
  { key: "platform", label: "Platform / institution", required: true, half: true, placeholder: "e.g. CommBank NetBank" },
  { key: "account_type", label: "Account type", half: true, placeholder: "e.g. Everyday, Savings" },
  { key: "username_email", label: "Login email / username", half: true },
  { key: "twofa_method", label: "Two-factor method", type: "select", options: TWO_FA_OPTS, half: true },
  { key: "access_instructions_location", label: "Where access details are kept (location only)", secretGuarded: true, placeholder: "e.g. E3tate Vault" },
];

const CRYPTO_FIELDS: FieldDef[] = [
  { key: "asset_type", label: "Asset", required: true, half: true, placeholder: "e.g. BTC, ETH" },
  { key: "exchange_wallet", label: "Exchange / wallet", half: true, placeholder: "e.g. Coinbase, Ledger" },
  { key: "approx_value_aud", label: "Approx. value (AUD)", type: "number", half: true },
  { key: "seed_phrase_key_location", label: "Where the seed phrase / key is kept (location only)", secretGuarded: true, placeholder: "e.g. Vault, safe deposit box" },
  { key: "notes", label: "Notes", type: "textarea" },
];

const SOCIAL_FIELDS: FieldDef[] = [
  { key: "platform", label: "Platform", required: true, half: true, placeholder: "e.g. Instagram" },
  { key: "username_profile_url", label: "Username / profile URL", half: true },
  {
    key: "instruction",
    label: "On my death",
    type: "select",
    required: true,
    half: true,
    options: [
      { value: "close", label: "Close the account" },
      { value: "memorialise", label: "Memorialise" },
      { value: "transfer", label: "Transfer to someone" },
    ],
  },
  { key: "authorised_person_notes", label: "Notes (who handles this)", type: "textarea" },
];

const DOMAIN_FIELDS: FieldDef[] = [
  { key: "asset", label: "Domain / IP asset", required: true, half: true, placeholder: "e.g. mysite.com" },
  { key: "registrar_platform", label: "Registrar / platform", half: true, placeholder: "e.g. GoDaddy" },
  { key: "approx_value_aud", label: "Approx. value (AUD)", type: "number", half: true },
  { key: "renewal_date", label: "Renewal date", half: true, placeholder: "e.g. 2026-09-01" },
  { key: "instructions_for_executor", label: "Instructions for executor", type: "textarea" },
];

const OTHER_FIELDS: FieldDef[] = [
  { key: "asset_description", label: "Asset", required: true, half: true, placeholder: "e.g. Qantas points, NFT" },
  { key: "platform_provider", label: "Platform / provider", half: true },
  {
    key: "category",
    label: "Category",
    type: "select",
    half: true,
    options: [
      { value: "loyalty_program", label: "Loyalty program" },
      { value: "digital_content", label: "Digital content" },
      { value: "gaming", label: "Gaming" },
      { value: "nft", label: "NFT" },
      { value: "cloud_storage", label: "Cloud storage" },
      { value: "email", label: "Email" },
      { value: "online_business", label: "Online business" },
      { value: "other", label: "Other" },
    ],
  },
  { key: "approx_value_or_points", label: "Approx. value or points", half: true },
  { key: "instructions", label: "Instructions", type: "textarea" },
];

export default function DigitalRegisterPage() {
  const router = useRouter();
  const [reg, setReg] = useState<DigitalRegister | null>(null);
  const [accounts, setAccounts] = useState<VaultRecord[]>([]);
  const [pmEditing, setPmEditing] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setReg(loadDigitalRegister());
      setAccounts(
        loadVaultRecords().filter(
          (r) => r.type === "accounts" || r.type === "credentials" || r.type === "wallets"
        )
      );
    };
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  if (!reg) return null;

  // CRUD: mutate the loaded register and persist (writeRaw dispatches
  // store-updated, which re-runs refresh; we also setReg for immediacy).
  const apply = (next: DigitalRegister) => {
    saveDigitalRegister(next);
    setReg(next);
  };
  type ArrayKey = "financial_accounts" | "crypto" | "social_media" | "domains_ip" | "other";
  const addItem = (key: ArrayKey, item: Record<string, unknown>) =>
    apply({ ...reg, [key]: [...reg[key], { ...item, id: genId() }] });
  const updateItem = (key: ArrayKey, id: string, item: Record<string, unknown>) =>
    apply({ ...reg, [key]: reg[key].map((x) => (x.id === id ? { ...x, ...item, id } : x)) });
  const deleteItem = (key: ArrayKey, id: string) =>
    apply({ ...reg, [key]: reg[key].filter((x) => x.id !== id) });

  const digitalValue = getDigitalAssetValue(reg);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Digital Asset Register
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            A record of your digital accounts and assets and how to access them. Download it as an{" "}
            <strong>annexure</strong> to keep with your printed will so your executor can find and
            deal with them.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={downloadDigitalRegisterPdf} className="flex-shrink-0">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* No-secrets reminder */}
      <Card padding="md" className="mb-6 border-l-4" style={{ borderLeftColor: "var(--info)" }}>
        <div className="flex items-start gap-3">
          <KeyRound className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "var(--info)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            This register never stores passwords, PINs, or seed phrases — only{" "}
            <strong>where</strong> access lives. Your actual credentials belong in the{" "}
            <button onClick={() => router.push("/vault/online")} className="underline" style={{ color: "var(--accent)" }}>
              Vault
            </button>
            .
          </p>
        </div>
      </Card>

      <RegisterSection
        title="Online financial accounts"
        icon={Landmark}
        description="Banking, brokerage, and other money logins"
        items={reg.financial_accounts as unknown as RegisterItem[]}
        fields={FINANCIAL_FIELDS}
        primaryKey="platform"
        secondaryKeys={["account_type", "username_email"]}
        addLabel="Add account"
        onAdd={(i) => addItem("financial_accounts", i)}
        onUpdate={(id, i) => updateItem("financial_accounts", id, i)}
        onDelete={(id) => deleteItem("financial_accounts", id)}
      />

      <RegisterSection
        title="Cryptocurrency"
        icon={Bitcoin}
        description="Holdings, exchanges, and wallets"
        items={reg.crypto as unknown as RegisterItem[]}
        fields={CRYPTO_FIELDS}
        primaryKey="asset_type"
        secondaryKeys={["exchange_wallet"]}
        addLabel="Add crypto"
        onAdd={(i) => addItem("crypto", i)}
        onUpdate={(id, i) => updateItem("crypto", id, i)}
        onDelete={(id) => deleteItem("crypto", id)}
      />

      <RegisterSection
        title="Social media & online accounts"
        icon={Share2}
        description="What should happen to each on your death"
        items={reg.social_media as unknown as RegisterItem[]}
        fields={SOCIAL_FIELDS}
        primaryKey="platform"
        secondaryKeys={["instruction"]}
        addLabel="Add account"
        onAdd={(i) => addItem("social_media", i)}
        onUpdate={(id, i) => updateItem("social_media", id, i)}
        onDelete={(id) => deleteItem("social_media", id)}
      />

      <RegisterSection
        title="Domains, websites & IP"
        icon={Globe2}
        description="Domains, sites, and intellectual property"
        items={reg.domains_ip as unknown as RegisterItem[]}
        fields={DOMAIN_FIELDS}
        primaryKey="asset"
        secondaryKeys={["registrar_platform"]}
        addLabel="Add domain"
        onAdd={(i) => addItem("domains_ip", i)}
        onUpdate={(id, i) => updateItem("domains_ip", id, i)}
        onDelete={(id) => deleteItem("domains_ip", id)}
      />

      <RegisterSection
        title="Other digital assets"
        icon={Boxes}
        description="Loyalty points, gaming, content, and more"
        items={reg.other as unknown as RegisterItem[]}
        fields={OTHER_FIELDS}
        primaryKey="asset_description"
        secondaryKeys={["platform_provider", "approx_value_or_points"]}
        addLabel="Add asset"
        onAdd={(i) => addItem("other", i)}
        onUpdate={(id, i) => updateItem("other", id, i)}
        onDelete={(id) => deleteItem("other", id)}
      />

      <PasswordManagerCard
        value={reg.password_manager}
        editing={pmEditing}
        setEditing={setPmEditing}
        onSave={(pm) => {
          apply({ ...reg, password_manager: pm });
          setPmEditing(false);
        }}
      />

      {digitalValue > 0 && (
        <p className="text-xs mt-2 mb-6" style={{ color: "var(--text-muted)" }}>
          Approx. value of holdings recorded here: <strong>{fmtAUD(digitalValue)}</strong>. This is a
          reference for your executor — to count a holding toward your net estate, also add it under{" "}
          <button onClick={() => router.push("/vault/assets")} className="underline" style={{ color: "var(--accent)" }}>
            Assets
          </button>
          .
        </p>
      )}

      {/* Online accounts captured via the Vault service flow (read-only here). */}
      {accounts.length > 0 && (
        <Card padding="lg" className="mt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              From your Vault accounts
            </h3>
            <Button variant="ghost" size="sm" onClick={() => router.push("/vault/online")}>
              Manage <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {accounts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-2 rounded-lg"
                style={{ backgroundColor: "var(--bg-surface)" }}
              >
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {a.title}
                </span>
                <span className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
                  {a.subtype || a.type}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// Password manager is a single record (the master key to everything), so it gets
// a dedicated inline form rather than the list editor.
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
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Application
              </label>
              <input className="input w-full" placeholder="e.g. 1Password" value={form.application || ""} onChange={(e) => set("application", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Account email / username
              </label>
              <input className="input w-full" value={form.email_username || ""} onChange={(e) => set("email_username", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Where the master password is kept (location only)
              </label>
              <input className={`input w-full${error ? " border-red-400" : ""}`} placeholder="e.g. Sealed letter with solicitor" value={form.master_password_location || ""} onChange={(e) => set("master_password_location", e.target.value)} />
              {error && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{error}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                Recovery / emergency access
              </label>
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
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>
            {value.application || "Password manager"}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {[value.email_username, value.master_password_location].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
      ) : (
        <p className="text-sm py-1" style={{ color: "var(--text-muted)" }}>
          Not recorded yet.
        </p>
      )}
    </Card>
  );
}
