# E3tate Component Patterns v2

**Purpose:** Copy-paste ready code patterns for consistent implementation  
**Updated:** January 2025  
**Rule:** Use these patterns exactly as shown

---

## 1. CONSTANTS & TYPES

### Master Type Definitions

```typescript
// types/index.ts

// The 6 master record types - used in Vault
export type RecordType = 
  | "Identity" 
  | "Financial" 
  | "Assets"
  | "Documents" 
  | "Instructions" 
  | "Credentials";

// Profile tabs
export type ProfileTab = "identity" | "assets" | "accounts" | "wishes";

// Categories
export type Category = "personal" | "business";

// User roles
export type BeneficiaryRole = "Executor" | "Beneficiary" | "Observer";

// Invitation status
export type InviteStatus = "Pending" | "Accepted" | "Declined";

// Record source
export type RecordSource = "profile" | "vault";

// Access scope
export type AccessScope = "Full" | "Partial" | "Metadata Only";
```

### Color Constants

```typescript
// lib/constants.ts

export const COLORS = {
  // Master Record Types (6 types)
  type: {
    Identity: { 
      color: "#8B5CF6", 
      bg: "rgba(139, 92, 246, 0.1)",
      icon: "User"
    },
    Financial: { 
      color: "#10B981", 
      bg: "rgba(16, 185, 129, 0.1)",
      icon: "Wallet"
    },
    Assets: { 
      color: "#F97316", 
      bg: "rgba(249, 115, 22, 0.1)",
      icon: "Gem"
    },
    Documents: { 
      color: "#3B82F6", 
      bg: "rgba(59, 130, 246, 0.1)",
      icon: "FileText"
    },
    Instructions: { 
      color: "#EC4899", 
      bg: "rgba(236, 72, 153, 0.1)",
      icon: "ScrollText"
    },
    Credentials: { 
      color: "#F59E0B", 
      bg: "rgba(245, 158, 11, 0.1)",
      icon: "Key"
    },
  },
  
  // Categories (Personal vs Business)
  category: {
    personal: { color: "#06B6D4", bg: "rgba(6, 182, 212, 0.1)" },
    business: { color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)" },
  },
  
  // User Roles
  role: {
    Executor: { color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.1)" },
    Beneficiary: { color: "#06B6D4", bg: "rgba(6, 182, 212, 0.1)" },
    Observer: { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)" },
  },
  
  // Status
  status: {
    success: { color: "#10B981", bg: "rgba(16, 185, 129, 0.1)" },
    warning: { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)" },
    error: { color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" },
    info: { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)" },
  },
  
  // Source badges
  source: {
    profile: { color: "#EC4899", bg: "rgba(236, 72, 153, 0.1)" },
  },
} as const;
```

### Profile → Vault Type Mapping

```typescript
// lib/profile-mapping.ts

import { RecordType, ProfileTab } from "@/types";

interface ProfileSubtype {
  id: string;
  label: string;
  icon: string;
  createsType: RecordType;
  description?: string;
}

export const PROFILE_SUBTYPES: Record<ProfileTab, ProfileSubtype[]> = {
  identity: [
    { id: "personal-id", label: "Personal ID", icon: "CreditCard", createsType: "Identity" },
    { id: "passport", label: "Passport", icon: "Globe", createsType: "Identity" },
    { id: "tax-number", label: "Tax File Number", icon: "Hash", createsType: "Identity" },
    { id: "birth-cert", label: "Birth Certificate", icon: "Baby", createsType: "Identity" },
    { id: "medicare", label: "Medicare Card", icon: "Heart", createsType: "Identity" },
  ],
  assets: [
    { id: "home-property", label: "Home/Property", icon: "Home", createsType: "Assets" },
    { id: "vehicle", label: "Vehicle", icon: "Car", createsType: "Assets" },
    { id: "crypto", label: "Cryptocurrency", icon: "Bitcoin", createsType: "Assets" },
    { id: "valuables", label: "Valuables", icon: "Gem", createsType: "Assets" },
    { id: "cash", label: "Cash Holdings", icon: "Banknote", createsType: "Assets" },
  ],
  accounts: [
    { id: "bank", label: "Bank Account", icon: "Landmark", createsType: "Financial" },
    { id: "super", label: "Superannuation", icon: "PiggyBank", createsType: "Financial" },
    { id: "insurance", label: "Insurance", icon: "Shield", createsType: "Financial" },
    { id: "investment", label: "Investment", icon: "TrendingUp", createsType: "Financial" },
    // NOTE: Digital/Social creates Credentials, not Financial!
    { id: "digital-social", label: "Digital/Social", icon: "AtSign", createsType: "Credentials" },
  ],
  wishes: [
    { id: "final-wishes", label: "Final Wishes", icon: "Heart", createsType: "Instructions" },
    { id: "care", label: "Care Instructions", icon: "Stethoscope", createsType: "Instructions" },
    { id: "messages", label: "Personal Messages", icon: "Mail", createsType: "Instructions" },
    { id: "funeral", label: "Funeral Preferences", icon: "Flower2", createsType: "Instructions" },
  ],
};

// Get the Vault type for a given Profile subtype
export function getVaultType(tab: ProfileTab, subtypeId: string): RecordType {
  const subtype = PROFILE_SUBTYPES[tab].find(s => s.id === subtypeId);
  return subtype?.createsType ?? "Documents";
}
```

---

## 2. RECORD INTERFACES

```typescript
// types/records.ts

import { RecordType, Category, RecordSource, AccessScope } from "./index";

export interface VaultRecord {
  id: string;
  title: string;
  type: RecordType;
  subtype?: string;           // Profile subtype ID (e.g., "bank", "home-property")
  category: Category;
  source: RecordSource;       // "profile" or "vault"
  description?: string;
  beneficiaries: string[];
  accessScope: AccessScope;
  encrypted: boolean;
  createdAt: string;
  modifiedAt: string;
  
  // Optional type-specific fields
  institution?: string;       // For Financial
  accountNumber?: string;     // For Financial
  estimatedValue?: number;    // For Assets
  fileSize?: string;          // For Documents
  fileType?: string;          // For Documents
}

export interface Beneficiary {
  id: string;
  name: string;
  email: string;
  role: BeneficiaryRole;
  status: InviteStatus;
  invitedAt: string;
  acceptedAt?: string;
  recordsAccess: number;
  disclosureScope: string;
}
```

---

## 3. BADGE COMPONENTS

### Type Badge

```tsx
// components/ui/type-badge.tsx

import { COLORS } from "@/lib/constants";
import { RecordType } from "@/types";

interface TypeBadgeProps {
  type: RecordType;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const colors = COLORS.type[type];
  
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ color: colors.color, backgroundColor: colors.bg }}
    >
      {type}
    </span>
  );
}
```

### Source Badge

```tsx
// components/ui/source-badge.tsx

import { COLORS } from "@/lib/constants";
import { RecordSource } from "@/types";
import { Link2 } from "lucide-react";

interface SourceBadgeProps {
  source: RecordSource;
}

export function SourceBadge({ source }: SourceBadgeProps) {
  if (source !== "profile") return null;
  
  const colors = COLORS.source.profile;
  
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: colors.color, backgroundColor: colors.bg }}
    >
      <Link2 className="w-3 h-3" />
      From Profile
    </span>
  );
}
```

### Role Badge

```tsx
// components/ui/role-badge.tsx

import { COLORS } from "@/lib/constants";
import { BeneficiaryRole } from "@/types";

interface RoleBadgeProps {
  role: BeneficiaryRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const colors = COLORS.role[role];
  
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ color: colors.color, backgroundColor: colors.bg }}
    >
      {role}
    </span>
  );
}
```

### Encrypted Badge

```tsx
// components/ui/encrypted-badge.tsx

import { Lock } from "lucide-react";

export function EncryptedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-emerald-600 bg-emerald-50">
      <Lock className="w-3 h-3" />
      Encrypted
    </span>
  );
}
```

---

## 4. VAULT RECORD CARD

```tsx
// components/vault/record-card.tsx

import { VaultRecord } from "@/types";
import { COLORS } from "@/lib/constants";
import { TypeBadge, SourceBadge, EncryptedBadge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";

interface RecordCardProps {
  record: VaultRecord;
  onView: () => void;
  onEdit: () => void;
}

export function RecordCard({ record, onView, onEdit }: RecordCardProps) {
  const typeConfig = COLORS.type[record.type];
  const Icon = Icons[typeConfig.icon as keyof typeof Icons] || Icons.FileText;
  
  return (
    <div className="bg-white rounded-xl border border-stone-200 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 p-4">
        {/* Type Icon */}
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: typeConfig.bg }}
        >
          <Icon className="w-5 h-5" style={{ color: typeConfig.color }} />
        </div>
        
        {/* Record Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-stone-900">{record.title}</h3>
            <TypeBadge type={record.type} />
            <SourceBadge source={record.source} />
            {record.encrypted && <EncryptedBadge />}
          </div>
          <p className="text-sm text-stone-500 mt-0.5">
            {record.beneficiaries.length > 0 
              ? record.beneficiaries.join(", ")
              : "No beneficiaries"
            }
            {" · "}
            {record.modifiedAt}
            {record.fileSize && ` · ${record.fileSize}`}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onView}>View</Button>
          <Button variant="secondary" size="sm" onClick={onEdit}>Edit</Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. VAULT FILTER TABS

```tsx
// components/vault/filter-tabs.tsx

import { RecordType } from "@/types";
import { COLORS } from "@/lib/constants";
import * as Icons from "lucide-react";

const RECORD_TYPES: RecordType[] = [
  "Identity", "Financial", "Credentials", "Documents", "Instructions", "Assets"
];

interface FilterTabsProps {
  selected: RecordType | "all";
  onChange: (type: RecordType | "all") => void;
  counts: Record<RecordType | "all", number>;
}

export function FilterTabs({ selected, onChange, counts }: FilterTabsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {/* All tab */}
      <button
        onClick={() => onChange("all")}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          selected === "all"
            ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white"
            : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
        }`}
      >
        All ({counts.all})
      </button>
      
      {/* Type tabs */}
      {RECORD_TYPES.map(type => {
        const config = COLORS.type[type];
        const Icon = Icons[config.icon as keyof typeof Icons];
        
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              selected === type
                ? "text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
            style={selected === type ? { backgroundColor: config.color } : undefined}
          >
            <Icon className="w-4 h-4" />
            {type} ({counts[type]})
          </button>
        );
      })}
    </div>
  );
}
```

---

## 6. PROFILE SUBTYPE SELECTOR

```tsx
// components/profile/subtype-selector.tsx

import { ProfileTab } from "@/types";
import { PROFILE_SUBTYPES } from "@/lib/profile-mapping";
import { COLORS } from "@/lib/constants";
import * as Icons from "lucide-react";

interface SubtypeSelectorProps {
  tab: ProfileTab;
  selected: string | null;
  onChange: (subtypeId: string) => void;
}

export function SubtypeSelector({ tab, selected, onChange }: SubtypeSelectorProps) {
  const subtypes = PROFILE_SUBTYPES[tab];
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {subtypes.map(subtype => {
        const Icon = Icons[subtype.icon as keyof typeof Icons] || Icons.File;
        const isSelected = selected === subtype.id;
        const typeColor = COLORS.type[subtype.createsType];
        
        return (
          <button
            key={subtype.id}
            type="button"
            onClick={() => onChange(subtype.id)}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              isSelected
                ? "border-violet-500 bg-violet-50"
                : "border-stone-200 hover:border-stone-300 bg-white"
            }`}
          >
            <div 
              className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: isSelected ? typeColor.bg : "#F5F5F4" }}
            >
              <Icon 
                className="w-6 h-6" 
                style={{ color: isSelected ? typeColor.color : "#57534E" }} 
              />
            </div>
            <p className="font-medium text-stone-900">{subtype.label}</p>
            <p 
              className="text-xs mt-1"
              style={{ color: typeColor.color }}
            >
              → {subtype.createsType}
            </p>
          </button>
        );
      })}
    </div>
  );
}
```

---

## 7. PROFILE SUMMARY SIDEBAR

```tsx
// components/profile/profile-summary.tsx

import { VaultRecord, RecordType } from "@/types";
import { COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";
import { CheckCircle } from "lucide-react";

const TYPE_ORDER: RecordType[] = [
  "Identity", "Financial", "Assets", "Documents", "Instructions", "Credentials"
];

interface ProfileSummaryProps {
  records: VaultRecord[];
  completion: number;
  onSaveComplete: () => void;
}

export function ProfileSummary({ records, completion, onSaveComplete }: ProfileSummaryProps) {
  // Group records by Vault type
  const groupedRecords = TYPE_ORDER.map(type => ({
    type,
    records: records.filter(r => r.type === type),
  }));
  
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      <h3 className="font-semibold text-stone-900 mb-4">Profile Summary</h3>
      
      {/* Completion */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-stone-600">Completion</span>
          <span 
            className="font-medium"
            style={{ color: completion >= 100 ? "#10B981" : "#EC4899" }}
          >
            {completion}%
          </span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all"
            style={{ width: `${Math.min(completion, 100)}%` }}
          />
        </div>
        <p className="text-xs text-stone-500 mt-2">
          {completion < 100 
            ? `Add ${Math.ceil((100 - completion) / 10)} more items to reach 100%`
            : "Profile complete!"
          }
        </p>
      </div>
      
      {/* Records by type */}
      <div className="space-y-4">
        {groupedRecords.map(({ type, records }) => {
          const config = COLORS.type[type];
          const Icon = Icons[config.icon as keyof typeof Icons];
          
          if (records.length === 0) return null;
          
          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: config.color }} />
                <span className="text-sm font-medium text-stone-700">
                  {type} ({records.length})
                </span>
              </div>
              <div className="ml-6 space-y-1">
                {records.map(record => (
                  <div key={record.id} className="flex items-center gap-2 text-sm text-stone-600">
                    <span className="w-1 h-1 rounded-full bg-stone-400" />
                    {record.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Save button */}
      <Button 
        className="w-full mt-6"
        onClick={onSaveComplete}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Save & Complete Setup
      </Button>
      
      <p className="text-xs text-stone-500 text-center mt-2">
        All changes are auto-saved
      </p>
    </div>
  );
}
```

---

## 8. PROFILE TAB NAVIGATION

```tsx
// components/profile/profile-tabs.tsx

import { ProfileTab } from "@/types";
import { COLORS } from "@/lib/constants";
import { User, Gem, Wallet, Heart } from "lucide-react";

const TABS: { id: ProfileTab; label: string; icon: typeof User; vaultType: string }[] = [
  { id: "identity", label: "Identity", icon: User, vaultType: "Identity" },
  { id: "assets", label: "Assets", icon: Gem, vaultType: "Assets" },
  { id: "accounts", label: "Accounts", icon: Wallet, vaultType: "Financial" },
  { id: "wishes", label: "Wishes", icon: Heart, vaultType: "Instructions" },
];

interface ProfileTabsProps {
  selected: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

export function ProfileTabs({ selected, onChange }: ProfileTabsProps) {
  return (
    <div className="flex gap-1 border-b border-stone-200">
      {TABS.map(tab => {
        const Icon = tab.icon;
        const isSelected = selected === tab.id;
        const typeColor = COLORS.type[tab.vaultType as keyof typeof COLORS.type];
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              isSelected
                ? "border-current text-stone-900"
                : "border-transparent text-stone-500 hover:text-stone-700"
            }`}
            style={isSelected ? { borderColor: typeColor.color } : undefined}
          >
            <Icon className="w-4 h-4" style={isSelected ? { color: typeColor.color } : undefined} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
```

---

## 9. BUTTON COMPONENT

```tsx
// components/ui/button.tsx

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:opacity-90",
      secondary: "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50",
      ghost: "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
      danger: "bg-red-500 text-white hover:bg-red-600",
    };
    
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };
    
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-all",
          "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);
```

---

## 10. EMPTY STATE COMPONENT

```tsx
// components/ui/empty-state.tsx

import { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
        <Icon className="w-8 h-8 text-stone-400" />
      </div>
      <h3 className="font-medium text-stone-900">{title}</h3>
      <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">{description}</p>
      {action && (
        <Button className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

---

## 11. PAGE HEADER COMPONENT

```tsx
// components/layout/page-header.tsx

import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
        <p className="text-stone-500 mt-1">{subtitle}</p>
      </div>
      {action && (
        <Button onClick={action.onClick}>
          {action.icon && <action.icon className="w-4 h-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

---

## 12. ICON MAPPING

```typescript
// lib/icons.ts

import {
  User, Wallet, Gem, FileText, ScrollText, Key,
  Home, Building2, Car, Bitcoin, Banknote,
  CreditCard, Globe, Hash, Baby, Heart,
  Landmark, PiggyBank, Shield, TrendingUp, AtSign,
  Stethoscope, Mail, Flower2,
  LayoutDashboard, Lock, Users, Zap, Clock, HelpCircle, Settings,
} from "lucide-react";

// Record type icons
export const TYPE_ICONS = {
  Identity: User,
  Financial: Wallet,
  Assets: Gem,
  Documents: FileText,
  Instructions: ScrollText,
  Credentials: Key,
} as const;

// Category icons
export const CATEGORY_ICONS = {
  personal: Home,
  business: Building2,
} as const;

// Profile subtype icons
export const SUBTYPE_ICONS = {
  // Identity
  "personal-id": CreditCard,
  "passport": Globe,
  "tax-number": Hash,
  "birth-cert": Baby,
  "medicare": Heart,
  
  // Assets
  "home-property": Home,
  "vehicle": Car,
  "crypto": Bitcoin,
  "valuables": Gem,
  "cash": Banknote,
  
  // Accounts
  "bank": Landmark,
  "super": PiggyBank,
  "insurance": Shield,
  "investment": TrendingUp,
  "digital-social": AtSign,
  
  // Wishes
  "final-wishes": Heart,
  "care": Stethoscope,
  "messages": Mail,
  "funeral": Flower2,
} as const;

// Navigation icons
export const NAV_ICONS = {
  dashboard: LayoutDashboard,
  profile: User,
  vault: Lock,
  beneficiaries: Users,
  triggers: Zap,
  activityLog: Clock,
  help: HelpCircle,
  settings: Settings,
} as const;
```

---

*Use these patterns exactly as shown for consistent implementation.*
