// Document type configuration with editability and security settings

export interface DocumentTypeConfig {
  id: string;
  label: string;
  editable: boolean;
  requiresPasswordToView: boolean;
  fileType: "text" | "binary";
  description: string;
}

export const documentTypes: { [key: string]: DocumentTypeConfig } = {
  will: {
    id: "will",
    label: "Last Will and Testament",
    editable: true,
    requiresPasswordToView: false,
    fileType: "text",
    description: "Your legal will - fully editable with version history",
  },
  insurance: {
    id: "insurance",
    label: "Life Insurance Policy",
    editable: true,
    requiresPasswordToView: false,
    fileType: "text",
    description: "Insurance policy details - editable",
  },
  deeds: {
    id: "deeds",
    label: "Property Deed",
    editable: false,
    requiresPasswordToView: true,
    fileType: "binary",
    description: "Official property deed - view only with password",
  },
  birth: {
    id: "birth",
    label: "Birth Certificate",
    editable: false,
    requiresPasswordToView: true,
    fileType: "binary",
    description: "Official birth certificate - view only with password",
  },
  marriage: {
    id: "marriage",
    label: "Marriage Certificate",
    editable: false,
    requiresPasswordToView: true,
    fileType: "binary",
    description: "Official marriage certificate - view only with password",
  },
  passport: {
    id: "passport",
    label: "Passport",
    editable: false,
    requiresPasswordToView: true,
    fileType: "binary",
    description: "Passport scan - view only with password",
  },
  military: {
    id: "military",
    label: "Military Records (DD-214)",
    editable: false,
    requiresPasswordToView: true,
    fileType: "binary",
    description: "Military discharge papers - view only with password",
  },
};

export interface DocumentVersion {
  version: number;
  timestamp: string;
  content: string;
  changes: string;
  editedBy: string;
}

export interface StoredDocument {
  id: string;
  docType: string;
  name: string;
  size: number;
  type: string;
  currentVersion: number;
  versions: DocumentVersion[];
  uploadedAt: string;
  lastModified: string;
}
