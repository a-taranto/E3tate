// Vault Record Creation Utilities
// Auto-create vault records from service setup

import { ServiceDefinition } from "./services";
import { loadAssets, upsertVaultRecord, toPrimaryType, type VaultRecord as StoreVaultRecord } from "./store";

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
 * Save (insert or update) a vault record for a configured online service,
 * through the unified store. Uses a stable id (`service-<id>`) so re-saving the
 * same service updates its record instead of duplicating it. This is the
 * canonical path now that the Online step saves each service at modal time.
 */
export function saveServiceToVault(service: ServiceDefinition, formData: ServiceFormData): void {
  const beneficiaries: string[] = [];
  if (formData.wishAction === "transfer" && formData.transferBeneficiary) {
    beneficiaries.push(formData.transferBeneficiary);
  }

  const record: StoreVaultRecord = {
    id: `service-${service.id}`,
    title: service.name,
    type: toPrimaryType(service.createsVaultType),
    subtype: service.category,
    category: "personal",
    source: "profile",
    description: buildDescription(service, formData),
    institution: service.name,
    beneficiaries,
    encrypted: true,
    serviceId: service.id,
    hasCredentials: formData.storeCredentials,
    createdAt: new Date().toISOString(),
    lastModified: "Just now",
    wish: {
      action: formData.wishAction,
      transferTo: formData.transferBeneficiary,
      legacyContact: formData.legacyContact,
      instructions: formData.additionalInstructions,
    },
    subscription: service.hasSubscription
      ? { cost: formData.monthlyCost, plan: formData.plan }
      : undefined,
    metadata: {
      accountDetails: formData.accountDetails,
      has2FA: service.has2FA,
      twoFactorMethod: formData.twoFactorMethod,
      hasMemorialization: service.hasMemorialization,
      hasLegacyContact: service.hasLegacyContact,
      deathPolicyUrl: service.deathPolicyUrl,
      category: service.category,
    },
  };

  upsertVaultRecord(record);
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

  // Assets (now first-class via the store; the legacy `setup_assets` key is
  // absorbed into `estate_assets` by migrateEstateAssetsV1).
  const assets = loadAssets();
  const assetsAssigned = assets.filter((a) => a.beneficiaryIds.length > 0).length;

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
