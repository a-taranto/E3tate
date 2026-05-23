# E3tate Guided Setup: Service-First Architecture

**Purpose:** Replace manual data entry with guided, service-aware setup  
**Principle:** The user should never have to think about what to add — we show them

---

## 1. THE PROBLEM

Current UX issues:
- User must think of accounts to add (cognitive load)
- Generic form fields for every service
- No guidance on what's important
- Wishes disconnected from accounts
- Profile and Vault feel like separate systems
- No visual recognition (logos, familiar UI)

---

## 2. THE SOLUTION: SERVICE CATALOG

### 2.1 Visual Service Selection

Instead of "Add Account → Type a name", show:

```
┌─────────────────────────────────────────────────────────────────┐
│  Which services do you use?                                     │
│  Select all that apply. We'll help you set up each one.         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📧 EMAIL & COMMUNICATION                                       │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│  │ Gmail │ │Outlook│ │ Yahoo │ │ProtonM│ │iCloud │            │
│  │  ✓    │ │       │ │       │ │       │ │  ✓    │            │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘            │
│                                                                 │
│  📱 SOCIAL MEDIA                                                │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│  │Facebook│ │Instagm│ │Twitter│ │LinkedIn│ │TikTok │           │
│  │  ✓    │ │  ✓    │ │       │ │  ✓    │ │       │            │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘            │
│                                                                 │
│  ☁️ CLOUD STORAGE                                               │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│  │Google │ │Dropbox│ │OneDriv│ │ iCloud│ │  Box  │            │
│  │ Drive │ │  ✓    │ │       │ │  ✓    │ │       │            │
│  │  ✓    │ │       │ │       │ │       │ │       │            │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘            │
│                                                                 │
│  🎬 STREAMING & ENTERTAINMENT                                   │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│  │Netflix│ │Spotify│ │Disney+│ │YouTube│ │ Stan  │            │
│  │  ✓    │ │  ✓    │ │       │ │Prm ✓  │ │       │            │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘            │
│                                                                 │
│  🤖 AI & PRODUCTIVITY                                           │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│  │ChatGPT│ │Claude │ │Notion │ │ Figma │ │Canva  │            │
│  │  ✓    │ │  ✓    │ │  ✓    │ │       │ │       │            │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘            │
│                                                                 │
│  💰 FINANCIAL                                                   │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│  │PayPal │ │Venmo  │ │Coinbas│ │Robinhd│ │ Wise  │            │
│  │       │ │       │ │  ✓    │ │       │ │       │            │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘            │
│                                                                 │
│  🛒 SHOPPING & SERVICES                                         │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│  │Amazon │ │ eBay  │ │ Uber  │ │Doordsh│ │Airbnb │            │
│  │  ✓    │ │       │ │  ✓    │ │       │ │       │            │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘            │
│                                                                 │
│  [+ Add custom service not listed]                             │
│                                                                 │
│  Selected: 14 services                    [Continue →]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Service-Specific Setup

After selection, guide through each service with **pre-filled knowledge**:

```
┌─────────────────────────────────────────────────────────────────┐
│  Setting up: Netflix                              [2 of 14]     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Netflix Logo]  NETFLIX                                        │
│                  Streaming Service                              │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Account Email                                                  │
│  [john.smith@gmail.com____________________________]             │
│  💡 We detected this from your Gmail selection                 │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  🔐 Store Login Credentials?                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ○ No - Just track this account                          │   │
│  │ ● Yes - Store credentials securely in Vault             │   │
│  │                                                          │   │
│  │   Password: [••••••••••••________] [Show]               │   │
│  │   PIN (if any): [____]                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  📋 What should happen to this account?                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ○ Cancel subscription                                   │   │
│  │ ● Transfer to family member                             │   │
│  │   → Transfer to: [Sarah Johnson ▼]                      │   │
│  │ ○ Keep active (paid from estate)                        │   │
│  │ ○ Delete account and all data                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  💵 Subscription Cost (optional)                               │
│  [$22.99___] per [month ▼]                                     │
│                                                                 │
│  📝 Additional Notes                                           │
│  [Family uses this account - profiles for Sarah and kids___]   │
│                                                                 │
│                                                                 │
│  [← Back]  [Skip this service]  [Save & Continue →]            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Service-Aware Fields

Each service type has **pre-configured fields**:

| Service Type | Known Fields |
|--------------|--------------|
| **Email** | Email address, recovery email, 2FA method |
| **Social Media** | Username, profile URL, memorialization option |
| **Cloud Storage** | Storage used, important folders, shared access |
| **Streaming** | Subscription tier, monthly cost, family members |
| **Financial** | Account type, balance range, linked bank |
| **Crypto Exchange** | 2FA type, withdrawal address, API keys |
| **AI Tools** | API keys, subscription tier, important projects |

### 2.4 Smart Actions Per Service Type

Pre-configured wish options based on service type:

| Service Type | Available Actions |
|--------------|-------------------|
| **Social Media** | Delete, Memorialize, Transfer, Download data first |
| **Email** | Transfer, Set auto-reply, Download archive, Delete |
| **Cloud Storage** | Transfer ownership, Download all, Delete |
| **Streaming** | Cancel, Transfer, Keep active |
| **Financial** | Close account, Transfer balance, Notify institution |
| **Crypto** | Transfer to wallet, Liquidate, Hold |
| **Subscriptions** | Cancel, Transfer, Keep active |

---

## 3. UNIFIED SETUP FLOW

### 3.1 New Profile Structure

Replace current tabs with a **guided wizard**:

```
┌─────────────────────────────────────────────────────────────────┐
│  Estate Setup                                                   │
│  Let's build your digital estate step by step                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Progress: ████████░░░░░░░░░░░░ 40%                            │
│                                                                 │
│  ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐          │
│  │  1  │───▶│  2  │───▶│  3  │───▶│  4  │───▶│  5  │          │
│  │ You │    │People│   │Online│   │Assets│   │  Will │         │
│  │     │    │     │    │     │    │     │    │     │          │
│  │ ✓   │    │ ✓   │    │ ●   │    │     │    │     │          │
│  └─────┘    └─────┘    └─────┘    └─────┘    └─────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Step 1: About You**
- Personal details, address, DOB
- Marital status, dependents

**Step 2: Your People**
- Add executors (who will manage your estate)
- Add beneficiaries (who will receive things)
- Relationships and contact info

**Step 3: Your Online Life**
- Service catalog selection (visual grid)
- Setup each selected service
- Credentials + wishes captured together

**Step 4: Your Assets**
- Property (homes, vehicles)
- Financial accounts (banks, super, insurance)
- Valuables and crypto
- Assign beneficiaries to each

**Step 5: Your Will**
- Create from template OR upload existing
- Review all assignments
- Generate documents

### 3.2 Everything Flows to Vault

As user completes setup:
- Each service → Creates Vault record (Credentials type)
- Each asset → Creates Vault record (Assets/Financial type)
- Each document → Creates Vault record (Documents type)
- Wishes → Attached to relevant records
- Will → Links to all records

**User never manually manages Vault** — it's auto-populated from guided setup.

---

## 4. SERVICE DATABASE

### 4.1 Service Definition

```typescript
interface ServiceDefinition {
  id: string;
  name: string;
  logo: string;                    // URL or component
  category: ServiceCategory;
  
  // Pre-configured fields
  fields: ServiceField[];
  
  // Available actions for wishes
  availableActions: WishAction[];
  defaultAction: WishAction;
  
  // Service-specific info
  hasSubscription: boolean;
  has2FA: boolean;
  hasMemorialization: boolean;     // e.g., Facebook
  hasLegacyContact: boolean;       // e.g., Apple, Google
  deathPolicyUrl?: string;         // Link to their policy
  
  // For Vault
  createsVaultType: "Credentials" | "Financial" | "Assets";
}

type ServiceCategory = 
  | "email"
  | "social"
  | "cloud"
  | "streaming"
  | "ai"
  | "financial"
  | "crypto"
  | "shopping"
  | "productivity"
  | "gaming"
  | "other";

interface ServiceField {
  id: string;
  label: string;
  type: "text" | "email" | "password" | "url" | "select" | "currency";
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];            // For select type
}

type WishAction = 
  | "cancel"
  | "delete"
  | "transfer"
  | "memorialize"
  | "download_first"
  | "keep_active"
  | "close_account"
  | "liquidate"
  | "notify_only";
```

### 4.2 Example Service Definitions

```typescript
const SERVICES: ServiceDefinition[] = [
  {
    id: "netflix",
    name: "Netflix",
    logo: "/logos/netflix.svg",
    category: "streaming",
    fields: [
      { id: "email", label: "Account Email", type: "email", required: true },
      { id: "password", label: "Password", type: "password", required: false },
      { id: "plan", label: "Plan", type: "select", required: false, 
        options: ["Basic", "Standard", "Premium"] },
      { id: "cost", label: "Monthly Cost", type: "currency", required: false },
    ],
    availableActions: ["cancel", "transfer", "keep_active"],
    defaultAction: "cancel",
    hasSubscription: true,
    has2FA: false,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Credentials",
  },
  
  {
    id: "facebook",
    name: "Facebook",
    logo: "/logos/facebook.svg",
    category: "social",
    fields: [
      { id: "email", label: "Account Email", type: "email", required: true },
      { id: "password", label: "Password", type: "password", required: false },
      { id: "profile_url", label: "Profile URL", type: "url", required: false },
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
    id: "google",
    name: "Google Account",
    logo: "/logos/google.svg",
    category: "email",
    fields: [
      { id: "email", label: "Gmail Address", type: "email", required: true },
      { id: "password", label: "Password", type: "password", required: false },
      { id: "recovery_email", label: "Recovery Email", type: "email", required: false },
      { id: "2fa_method", label: "2FA Method", type: "select", required: false,
        options: ["Authenticator App", "SMS", "Security Key", "None"] },
    ],
    availableActions: ["transfer", "delete", "download_first"],
    defaultAction: "transfer",
    hasSubscription: false,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: true,
    deathPolicyUrl: "https://support.google.com/accounts/answer/3036546",
    createsVaultType: "Credentials",
  },
  
  {
    id: "coinbase",
    name: "Coinbase",
    logo: "/logos/coinbase.svg",
    category: "crypto",
    fields: [
      { id: "email", label: "Account Email", type: "email", required: true },
      { id: "password", label: "Password", type: "password", required: false },
      { id: "2fa_method", label: "2FA Method", type: "select", required: true,
        options: ["Authenticator App", "SMS", "Security Key"] },
      { id: "balance_range", label: "Approximate Balance", type: "select", required: false,
        options: ["Under $1k", "$1k-$10k", "$10k-$100k", "Over $100k"] },
    ],
    availableActions: ["transfer", "liquidate", "notify_only"],
    defaultAction: "transfer",
    hasSubscription: false,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Financial",
  },
  
  {
    id: "claude",
    name: "Claude (Anthropic)",
    logo: "/logos/anthropic.svg",
    category: "ai",
    fields: [
      { id: "email", label: "Account Email", type: "email", required: true },
      { id: "password", label: "Password", type: "password", required: false },
      { id: "plan", label: "Plan", type: "select", required: false,
        options: ["Free", "Pro", "Team"] },
      { id: "api_key", label: "API Key (if any)", type: "password", required: false,
        helpText: "Only if you have API access" },
    ],
    availableActions: ["cancel", "transfer", "delete"],
    defaultAction: "cancel",
    hasSubscription: true,
    has2FA: true,
    hasMemorialization: false,
    hasLegacyContact: false,
    createsVaultType: "Credentials",
  },
];
```

### 4.3 Service Categories with Icons

```typescript
const SERVICE_CATEGORIES = [
  { id: "email", label: "Email & Communication", icon: "Mail", color: "#EA4335" },
  { id: "social", label: "Social Media", icon: "Users", color: "#1DA1F2" },
  { id: "cloud", label: "Cloud Storage", icon: "Cloud", color: "#0061FF" },
  { id: "streaming", label: "Streaming & Entertainment", icon: "Play", color: "#E50914" },
  { id: "ai", label: "AI & Productivity", icon: "Sparkles", color: "#8B5CF6" },
  { id: "financial", label: "Financial & Payments", icon: "CreditCard", color: "#00C853" },
  { id: "crypto", label: "Cryptocurrency", icon: "Bitcoin", color: "#F7931A" },
  { id: "shopping", label: "Shopping & Services", icon: "ShoppingBag", color: "#FF9900" },
  { id: "productivity", label: "Work & Productivity", icon: "Briefcase", color: "#0052CC" },
  { id: "gaming", label: "Gaming", icon: "Gamepad2", color: "#5865F2" },
];
```

---

## 5. COMPLETE SETUP SCREEN FLOWS

### 5.1 Service Selection Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  Your Online Life                                    Step 3 of 5│
│  Which services do you use? Select all that apply.              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔍 [Search services...___________________________]             │
│                                                                 │
│  ━━━ 📧 Email & Communication ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │   [Logo]   │ │   [Logo]   │ │   [Logo]   │ │   [Logo]   │  │
│  │   Gmail    │ │  Outlook   │ │   Yahoo    │ │  iCloud    │  │
│  │     ☑      │ │     ☐      │ │     ☐      │ │     ☑      │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                 │
│  ━━━ 📱 Social Media ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │   [Logo]   │ │   [Logo]   │ │   [Logo]   │ │   [Logo]   │  │
│  │  Facebook  │ │ Instagram  │ │  Twitter/X │ │  LinkedIn  │  │
│  │     ☑      │ │     ☑      │ │     ☐      │ │     ☑      │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                 │
│  ━━━ ☁️ Cloud Storage ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │   [Logo]   │ │   [Logo]   │ │   [Logo]   │ │   [Logo]   │  │
│  │Google Drive│ │  Dropbox   │ │  OneDrive  │ │iCloud Drive│  │
│  │     ☑      │ │     ☑      │ │     ☐      │ │     ☑      │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                 │
│  [Show more categories ▼]                                      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ + Add a service not listed above                         │   │
│  │   [Service name: _______________________]               │   │
│  │   [Category: Select... ▼]                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Selected: 9 services                                          │
│  Gmail, iCloud Mail, Facebook, Instagram, LinkedIn,            │
│  Google Drive, Dropbox, iCloud Drive, Netflix                  │
│                                                                 │
│  [← Back to People]              [Continue to Setup (9) →]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Individual Service Setup

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to selection                                            │
│                                                                 │
│  Setting up your services                          3 of 9 done │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  [Facebook Logo - Large]                                │   │
│  │                                                          │   │
│  │  Facebook                                                │   │
│  │  Social Media · Has memorialization option              │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ACCOUNT DETAILS                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Email/Phone                                              │   │
│  │ [john.smith@gmail.com___________________________]       │   │
│  │                                                          │   │
│  │ Profile URL (optional)                                  │   │
│  │ [facebook.com/john.smith_______________________]        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  SECURE CREDENTIALS                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Do you want to store login credentials?                 │   │
│  │                                                          │   │
│  │ ○ No, just track this account                           │   │
│  │ ● Yes, store securely (encrypted, zero-knowledge)       │   │
│  │                                                          │   │
│  │   Password                                               │   │
│  │   [••••••••••••••••••______________] [👁]               │   │
│  │                                                          │   │
│  │   Two-Factor Auth                                       │   │
│  │   [Authenticator App ▼]                                 │   │
│  │                                                          │   │
│  │   Recovery Codes (optional)                             │   │
│  │   [Paste recovery codes here..._____________________]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  YOUR WISHES                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ What should happen to this account?                     │   │
│  │                                                          │   │
│  │ ┌─────────────────────────────────────────────────────┐ │   │
│  │ │ 🪦 Memorialize Account                        ● ← │ │   │
│  │ │ Facebook can turn your profile into a memorial     │ │   │
│  │ │ page that friends and family can visit.            │ │   │
│  │ │                                                     │ │   │
│  │ │ Legacy Contact (who can manage memorial):          │ │   │
│  │ │ [Sarah Johnson ▼]                                  │ │   │
│  │ └─────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │ ┌─────────────────────────────────────────────────────┐ │   │
│  │ │ 🗑️ Delete Account                              ○   │ │   │
│  │ │ Permanently delete the account and all data        │ │   │
│  │ └─────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │ ┌─────────────────────────────────────────────────────┐ │   │
│  │ │ 📥 Download Data First, Then Delete             ○   │ │   │
│  │ │ Request data download before deletion              │ │   │
│  │ │ Send download to: [Sarah Johnson ▼]               │ │   │
│  │ └─────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │ Additional instructions:                                │   │
│  │ [Post a final message to friends before memorializing]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ℹ️ Facebook's death policy: [View on Facebook →]              │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  [Skip this service]                    [Save & Next Service →]│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Setup Complete Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  ✓ Online Accounts Setup Complete                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  You've set up 9 services:                                     │
│                                                                 │
│  📧 EMAIL                                                       │
│  ├── Gmail → Transfer to Sarah Johnson                         │
│  └── iCloud Mail → Delete after download                       │
│                                                                 │
│  📱 SOCIAL                                                      │
│  ├── Facebook → Memorialize (Sarah as legacy contact)          │
│  ├── Instagram → Delete                                        │
│  └── LinkedIn → Download then delete                           │
│                                                                 │
│  ☁️ CLOUD STORAGE                                               │
│  ├── Google Drive → Transfer to Sarah Johnson                  │
│  ├── Dropbox → Transfer to Michael Kim                         │
│  └── iCloud → Transfer to Sarah Johnson                        │
│                                                                 │
│  🎬 STREAMING                                                   │
│  └── Netflix → Cancel subscription                             │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  🔐 Credentials stored: 7 services                             │
│  📋 Wishes recorded: 9 services                                │
│  💰 Subscriptions tracked: $45.98/month                        │
│                                                                 │
│  All of this is now in your Vault and will be included in     │
│  your Will under "Digital Legacy".                             │
│                                                                 │
│  [← Add More Services]              [Continue to Assets →]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. VAULT AUTO-POPULATION

As user completes setup, Vault is automatically populated:

```typescript
// When user saves a service setup
function createVaultRecordFromService(
  service: ServiceDefinition,
  userInput: ServiceFormData
): VaultRecord {
  return {
    id: generateId(),
    title: service.name,
    type: service.createsVaultType,
    subtype: service.category,
    category: "personal",
    source: "profile",
    description: `${service.name} account`,
    
    // From service definition
    serviceId: service.id,
    
    // From user input
    credentials: userInput.storeCredentials ? {
      email: userInput.email,
      password: encrypt(userInput.password),
      twoFactorMethod: userInput.twoFactorMethod,
      recoveryCodes: encrypt(userInput.recoveryCodes),
    } : null,
    
    // Wishes attached directly to record
    wish: {
      action: userInput.wishAction,
      transferTo: userInput.transferBeneficiary,
      instructions: userInput.additionalInstructions,
    },
    
    // Subscription tracking
    subscription: service.hasSubscription ? {
      cost: userInput.subscriptionCost,
      frequency: userInput.subscriptionFrequency,
    } : null,
    
    beneficiaries: userInput.transferBeneficiary 
      ? [userInput.transferBeneficiary] 
      : ["All Beneficiaries"],
    
    encrypted: true,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  };
}
```

---

## 7. IMPLEMENTATION PRIORITY

### Phase 1: Service Catalog (MVP)
- [ ] Create service database (start with 50 common services)
- [ ] Build visual service selection grid
- [ ] Implement service-specific forms
- [ ] Auto-create Vault records

### Phase 2: Guided Setup Wizard
- [ ] Replace Profile tabs with step-by-step wizard
- [ ] Unify About You → People → Online → Assets → Will flow
- [ ] Show progress throughout
- [ ] Setup summary at end

### Phase 3: Smart Features
- [ ] Email detection (suggest services based on email domain)
- [ ] Subscription cost tracking
- [ ] Service policy links
- [ ] Reminder to update when services change

---

## 8. SERVICE LOGO ASSETS

Need logos for all services. Options:
1. **Simple Icons** (simpleicons.org) - Free SVG brand icons
2. **Logo.dev API** - Fetch logos dynamically
3. **Self-hosted** - Download and host common logos

For MVP, use Simple Icons + fallback to first letter avatar.

---

*The goal: User selects services, we do the rest.*
