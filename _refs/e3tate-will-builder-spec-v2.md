# E3tate Will Builder — Complete Specification v2

**Reference:** Lovable implementation (superior)  
**Goal:** Match and exceed Lovable's Will + Vault integration

---

## EXECUTIVE SUMMARY

Lovable does these things RIGHT that E3tate must implement:

1. ✅ **Will Builder generates real legal document text** (not just stores form data)
2. ✅ **Will automatically saves to Vault** as a Document record
3. ✅ **"Create Will" option in Vault's Add dropdown**
4. ✅ **Document Sections checklist** shows what's complete
5. ✅ **"Edit in Will Builder"** returns to wizard with data pre-filled
6. ✅ **"Download PDF"** generates downloadable document
7. ✅ **"Preview Will"** shows formatted legal text in modal
8. ✅ **7 logical steps** (separates Digital Assets from Physical Assets)
9. ✅ **"Reviewing Attorney" field** for professional review tracking
10. ✅ **Progress persistence** ("Save & Exit" to resume later)

---

## 1. WILL BUILDER WIZARD (7 Steps)

### Step Flow:

```
┌─────────────────────────────────────────────────────────────────┐
│  Will Builder                                    [Save & Exit]  │
│  Create your Last Will & Testament                              │
├─────────────────────────────────────────────────────────────────┤
│  Step 1 of 7                                      14% Complete  │
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ① ─── ② ─── ③ ─── ④ ─── ⑤ ─── ⑥ ─── ⑦                       │
│  Personal Exec  Benef Digital Physical Final  Review           │
│  Info           iciaries Assets Assets Wishes                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 1: Personal Information
```
┌─────────────────────────────────────────────────────────────────┐
│  Personal Information                                           │
│  Enter your legal information as the testator of this will.     │
│                                                                 │
│  Full Legal Name *                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ John Michael Doe                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Date of Birth *              Social Security Number (Optional) │
│  ┌───────────────────┐       ┌───────────────────────────────┐ │
│  │ dd/mm/yyyy    📅  │       │ XXX-XX-XXXX                   │ │
│  └───────────────────┘       └───────────────────────────────┘ │
│                                                                 │
│  Street Address *                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1234 Oak Avenue                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  City *                       State *                           │
│  ┌───────────────────┐       ┌───────────────────────────────┐ │
│  │ San Francisco     │       │ California              ▼     │ │
│  └───────────────────┘       └───────────────────────────────┘ │
│                                                                 │
│  ZIP Code *                                                     │
│  ┌───────────────────┐                                         │
│  │ 94102             │                                         │
│  └───────────────────┘                                         │
│                                                                 │
│  Country                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ United States                                        ▼   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│              [← Previous]                    [Next →]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 2: Executors
```
┌─────────────────────────────────────────────────────────────────┐
│  Executor Appointment                                           │
│  Appoint people to manage your estate after your passing.       │
│                                                                 │
│  PRIMARY EXECUTOR *                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  👤 Sarah Jane Johnson                                   │   │
│  │  Relationship: Spouse                                    │   │
│  │  Email: sarah.johnson@email.com                         │   │
│  │  Phone: +1 (555) 123-4567                               │   │
│  │                                           [Edit] [Remove]│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ALTERNATE EXECUTOR (Recommended)                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  👤 Michael Robert Doe                                   │   │
│  │  Relationship: Sibling                                   │   │
│  │  Email: michael.doe@email.com                           │   │
│  │                                           [Edit] [Remove]│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [+ Add Another Executor]                                      │
│                                                                 │
│  💡 Tip: Choose someone you trust who is organized and         │
│     capable of handling financial and legal matters.           │
│                                                                 │
│              [← Previous]                    [Next →]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Beneficiaries
```
┌─────────────────────────────────────────────────────────────────┐
│  Beneficiaries & Distribution                                   │
│  Specify who will inherit your estate.                          │
│                                                                 │
│  RESIDUARY ESTATE (What's left after specific gifts)           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  👤 Sarah J. (Spouse)                            60%    │   │
│  │     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░░░░░░░   │   │
│  │                                           [Edit] [Remove]│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  👤 Michael J. (Child)                           40%    │   │
│  │     ━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░░░░░░░░░░░░░   │   │
│  │                                           [Edit] [Remove]│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Total: 100% ✓                                                 │
│                                                                 │
│  [+ Add Beneficiary]                                           │
│                                                                 │
│  ⚠️ If percentages don't add to 100%, the remainder will be    │
│     distributed according to intestacy laws.                   │
│                                                                 │
│              [← Previous]                    [Next →]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 4: Digital Assets
```
┌─────────────────────────────────────────────────────────────────┐
│  Digital Assets                                                 │
│  Assign digital assets to beneficiaries with access instructions│
│                                                                 │
│  YOUR DIGITAL ASSETS FROM VAULT                                │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  💰 Ethereum Main Wallet                                 │   │
│  │  Cryptocurrency • Added Oct 15, 2024                    │   │
│  │                                                          │   │
│  │  Assign to: [Michael J. ▼]                              │   │
│  │                                                          │   │
│  │  Access Instructions:                                    │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │ Hardware wallet stored in home safe. Seed phrase  │  │   │
│  │  │ in safety deposit box at First National Bank.     │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  │                                           [✓ Assigned]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  💰 Bitcoin Cold Storage                                 │   │
│  │  Cryptocurrency • Added Sep 20, 2024                    │   │
│  │                                                          │   │
│  │  Assign to: [Split Equally ▼]                           │   │
│  │                                                          │   │
│  │  Access Instructions:                                    │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │ Trezor device location documented in executor     │  │   │
│  │  │ instructions.                                      │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  │                                           [✓ Assigned]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │
│  │  + Add Digital Asset Not in Vault                       │   │
│  │  (Crypto, online accounts, digital files, etc.)        │   │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   │
│                                                                 │
│              [← Previous]                    [Next →]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 5: Physical Assets
```
┌─────────────────────────────────────────────────────────────────┐
│  Physical Assets                                                │
│  Assign physical property and valuables to beneficiaries.       │
│                                                                 │
│  YOUR PHYSICAL ASSETS FROM VAULT                               │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🏠 Primary Residence                                    │   │
│  │  123 Main St, San Francisco, CA • Est. $2,400,000       │   │
│  │                                                          │   │
│  │  Assign to: [Sarah J. ▼]                                │   │
│  │                                                          │   │
│  │  Notes:                                                  │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │ Property deed and mortgage documents in vault.    │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  │                                           [✓ Assigned]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🚗 2022 Tesla Model S                                   │   │
│  │  Vehicle • Est. $65,000                                 │   │
│  │                                                          │   │
│  │  Assign to: [Michael J. ▼]                              │   │
│  │                                                          │   │
│  │  Notes:                                                  │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │ Title in glove compartment. Loan paid off.        │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  │                                           [✓ Assigned]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │
│  │  + Add Physical Asset Not in Vault                      │   │
│  │  (Property, vehicles, jewelry, collectibles, etc.)     │   │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   │
│                                                                 │
│              [← Previous]                    [Next →]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 6: Final Wishes
```
┌─────────────────────────────────────────────────────────────────┐
│  Final Wishes                                                   │
│  Document your preferences for end-of-life arrangements.        │
│                                                                 │
│  BURIAL / CREMATION PREFERENCE                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ○ Burial                                                │   │
│  │  ● Cremation                                             │   │
│  │  ○ Donation to medical science                          │   │
│  │  ○ Other (specify below)                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  MEMORIAL SERVICE INSTRUCTIONS                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Memorial service to be held at the family's discretion. │   │
│  │ Prefer small gathering with close family and friends.   │   │
│  │ No formal religious service required.                   │   │
│  │                                                          │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  SPECIAL INSTRUCTIONS FOR EXECUTOR                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Please ensure all digital accounts are properly closed  │   │
│  │ or memorialized. Contact list for important accounts    │   │
│  │ is stored in the E3tate vault under "Digital Legacy     │   │
│  │ Instructions".                                           │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│              [← Previous]                    [Next →]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step 7: Review & Generate
```
┌─────────────────────────────────────────────────────────────────┐
│  Review Your Will                                               │
│  Verify all information before generating your document.        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  DOCUMENT SECTIONS                           Status      │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  ✅ Personal Information                     Complete   │   │
│  │  ✅ Executor Appointment                     Complete   │   │
│  │  ✅ Beneficiaries                            Complete   │   │
│  │  ✅ Digital Assets                           Complete   │   │
│  │  ✅ Physical Assets                          Complete   │   │
│  │  ✅ Final Wishes                             Complete   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  WILL PREVIEW                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           LAST WILL AND TESTAMENT                       │   │
│  │              of John Michael Doe                        │   │
│  │                                                          │   │
│  │  I, John Michael Doe, of San Francisco, California,    │   │
│  │  being of sound mind and memory, do hereby declare     │   │
│  │  this to be my Last Will and Testament, revoking all   │   │
│  │  previous wills and codicils.                          │   │
│  │                                                          │   │
│  │  ARTICLE I: APPOINTMENT OF EXECUTOR                    │   │
│  │  I appoint Sarah Jane Johnson, my Spouse, as the       │   │
│  │  Executor of this Will...                              │   │
│  │                                                          │   │
│  │                              [Show Full Preview]        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ⚠️ LEGAL DISCLAIMER                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  This document is for informational purposes only.      │   │
│  │  Have a qualified attorney review your will before     │   │
│  │  signing. Requirements vary by jurisdiction.           │   │
│  │                                                          │   │
│  │  ☑️ I understand this is a template and I should have  │   │
│  │     it reviewed by a legal professional.               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  REVIEWING ATTORNEY (Optional)                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Harrison & Associates LLP                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│       [← Previous]      [Preview Full Will]  [Generate Will]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. WILL DOCUMENT GENERATION

### Legal Document Template:

```typescript
function generateWillDocument(data: WillData): string {
  return `
LAST WILL AND TESTAMENT
of ${data.personalInfo.fullName}

I, ${data.personalInfo.fullName}, of ${data.personalInfo.city}, ${data.personalInfo.state}, being of sound mind and memory, do hereby declare this to be my Last Will and Testament, revoking all previous wills and codicils.

ARTICLE I: APPOINTMENT OF EXECUTOR
I appoint ${data.executors[0].name}, my ${data.executors[0].relationship}, as the Executor of this Will. If they are unable or unwilling to serve, I appoint ${data.executors[1]?.name || 'a successor to be determined by the court'} as alternate Executor.

ARTICLE II: BENEFICIARIES AND DISTRIBUTION
${data.beneficiaries.map(b => 
  `To ${b.name} (${b.relationship}): ${b.percentage}% of estate assets.`
).join('\n')}

ARTICLE III: DIGITAL ASSETS
${data.digitalAssets.map(asset => 
  `${asset.name} (${asset.type}): To ${asset.assignee}. Access instructions: ${asset.instructions}`
).join('\n')}

ARTICLE IV: PHYSICAL ASSETS
${data.physicalAssets.map(asset => 
  `${asset.name} (valued at approximately $${asset.value?.toLocaleString() || 'undetermined'}): To ${asset.assignee}. ${asset.notes}`
).join('\n')}

ARTICLE V: FINAL WISHES
${data.finalWishes.burialPreference === 'cremation' ? 'I wish to be cremated.' : 
  data.finalWishes.burialPreference === 'burial' ? 'I wish to be buried.' : 
  data.finalWishes.burialPreference}
${data.finalWishes.memorialInstructions}

IN WITNESS WHEREOF, I have signed this Will on this ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}.

_________________________________
${data.personalInfo.fullName}, Testator


WITNESSES:

_________________________________
Witness 1 Signature / Print Name / Date

_________________________________
Witness 2 Signature / Print Name / Date
`;
}
```

### PDF Generation:

```typescript
// Use react-pdf or puppeteer to generate PDF
import { pdf } from '@react-pdf/renderer';
import { WillDocument } from './WillDocument'; // React component

async function generateWillPDF(data: WillData): Promise<Blob> {
  const document = <WillDocument data={data} />;
  const blob = await pdf(document).toBlob();
  return blob;
}
```

---

## 3. VAULT INTEGRATION

### On Will Generation:

```typescript
async function completeWillBuilder(willData: WillData): Promise<void> {
  // 1. Generate PDF
  const pdfBlob = await generateWillPDF(willData);
  const pdfUrl = await uploadToStorage(pdfBlob, 'will.pdf');
  
  // 2. Create or Update Vault Record
  const vaultRecord: VaultRecord = {
    id: existingWillId || generateId(),
    title: 'Last Will & Testament',
    subtitle: 'Created with Will Builder',
    type: 'Documents',
    category: 'Legal',
    tags: ['estate', 'legal', 'will'],
    
    // Will-specific metadata
    metadata: {
      createdWith: 'will-builder',
      status: 'complete', // draft | complete | signed
      reviewingAttorney: willData.reviewingAttorney,
      documentSections: {
        personalInformation: true,
        executorAppointment: true,
        beneficiaries: true,
        digitalAssets: willData.digitalAssets.length > 0,
        physicalAssets: willData.physicalAssets.length > 0,
        finalWishes: true,
      },
    },
    
    // Linked assets
    linkedAssets: [
      ...willData.digitalAssets.map(a => a.vaultRecordId).filter(Boolean),
      ...willData.physicalAssets.map(a => a.vaultRecordId).filter(Boolean),
    ],
    
    // File
    files: [{
      name: 'Last_Will_and_Testament.pdf',
      url: pdfUrl,
      type: 'application/pdf',
      generatedAt: new Date().toISOString(),
    }],
    
    // Standard fields
    createdAt: existingWill?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    beneficiaryAccess: 'All Beneficiaries',
    encrypted: true,
  };
  
  await saveVaultRecord(vaultRecord);
  
  // 3. Update Will state
  await updateWillState({
    hasWill: true,
    willType: 'builder',
    vaultRecordId: vaultRecord.id,
    status: 'complete',
  });
}
```

### Vault "Add Item" Dropdown:

```tsx
// components/vault/AddItemDropdown.tsx

const addItemOptions = [
  { 
    id: 'create-will',
    icon: FileEdit,
    label: 'Create Will',
    description: 'Use the Will Builder wizard',
    action: () => router.push('/will/builder'),
  },
  { 
    id: 'upload-document',
    icon: Upload,
    label: 'Upload Document',
    description: 'PDF, Word, or image files',
    action: () => openUploadModal('document'),
  },
  { 
    id: 'add-wallet',
    icon: Wallet,
    label: 'Add Wallet',
    description: 'Crypto wallet or hardware wallet',
    action: () => openUploadModal('wallet'),
  },
  { 
    id: 'add-credential',
    icon: Key,
    label: 'Add Credential',
    description: 'Login, password, or access key',
    action: () => openUploadModal('credential'),
  },
  { 
    id: 'add-account',
    icon: Globe,
    label: 'Add Account',
    description: 'Online service or social media',
    action: () => openUploadModal('account'),
  },
];
```

---

## 4. WILL VAULT RECORD DETAIL

### Modal Design:

```
┌─────────────────────────────────────────────────────────────────┐
│  📄 Last Will & Testament                                  ✕   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                          │
│  │  Legal  │ │  estate │ │  legal  │                          │
│  └─────────┘ └─────────┘ └─────────┘                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Details   │ │Beneficiaries│ │   History   │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ✏️  Last Will & Testament                              │   │
│  │     Created with Will Builder            ✅ Complete    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Created                    Last Modified                      │
│  Jan 15, 2023               Dec 15, 2024                       │
│                                                                 │
│  Reviewing Attorney                                            │
│  Harrison & Associates LLP                                     │
│                                                                 │
│  Description                                                   │
│  Primary last will and testament document                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ⚠️ Notes                                                │   │
│  │  Includes provisions for digital assets and             │   │
│  │  cryptocurrency holdings. Review annually.              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Document Sections                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ✅ Personal Information      ✅ Executor Appointment   │   │
│  │  ✅ Beneficiaries             ✅ Digital Assets         │   │
│  │  ✅ Physical Assets           ✅ Final Wishes           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐     │
│  │ 👁 Preview Will │ │✏️ Edit in Will │ │⬇️ Download PDF │     │
│  │                │ │   Builder      │ │                │     │
│  └────────────────┘ └────────────────┘ └────────────────┘     │
│                                                                 │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐     │
│  │✏️ Edit Document│ │📤 Replace File │ │🗑️ Delete       │     │
│  └────────────────┘ └────────────────┘ └────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Actions Explained:

| Action | Behavior |
|--------|----------|
| **Preview Will** | Opens modal showing formatted legal text |
| **Edit in Will Builder** | Returns to wizard with all data pre-filled |
| **Download PDF** | Downloads generated PDF file |
| **Edit Document** | Edit metadata (description, notes, tags) |
| **Replace File** | Upload signed/notarized version |
| **Delete** | Removes will from vault (with confirmation) |

---

## 5. WILL PREVIEW MODAL

```
┌─────────────────────────────────────────────────────────────────┐
│  Will Preview                                              ✕   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│              LAST WILL AND TESTAMENT                           │
│                 of John Michael Doe                            │
│                                                                 │
│  I, John Michael Doe, of San Francisco, California, being     │
│  of sound mind and memory, do hereby declare this to be my    │
│  Last Will and Testament, revoking all previous wills and     │
│  codicils.                                                     │
│                                                                 │
│  ARTICLE I: APPOINTMENT OF EXECUTOR                           │
│  I appoint Sarah Jane Johnson, my Spouse, as the Executor    │
│  of this Will. If they are unable or unwilling to serve, I    │
│  appoint Michael Robert Doe as alternate Executor.            │
│                                                                 │
│  ARTICLE II: BENEFICIARIES AND DISTRIBUTION                   │
│  To Sarah J. (Spouse): 60% of estate assets.                  │
│  To Michael J. (Child): 40% of estate assets.                 │
│                                                                 │
│  ARTICLE III: DIGITAL ASSETS                                  │
│  Ethereum Main Wallet (Cryptocurrency): To Michael J.         │
│  Access instructions: Hardware wallet stored in home safe.    │
│  Seed phrase in safety deposit box.                           │
│                                                                 │
│  Bitcoin Cold Storage (Cryptocurrency): To be split equally   │
│  between beneficiaries. Access instructions: Trezor device    │
│  location documented in executor instructions.                │
│                                                                 │
│  ARTICLE IV: PHYSICAL ASSETS                                  │
│  Primary Residence (valued at approximately $2,400,000):      │
│  To Sarah J. Property deed and mortgage documents in vault.   │
│                                                                 │
│  ARTICLE V: FINAL WISHES                                      │
│  I wish to be cremated. Memorial service to be held at the    │
│  family's discretion.                                          │
│                                                                 │
│  IN WITNESS WHEREOF, I have signed this Will on this 15th     │
│  day of December, 2024.                                        │
│                                                                 │
│                                                                 │
│  _________________________________                             │
│  John Michael Doe, Testator                                   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│               [Close]               [Download PDF]             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. DATA MODEL

```typescript
// types/will.ts

interface WillData {
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
    vaultRecordId?: string; // Link to vault
    name: string;
    type: string;
    assignee: string; // beneficiary name or "Split Equally"
    instructions: string;
  }>;
  
  physicalAssets: Array<{
    id: string;
    vaultRecordId?: string; // Link to vault
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
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  vaultRecordId?: string; // Link to generated vault record
}

interface WillVaultMetadata {
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
```

---

## 7. API ENDPOINTS

```typescript
// Will Builder API

// Save draft (auto-save)
POST /api/will/draft
Body: { step: number, data: Partial<WillData> }
Response: { success: boolean, willId: string }

// Load existing will data
GET /api/will/:id
Response: WillData

// Complete will & generate PDF
POST /api/will/:id/complete
Body: { acknowledgedDisclaimer: boolean, reviewingAttorney?: string }
Response: { 
  success: boolean, 
  vaultRecordId: string, 
  pdfUrl: string,
  previewText: string 
}

// Get will preview text
GET /api/will/:id/preview
Response: { previewText: string }

// Download PDF
GET /api/will/:id/pdf
Response: PDF file stream

// Edit will (returns to builder)
GET /api/will/:id/edit
Response: Redirect to /will/builder?id={id}

// Delete will
DELETE /api/will/:id
Response: { success: boolean }
```

---

## 8. IMPLEMENTATION CHECKLIST

### Phase 1: Will Builder Wizard
- [ ] Create 7-step wizard component
- [ ] Build each step form with validation
- [ ] Implement auto-save on step change
- [ ] Add "Save & Exit" functionality
- [ ] Create progress indicator component

### Phase 2: Asset Integration
- [ ] Fetch digital assets from Vault for Step 4
- [ ] Fetch physical assets from Vault for Step 5
- [ ] Build asset assignment UI (dropdown + instructions)
- [ ] Allow adding assets not in Vault
- [ ] Link assigned assets to Vault records

### Phase 3: Document Generation
- [ ] Create legal document text template
- [ ] Build PDF generation service (react-pdf or puppeteer)
- [ ] Generate preview text for modal
- [ ] Store generated PDF in encrypted storage

### Phase 4: Vault Integration
- [ ] Create/update Vault record on completion
- [ ] Add "Create Will" to Vault Add dropdown
- [ ] Build Will-specific detail modal
- [ ] Implement "Edit in Will Builder" action
- [ ] Implement "Preview Will" modal
- [ ] Implement "Download PDF" action

### Phase 5: Polish
- [ ] Add Document Sections checklist to detail modal
- [ ] Add Reviewing Attorney field
- [ ] Add status badges (Draft/Complete/Signed)
- [ ] Handle "Replace File" for signed versions
- [ ] Add version history

---

## 9. TESTING CHECKLIST

After implementation, verify:

- [ ] Can complete all 7 wizard steps
- [ ] "Save & Exit" saves progress and can resume
- [ ] Vault assets appear in Steps 4 and 5
- [ ] Can assign assets to beneficiaries
- [ ] Can add assets not in Vault
- [ ] Preview shows correct legal text
- [ ] PDF downloads correctly
- [ ] Will appears in Vault under Documents
- [ ] "Edit in Will Builder" returns to wizard with data
- [ ] Document Sections shows correct completion status
- [ ] Reviewing Attorney is saved
- [ ] Legal disclaimer must be acknowledged
- [ ] Linked assets show in Vault record
