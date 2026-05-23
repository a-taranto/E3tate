// Vault Record Creation Utilities
// Auto-create vault records from service setup

import { ServiceDefinition } from "./services";
import { VaultRecord } from "@/types";

interface ServiceFormData {
  // Account details (dynamic based on service.fields)
  accountDetails: { [fieldId: string]: string };

  // Credentials
  storeCredentials: boolean;
  password?: string;
  twoFactorMethod?: string;
  recoveryCodes?: string;

  // Wishes
  wishAction: string;
  transferBeneficiary?: string;
  legacyContact?: string;
  additionalInstructions?: string;

  // Subscription (if applicable)
  monthlyCost?: string;
  plan?: string;
}

/**
 * Create a Vault record from a service setup form
 */
export function createVaultRecordFromService(
  service: ServiceDefinition,
  formData: ServiceFormData,
  userId?: string
): VaultRecord {
  const now = new Date();

  // Determine beneficiaries from wish action
  const beneficiaries: string[] = [];
  if (formData.wishAction === "transfer" && formData.transferBeneficiary) {
    beneficiaries.push(formData.transferBeneficiary);
  }

  return {
    id: `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: service.name,
    type: service.createsVaultType,
    subtype: service.category,
    category: "personal",
    source: "profile",
    description: buildDescription(service, formData),
    institution: service.name,
    encrypted: true,
    beneficiaries,
    createdAt: now,
    updatedAt: now,

    // Service-specific fields
    serviceId: service.id,
    hasCredentials: formData.storeCredentials,

    wish: {
      action: formData.wishAction,
      transferTo: formData.transferBeneficiary,
      legacyContact: formData.legacyContact,
      instructions: formData.additionalInstructions,
    },

    subscription: service.hasSubscription
      ? {
          cost: formData.monthlyCost,
          plan: formData.plan,
        }
      : undefined,

    // Store account details in metadata
    metadata: {
      accountDetails: formData.accountDetails,
      has2FA: service.has2FA,
      twoFactorMethod: formData.twoFactorMethod,
      hasMemorialization: service.hasMemorialization,
      hasLegacyContact: service.hasLegacyContact,
      deathPolicyUrl: service.deathPolicyUrl,
    },
  };
}

/**
 * Build a human-readable description from service and form data
 */
function buildDescription(service: ServiceDefinition, formData: ServiceFormData): string {
  const parts: string[] = [];

  // Add primary account identifier (usually email or username)
  const primaryField = service.fields[0];
  if (primaryField && formData.accountDetails[primaryField.id]) {
    parts.push(`Account: ${formData.accountDetails[primaryField.id]}`);
  }

  // Add subscription info if applicable
  if (service.hasSubscription && formData.plan) {
    parts.push(`Plan: ${formData.plan}`);
  }

  // Add 2FA info if applicable
  if (service.has2FA && formData.twoFactorMethod) {
    parts.push(`2FA: ${formData.twoFactorMethod}`);
  }

  return parts.join(" • ");
}

/**
 * Load all vault records from localStorage
 */
export function loadVaultRecords(): VaultRecord[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem("vault_records");
  if (!stored) return [];

  try {
    const records = JSON.parse(stored);
    // Convert date strings back to Date objects
    return records.map((r: any) => ({
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
    }));
  } catch {
    return [];
  }
}

/**
 * Save vault records to localStorage
 */
export function saveVaultRecords(records: VaultRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("vault_records", JSON.stringify(records));
}

/**
 * Add a single vault record
 */
export function addVaultRecord(record: VaultRecord): void {
  const existing = loadVaultRecords();
  const updated = [...existing, record];
  saveVaultRecords(updated);
}

/**
 * Process all services from setup and create vault records
 */
export function processSetupServices(): VaultRecord[] {
  if (typeof window === "undefined") return [];

  const selectedServices = JSON.parse(localStorage.getItem("setup_selected_services") || "[]");
  const serviceData = JSON.parse(localStorage.getItem("setup_service_data") || "{}");

  const newRecords: VaultRecord[] = [];

  // Import services dynamically
  import("./services").then(({ getServiceById }) => {
    selectedServices.forEach((serviceId: string) => {
      const service = getServiceById(serviceId);
      const formData = serviceData[serviceId];

      if (service && formData) {
        const record = createVaultRecordFromService(service, formData);
        newRecords.push(record);
      }
    });

    // Add to existing vault records
    const existing = loadVaultRecords();
    const updated = [...existing, ...newRecords];
    saveVaultRecords(updated);
  });

  return newRecords;
}

/**
 * Get summary statistics for setup completion screen
 */
export function getSetupSummary(): {
  servicesSetUp: number;
  credentialsStored: number;
  wishesRecorded: number;
  monthlySubscriptionCost: number;
  assetsAssigned: number;
  willStatus: "created" | "uploaded" | "none";
} {
  if (typeof window === "undefined") {
    return {
      servicesSetUp: 0,
      credentialsStored: 0,
      wishesRecorded: 0,
      monthlySubscriptionCost: 0,
      assetsAssigned: 0,
      willStatus: "none",
    };
  }

  // Services
  const serviceData = JSON.parse(localStorage.getItem("setup_service_data") || "{}");
  const serviceIds = Object.keys(serviceData);
  const servicesSetUp = serviceIds.length;

  let credentialsStored = 0;
  let wishesRecorded = 0;
  let monthlySubscriptionCost = 0;

  serviceIds.forEach((serviceId) => {
    const data = serviceData[serviceId];
    if (data.storeCredentials) credentialsStored++;
    if (data.wishAction) wishesRecorded++;
    if (data.monthlyCost) {
      const cost = parseFloat(data.monthlyCost.replace(/[^0-9.]/g, ""));
      if (!isNaN(cost)) monthlySubscriptionCost += cost;
    }
  });

  // Assets
  const assets = JSON.parse(localStorage.getItem("setup_assets") || "[]");
  const assetsAssigned = assets.filter((a: any) => a.beneficiaryIds.length > 0).length;

  // Will
  let willStatus: "created" | "uploaded" | "none" = "none";
  const uploadedWill = localStorage.getItem("uploaded_will");
  const willTemplate = localStorage.getItem("will_template");
  if (uploadedWill) willStatus = "uploaded";
  else if (willTemplate) willStatus = "created";

  return {
    servicesSetUp,
    credentialsStored,
    wishesRecorded,
    monthlySubscriptionCost,
    assetsAssigned,
    willStatus,
  };
}
