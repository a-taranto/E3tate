# E3tate Will-Centric Architecture

**Purpose:** Make the Last Will and Testament the central document of the platform  
**Vision:** Progress toward a self-executing smart will

---

## 1. THE PROBLEM

Currently:
- Will is just another document in the Vault
- No connection between Will clauses and digital assets
- Beneficiaries in the app may not match beneficiaries in the Will
- No validation or cross-referencing
- User has to manually ensure consistency

---

## 2. THE VISION

The Will should be:
1. **Central** — The anchor document everything else references
2. **Parsed** — Key information extracted and structured
3. **Linked** — Assets, beneficiaries, and wishes connected to Will clauses
4. **Validated** — Platform warns if digital estate doesn't match Will
5. **Executable** — Eventually, a smart contract that self-executes

---

## 3. PROPOSED UX STRUCTURE

### 3.1 New Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Welcome back                                                   │
│  Your digital estate at a glance                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📜 LAST WILL AND TESTAMENT                              │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│  │                                                          │   │
│  │  Status: ✓ Uploaded    Last Updated: 2026-01-10         │   │
│  │  Physical Location: Safe deposit box, First National    │   │
│  │                                                          │   │
│  │  [View Document]  [Update Will]  [Parse & Link]         │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Estate Coverage                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ Executors   │ │ Beneficiaries│ │ Assets      │              │
│  │ 2 assigned  │ │ 3 designated │ │ 14 recorded │              │
│  │ ✓ In Will   │ │ ⚠ 1 missing │ │ ✓ All linked│              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                                 │
│  [View Full Estate Map]                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 New "Will" Page (Top-Level Navigation)

Add a dedicated Will page that becomes the control center:

**Navigation:**
```
Dashboard
Will          ← NEW (prominent position)
Profile
Vault
Beneficiaries
Triggers
```

**Will Page Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Last Will and Testament                    [Upload New Version]│
│  The foundation of your digital estate                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Document Status                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📄 Will_Test.docx                                       │   │
│  │  Uploaded: 2026-01-10 │ Size: 12.9 KB │ Encrypted ✓     │   │
│  │                                                          │   │
│  │  Physical Location:                                      │   │
│  │  Safe deposit box at First National Bank, Box #123       │   │
│  │                                                          │   │
│  │  [Download]  [View Details]  [Update Location]          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Extracted Information (AI-Assisted)                            │
│                                                                 │
│  Executors Named in Will                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Sarah Johnson (Primary)          ✓ Added to Platform  │   │
│  │ • Michael Kim (Secondary)          ✓ Added to Platform  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Beneficiaries Named in Will                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Sarah Johnson — 50% of estate    ✓ Added to Platform  │   │
│  │ • Emma Lewis — 30% of estate       ✓ Added to Platform  │   │
│  │ • Red Cross — 20% of estate        ⚠ Not in Platform    │   │
│  │                                    [+ Add Beneficiary]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Specific Bequests                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • "House at 123 Main St to Sarah"  → Home 1 [Linked ✓]  │   │
│  │ • "Bitcoin holdings to Emma"       → Crypto [Linked ✓]  │   │
│  │ • "Art collection to Museum"       → ⚠ Not in Vault     │   │
│  │                                    [+ Add to Vault]     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Estate Consistency Check                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ⚠ 2 items need attention                               │   │
│  │                                                          │   │
│  │  • "Red Cross" named in Will but not added as           │   │
│  │    beneficiary in platform                               │   │
│  │                                                          │   │
│  │  • "Art collection" mentioned in Will but no            │   │
│  │    corresponding asset in Vault                          │   │
│  │                                                          │   │
│  │  [Resolve All]                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. WILL PARSING (AI-ASSISTED)

### 4.1 What to Extract

When user uploads a Will, use AI to extract:

| Field | Example |
|-------|---------|
| **Executors** | Names, roles (primary/secondary) |
| **Beneficiaries** | Names, percentages, specific bequests |
| **Specific Bequests** | "House to Sarah", "Car to Michael" |
| **Residuary Clause** | Who gets everything else |
| **Trusts** | Any trust provisions |
| **Guardians** | For minor children |
| **Special Instructions** | Funeral wishes, pet care |

### 4.2 Parsing Flow

```
1. User uploads Will.docx
   ↓
2. Convert to text (mammoth.js or similar)
   ↓
3. Send to AI for extraction (Claude API)
   ↓
4. Present extracted info for user confirmation
   ↓
5. User confirms/edits extracted data
   ↓
6. Create links to existing Vault records
   ↓
7. Flag any gaps (beneficiaries or assets not in platform)
```

### 4.3 Prompt for AI Extraction

```
Extract the following from this Last Will and Testament:

1. Executor(s): Name and role (primary/alternate)
2. Beneficiaries: Name, relationship, percentage or specific bequest
3. Specific Bequests: Item/asset and recipient
4. Residuary Clause: Who receives the remainder
5. Trusts: Any trust provisions
6. Guardians: For minor children
7. Special Instructions: Funeral, charitable donations, etc.

Return as structured JSON.
```

---

## 5. LINKING ASSETS TO WILL CLAUSES

### 5.1 Data Model Addition

```typescript
interface WillClause {
  id: string;
  type: "bequest" | "residuary" | "trust" | "instruction";
  text: string;              // Original text from Will
  beneficiaryId?: string;    // Linked beneficiary
  recordIds?: string[];      // Linked Vault records
  percentage?: number;       // For residuary splits
  status: "linked" | "unlinked" | "partial";
}

interface Will {
  id: string;
  documentId: string;        // Reference to Vault record
  physicalLocation?: string;
  uploadedAt: string;
  parsedAt?: string;
  executors: WillClause[];
  beneficiaries: WillClause[];
  bequests: WillClause[];
  residuary?: WillClause;
  trusts: WillClause[];
  instructions: WillClause[];
  consistencyScore: number;  // 0-100%
}
```

### 5.2 UI for Linking

When viewing a Vault record, show which Will clause it's linked to:

```
┌─────────────────────────────────────────────────────────────────┐
│  Home 1                                     [Assets] [Encrypted]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📜 Will Reference                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  "I bequeath my primary residence at 123 Main Street    │   │
│  │   to my daughter Sarah Johnson."                         │   │
│  │                                                          │   │
│  │  Beneficiary: Sarah Johnson ✓                           │   │
│  │  [View in Will] [Unlink]                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ... rest of record details ...                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. SMART WILL EXECUTION (FUTURE VISION)

### 6.1 Stages of Automation

| Stage | Description | Status |
|-------|-------------|--------|
| **Stage 1** | Digital document storage | ✓ Current |
| **Stage 2** | AI-assisted parsing & linking | Next |
| **Stage 3** | Consistency validation | Next |
| **Stage 4** | Automated notifications to executors | Future |
| **Stage 5** | Smart contract for specific bequests | Future |
| **Stage 6** | Full self-executing Will | Vision |

### 6.2 What "Self-Executing" Means

For **digital assets only**, upon verified death trigger:

1. **Crypto transfers** — Multisig releases funds to designated wallets
2. **Account access** — Credentials disclosed to designated beneficiaries
3. **Digital files** — Access granted per Will instructions
4. **Notifications** — Automated messages sent to beneficiaries

**Physical assets** still require traditional probate — E3tate provides:
- Evidence bundle for executor
- Clear documentation of wishes
- Audit trail for legal proceedings

### 6.3 Smart Contract Integration (Conceptual)

```
┌─────────────────────────────────────────────────────────────────┐
│  Will Smart Contract                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Status: Armed                                                  │
│  Trigger: Death verified by executor + cooling-off period       │
│                                                                 │
│  Automated Actions:                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Release 2.5 BTC to Sarah's wallet                    │   │
│  │    Wallet: bc1q...xyz                                    │   │
│  │    Status: ⏳ Pending trigger                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2. Disclose bank credentials to Michael                 │   │
│  │    Records: Primary Bank Account, Savings Account        │   │
│  │    Status: ⏳ Pending trigger                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 3. Send memorial message to family                      │   │
│  │    Recipients: All beneficiaries                         │   │
│  │    Status: ⏳ Pending trigger                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [View Full Execution Plan]  [Edit Actions]  [Disarm]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. SAMPLE WILL TEMPLATE

### 7.1 The Problem

Many users don't have a will at all:
- ~60% of adults don't have a will
- Legal fees are a barrier ($500-$2000+)
- People don't know where to start
- Procrastination due to complexity

### 7.2 The Solution: Keepr-E3tate Sample Will

Provide a **free, editable template** that users can customize:

```
┌─────────────────────────────────────────────────────────────────┐
│  Last Will and Testament                                        │
│  The foundation of your digital estate                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  You don't have a Will uploaded yet.                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📄 Upload Your Existing Will                            │   │
│  │  If you already have a will, upload it here              │   │
│  │  [Upload Document]                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ── OR ──                                                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📝 Create a Will Using Our Template                     │   │
│  │  Start with the Keepr-E3tate sample will and customize  │   │
│  │  it to your needs. Free to use.                          │   │
│  │                                                          │   │
│  │  ✓ Legally-structured template                          │   │
│  │  ✓ Plain English explanations                           │   │
│  │  ✓ Guided form to fill in your details                  │   │
│  │  ✓ Auto-links to your Vault records                     │   │
│  │  ✓ Export as PDF for signing                            │   │
│  │                                                          │   │
│  │  [Start With Template]                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ⚠️ Important: This template is for informational purposes.    │
│  We recommend having a lawyer review your will before signing. │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Template Builder Flow

**Step 1: Personal Information**
```
┌─────────────────────────────────────────────────────────────────┐
│  Step 1 of 6: About You                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Full Legal Name                                                │
│  [John Michael Smith_______________________________]            │
│                                                                 │
│  Address                                                        │
│  [123 Main Street, Sydney NSW 2000_________________]            │
│                                                                 │
│  Date of Birth                                                  │
│  [15/03/1985___]                                                │
│                                                                 │
│  Marital Status                                                 │
│  [Married ▼]                                                    │
│                                                                 │
│  Spouse Name (if applicable)                                    │
│  [Sarah Jane Smith_________________________________]            │
│                                                                 │
│                                          [Next: Executors →]   │
└─────────────────────────────────────────────────────────────────┘
```

**Step 2: Executors**
```
┌─────────────────────────────────────────────────────────────────┐
│  Step 2 of 6: Executors                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  An executor carries out the instructions in your will.         │
│                                                                 │
│  💡 You've already added executors in E3tate:                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ☑ Sarah Johnson (sarah.j@example.com)                   │   │
│  │ ☑ Michael Kim (michael.k@example.com)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  [+ Add Another Executor]                                       │
│                                                                 │
│  Primary Executor: [Sarah Johnson ▼]                           │
│  Alternate Executor: [Michael Kim ▼]                           │
│                                                                 │
│                                     [← Back] [Next: Beneficiaries →]
└─────────────────────────────────────────────────────────────────┘
```

**Step 3: Beneficiaries**
```
┌─────────────────────────────────────────────────────────────────┐
│  Step 3 of 6: Beneficiaries                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Who should receive your estate?                                │
│                                                                 │
│  💡 You've already added beneficiaries in E3tate:              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ☑ Sarah Johnson — Spouse                                │   │
│  │ ☑ Emma Lewis — Daughter                                 │   │
│  │ ☐ Michael Kim — (Executor only, not beneficiary)        │   │
│  └─────────────────────────────────────────────────────────┘   │
│  [+ Add Another Beneficiary]                                    │
│                                                                 │
│  Residuary Estate (everything not specifically bequeathed):     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Sarah Johnson          [50%]                            │   │
│  │ Emma Lewis             [50%]                            │   │
│  │                        [100%] ✓                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                     [← Back] [Next: Specific Gifts →]
└─────────────────────────────────────────────────────────────────┘
```

**Step 4: Specific Bequests**
```
┌─────────────────────────────────────────────────────────────────┐
│  Step 4 of 6: Specific Gifts                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Leave specific items to specific people.                       │
│                                                                 │
│  💡 Your Vault contains these assets:                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🏠 Home 1 (123 Main St)                                 │   │
│  │    Leave to: [Sarah Johnson ▼]                          │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 🏠 Home 2 (Investment Property)                         │   │
│  │    Leave to: [Emma Lewis ▼]                             │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ ₿ Bitcoin Wallet                                        │   │
│  │    Leave to: [Emma Lewis ▼]                             │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 🚗 Vehicle (Tesla Model 3)                              │   │
│  │    Leave to: [Sarah Johnson ▼]                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [+ Add Custom Gift] (items not in Vault)                      │
│                                                                 │
│                                     [← Back] [Next: Guardians →]
└─────────────────────────────────────────────────────────────────┘
```

**Step 5: Guardians (if applicable)**
```
┌─────────────────────────────────────────────────────────────────┐
│  Step 5 of 6: Guardians                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Do you have children under 18?                                │
│  [Yes ▼]                                                        │
│                                                                 │
│  Guardian for minor children:                                   │
│  Name: [Michael Kim_______________________________]             │
│  Relationship: [Brother ▼]                                     │
│  Address: [456 Oak Ave, Melbourne VIC 3000________]            │
│                                                                 │
│  Alternate Guardian:                                            │
│  Name: [Jane Smith________________________________]             │
│  Relationship: [Sister ▼]                                      │
│                                                                 │
│                                     [← Back] [Next: Final Wishes →]
└─────────────────────────────────────────────────────────────────┘
```

**Step 6: Final Wishes & Review**
```
┌─────────────────────────────────────────────────────────────────┐
│  Step 6 of 6: Final Wishes & Review                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Funeral Preferences:                                           │
│  [Burial ▼] / [Cremation ▼] / [No Preference ▼]               │
│                                                                 │
│  Special Instructions:                                          │
│  [________________________________________________]            │
│  [________________________________________________]            │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  📋 Will Summary                                                │
│  • Executors: Sarah Johnson (primary), Michael Kim (alternate) │
│  • Beneficiaries: Sarah Johnson (50%), Emma Lewis (50%)        │
│  • Specific Gifts: 4 items assigned                            │
│  • Guardian: Michael Kim                                        │
│                                                                 │
│  [← Back]  [Preview Full Document]  [Generate Will →]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4 Generated Document

After completing the wizard, generate:

1. **PDF for signing** — Formatted legal document
2. **Digital copy in Vault** — Encrypted, linked to all referenced records
3. **Execution-ready data** — Structured data for smart execution

```
┌─────────────────────────────────────────────────────────────────┐
│  ✓ Your Will Has Been Created                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📄 Last_Will_and_Testament_John_Smith.pdf                     │
│                                                                 │
│  Next Steps:                                                    │
│  1. [Download PDF] — Print and review                          │
│  2. Sign in presence of 2 witnesses (not beneficiaries)        │
│  3. Store original in safe location                            │
│  4. Update "Physical Location" field in E3tate                 │
│                                                                 │
│  ⚖️ Legal Review Recommended                                   │
│  While this template follows standard legal structure,          │
│  we recommend having a lawyer review before signing.            │
│  [Find a Lawyer Near Me]                                       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Your digital estate is now linked:                            │
│  ✓ 2 Executors connected                                       │
│  ✓ 2 Beneficiaries connected                                   │
│  ✓ 4 Assets linked to specific bequests                        │
│  ✓ Will stored in encrypted Vault                              │
│                                                                 │
│  [Go to Will Dashboard]                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.5 Template Considerations

**Legal Disclaimers:**
- "This template is for informational purposes only"
- "Not a substitute for legal advice"
- "Laws vary by jurisdiction — consult a local attorney"
- "E3tate is not a law firm"

**Jurisdiction Handling:**
- Start with Australian (NSW) template
- Add jurisdiction selector for future expansion
- Partner with legal services for review referrals

**Template Updates:**
- Allow user to edit will anytime
- Track versions
- Prompt for review when beneficiaries/assets change

### 7.6 Data Model for Template Will

```typescript
interface WillTemplate {
  id: string;
  userId: string;
  status: "draft" | "generated" | "signed";
  jurisdiction: string;
  
  // Personal info
  fullName: string;
  address: string;
  dateOfBirth: string;
  maritalStatus: "single" | "married" | "divorced" | "widowed";
  spouseName?: string;
  
  // Executors (linked to Beneficiary records)
  primaryExecutorId: string;
  alternateExecutorId?: string;
  
  // Beneficiaries with percentages
  residuaryBeneficiaries: {
    beneficiaryId: string;
    percentage: number;
  }[];
  
  // Specific bequests (linked to Vault records)
  specificBequests: {
    recordId: string;        // Vault record
    beneficiaryId: string;   // Who receives it
    description?: string;    // Custom note
  }[];
  
  // Guardians
  hasMinorChildren: boolean;
  guardianName?: string;
  guardianRelationship?: string;
  guardianAddress?: string;
  alternateGuardianName?: string;
  
  // Final wishes
  funeralPreference: "burial" | "cremation" | "no_preference";
  specialInstructions?: string;
  
  // Generated outputs
  generatedPdfUrl?: string;
  generatedAt?: string;
  signedAt?: string;
  physicalLocation?: string;
  
  // Versioning
  version: number;
  previousVersions: string[];  // IDs of previous versions
}
```

---

## 9. IMPLEMENTATION ROADMAP

### Phase 1: Will as Central Document (MVP+)
- [ ] Add "Will" to top-level navigation
- [ ] Create dedicated Will page
- [ ] Show Will prominently on Dashboard
- [ ] Link physical location tracking
- [ ] Fix document preview (show metadata, not broken viewer)
- [ ] Add "Upload existing" vs "Create from template" options

### Phase 2: Sample Will Template
- [ ] Build multi-step will creation wizard (6 steps)
- [ ] Auto-populate executors/beneficiaries from existing data
- [ ] Auto-populate assets from Vault for specific bequests
- [ ] Generate PDF from template
- [ ] Store generated will in encrypted Vault
- [ ] Add jurisdiction selector (start with NSW Australia)
- [ ] Legal disclaimer system

### Phase 3: AI-Assisted Parsing (for uploaded wills)
- [ ] Integrate document text extraction (mammoth.js)
- [ ] Build AI extraction prompt
- [ ] Create UI for reviewing extracted data
- [ ] Allow user to confirm/edit extractions

### Phase 4: Linking & Validation
- [ ] Link beneficiaries to Will clauses
- [ ] Link Vault records to specific bequests
- [ ] Build consistency checker
- [ ] Show warnings for gaps
- [ ] Prompt for will review when estate changes

### Phase 5: Smart Execution
- [ ] Define execution rules per asset
- [ ] Integrate with crypto multisig
- [ ] Build automated notification system
- [ ] Create evidence bundle generator

---

## 10. IMMEDIATE ACTIONS

### For Claude Code:

```markdown
## Make Will Central to UX

### 1. Add Will to navigation
Add "Will" as second item in sidebar (after Dashboard, before Profile)
Icon: ScrollText or FileText
Label: "Will"

### 2. Create Will page at /will
- Show uploaded Will document with metadata
- Physical location field
- Download button (not inline preview for .docx)
- Placeholder sections for future: Executors, Beneficiaries, Bequests

### 3. Update Dashboard
- Add prominent Will status card at top
- Show "Upload Will" CTA if none uploaded
- Show Will summary if uploaded

### 4. Fix document viewer
- For .docx files, show metadata + download button
- Don't attempt inline rendering of binary formats
- Show thumbnail/icon instead of corrupted content
```

---

*The Will is the source of truth. Everything else validates against it.*
