# E3tate UX Audit Report

**Date:** January 11, 2026  
**Based on:** Screen recording walkthrough (4:16)  
**Auditor:** Claude  

---

## Executive Summary

The E3tate app has made **significant progress** since earlier iterations. The guided setup wizard, service selection grid, and will creation flow are substantial improvements. However, there are still **critical UX issues** that create confusion, redundancy, and friction.

### Overall Score: 6.5/10

| Area | Score | Status |
|------|-------|--------|
| Onboarding Flow | 7/10 | Good structure, needs polish |
| Information Architecture | 5/10 | Confusing overlap between Setup/Profile/Vault |
| Data Entry Efficiency | 6/10 | Service catalog is great, but duplication exists |
| Visual Consistency | 7/10 | Clean design, some inconsistencies |
| Feature Completeness | 7/10 | Core features present, some gaps |
| User Guidance | 6/10 | Good in places, missing in others |

---

## 1. CRITICAL ISSUES (Must Fix)

### 1.1 ❌ Setup vs Profile Confusion

**Problem:** There are TWO separate entry points for the same data:
- `/setup` — 5-step guided wizard (You → People → Online → Assets → Will)
- `/profile` — Tab-based interface (Identity → Assets → Accounts → Wishes)

**User sees:**
- Setup wizard collects personal info, assets, online accounts
- Profile page ALSO has Identity, Assets, Accounts tabs
- It's unclear which is the "source of truth"
- Data appears duplicated or disconnected

**Evidence from video:**
- Frame 5: Setup wizard "Tell us about yourself"
- Frame 32: Profile page ALSO has "Personal Information" with same fields
- Frame 40: Profile "Accounts" tab with same service selection

**Recommendation:**
```
MERGE Setup and Profile into ONE guided experience.

Option A: Setup IS the Profile
- First-time users see the wizard
- Returning users see Profile with all data pre-filled
- Profile tabs map to wizard steps

Option B: Remove Profile entirely
- Setup wizard is the only way to enter data
- "Profile" becomes "My Estate" showing summary only
- Edit buttons take you back into relevant wizard step
```

**Priority:** 🔴 CRITICAL

---

### 1.2 ❌ Will Not Prominent Enough

**Problem:** The Will is buried as the last step of setup and not visible in main navigation.

**Evidence from video:**
- Frame 30: Will is Step 5 of setup
- Main nav: Dashboard, Will (!), Setup, Profile, Vault, Beneficiaries...
- But "Will" page seems to just be part of setup, not standalone

**Current nav seen in video:**
```
Dashboard
Will (shown but unclear what it does)
Setup
Profile
Vault
Beneficiaries
Triggers
Activity Log
Help
Settings
```

**Recommendation:**
```
Make Will the HERO of the app:

1. Will should be position #2 in nav (after Dashboard)
2. Will page should show:
   - Uploaded/created will document
   - Extracted data (executors, beneficiaries, bequests)
   - Links to all connected Vault records
   - Consistency checker
   
3. Dashboard should feature Will status prominently
```

**Priority:** 🔴 CRITICAL

---

### 1.3 ❌ Document Viewer Bug

**Problem:** .docx files show a generic "Microsoft Office document" message instead of preview.

**Evidence from video:**
- Frame 50: "Last Will and Testament" modal shows:
  - "Will_Test.docx"
  - "This is a Microsoft Office document. Click 'Download Original' above to view..."
  - No actual preview

**Recommendation:**
```
For MVP, this is acceptable BUT improve the UI:

1. Show document icon/thumbnail (not empty space)
2. Show metadata more prominently:
   - File name
   - Type: Word Document
   - Size: 12.9 KB
   - Uploaded: Date
   - Encrypted: Yes ✓
   
3. Primary action: "Download Original"
4. Secondary: "View in Word Online" (future)
```

**Priority:** 🟡 MEDIUM

---

### 1.4 ❌ Profile Summary Doesn't Match Vault Types

**Problem:** Profile Summary sidebar groups items differently than Vault.

**Evidence from video:**
- Frame 35, 40: Profile Summary shows:
  - Financial (1): Bank Savings
  - Assets (2): Home 1, Home 2
  - Documents (1): will

- Frame 45: Vault shows different type filters:
  - Identity, Financial, Credentials, Documents, Instructions, Assets

**The taxonomy mismatch persists** despite earlier work to unify them.

**Recommendation:**
```
Profile Summary MUST use the 6 canonical Vault types:

✗ Current: Financial, Assets, Documents
✓ Should be: Identity, Financial, Credentials, Documents, Instructions, Assets

Every Profile item should show which Vault type it creates.
```

**Priority:** 🟡 MEDIUM

---

## 2. MAJOR ISSUES (Should Fix)

### 2.1 ⚠️ Service Setup Flow is Good but Incomplete

**Positive:** The service selection grid (Frame 10, 15) is excellent:
- Visual logos for services
- Categories: Email, Social Media, Financial, Crypto, Shopping
- Multi-select with "Continue" button

**Positive:** Individual service setup (Frame 17, 20) captures:
- Account details
- Secure credentials (optional)
- "What should happen?" (wishes)
- Legacy contact option

**Issues:**
1. Progress indicator "Setting up service 1 of 8" is small
2. "Skip for now" is easy to miss
3. No way to see all selected services at once during setup
4. No summary at end showing what was configured

**Recommendation:**
```
1. Larger progress: "Facebook (1 of 8 services)"
2. Add service thumbnails in progress bar
3. After all services, show summary:
   - 8 services configured
   - 5 with credentials stored
   - 8 with wishes set
   - "Review All" or "Continue to Assets"
```

**Priority:** 🟡 MEDIUM

---

### 2.2 ⚠️ Assets Step is Too Sparse

**Problem:** Frame 25 shows "Your assets" step with just category icons and no guidance.

**Current UI:**
- Icons: Property, Vehicle, Bank Account, Superannuation, Cryptocurrency
- Empty message: "No complete assets found. Fill in details above..."

**Issues:**
1. No explanation of what goes where
2. Icons aren't self-explanatory
3. No "common assets checklist" to guide users
4. Should pull in assets already added in Profile

**Recommendation:**
```
Add guidance and examples:

Property: "Homes, land, investment properties"
Vehicle: "Cars, motorcycles, boats"
Bank Account: "Checking, savings, term deposits"
Superannuation: "Super funds, pension accounts"
Cryptocurrency: "Bitcoin, Ethereum, exchange accounts"

Show: "💡 You've already added 2 properties in your profile"
```

**Priority:** 🟡 MEDIUM

---

### 2.3 ⚠️ Wishes Tab Still Has Generic Text Fields

**Problem:** Frame 42 shows "Digital Legacy" section with empty state and generic text fields.

**Current UI:**
- "No Digital Accounts or Crypto Assets"
- Buttons: "Go to Accounts" / "Go to Assets"
- Generic text fields: Website/Blog, Digital Photos, Online Subscriptions, Other

**This was identified in earlier session** — the Wishes tab should pull in existing accounts and let users set actions, not require re-entering data.

**Recommendation:**
```
Replace generic text fields with:

1. Pull in records from Accounts and Assets tabs
2. For each record, show action selector:
   - [Delete] [Memorialize] [Transfer] [Keep Active]
3. If Transfer: Show beneficiary dropdown
4. Notes field for specific instructions

Example:
┌─────────────────────────────────────────────────┐
│ Facebook                          [Memorialize ▼]│
│ Legacy Contact: Sarah Johnson                   │
│ Notes: [Post final message first____________]   │
└─────────────────────────────────────────────────┘
```

**Priority:** 🟡 MEDIUM

---

### 2.4 ⚠️ Vault "Add Record" Flow is Clunky

**Problem:** Frame 55 shows multi-step "Add New Record" modal.

**Current flow:**
- Step 1: Basic Info (type selection)
- Step 2: Content (upload files OR enter credentials)
- Step 3: ??? (not shown)
- Step 4: ???

**Issues:**
1. Too many steps for simple record
2. "Upload files OR enter credentials manually" is confusing
3. No service-awareness (unlike the setup wizard)
4. Should auto-suggest type based on content

**Recommendation:**
```
Simplify Vault "Add Record":

Quick Add (single step):
- Title
- Type (auto-suggest based on title)
- Beneficiaries
- Upload file OR enter text
- Save

Advanced (multi-step, only if needed):
- Use for complex records with credentials + files + instructions
```

**Priority:** 🟢 LOW (users mostly add via Profile, not Vault)

---

### 2.5 ⚠️ Beneficiaries Page Works Well

**Positive:** Frame 60 shows clean Beneficiaries page:
- Role types explained (Executor, Beneficiary, Observer)
- Status badges (Accepted, Pending)
- Record access counts
- Disclosure scope shown

**Minor issues:**
1. "Edit Scope" and "View Details" could be combined
2. Pending invites should have "Resend" button
3. Would be nice to see which records each person can access

**Priority:** 🟢 LOW (mostly working)

---

### 2.6 ⚠️ Activity Log is Good

**Positive:** Frame 65 shows detailed Activity Log:
- Profile Saved events with details
- Timestamps
- Expandable entries

**This is well-implemented** for audit purposes.

**Priority:** ✅ OK

---

### 2.7 ⚠️ Triggers Page is Well Done

**Positive:** Frame 80 shows Triggers & Execution page:
- Clear "System Armed" status
- Three trigger types: Inactivity, Manual Executor, Legal Proof
- Each with configuration options
- Status indicators

**Minor issues:**
1. "Critical System Armed" banner could be more visually distinct
2. Should show which beneficiaries will be notified

**Priority:** ✅ OK

---

### 2.8 ⚠️ Help Documentation Exists

**Positive:** Frame 70 shows comprehensive Help & Documentation:
- Table of Contents
- Document Management & Viewing
- Editable vs View-Only documents
- Version Control System

**This is excellent** for user education.

**Priority:** ✅ OK

---

### 2.9 ⚠️ Settings Page is Complete

**Positive:** Frame 75 shows Settings:
- Security Status
- Email & Password
- Multi-Factor Authentication
- Trusted Devices
- Theme preferences

**Includes dev tools** (useful for development, remove for production).

**Priority:** ✅ OK

---

## 3. SIMPLIFIED FLOW DIAGRAM

### Current Flow (Confusing)

```
                    ┌─────────────┐
                    │  Dashboard  │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │  Setup   │    │ Profile  │    │  Vault   │
    │ (Wizard) │    │  (Tabs)  │    │  (List)  │
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │               │               │
         │  OVERLAP!     │  OVERLAP!     │
         │               │               │
    ┌────┴────┐     ┌────┴────┐     ┌────┴────┐
    │You      │     │Identity │     │Records  │
    │People   │     │Assets   │     │(mixed)  │
    │Online   │◄───►│Accounts │◄───►│         │
    │Assets   │     │Wishes   │     │         │
    │Will     │     │         │     │         │
    └─────────┘     └─────────┘     └─────────┘
    
    ⚠️ User doesn't know which to use
    ⚠️ Data might be in multiple places
    ⚠️ Will is buried
```

### Proposed Flow (Clear)

```
                    ┌─────────────┐
                    │  Dashboard  │
                    │  (Will Hero)│
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │   Will   │    │ My Estate│    │Benefic-  │
    │ (Central)│    │ (Guided) │    │iaries    │
    └────┬─────┘    └────┬─────┘    └──────────┘
         │               │
         │               │
         ▼               ▼
    ┌─────────────────────────────────────────┐
    │           UNIFIED SETUP WIZARD          │
    │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐│
    │  │ You │→│People│→│Online│→│Asset│→│Will ││
    │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘│
    └─────────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────┐
                    │  Vault   │
                    │(Auto-pop)│
                    └──────────┘
    
    ✓ One path to enter data
    ✓ Vault is auto-populated
    ✓ Will is central
    ✓ No confusion
```

---

## 4. RECOMMENDED ARCHITECTURE

### 4.1 Navigation Hierarchy

```
PRIMARY NAV:
├── Dashboard (estate overview, will status)
├── Will (central document, linked records)
├── My Estate (guided setup/edit)
│   ├── About You
│   ├── Your People
│   ├── Online Life
│   ├── Assets
│   └── Wishes (linked to records)
├── Vault (auto-populated, read-mostly)
├── Beneficiaries
├── Triggers
└── Settings

SECONDARY:
├── Activity Log
└── Help
```

### 4.2 Data Flow

```
┌────────────────────────────────────────────────────────────┐
│                        MY ESTATE                           │
│                    (Single Entry Point)                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Step 1: About You          → Creates: Identity records    │
│  Step 2: Your People        → Creates: Beneficiary records │
│  Step 3: Online Life        → Creates: Credentials records │
│  Step 4: Assets             → Creates: Assets/Financial    │
│  Step 5: Wishes             → Attaches to existing records │
│                                                            │
│                        ↓ ALL AUTO-CREATES ↓                │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                      VAULT                           │  │
│  │  (Auto-populated from My Estate)                     │  │
│  │  User rarely adds directly here                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│                        ↓ ALL LINKS TO ↓                    │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                       WILL                           │  │
│  │  - Executors linked to People                        │  │
│  │  - Beneficiaries linked to People                    │  │
│  │  - Bequests linked to Vault records                  │  │
│  │  - Wishes attached to records                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 4.3 Remove Redundancy

| Current | Proposed | Action |
|---------|----------|--------|
| `/setup` wizard | `/my-estate` wizard | Rename, keep |
| `/profile` tabs | Remove | Merge into My Estate |
| `/vault` list | `/vault` (read-mostly) | Keep, simplify Add |
| `/will` | `/will` (hero page) | Expand significantly |

---

## 5. QUICK WINS (Implement This Week)

### 5.1 Rename "Setup" to "My Estate"
- Change nav label
- Update page title
- Makes it clear this is the ongoing place to manage data

### 5.2 Hide or Remove "/profile"
- Either redirect to /my-estate
- Or remove from nav entirely
- Prevents confusion

### 5.3 Fix Profile Summary Taxonomy
- Use 6 Vault types consistently
- Show type badge on each item

### 5.4 Improve Document Viewer
- Show proper metadata for .docx
- Larger download button
- Show encryption status

### 5.5 Add Setup Completion Summary
- After service setup, show summary
- After assets, show summary
- Final summary before Will step

---

## 6. MEDIUM-TERM IMPROVEMENTS (Next Sprint)

### 6.1 Will-Centric Dashboard
- Will status card at top
- Link to create/upload if missing
- Show linked records count

### 6.2 Wishes Linked to Records
- Pull in accounts from Online Life step
- Let user set action per account
- No more generic text fields

### 6.3 Service Setup Polish
- Larger progress indicator
- Service thumbnails in progress
- Better empty states

### 6.4 Vault "Quick Add"
- Single-step add for simple records
- Multi-step only for complex items

---

## 7. LONG-TERM VISION (Future Releases)

### 7.1 AI-Powered Will Parsing
- Upload existing will
- Extract executors, beneficiaries, bequests
- Auto-link to Vault records

### 7.2 Consistency Checker
- Compare Will to Vault
- Flag missing assets
- Flag unassigned beneficiaries

### 7.3 Smart Execution
- Crypto transfers via multisig
- Automated notifications
- Evidence bundle generation

---

## 8. SUMMARY OF RECOMMENDATIONS

| Priority | Issue | Action |
|----------|-------|--------|
| 🔴 CRITICAL | Setup vs Profile confusion | Merge into single "My Estate" |
| 🔴 CRITICAL | Will not prominent | Make Will hero of dashboard |
| 🟡 MEDIUM | Document viewer bug | Improve metadata display |
| 🟡 MEDIUM | Profile Summary taxonomy | Use 6 Vault types |
| 🟡 MEDIUM | Service setup incomplete | Add summaries |
| 🟡 MEDIUM | Assets step sparse | Add guidance |
| 🟡 MEDIUM | Wishes still generic | Link to records |
| 🟢 LOW | Vault Add Record | Simplify to quick add |

---

## 9. WHAT'S WORKING WELL ✅

1. **Service catalog** — Visual grid is excellent
2. **Service-specific setup** — Captures credentials + wishes together
3. **Beneficiaries page** — Clean, clear roles
4. **Triggers page** — Well-designed configuration
5. **Activity Log** — Good audit trail
6. **Help documentation** — Comprehensive
7. **Settings** — Complete security options
8. **Visual design** — Clean, professional, Gen-Z friendly

---

*The foundation is solid. The main work is eliminating redundancy and making the Will central.*
