// E3tate Unified Data Model - Profile to Vault Type Mapping
// Based on e3tate-unified-data-model.md

import type { ProfileTab, ProfileSubtype, RecordType } from "@/types";

// Profile Subtypes by Tab
export const PROFILE_SUBTYPES: Record<ProfileTab, ProfileSubtype[]> = {
  identity: [
    {
      id: "personal-id",
      label: "Personal ID",
      icon: "CreditCard",
      createsType: "Identity",
      description: "Driver's license, state ID",
    },
    {
      id: "passport",
      label: "Passport",
      icon: "Globe",
      createsType: "Identity",
      description: "International travel document",
    },
    {
      id: "tax-id",
      label: "Tax File Number",
      icon: "Hash",
      createsType: "Identity",
      description: "TFN, SSN, or equivalent",
    },
    {
      id: "birth-certificate",
      label: "Birth Certificate",
      icon: "Baby",
      createsType: "Identity",
      description: "Official birth record",
    },
    {
      id: "health-card",
      label: "Medicare Card",
      icon: "Heart",
      createsType: "Identity",
      description: "Medicare, health insurance card",
    },
  ],

  assets: [
    {
      id: "home-property",
      label: "Home / Property",
      icon: "Home",
      createsType: "Assets",
      description: "Real estate, land",
    },
    {
      id: "vehicle",
      label: "Vehicle",
      icon: "Car",
      createsType: "Assets",
      description: "Car, motorcycle, boat",
    },
    {
      id: "cryptocurrency",
      label: "Cryptocurrency",
      icon: "Bitcoin",
      createsType: "Assets",
      description: "Bitcoin, Ethereum, etc.",
    },
    {
      id: "valuables",
      label: "Valuables",
      icon: "Gem",
      createsType: "Assets",
      description: "Jewelry, art, collectibles",
    },
    {
      id: "business",
      label: "Business Ownership",
      icon: "Building2",
      createsType: "Assets",
      description: "Company shares, partnership",
    },
  ],

  accounts: [
    {
      id: "bank",
      label: "Bank Account",
      icon: "Landmark",
      createsType: "Financial",
      description: "Checking, savings account",
    },
    {
      id: "superannuation",
      label: "Superannuation",
      icon: "PiggyBank",
      createsType: "Financial",
      description: "Retirement fund, 401k",
    },
    {
      id: "insurance",
      label: "Insurance Policy",
      icon: "Shield",
      createsType: "Financial",
      description: "Life, health, property insurance",
    },
    {
      id: "investment",
      label: "Investment Account",
      icon: "TrendingUp",
      createsType: "Financial",
      description: "Brokerage, trading account",
    },
    {
      id: "digital-social",
      label: "Digital / Social",
      icon: "AtSign",
      createsType: "Credentials", // NOTE: Creates Credentials, not Financial!
      description: "Social media, email, cloud services",
    },
  ],

  wishes: [
    {
      id: "final-wishes",
      label: "Final Wishes",
      icon: "Heart",
      createsType: "Instructions",
      description: "End-of-life preferences",
    },
    {
      id: "care-instructions",
      label: "Care Instructions",
      icon: "Stethoscope",
      createsType: "Instructions",
      description: "Medical directives, living will",
    },
    {
      id: "personal-messages",
      label: "Personal Messages",
      icon: "Mail",
      createsType: "Instructions",
      description: "Letters to loved ones",
    },
    {
      id: "funeral-preferences",
      label: "Funeral Preferences",
      icon: "Flower2",
      createsType: "Instructions",
      description: "Service, burial wishes",
    },
    {
      id: "pet-care",
      label: "Pet Care",
      icon: "Dog",
      createsType: "Instructions",
      description: "Instructions for pets",
    },
  ],
};

// Helper: Get Vault type for a Profile subtype
export function getVaultType(tab: ProfileTab, subtypeId: string): RecordType {
  const subtypes = PROFILE_SUBTYPES[tab];
  const subtype = subtypes.find((s) => s.id === subtypeId);
  return subtype?.createsType || "Documents"; // Fallback to Documents
}

// Helper: Get all subtypes that create a specific Vault type
export function getSubtypesForVaultType(vaultType: RecordType): ProfileSubtype[] {
  const allSubtypes = Object.values(PROFILE_SUBTYPES).flat();
  return allSubtypes.filter((s) => s.createsType === vaultType);
}

// Helper: Get Profile tab for a Vault type (primary mapping)
export function getProfileTabForVaultType(vaultType: RecordType): ProfileTab | null {
  const mapping: Record<RecordType, ProfileTab | null> = {
    Identity: "identity",
    Financial: "accounts",
    Assets: "assets",
    Documents: null, // No Profile tab for Documents
    Instructions: "wishes",
    Credentials: "accounts", // Digital/Social in Accounts tab
  };
  return mapping[vaultType];
}
