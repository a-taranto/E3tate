// User-added ("custom") services, persisted in localStorage and merged into the
// catalog by lib/services.ts. Each is a full ServiceDefinition with a minimal
// field set, so it flows through the existing setup form and vault-record
// creation unchanged.

import type { ServiceDefinition, ServiceCategory } from "./services";

const KEY = "custom_services";

export function loadCustomServices(): ServiceDefinition[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function addCustomService(name: string, category: ServiceCategory): ServiceDefinition {
  const def: ServiceDefinition = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim(),
    logo: "", // ServiceCard falls back to the first letter
    category,
    fields: [
      { id: "account", label: "Account / Username", type: "text", required: true, placeholder: "Email, username, or account ID" },
      { id: "url", label: "Website (optional)", type: "url", required: false, placeholder: "https://" },
    ],
    availableActions: ["transfer", "download_first", "close_account", "delete"],
    defaultAction: "download_first",
    hasSubscription: false,
    has2FA: false,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Credentials",
  };
  const next = [...loadCustomServices(), def];
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  return def;
}
