// Will Builder Data Types

export interface WillData {
  id: string;
  status: 'draft' | 'complete' | 'signed';
  currentStep: number;

  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    ssn?: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  executors: Array<{
    id: string;
    name: string;
    relationship: string;
    email: string;
    phone?: string;
    isPrimary: boolean;
  }>;

  beneficiaries: Array<{
    id: string;
    name: string;
    relationship: string;
    percentage: number;
    email?: string;
  }>;

  digitalAssets: Array<{
    id: string;
    vaultRecordId?: string;
    name: string;
    type: string;
    assignee: string;
    instructions: string;
  }>;

  physicalAssets: Array<{
    id: string;
    vaultRecordId?: string;
    name: string;
    type: string;
    value?: number;
    assignee: string;
    notes: string;
  }>;

  finalWishes: {
    burialPreference: 'burial' | 'cremation' | 'donation' | 'other';
    burialDetails?: string;
    memorialInstructions: string;
    executorInstructions: string;
  };

  reviewingAttorney?: string;
  acknowledgedDisclaimer: boolean;

  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  vaultRecordId?: string;
}

export interface WillVaultMetadata {
  createdWith: 'will-builder' | 'uploaded';
  status: 'draft' | 'complete' | 'signed' | 'notarized';
  reviewingAttorney?: string;
  documentSections: {
    personalInformation: boolean;
    executorAppointment: boolean;
    beneficiaries: boolean;
    digitalAssets: boolean;
    physicalAssets: boolean;
    finalWishes: boolean;
  };
}

export const INITIAL_WILL_DATA: WillData = {
  id: '',
  status: 'draft',
  currentStep: 1,
  personalInfo: {
    fullName: '',
    dateOfBirth: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  },
  executors: [],
  beneficiaries: [],
  digitalAssets: [],
  physicalAssets: [],
  finalWishes: {
    burialPreference: 'burial',
    memorialInstructions: '',
    executorInstructions: '',
  },
  acknowledgedDisclaimer: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
