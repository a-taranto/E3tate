// Service Database for E3tate Guided Setup
// Service-first architecture for onboarding

export type ServiceCategory =
  | "email"
  | "social"
  | "cloud"
  | "photos"
  | "ai"
  | "financial"
  | "crypto";

export type WishAction =
  | "cancel"
  | "delete"
  | "transfer"
  | "memorialize"
  | "download_first"
  | "keep_active"
  | "close_account"
  | "liquidate";

export interface ServiceField {
  id: string;
  label: string;
  type: "text" | "email" | "url" | "password" | "textarea" | "select";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface ServiceDefinition {
  id: string;
  name: string;
  logo: string; // Simple Icons CDN: https://cdn.simpleicons.org/{name}
  category: ServiceCategory;
  fields: ServiceField[];
  availableActions: WishAction[];
  defaultAction: WishAction;
  hasSubscription: boolean;
  has2FA: boolean;
  hasMemorialization: boolean;
  hasLegacyContact: boolean;
  deathPolicyUrl?: string;
  createsVaultType: "Credentials" | "Financial" | "Assets";
}

export const SERVICE_CATEGORIES: { id: ServiceCategory; label: string; icon: string }[] = [
  { id: "email", label: "Email", icon: "Mail" },
  { id: "social", label: "Social Media", icon: "Users" },
  { id: "cloud", label: "Cloud Storage", icon: "Cloud" },
  { id: "photos", label: "Photos", icon: "Image" },
  { id: "ai", label: "AI & Productivity", icon: "Sparkles" },
  { id: "financial", label: "Financial", icon: "DollarSign" },
  { id: "crypto", label: "Cryptocurrency", icon: "Coins" },
];

export const SERVICES: ServiceDefinition[] = [
  // EMAIL
  {
    id: "gmail",
    name: "Gmail",
    logo: "https://cdn.simpleicons.org/gmail",
    category: "email",
    fields: [
      { id: "email", label: "Email Address", type: "email", required: true, placeholder: "you@gmail.com" },
      { id: "recovery_email", label: "Recovery Email", type: "email", required: false, placeholder: "backup@example.com" },
    ],
    availableActions: ["delete", "download_first", "transfer"],
    defaultAction: "download_first",
    hasSubscription: false,
    has2FA: true,
    hasMemorialization: true,
    hasLegacyContact: true,
    deathPolicyUrl: "https://support.google.com/accounts/answer/3036546",
    createsVaultType: "Credentials",
  },
  {
    id: "outlook",
    name: "Outlook / Microsoft",
    logo: "https://cdn.simpleicons.org/microsoftoutlook",
    category: "email",
    fields: [
      { id: "email", label: "Email Address", type: "email", required: true, placeholder: "you@outlook.com" },
    ],
    availableActions: ["delete", "download_first"],
    defaultAction: "download_first",
    hasSubscription: false,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Credentials",
  },
  {
    id: "icloud",
    name: "iCloud Mail",
    logo: "https://cdn.simpleicons.org/icloud",
    category: "email",
    fields: [
      { id: "email", label: "Apple ID", type: "email", required: true, placeholder: "you@icloud.com" },
    ],
    availableActions: ["delete", "download_first"],
    defaultAction: "download_first",
    hasSubscription: false,
    has2FA: true,
    hasMemorialization: true,
    hasLegacyContact: true,
    deathPolicyUrl: "https://support.apple.com/en-us/HT208510",
    createsVaultType: "Credentials",
  },
  {
    id: "yahoo",
    name: "Yahoo Mail",
    logo: "https://cdn.simpleicons.org/yahoo",
    category: "email",
    fields: [
      { id: "email", label: "Email Address", type: "email", required: true, placeholder: "you@yahoo.com" },
    ],
    availableActions: ["delete", "download_first"],
    defaultAction: "download_first",
    hasSubscription: false,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Credentials",
  },
  {
    id: "protonmail",
    name: "ProtonMail",
    logo: "https://cdn.simpleicons.org/protonmail",
    category: "email",
    fields: [
      { id: "email", label: "Email Address", type: "email", required: true, placeholder: "you@proton.me" },
    ],
    availableActions: ["delete", "download_first"],
    defaultAction: "download_first",
    hasSubscription: true,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Credentials",
  },

  // SOCIAL MEDIA
  {
    id: "facebook",
    name: "Facebook",
    logo: "https://cdn.simpleicons.org/facebook",
    category: "social",
    fields: [
      { id: "email", label: "Email or Phone", type: "text", required: true, placeholder: "Email or phone number" },
      { id: "profile_url", label: "Profile URL", type: "url", required: false, placeholder: "https://facebook.com/yourname" },
    ],
    availableActions: ["delete", "memorialize", "download_first"],
    defaultAction: "memorialize",
    hasSubscription: false,
    has2FA: true,
    hasMemorialization: true,
    hasLegacyContact: true,
    deathPolicyUrl: "https://www.facebook.com/help/1506822589577997",
    createsVaultType: "Credentials",
  },
  {
    id: "instagram",
    name: "Instagram",
    logo: "https://cdn.simpleicons.org/instagram",
    category: "social",
    fields: [
      { id: "username", label: "Username", type: "text", required: true, placeholder: "@username" },
      { id: "email", label: "Email", type: "email", required: false, placeholder: "you@example.com" },
    ],
    availableActions: ["delete", "memorialize", "download_first"],
    defaultAction: "memorialize",
    hasSubscription: false,
    has2FA: true,
    hasMemorialization: true,
    hasLegacyContact: true,
    deathPolicyUrl: "https://help.instagram.com/contact/452224988254813",
    createsVaultType: "Credentials",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    logo: "https://cdn.simpleicons.org/x",
    category: "social",
    fields: [
      { id: "username", label: "Username", type: "text", required: true, placeholder: "@username" },
      { id: "email", label: "Email", type: "email", required: false, placeholder: "you@example.com" },
    ],
    availableActions: ["delete", "download_first"],
    defaultAction: "delete",
    hasSubscription: true,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Credentials",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    logo: "https://cdn.simpleicons.org/linkedin",
    category: "social",
    fields: [
      { id: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com" },
      { id: "profile_url", label: "Profile URL", type: "url", required: false, placeholder: "https://linkedin.com/in/yourname" },
    ],
    availableActions: ["delete", "memorialize"],
    defaultAction: "memorialize",
    hasSubscription: true,
    has2FA: true,
    hasMemorialization: true,
    hasLegacyContact: false,
    createsVaultType: "Credentials",
  },
  {
    id: "tiktok",
    name: "TikTok",
    logo: "https://cdn.simpleicons.org/tiktok",
    category: "social",
    fields: [
      { id: "username", label: "Username", type: "text", required: true, placeholder: "@username" },
      { id: "email", label: "Email", type: "email", required: false, placeholder: "you@example.com" },
    ],
    availableActions: ["delete", "download_first"],
    defaultAction: "delete",
    hasSubscription: false,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Credentials",
  },

  // CLOUD STORAGE
  {
    id: "google-drive",
    name: "Google Drive",
    logo: "https://cdn.simpleicons.org/googledrive",
    category: "cloud",
    fields: [
      { id: "email", label: "Google Account", type: "email", required: true, placeholder: "you@gmail.com" },
    ],
    availableActions: ["transfer", "download_first", "delete"],
    defaultAction: "download_first",
    hasSubscription: true,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: true,
    createsVaultType: "Credentials",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    logo: "https://cdn.simpleicons.org/dropbox",
    category: "cloud",
    fields: [
      { id: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com" },
    ],
    availableActions: ["transfer", "download_first", "delete"],
    defaultAction: "download_first",
    hasSubscription: true,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Credentials",
  },
  {
    id: "onedrive",
    name: "OneDrive",
    logo: "https://cdn.simpleicons.org/microsoftonedrive",
    category: "cloud",
    fields: [
      { id: "email", label: "Microsoft Account", type: "email", required: true, placeholder: "you@outlook.com" },
    ],
    availableActions: ["transfer", "download_first", "delete"],
    defaultAction: "download_first",
    hasSubscription: true,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Credentials",
  },
  {
    id: "icloud-storage",
    name: "iCloud Storage",
    logo: "https://cdn.simpleicons.org/icloud",
    category: "cloud",
    fields: [
      { id: "email", label: "Apple ID", type: "email", required: true, placeholder: "you@icloud.com" },
    ],
    availableActions: ["transfer", "download_first"],
    defaultAction: "download_first",
    hasSubscription: true,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: true,
    createsVaultType: "Credentials",
  },

  // PHOTOS
  {
    id: "google-photos",
    name: "Google Photos",
    logo: "https://cdn.simpleicons.org/googlephotos",
    category: "photos",
    fields: [
      { id: "email", label: "Google Account", type: "email", required: true, placeholder: "you@gmail.com" },
    ],
    availableActions: ["transfer", "download_first", "delete"],
    defaultAction: "download_first",
    hasSubscription: true,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: true,
    createsVaultType: "Credentials",
  },
  {
    id: "icloud-photos",
    name: "iCloud Photos",
    logo: "https://cdn.simpleicons.org/icloud",
    category: "photos",
    fields: [
      { id: "email", label: "Apple ID", type: "email", required: true, placeholder: "you@icloud.com" },
    ],
    availableActions: ["transfer", "download_first"],
    defaultAction: "download_first",
    hasSubscription: true,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: true,
    createsVaultType: "Credentials",
  },

  // AI & PRODUCTIVITY
  {
    id: "chatgpt",
    name: "ChatGPT",
    logo: "https://cdn.simpleicons.org/openai",
    category: "ai",
    fields: [
      { id: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com" },
    ],
    availableActions: ["cancel", "download_first", "delete"],
    defaultAction: "download_first",
    hasSubscription: true,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Credentials",
  },
  {
    id: "claude",
    name: "Claude",
    logo: "https://cdn.simpleicons.org/anthropic",
    category: "ai",
    fields: [
      { id: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com" },
    ],
    availableActions: ["cancel", "download_first", "delete"],
    defaultAction: "download_first",
    hasSubscription: true,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Credentials",
  },
  {
    id: "notion",
    name: "Notion",
    logo: "https://cdn.simpleicons.org/notion",
    category: "ai",
    fields: [
      { id: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com" },
      { id: "workspace_url", label: "Workspace URL", type: "url", required: false, placeholder: "https://notion.so/workspace" },
    ],
    availableActions: ["transfer", "download_first", "delete"],
    defaultAction: "download_first",
    hasSubscription: true,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Credentials",
  },
  {
    id: "evernote",
    name: "Evernote",
    logo: "https://cdn.simpleicons.org/evernote",
    category: "ai",
    fields: [
      { id: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com" },
    ],
    availableActions: ["download_first", "delete"],
    defaultAction: "download_first",
    hasSubscription: true,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Credentials",
  },

  // FINANCIAL
  {
    id: "paypal",
    name: "PayPal",
    logo: "https://cdn.simpleicons.org/paypal",
    category: "financial",
    fields: [
      { id: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com" },
    ],
    availableActions: ["transfer", "close_account"],
    defaultAction: "transfer",
    hasSubscription: false,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    deathPolicyUrl: "https://www.paypal.com/us/webapps/mpp/ua/useragreement-full#deceased",
    createsVaultType: "Financial",
  },
  {
    id: "venmo",
    name: "Venmo",
    logo: "https://cdn.simpleicons.org/venmo",
    category: "financial",
    fields: [
      { id: "username", label: "Username", type: "text", required: true, placeholder: "@username" },
      { id: "email", label: "Email", type: "email", required: false, placeholder: "you@example.com" },
    ],
    availableActions: ["transfer", "close_account"],
    defaultAction: "transfer",
    hasSubscription: false,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Financial",
  },
  {
    id: "stripe",
    name: "Stripe",
    logo: "https://cdn.simpleicons.org/stripe",
    category: "financial",
    fields: [
      { id: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com" },
      { id: "account_id", label: "Account ID", type: "text", required: false, placeholder: "acct_..." },
    ],
    availableActions: ["transfer", "close_account"],
    defaultAction: "transfer",
    hasSubscription: false,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Financial",
  },

  // CRYPTOCURRENCY
  {
    id: "coinbase",
    name: "Coinbase",
    logo: "https://cdn.simpleicons.org/coinbase",
    category: "crypto",
    fields: [
      { id: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com" },
      { id: "wallet_address", label: "Primary Wallet Address", type: "text", required: false, placeholder: "0x..." },
    ],
    availableActions: ["transfer", "liquidate"],
    defaultAction: "transfer",
    hasSubscription: false,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Assets",
  },
  {
    id: "binance",
    name: "Binance",
    logo: "https://cdn.simpleicons.org/binance",
    category: "crypto",
    fields: [
      { id: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com" },
    ],
    availableActions: ["transfer", "liquidate"],
    defaultAction: "transfer",
    hasSubscription: false,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Assets",
  },
  {
    id: "metamask",
    name: "MetaMask",
    logo: "https://cdn.simpleicons.org/metamask",
    category: "crypto",
    fields: [
      { id: "wallet_address", label: "Wallet Address", type: "text", required: true, placeholder: "0x..." },
      { id: "seed_location", label: "Seed Phrase Location", type: "textarea", required: false, placeholder: "Describe where your recovery phrase is stored" },
    ],
    availableActions: ["transfer"],
    defaultAction: "transfer",
    hasSubscription: false,
    has2FA: false,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Assets",
  },
  {
    id: "ledger",
    name: "Ledger",
    logo: "https://cdn.simpleicons.org/ledger",
    category: "crypto",
    fields: [
      { id: "device_type", label: "Device Type", type: "text", required: true, placeholder: "Ledger Nano S/X" },
      { id: "seed_location", label: "Recovery Phrase Location", type: "textarea", required: false, placeholder: "Describe where your 24-word recovery phrase is stored" },
    ],
    availableActions: ["transfer"],
    defaultAction: "transfer",
    hasSubscription: false,
    has2FA: false,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Assets",
  },
];

// Helper Functions
export function getServicesByCategory(category: ServiceCategory): ServiceDefinition[] {
  return SERVICES.filter((service) => service.category === category);
}

export function getServiceById(id: string): ServiceDefinition | undefined {
  return SERVICES.find((service) => service.id === id);
}

export function getAllCategories(): { id: ServiceCategory; label: string; icon: string; count: number }[] {
  return SERVICE_CATEGORIES.map((cat) => ({
    ...cat,
    count: getServicesByCategory(cat.id).length,
  }));
}
