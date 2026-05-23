# E3tate UI/UX Specification v2

**Purpose:** Authoritative reference for all UI decisions in E3tate  
**Updated:** January 2025  
**Rule:** All screens MUST follow these specifications exactly

---

## 1. TERMINOLOGY GLOSSARY

Use these exact terms throughout the application. Never deviate.

| Canonical Term | Definition | ❌ Never Use |
|----------------|------------|--------------|
| **Record** | A single item in the vault | Entry, Item, File, Data |
| **Vault** | The encrypted storage containing all records | Safe, Locker, Storage, Repository |
| **Profile** | Guided wizard for adding common records | Setup, Onboarding, Quick Add |
| **Type** | Record classification (6 types) | Category, Kind, Class |
| **Subtype** | Specific variant within a Profile tab | Subcategory, Option |
| **Category** | Personal or Business grouping | Workspace, Folder, Section |
| **Beneficiary** | Person who receives records | Recipient, Heir, Assignee |
| **Executor** | Person who triggers execution | Administrator, Manager |
| **Observer** | Read-only legal access | Viewer, Watcher, Auditor |
| **Trigger** | Condition that starts execution | Activation, Event, Switch |
| **Execution** | The disclosure process | Release, Transfer, Handover |
| **Arm** | Enable triggers for execution | Activate, Enable, Turn on |

---

## 2. MASTER RECORD TYPES

There are exactly **6** record types. Used in Vault and as the canonical classification everywhere.

| Type | Label | Icon | Color | Background | Description |
|------|-------|------|-------|------------|-------------|
| **Identity** | "Identity" | `User` | `#8B5CF6` | `rgba(139, 92, 246, 0.1)` | Personal ID documents |
| **Financial** | "Financial" | `Wallet` | `#10B981` | `rgba(16, 185, 129, 0.1)` | Bank, super, insurance, investments |
| **Assets** | "Assets" | `Gem` | `#F97316` | `rgba(249, 115, 22, 0.1)` | Property, vehicles, crypto, valuables |
| **Documents** | "Documents" | `FileText` | `#3B82F6` | `rgba(59, 130, 246, 0.1)` | Legal docs, certificates, contracts |
| **Instructions** | "Instructions" | `ScrollText` | `#EC4899` | `rgba(236, 72, 153, 0.1)` | Final wishes, care instructions |
| **Credentials** | "Credentials" | `Key` | `#F59E0B` | `rgba(245, 158, 11, 0.1)` | Logins, passwords, recovery codes |

---

## 3. PROFILE → VAULT MAPPING

Profile provides guided entry that creates Vault records. Each Profile tab maps to specific Vault types.

### Profile Tab: Identity
**Creates:** `Identity` type records

| Subtype | Icon | Creates Type |
|---------|------|--------------|
| Personal ID (License) | `CreditCard` | Identity |
| Passport | `Globe` | Identity |
| Tax File Number / SSN | `Hash` | Identity |
| Birth Certificate | `Baby` | Identity |
| Medicare / Health Card | `Heart` | Identity |

### Profile Tab: Assets
**Creates:** `Assets` type records

| Subtype | Icon | Creates Type |
|---------|------|--------------|
| Home / Property | `Home` | Assets |
| Vehicle | `Car` | Assets |
| Cryptocurrency | `Bitcoin` | Assets |
| Valuables / Collectibles | `Gem` | Assets |
| Cash Holdings | `Banknote` | Assets |

### Profile Tab: Accounts
**Creates:** `Financial` or `Credentials` type records

| Subtype | Icon | Creates Type |
|---------|------|--------------|
| Bank Account | `Landmark` | Financial |
| Superannuation | `PiggyBank` | Financial |
| Insurance Policy | `Shield` | Financial |
| Investment / Brokerage | `TrendingUp` | Financial |
| Digital / Social Accounts | `AtSign` | **Credentials** ⚠️ |

> ⚠️ **Exception:** Digital/Social creates `Credentials`, not Financial!

### Profile Tab: Wishes
**Creates:** `Instructions` type records

| Subtype | Icon | Creates Type |
|---------|------|--------------|
| Final Wishes | `Heart` | Instructions |
| Care Instructions | `Stethoscope` | Instructions |
| Personal Messages | `Mail` | Instructions |
| Funeral Preferences | `Flower2` | Instructions |

---

## 4. CATEGORIES (Personal vs Business)

There are exactly **2** categories. Applied to any record regardless of type.

| Category | Label | Icon | Color | Background |
|----------|-------|------|-------|------------|
| **Personal** | "Personal" | `Home` | `#06B6D4` | `rgba(6, 182, 212, 0.1)` |
| **Business** | "Business" | `Building2` | `#8B5CF6` | `rgba(139, 92, 246, 0.1)` |

**Usage:**
- Personal = Individual/family assets (home, car, personal accounts)
- Business = Commercial assets (company accounts, commercial property)

---

## 5. USER ROLES

There are exactly **3** beneficiary roles.

| Role | Badge Color | Background | Permissions |
|------|-------------|------------|-------------|
| **Executor** | `#8B5CF6` | `rgba(139, 92, 246, 0.1)` | Full vault access, can trigger execution |
| **Beneficiary** | `#06B6D4` | `rgba(6, 182, 212, 0.1)` | Receives assigned records only |
| **Observer** | `#F59E0B` | `rgba(245, 158, 11, 0.1)` | Read-only evidence access |

---

## 6. COLOR SYSTEM

### Backgrounds
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#FAFAF9` | Main page background |
| `--bg-secondary` | `#FFFFFF` | Cards, modals |
| `--bg-surface` | `#F5F5F4` | Subtle sections, hover states |
| `--bg-sidebar` | `#1C1917` | Sidebar background |

### Accent Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--accent` | `#8B5CF6` | Primary accent (violet) |
| `--accent-secondary` | `#EC4899` | Secondary accent (pink) |
| `--accent-gradient` | `violet → pink` | Primary buttons, highlights |

### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#1C1917` | Headings, primary text |
| `--text-secondary` | `#57534E` | Body text, descriptions |
| `--text-muted` | `#A8A29E` | Hints, timestamps, placeholders |
| `--text-inverse` | `#FAFAF9` | Text on dark backgrounds |

### Status Colors
| Status | Color | Background |
|--------|-------|------------|
| Success | `#10B981` | `rgba(16, 185, 129, 0.1)` |
| Warning | `#F59E0B` | `rgba(245, 158, 11, 0.1)` |
| Error | `#EF4444` | `rgba(239, 68, 68, 0.1)` |
| Info | `#3B82F6` | `rgba(59, 130, 246, 0.1)` |

---

## 7. NAVIGATION STRUCTURE

### Sidebar Items
```tsx
const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/vault", label: "Vault", icon: Lock },
  { href: "/beneficiaries", label: "Beneficiaries", icon: Users },
  { href: "/triggers", label: "Triggers", icon: Zap },
  { href: "/activity-log", label: "Activity Log", icon: Clock },
  { href: "/help", label: "Help", icon: HelpCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];
```

### Page Titles & Subtitles

| Page | Title | Subtitle | Primary Action |
|------|-------|----------|----------------|
| Dashboard | "Welcome back" | "Your digital estate at a glance" | "+ Add Record" |
| Profile | "Profile" | "Your personal information and final wishes" | "Save All Changes" |
| Vault | "Vault" | "Manage your encrypted digital estate records" | "+ Add Record" |
| Beneficiaries | "Beneficiaries" | "Manage executors, beneficiaries, and disclosure scopes" | "+ Invite" |
| Triggers | "Triggers" | "Configure when and how your estate plan executes" | "Arm Estate Plan" |
| Activity Log | "Activity Log" | "Track all changes to your digital estate" | None |
| Settings | "Settings" | "Manage your account and preferences" | None |

---

## 8. PAGE LAYOUTS

### Standard Page Structure
```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR (180px, dark)           MAIN CONTENT (flex-1, light)   │
│  ┌────────────────────┐         ┌─────────────────────────────┐ │
│  │ Logo               │         │ Page Header                 │ │
│  │ ────────────────── │         │ [Title]        [Action Btn] │ │
│  │ Dashboard          │         │ [Subtitle]                  │ │
│  │ Profile ← active   │         ├─────────────────────────────┤ │
│  │ Vault              │         │                             │ │
│  │ Beneficiaries      │         │ Page Content                │ │
│  │ Triggers           │         │                             │ │
│  │ Activity Log       │         │                             │ │
│  │ Help               │         │                             │ │
│  │ Settings           │         │                             │ │
│  │ ────────────────── │         │                             │ │
│  │ User Account       │         │                             │ │
│  └────────────────────┘         └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Profile Page Structure
```
┌─────────────────────────────────────────────────────────────────┐
│  Profile                                    [Save All Changes]  │
│  Your personal information and final wishes                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔒 Maximum Privacy Protection                            │   │
│  │ All information encrypted with zero-knowledge...         │   │
│  │ [End-to-end Encrypted] [Post-Trigger Access Only]       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Identity] [Assets] [Accounts] [Wishes]  ← Profile tabs       │
│                                                                 │
│  ┌───────────────────────────────────┐ ┌───────────────────┐   │
│  │                                   │ │ Profile Summary   │   │
│  │  Subtype selector + Form          │ │ Completion: 40%   │   │
│  │                                   │ │ ─────────────────│   │
│  │                                   │ │ Identity (0)      │   │
│  │                                   │ │ Financial (1)     │   │
│  │                                   │ │ Assets (2)        │   │
│  │                                   │ │ Documents (1)     │   │
│  │                                   │ │ Instructions (0)  │   │
│  │                                   │ │ Credentials (0)   │   │
│  │                                   │ │                   │   │
│  │                                   │ │ [Save & Complete] │   │
│  └───────────────────────────────────┘ └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Vault Page Structure
```
┌─────────────────────────────────────────────────────────────────┐
│  Vault                                          [+ Add Record]  │
│  Manage your encrypted digital estate records                   │
├─────────────────────────────────────────────────────────────────┤
│  [🔍 Search records...]                                         │
│                                                                 │
│  [All(12)] [Identity(1)] [Financial(2)] [Credentials(1)]       │
│  [Documents(4)] [Instructions(1)] [Assets(3)]                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [📄] Title      [Type Badge] [From Profile] [Encrypted] │   │
│  │      Beneficiaries · Time · Size            [View][Edit]│   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [📄] Title      [Type Badge] [Encrypted]                │   │
│  │      Beneficiaries · Time · Size            [View][Edit]│   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. PROFILE SUMMARY SIDEBAR

The Profile Summary MUST group records by **Vault type**, not Profile tab.

### Structure
```tsx
interface ProfileSummary {
  completion: number; // 0-100
  types: {
    type: RecordType;
    count: number;
    records: { id: string; title: string; icon: string }[];
  }[];
}
```

### Display Order
1. Identity
2. Financial
3. Assets
4. Documents
5. Instructions
6. Credentials

### Visual
```
Profile Summary
Completion                    40%
████████░░░░░░░░░░░░░

Add 7 more items to reach 100%

◈ Assets (2)
  ⌂ Home 1
  ⌂ Home 2

💳 Accounts (1)        ← Label can stay "Accounts" 
  🏦 Bank Savings         but groups as Financial

📄 Documents (1)
  📄 Will

[✓ Save & Complete Setup]
```

> **Note:** The sidebar can use friendly labels like "Accounts" but internally groups by Vault type (Financial).

---

## 10. RECORD BADGES

### Type Badge
Shows the master Vault type with appropriate color.

```tsx
<Badge color={TYPE_COLORS[record.type].color} bg={TYPE_COLORS[record.type].bg}>
  {record.type}
</Badge>
```

### Source Badge
Shows where the record was created.

| Source | Badge Text | Color |
|--------|------------|-------|
| Profile | "From Profile" | `#EC4899` pink |
| Vault | (no badge) | — |

### Status Badge
Shows encryption/access status.

| Status | Badge Text | Color |
|--------|------------|-------|
| Encrypted | "Encrypted" | `#10B981` green |
| Post-Trigger | "Post-Trigger Access Only" | `#3B82F6` blue |

---

## 11. BUTTON PATTERNS

### Primary Action (Gradient)
```tsx
className="bg-gradient-to-r from-violet-500 to-pink-500 text-white 
           hover:opacity-90 rounded-lg px-4 py-2"
```
Used for: Main CTAs, "Add", "Save", "Continue"

### Secondary Action (Outline)
```tsx
className="border border-stone-200 bg-white text-stone-700 
           hover:bg-stone-50 rounded-lg px-4 py-2"
```
Used for: "Cancel", "View", secondary actions

### Ghost Action
```tsx
className="text-stone-600 hover:bg-stone-100 rounded-lg px-4 py-2"
```
Used for: Tertiary actions, "Edit" in lists

### Destructive Action
```tsx
className="bg-red-500 text-white hover:bg-red-600 rounded-lg px-4 py-2"
```
Used for: Delete, Remove (always with confirmation)

---

## 12. FORM PATTERNS

### Input Field
```tsx
<input
  className="w-full px-4 py-2 border border-stone-200 rounded-lg 
             bg-white text-stone-900 placeholder:text-stone-400
             focus:outline-none focus:ring-2 focus:ring-violet-500"
  placeholder="e.g., Primary Residence"
/>
```

### Label
```tsx
<label className="block text-sm font-medium text-stone-700 mb-1.5">
  Name
</label>
```

### Help Text
```tsx
<p className="text-sm text-stone-500 mt-1">Additional details...</p>
```

---

## 13. SUBTYPE SELECTOR

When selecting a subtype in Profile, show which Vault type it creates:

```tsx
<div className="grid grid-cols-4 gap-4">
  {subtypes.map(subtype => (
    <button
      key={subtype.id}
      className={`p-4 rounded-xl border-2 text-center transition-all ${
        selected === subtype.id
          ? "border-violet-500 bg-violet-50"
          : "border-stone-200 hover:border-stone-300"
      }`}
    >
      <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-stone-100 
                      flex items-center justify-center">
        <Icon className="w-6 h-6 text-stone-600" />
      </div>
      <p className="font-medium text-stone-900">{subtype.label}</p>
      <p className="text-xs text-stone-500 mt-1">
        → {subtype.createsType}
      </p>
    </button>
  ))}
</div>
```

---

## 14. EMPTY STATES

| Context | Icon | Title | Description | Action |
|---------|------|-------|-------------|--------|
| Vault (empty) | `Lock` | "No records yet" | "Add your first record to start building your digital estate" | "+ Add Record" |
| Vault (no results) | `Search` | "No records found" | "Try adjusting your search or filters" | "Clear Filters" |
| Beneficiaries (empty) | `Users` | "No beneficiaries yet" | "Invite someone to be an executor or beneficiary" | "+ Invite" |
| Profile tab (empty) | Varies | "No {type} added" | "Add your first {type} to continue" | "+ Add {Type}" |

---

## 15. IMPLEMENTATION CHECKLIST

Before shipping any screen, verify:

- [ ] Uses terminology from Section 1 glossary
- [ ] Record types use colors from Section 2
- [ ] Profile tabs map correctly to Vault types (Section 3)
- [ ] Categories use colors from Section 4
- [ ] Page follows layout from Section 8
- [ ] Profile Summary groups by Vault type (Section 9)
- [ ] Badges follow patterns from Section 10
- [ ] Buttons follow patterns from Section 11
- [ ] Forms follow patterns from Section 12
- [ ] Empty states implemented from Section 14

---

*This specification is the single source of truth. When in doubt, refer here.*
