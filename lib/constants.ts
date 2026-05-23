// E3tate Unified Data Model - Centralized Constants
// Based on e3tate-component-patterns-v2.md

export const COLORS = {
  type: {
    // Simplified 4 categories per architecture
    Documents: {
      color: "#3B82F6", // blue
      bg: "rgba(59, 130, 246, 0.1)",
      icon: "FileText",
      description: "Legal documents, insurance policies, property deeds",
    },
    Wallets: {
      color: "#10B981", // emerald
      bg: "rgba(16, 185, 129, 0.1)",
      icon: "Wallet",
      description: "Cryptocurrency wallets and hardware wallets",
    },
    Credentials: {
      color: "#F59E0B", // amber
      bg: "rgba(245, 158, 11, 0.1)",
      icon: "Key",
      description: "Bank accounts, investments, financial logins",
    },
    Accounts: {
      color: "#8B5CF6", // violet
      bg: "rgba(139, 92, 246, 0.1)",
      icon: "Globe",
      description: "Email, social media, cloud storage, AI tools",
    },

    // Legacy categories (for backward compatibility with existing data)
    Identity: {
      color: "#8B5CF6", // violet -> maps to Accounts
      bg: "rgba(139, 92, 246, 0.1)",
      icon: "User",
      migratesTo: "Accounts",
    },
    Financial: {
      color: "#10B981", // emerald -> maps to Credentials
      bg: "rgba(16, 185, 129, 0.1)",
      icon: "Wallet",
      migratesTo: "Credentials",
    },
    Assets: {
      color: "#F97316", // orange -> maps to Documents
      bg: "rgba(249, 115, 22, 0.1)",
      icon: "Gem",
      migratesTo: "Documents",
    },
    Instructions: {
      color: "#EC4899", // pink -> maps to Documents
      bg: "rgba(236, 72, 153, 0.1)",
      icon: "ScrollText",
      migratesTo: "Documents",
    },
  },
  source: {
    profile: {
      color: "#EC4899", // pink/coral
      bg: "rgba(236, 72, 153, 0.1)",
    },
    vault: {
      color: "#6B7280", // gray (no special badge for vault-created)
      bg: "rgba(107, 114, 128, 0.1)",
    },
  },
  category: {
    personal: {
      color: "#3B82F6", // blue
      bg: "rgba(59, 130, 246, 0.1)",
    },
    business: {
      color: "#8B5CF6", // violet
      bg: "rgba(139, 92, 246, 0.1)",
    },
  },
  role: {
    executor: {
      color: "#8B5CF6", // violet
      bg: "rgba(139, 92, 246, 0.1)",
    },
    beneficiary: {
      color: "#10B981", // emerald
      bg: "rgba(16, 185, 129, 0.1)",
    },
    contact: {
      color: "#6B7280", // gray
      bg: "rgba(107, 114, 128, 0.1)",
    },
  },
  status: {
    pending: {
      color: "#F59E0B", // amber
      bg: "rgba(245, 158, 11, 0.1)",
    },
    confirmed: {
      color: "#10B981", // emerald
      bg: "rgba(16, 185, 129, 0.1)",
    },
  },
} as const;

// Type icon mapping for quick access
export const TYPE_ICONS = {
  // Primary 4 categories
  Documents: "FileText",
  Wallets: "Wallet",
  Credentials: "Key",
  Accounts: "Globe",

  // Legacy (for backward compatibility)
  Identity: "User",
  Financial: "Wallet",
  Assets: "Gem",
  Instructions: "ScrollText",
} as const;

// Primary vault categories for UI
export const VAULT_CATEGORIES = [
  {
    id: "Documents",
    label: "Documents",
    icon: "FileText",
    color: "#3B82F6",
    description: "Legal documents, insurance, property deeds",
  },
  {
    id: "Wallets",
    label: "Wallets",
    icon: "Wallet",
    color: "#10B981",
    description: "Cryptocurrency wallets",
  },
  {
    id: "Credentials",
    label: "Credentials",
    icon: "Key",
    color: "#F59E0B",
    description: "Bank accounts, investments, financial logins",
  },
  {
    id: "Accounts",
    label: "Accounts",
    icon: "Globe",
    color: "#8B5CF6",
    description: "Email, social media, cloud storage, AI",
  },
] as const;
