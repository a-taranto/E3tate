"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { Globe, FileText, ArrowRight } from "lucide-react";
import { loadVaultRecords, type VaultRecord } from "@/lib/store";
import { loadDigitalRegister, getDigitalAssetValue, type DigitalRegister } from "@/lib/model/digitalRegister";

const fmtAUD = (n: number) => n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

export default function DigitalRegisterPage() {
  const router = useRouter();
  const [reg, setReg] = useState<DigitalRegister | null>(null);
  const [accounts, setAccounts] = useState<VaultRecord[]>([]);

  useEffect(() => {
    const refresh = () => {
      setReg(loadDigitalRegister());
      setAccounts(loadVaultRecords().filter((r) => r.type === "accounts" || r.type === "credentials" || r.type === "wallets"));
    };
    refresh();
    window.addEventListener("store-updated", refresh);
    return () => window.removeEventListener("store-updated", refresh);
  }, []);

  if (!reg) return null;

  const digitalValue = getDigitalAssetValue(reg);
  const sections: { label: string; count: number }[] = [
    { label: "Online accounts (Vault)", count: accounts.length },
    { label: "Cryptocurrency", count: reg.crypto.length },
    { label: "Financial accounts", count: reg.financial_accounts.length },
    { label: "Social & email", count: reg.social_media.length },
    { label: "Domains & IP", count: reg.domains_ip.length },
    { label: "Other digital", count: reg.other.length },
  ];
  const totalItems = sections.reduce((s, x) => s + x.count, 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Digital Asset Register</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          A summary of your digital accounts and assets. This register is appended to your will as a <strong>schedule</strong> so your executor can find and deal with them.
        </p>
      </div>

      <Card padding="lg" className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {sections.map((s) => (
            <div key={s.label} className="text-center p-3 rounded-lg" style={{ backgroundColor: "var(--bg-surface)" }}>
              <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{s.count}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>
        {digitalValue > 0 && (
          <p className="text-sm mt-4 text-center" style={{ color: "var(--text-secondary)" }}>
            Digital assets of value: <strong>{fmtAUD(digitalValue)}</strong> (included in your net estate)
          </p>
        )}
      </Card>

      <Card padding="md" className="mb-6 border-l-4" style={{ borderLeftColor: "var(--info)" }}>
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "var(--info)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            This register does not store passwords or keys — only where access lives. Add accounts and credentials in your{" "}
            <button onClick={() => router.push("/vault/online")} className="underline" style={{ color: "var(--accent)" }}>Vault</button>.
          </p>
        </div>
      </Card>

      {totalItems === 0 ? (
        <Card padding="lg" className="text-center">
          <Globe className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>No digital accounts recorded yet.</p>
          <Button variant="primary" onClick={() => router.push("/vault/online")}>Add accounts <ArrowRight className="h-4 w-4" /></Button>
        </Card>
      ) : (
        accounts.length > 0 && (
          <Card padding="lg">
            <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Online accounts</h3>
            <div className="space-y-2">
              {accounts.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: "var(--bg-surface)" }}>
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{a.title}</span>
                  <span className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>{a.subtype || a.type}</span>
                </div>
              ))}
            </div>
          </Card>
        )
      )}
    </div>
  );
}
