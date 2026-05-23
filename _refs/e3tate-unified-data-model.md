# E3tate Unified Data Model

**Purpose:** Align Profile and Vault into a single coherent taxonomy  
**Rule:** Profile is a guided wizard that creates Vault records

---

## 1. MASTER RECORD TYPES

There are exactly **6** record types. These are used in the Vault and are the canonical classification.

| Type | Icon | Color | Description |
|------|------|-------|-------------|
| **Identity** | `User` | `#8B5CF6` Violet | Personal identification documents |
| **Financial** | `Wallet` | `#10B981` Emerald | Bank accounts, super, insurance, investments |
| **Assets** | `Gem` | `#F97316` Orange | Property, vehicles, crypto, valuables |
| **Documents** | `FileText` | `#3B82F6` Blue | Legal docs, certificates, contracts |
| **Instructions** | `ScrollText` | `#EC4899` Pink | Final wishes, care instructions, messages |
| **Credentials** | `Key` | `#F59E0B` Amber | Logins, passwords, recovery codes |

---

## 2. PROFILE TABS → VAULT MAPPING

Profile provides a **guided entry experience** that creates records in the Vault.

### Tab: Identity
**Creates:** `Identity` type records

| Subtype in Profile | Vault Record Type | Icon |
|--------------------|-------------------|------|
| Personal ID (License, State ID) | Identity | `CreditCard` |
| Passport | Identity | `Globe` |
| Tax File Number / SSN | Identity | `Hash` |
| Birth Certificate | Identity | `Baby` |
| Medicare / Health Card | Identity | `Heart` |

### Tab: Assets  
**Creates:** `Assets` type records

| Subtype in Profile | Vault Record Type | Icon |
|--------------------|-------------------|------|
| Home / Property | Assets | `Home` |
| Vehicle | Assets | `Car` |
| Cryptocurrency | Assets | `Bitcoin` |
| Valuables / Collectibles | Assets | `Gem` |
| Business Ownership | Assets | `Building2` |

### Tab: Accounts
**Creates:** `Financial` type records

| Subtype in Profile | Vault Record Type | Icon |
|--------------------|-------------------|------|
| Bank Account | Financial | `Landmark` |
| Superannuation | Financial | `PiggyBank` |
| Insurance Policy | Financial | `Shield` |
| Investment / Brokerage | Financial | `TrendingUp` |
| Digital / Social Accounts | Credentials | `AtSign` |

> **Note:** "Digital/Social Accounts" creates `Credentials` type, not Financial!

### Tab: Wishes
**Creates:** `Instructions` type records

| Subtype in Profile | Vault Record Type | Icon |
|--------------------|-------------------|------|
| Final Wishes | Instructions | `Heart` |
| Care Instructions | Instructions | `Stethoscope` |
| Personal Messages | Instructions | `Mail` |
| Funeral Preferences | Instructions | `Flower2` |
| Pet Care Instructions | Instructions | `Dog` |

---

## 3. VAULT FILTER TABS

The Vault shows **all records** with these filter tabs:

```
[All (12)] [Identity (1)] [Financial (2)] [Credentials (1)] [Documents (4)] [Instructions (1)] [Assets (3)]
```

Each tab filters by the master record type.

---

## 4. RECORD CARD DISPLAY

Every record (whether created via Profile or Vault) displays the same way:

```
┌─────────────────────────────────────────────────────────────┐
│ [Type Icon] │ Title           [Type Badge]  [Source Badge]  │
│             │ Beneficiaries · Modified time · Size (if file)│
│             │                                   [View] [Edit]│
└─────────────────────────────────────────────────────────────┘
```

**Source Badge:** 
- `From Profile` — Created via Profile wizard (pink/coral badge)
- No badge — Created directly in Vault

**Type Badge:** Uses master type colors (Identity=violet, Financial=emerald, etc.)

---

## 5. PROFILE SUMMARY SIDEBAR

The Profile Summary should mirror Vault types:

### Current (Problematic)
```
Profile Summary
├── Assets (2)
│   ├── Home 1
│   └── Home 2
├── Accounts (1)
│   └── Bank Savings
└── Documents (1)
    └── will
```

### Recommended (Aligned)
```
Profile Summary
├── Identity (0)
├── Financial (1)
│   └── Bank Savings
├── Assets (2)
│   ├── Home 1
│   └── Home 2
├── Documents (1)
│   └── Will
└── Instructions (0)
```

This matches the Vault filter tabs exactly.

---

## 6. NAVIGATION LABELS

| Location | Current | Recommended |
|----------|---------|-------------|
| Sidebar nav | "Profile" + "Vault" | Keep both |
| Profile page title | "Profile" | "Profile Setup" or "Quick Add" |
| Profile subtitle | "Your personal information and final wishes" | "Add records to your vault with guided forms" |

**Clarify the relationship:**
- Profile = Guided wizard for adding common record types
- Vault = Full view of all encrypted records

---

## 7. VISUAL CONSISTENCY

### Colors (Both Pages)
Use the same type colors everywhere:

| Type | Badge Color | Icon Background |
|------|-------------|-----------------|
| Identity | `#8B5CF6` violet | `rgba(139, 92, 246, 0.1)` |
| Financial | `#10B981` emerald | `rgba(16, 185, 129, 0.1)` |
| Assets | `#F97316` orange | `rgba(249, 115, 22, 0.1)` |
| Documents | `#3B82F6` blue | `rgba(59, 130, 246, 0.1)` |
| Instructions | `#EC4899` pink | `rgba(236, 72, 153, 0.1)` |
| Credentials | `#F59E0B` amber | `rgba(245, 158, 11, 0.1)` |

### Profile Tab Styling
Profile tabs should hint at the Vault type they create:

```tsx
// Identity tab - violet accent
<Tab icon={User} color="#8B5CF6">Identity</Tab>

// Assets tab - orange accent  
<Tab icon={Gem} color="#F97316">Assets</Tab>

// Accounts tab - emerald accent (creates Financial)
<Tab icon={Wallet} color="#10B981">Accounts</Tab>

// Wishes tab - pink accent (creates Instructions)
<Tab icon={ScrollText} color="#EC4899">Wishes</Tab>
```

---

## 8. SUBTYPE SELECTOR STYLING

When user selects a subtype in Profile, show which Vault type it creates:

```
┌─────────────────────────────────────────────────────────┐
│  Add Account                                            │
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ 🏦          │ │ 🐷          │ │ 🛡️          │       │
│  │ Bank Account│ │ Super-      │ │ Insurance   │       │
│  │             │ │ annuation   │ │             │       │
│  │ → Financial │ │ → Financial │ │ → Financial │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                         │
│  ┌─────────────┐                                       │
│  │ @           │                                       │
│  │ Digital/    │                                       │
│  │ Social      │                                       │
│  │ → Credentials│  ← Different type!                   │
│  └─────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 9. IMPLEMENTATION CHECKLIST

### Profile Page Updates
- [ ] Rename tab labels if needed for clarity
- [ ] Add Vault type indicator to each subtype card
- [ ] Update Profile Summary to use Vault type groupings
- [ ] Ensure "Digital/Social" creates Credentials, not Financial
- [ ] Add "From Profile" badge to records created here

### Vault Page Updates
- [ ] Add "From Profile" badge for applicable records
- [ ] Ensure filter counts match Profile Summary
- [ ] Keep existing type colors consistent

### Data Model Updates
- [ ] Add `source: "profile" | "vault"` field to records
- [ ] Add `subtype` field for Profile-specific categorization
- [ ] Ensure `type` always uses the 6 master types

---

## 10. EXAMPLE: BANK ACCOUNT FLOW

**User Journey:**

1. User goes to Profile → Accounts tab
2. Selects "Bank Account" subtype
3. Fills in: Account Name, Account Number, Institution, Additional Details
4. Optionally adds credentials (login info)
5. Clicks "Add Account"

**What gets created:**

```typescript
{
  id: "rec_123",
  title: "ANZ Savings Account",
  type: "Financial",           // Master type
  subtype: "Bank Account",     // Profile subtype
  source: "profile",           // Where it was created
  category: "personal",        // Personal vs Business
  description: "Main savings account",
  institution: "ANZ",
  encrypted: true,
  beneficiaries: ["All Beneficiaries"],
  // ... other fields
}
```

**How it displays in Vault:**

```
┌─────────────────────────────────────────────────────────────┐
│ [🏦] │ ANZ Savings Account  [Financial] [From Profile]      │
│      │ All Beneficiaries · 2 hours ago         [View] [Edit]│
└─────────────────────────────────────────────────────────────┘
```

---

*This specification ensures Profile and Vault speak the same language.*
