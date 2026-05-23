// E3tate Unified Data Model - Type Definitions
// Based on e3tate-unified-data-model.md

// Master Record Types (used in Vault)
export type RecordType =
  | "Identity"
  | "Financial"
  | "Assets"
  | "Documents"
  | "Instructions"
  | "Credentials";

// Profile Tabs (guided wizard interface)
export type ProfileTab = "identity" | "assets" | "accounts" | "wishes";

// Record Categories
export type Category = "personal" | "business";

// Record Source (where it was created)
export type RecordSource = "profile" | "vault";

// Beneficiary Roles
export type BeneficiaryRole = "executor" | "beneficiary" | "contact";

// Beneficiary Status
export type BeneficiaryStatus = "pending" | "confirmed";

// Profile Subtype Configuration
export interface ProfileSubtype {
  id: string;
  label: string;
  icon: string;
  createsType: RecordType;
  description?: string;
}

// Vault Record Interface
export interface VaultRecord {
  id: string;
  title: string;
  type: RecordType; // Master Vault type
  subtype?: string; // Profile-specific subtype (e.g., "bank", "home-property")
  source: RecordSource; // Where it was created
  category?: Category; // Personal or Business
  description?: string;
  institution?: string; // For Financial records
  encrypted: boolean;
  beneficiaries: string[]; // Array of beneficiary IDs or "All Beneficiaries"
  createdAt: Date;
  updatedAt: Date;
  fileSize?: number; // For document records

  // Service-first architecture fields
  serviceId?: string; // ID from services.ts if created from service setup
  hasCredentials?: boolean; // Whether credentials are stored
  wish?: {
    action: string;
    transferTo?: string; // beneficiary ID
    legacyContact?: string; // executor/beneficiary ID
    instructions?: string;
  };
  subscription?: {
    cost?: string;
    plan?: string;
  };

  metadata?: Record<string, any>; // Additional fields
}

// Beneficiary Interface
export interface Beneficiary {
  id: string;
  name: string;
  email: string;
  role: BeneficiaryRole;
  status: BeneficiaryStatus;
  relationship?: string;
  addedAt: Date;
}

// Profile Summary Group
export interface ProfileSummaryGroup {
  type: RecordType;
  count: number;
  records: VaultRecord[];
}

// Record Wish (for Digital Legacy and asset distribution)
export interface RecordWish {
  recordId: string;
  action: "delete" | "memorialize" | "transfer" | "download" | "preserve" | "other";
  transferTo?: string; // beneficiary ID
  notes?: string;
}

// Will Template (for will creation wizard)
export interface WillTemplate {
  id: string;
  userId?: string;
  status: "draft" | "generated" | "signed";
  jurisdiction: string;

  // Personal Information
  fullName: string;
  address: string;
  dateOfBirth: string;
  maritalStatus: "single" | "married" | "divorced" | "widowed";
  spouseName?: string;

  // Executors
  primaryExecutorId: string;
  alternateExecutorId?: string;

  // Beneficiaries & Distribution
  residuaryBeneficiaries: {
    beneficiaryId: string;
    percentage: number;
  }[];

  // Specific Bequests
  specificBequests: {
    recordId: string;
    beneficiaryId: string;
    description?: string;
  }[];

  // Guardianship (for minor children)
  hasMinorChildren: boolean;
  guardianName?: string;
  guardianRelationship?: string;
  guardianAddress?: string;
  alternateGuardianName?: string;
  alternateGuardianRelationship?: string;
  alternateGuardianAddress?: string;

  // Final Wishes
  funeralPreference: "burial" | "cremation" | "no_preference";
  specialInstructions?: string;

  // Document Management
  generatedPdfUrl?: string;
  generatedAt?: string;
  physicalLocation?: string;
  witnessNames?: string[];
  signingDate?: string;
  version: number;
  lastModified: string;
  createdAt: string;
}
