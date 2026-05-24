# Keepr-E3tate — Code Audit & Fix Plan

**Date:** 2026-05-22 · **Updated:** 2026-05-24 (see [Resolution status](#resolution-status--2026-05-24))
**Scope:** Whole app — every route under `app/`, plus `lib/`, `components/`, `types/`, and `app/globals.css`.
**Method:** Static code review against the behavioral findings from a Chrome session at `localhost:3000` (Overview, Will, Vault, Beneficiaries, Settings).
**Deliverable (2026-05-22):** Findings only — no code changes were made in that pass.
**Status (2026-05-24):** Phases 1–4 implemented, verified, and committed on branch `audit-phases-1-4`. 44 → 0 TypeScript errors; `next build` green.

All line numbers below are relative to the file at the time of the original audit; many have since shifted. Paths are relative to the repo root unless absolute.

---

## Resolution status — 2026-05-24

A follow-up pass (two days after this audit) implemented the fix plan in §6. The unified store (`lib/store.ts`) — which existed in code but had never been mounted — is now wired throughout; the 6→4 category migration is live; dead controls are wired or gated; the information architecture is fixed; and uploaded wills mirror into the vault. Net result: **44 → 0 TypeScript errors**, `next build` passes (20 routes), committed on `audit-phases-1-4` (≈ −3,560 net lines, mostly the `profile-old` deletion).

### Root causes

| ID | Status | Notes |
|---|---|---|
| RC-A — no single source of truth | ✅ Resolved | `lib/store.ts` wired into dashboard, vault, beneficiaries, `estate-score`, and the my-estate wizard. The numbers agree. |
| RC-B — half-finished 6→4 migration | ✅ Resolved | `toPrimaryType` + `migrateCategoriesV2`; the live vault renders the 4 categories and tab counts sum. |
| RC-C — pervasive dead CTAs | ✅ Resolved | CTAs wired or gated "Coming soon"; `Card` only applies `cursor-pointer` when an `onClick` is present. |
| RC-D — two parallel profile flows | ✅ Resolved | `profile-old` (3,296 lines) and the orphaned `profile-mapping.ts` deleted. |
| RC-E — schema drift | ◐ Partial | The store normalizes role/status/type. `types/index.ts` still defines the old 6-type `RecordType`, but nothing load-bearing imports it now. |
| RC-F — sidebar reaches 5 of ~11 routes | ✅ Resolved | Sidebar covers all 9 routes with deep-route active-state. |
| RC-G — `activityLogger` barely called | ◐ Mostly | Now logs from Settings, Triggers, Beneficiaries, and Will. (Vault delete still doesn't log.) |

### Findings

- **P0-1 … P0-8** — ✅ all resolved. One store feeds dashboard / vault / beneficiaries / score (they agree); Settings + Triggers controls persist; delete-account works; the `observer` role is first-class.
- **P1-1, P1-2, P1-4 … P1-15** — ✅ resolved (wired or gated). Vault tab counts sum; crypto shows Wallets; will/create reads real beneficiaries; the `profile-old`-specific findings (P1-13/14/15) are moot after deletion.
- **P2-1, P2-4, P2-5, P2-6, P2-9, P2-10** — ✅ resolved (scroll-behavior attribute; derived sidebar status + identity; category copy; `services.ts` uses Credentials; `Card` affordance gate).

### Still open

- **Will draft keys not unified** (P1-16, partial): `uploaded_will` now mirrors into the vault, but `will_template` (will/create) and `will-draft-*` (will/builder) remain separate stores.
- **`types/index.ts` stale** (RC-E / P2-2): still the old 6-type model — harmless now that `profile-old` is gone, but should be aligned to `lib/store.ts`.
- **Cosmetic / minor**: vault empty-state copy not parameterized (P1-3); Triggers execution timeline still uses mock relative dates (P2-8); `will/builder` uses `window.location.search` instead of `useSearchParams` (P2-12); vault delete doesn't `logActivity`.
- **README** (P2-3): there is no `README.md` in the repo to update.

---

## 1. Executive summary

The prototype is functionally further along than it looks — the data layer, will generator, activity logger, and most of the wizard flow already exist in code. What makes the running app feel broken is that none of those pieces talk to each other. Specifically:

1. **Three parallel "data sources" disagree on every screen.** Each page has its own hardcoded mock data; in addition, the codebase has a mid-finished `localStorage` layer with ~15 keys across 3 naming conventions; in addition, the Estate Readiness Score is the *only* thing reading real `localStorage` state, which is why it shows 0% while the same page claims "24 records / 5 beneficiaries."
2. **A category migration from 6 types to 4 was started but never finished.** `types/index.ts`, the README, and the seeded mock records still use the old six (Identity / Financial / Assets / Documents / Instructions / Credentials). The Vault UI shows the new four (Documents / Wallets / Credentials / Accounts). That single mismatch is the root cause of every Vault filter/icon bug Chrome reported.
3. **Most non-primary CTAs are skeletons.** Across Beneficiaries, Settings, Triggers, Will, and the Vault detail panel, dozens of buttons are rendered but have no `onClick`. Cards with `hover` get an automatic `cursor-pointer` so they *look* clickable even when they aren't.
4. **There are two parallel "profile" implementations.** `/profile` now redirects to `/my-estate/about` (the wizard). The old `app/profile-old/page.tsx` (~3,300 lines) still ships and is a feature-richer flow that nothing else in the app reads from.
5. **The Sidebar reaches 5 of the ~11 routes.** Activity, Triggers, Help, and the entire My-Estate setup flow have no nav entry — you can only reach them through dashboard CTAs or deep links.

Fixing the data-source mess and finishing the category migration would, alone, resolve roughly half of Chrome's findings. The dead-button cleanup is mechanical but high volume.

A small but important note on Chrome's report: it was right about every data inconsistency and dead-button claim I could verify, except for **four primary CTAs Chrome said were dead but which are in fact wired**. Those are listed under "Disputed findings" at the end.

---

## 2. Severity definitions

- **P0** — Lies to the user about their data, or quietly drops a real user action.
- **P1** — User-visible broken control or contradiction. Doesn't lose data but makes the prototype look unfinished.
- **P2** — Polish, dev-only warnings, dead code, schema drift that doesn't surface yet.

---

## 3. Root causes (themes)

Every finding below traces back to one of these.

### RC-A. No single source of truth for vault records / beneficiaries / counts

The dashboard tile, the Vault page, the Beneficiaries page, and the Estate Readiness Score each compute their own answer to "how many records do I have." The numbers come from four unrelated places:

- `app/page.tsx` lines 28–32, 181, 186 — hardcoded `totalRecords: 24`, `<p>5</p>`, `"3 executors, 2 observers"`
- `app/vault/page.tsx` lines 448–541 — a hardcoded `mockRecords` array of 8 items, *merged* (line 544) with whatever is in localStorage keys `uploadedDocuments`, `profileAssets`, `profileAccounts`, `vaultCredentials`, `profileIdentities`
- `app/beneficiaries/page.tsx` lines 46–67 — seeds `beneficiariesList` localStorage on first load with 2 executors, `recordsAccess: 18` (a literal that has no relationship to any actual record count anywhere)
- `lib/estate-score.ts` lines 135–186 — reads only the *real* keys (`uploaded_will`, `setup_beneficiaries`, `vault_records`), which are empty for a new user → 0%

There is no shared store, no derived selector, no normalization layer. Each screen lies independently.

### RC-B. Half-finished migration from 6 vault categories to 4

The data model was clearly redesigned at some point. The new system is in `lib/constants.ts` and the Vault UI:

```
Documents | Wallets | Credentials | Accounts   (new — 4 categories, primary)
```

The old system is in `types/index.ts`, the README, and every seeded mock record:

```
Identity | Financial | Assets | Documents | Instructions | Credentials   (old — 6 categories)
```

Evidence of the migration being mid-flight:

- `lib/constants.ts` lines 32–56 — legacy entries with a `migratesTo` field, but no migration code runs
- `app/vault/page.tsx` lines 75–80 — "Legacy types (for backward compatibility with existing data)" with `(Legacy)` label suffix
- `components/vault/VaultCard.tsx` lines 25–34 — `categoryConfig` includes both sets; legacy `assets` maps to a `Home` icon (this is why Chrome reported a house icon on "Cryptocurrency Wallets")
- `lib/services.ts` lines 45, 76, 416, 469 — `createsVaultType` field sometimes returns `"Credentials"` and sometimes `"Financial"`, mixing the two worlds

Semantic shift makes this nontrivial: in the 6-cat world, "Financial" was bank accounts; in the 4-cat world, "Credentials" is bank logins and "Accounts" is email/social. A migration script needs to map old → new with awareness of subtype.

### RC-C. Dead CTAs are pervasive — Cards in particular look clickable even when they aren't

The `Card` primitive auto-attaches `cursor-pointer` when `hover` is true, without enforcing that an `onClick` is present (`components/ui/Card.tsx`). The Button component has no equivalent affordance check. Together these make it cheap to render buttons and cards that mislead the user.

Counted dead controls: 30+, listed in §5.

### RC-D. Two parallel profile implementations

- `app/profile/page.tsx` is a 5-line redirect to `/my-estate/about`
- `app/profile-old/page.tsx` is ~3,300 lines of a feature-richer profile (medical, end-of-life, digital legacy, final messages) that *still ships* but isn't linked from anywhere
- The setup wizard at `/my-estate/*` writes to `setup_*` keys; profile-old writes to `profile*` keys; nothing reconciles them
- `profile-old` writes `pendingBeneficiaries` which the Beneficiaries page consumes (lines 73–78), but the new my-estate/people page neither reads nor writes that key

### RC-E. Schema drift

Three concrete drifts:

| Concept | `types/index.ts` says | Page actually uses |
|---|---|---|
| Beneficiary role | `executor / beneficiary / contact` | `executor / beneficiary / observer` (`app/beneficiaries/page.tsx:25`, dashboard copy says "observers") |
| Beneficiary status | `pending / confirmed` | `accepted / pending / draft` (`app/beneficiaries/page.tsx:26`, profile-old uses `draft`) |
| Asset type | (no enum) | `home / crypto / car / cash` in profile-old; `property / vehicle / bank / super / crypto` in my-estate/assets |

### RC-F. Sidebar covers 5 of ~11 routes

`components/layout/Sidebar.tsx` lines 18–24 lists only Overview, Will, Vault, Beneficiaries, Settings. The Activity, Triggers, Help, and the entire My-Estate setup flow have no nav entry. Users can reach those routes only via dashboard CTAs (which DO navigate — Chrome was wrong about those — but only the Dashboard surfaces them). There's also a Profile icon (`User` lucide icon) imported on line 10 but never used.

### RC-G. activityLogger.ts works but is barely called

`lib/activityLogger.ts` writes to `localStorage["activityLog"]` and fires a custom event. `app/activity/page.tsx` reads it correctly. But `logActivity()` is only called from two pages: `app/will/page.tsx` (3 times) and `app/beneficiaries/page.tsx` (1 time). Triggers arm/disarm, settings changes, vault add/edit, profile saves — none of those log. The Activity Log will look perpetually thin.

---

## 4. localStorage key inventory

For reference when wiring a single store. Current keys, where they're written, where they're read:

| Key | Written by | Read by |
|---|---|---|
| `vault_records` | (nothing — declared but never written) | `lib/estate-score.ts`, `app/my-estate/assets/page.tsx` |
| `uploadedDocuments` | `app/my-estate/will/page.tsx` (?), profile-old | `app/vault/page.tsx` |
| `profileAssets`, `profileAccounts`, `profileIdentities` | `app/profile-old/page.tsx` | `app/vault/page.tsx` |
| `vaultCredentials` | profile-old (`createVaultRecordWithCredentials`) | `app/vault/page.tsx` |
| `beneficiariesList` | `app/beneficiaries/page.tsx` | `app/beneficiaries/page.tsx` |
| `pendingBeneficiaries` | profile-old | `app/beneficiaries/page.tsx` |
| `uploaded_will` | `app/will/page.tsx` | `app/will/page.tsx`, `lib/estate-score.ts` |
| `will_template` | `app/will/create/page.tsx` | `lib/vaultUtils.ts` |
| `will-draft-{id}`, `will-current-draft-id` | `app/will/builder/page.tsx` | itself |
| `setup_personal_info`, `setup_beneficiaries`, `setup_assets`, `setup_selected_services`, `setup_service_data`, `setup_completed_steps`, `setup_complete` | `app/my-estate/*` | `app/my-estate/complete/page.tsx` via `lib/vaultUtils.ts` |
| `profileData`, `profileLastSaved`, `profilePersonalInfo`, `userCountry`, `recordWishes` | profile-old | profile-old |
| `activityLog` | `lib/activityLogger.ts` | `app/activity/page.tsx` |

That's at least **6 distinct concepts of "what is a record"** persisted in **15+ keys** with **4 naming conventions** (`camelCase`, `snake_case`, `kebab-case-with-id`, `bareNouns`). Cleaning this up is a prerequisite to fixing the count inconsistencies.

---

## 5. Findings by severity

### P0 — Lies to the user / drops actions

**P0-1. Dashboard tiles fabricate numbers that contradict every other page.**
`app/page.tsx:28-32, 168, 173, 181, 186`. `totalRecords: 24`, `"Across 6 categories"`, `5` beneficiaries, `"3 executors, 2 observers"`. Vault contains 8 records (4 visible in filter tabs because of RC-B); the Beneficiaries page has 2 (both executors, no "observers" role exists in the seeded data); the Estate Readiness Score reports 0% from real localStorage. Pick a source and use it everywhere.

**P0-2. Estate Readiness Score is the only honest screen, which makes it look broken.**
`components/dashboard/EstateReadinessScore.tsx:16-18` → `lib/estate-score.ts:135-186`. Reads `vault_records` (never written), `setup_beneficiaries` (only populated by the setup wizard, not by manual additions on `/beneficiaries`), `uploaded_will`. On a first-run app it correctly returns 0%, then sits next to a tile claiming 24 records. The fix is either to point everything at the same keys, or to seed those keys with the dashboard's mock numbers.

**P0-3. Beneficiaries page primary CTA does nothing.**
`app/beneficiaries/page.tsx:160` — `<Button variant="primary">Invite Beneficiary</Button>` has no `onClick`. There is no invite flow anywhere, so the page's stated purpose ("Manage executors, beneficiaries, and disclosure scopes") is unreachable.

**P0-4. Settings page "Permanently Delete Account" has no onClick.**
`app/settings/page.tsx:402`. A button labelled like this should either work or be removed. Currently the user can press it expecting consequences and get none.

**P0-5. Settings dropdowns and checkboxes are decorative.**
`app/settings/page.tsx:269, 283` (selects for check-in frequency and inactivity trigger) and `312-325` (notification checkboxes) use `defaultChecked` / `defaultValue` with **no onChange**. The user's selections are never persisted, never read. This is the worst kind of dead control — the UI gives the illusion of saving.

**P0-6. Triggers arm/disarm toggle is `readOnly`.**
`app/triggers/page.tsx:191-199`. Trigger enable checkbox has `readOnly` attribute and no `onChange`. Toggling it does nothing. The "Disarm All Triggers" button at line 106 also has no `onClick`. The Dashboard says "Execution Status: armed" but neither page can change it.

**P0-7. Schema drift on Beneficiary.role drops the "observers" concept silently.**
Dashboard (`app/page.tsx:186`) and Beneficiaries page (`app/beneficiaries/page.tsx:25`) say `observer`; `types/index.ts:23` says `contact`. The Beneficiaries page's "Confirm" flow lets the user pick `observer` (line 237) and then writes it to `beneficiariesList`. If `types/index.ts` ever becomes load-bearing (e.g., a real backend), all observers will fail validation.

**P0-8. "Vault records" key is unused, but estate-score reads it.**
`lib/estate-score.ts:163` reads `vault_records`. Nothing in the codebase writes that key. `vault/page.tsx` reads from `uploadedDocuments`, `profileAssets`, `profileAccounts`, `vaultCredentials`, `profileIdentities`. The score and the vault are looking at different worlds.

### P1 — User-visible broken control or contradiction

**P1-1. Vault filter tabs only show the 4 new categories, so 4 of the 8 mock records have no tab home.**
`app/vault/page.tsx:84-87, 880-891`. Mock records use legacy types `financial / identity / instructions / assets`. Tab list only renders `isPrimary === true` types. Result: `All (8)`, `Documents (3)`, `Wallets (0)`, `Credentials (1)`, `Accounts (0)` — Chrome's "3+0+1+0=4 ≠ 8" report is correct.

**P1-2. "Cryptocurrency Wallets" record uses a Home icon.**
`app/vault/page.tsx:531-540` — record id 8 has `type: "assets"`. `components/vault/VaultCard.tsx:31` maps `assets` → `Home` icon. The record is in legacy land; the Wallets filter tab can never count it because no record has type `wallets`.

**P1-3. Vault empty-state copy is not parameterized.**
`app/vault/page.tsx:910-917`. Always reads "No documents yet" / "Add your first document" regardless of which filter is active. The header button correctly says "+ Add Wallets" etc. (line 791-795).

**P1-4. Beneficiary card actions are all dead.**
`app/beneficiaries/page.tsx:380` (MoreVertical), `404` (Edit Scope), `407` (View Details) — none have `onClick`. The "Send Invite" button at `411` does, but only renders when status is pending, which never happens because the seeded data is all `accepted`.

**P1-5. Vault detail-panel "Add Beneficiary" is decorative.**
`app/vault/page.tsx:1094-1097`. Inside the SlideOverPanel, a `<Button>` labelled "Add Beneficiary" has no onClick. Same for the non-profile, non-uploaded branch: "Edit Record" (1197), "Copy" (1201), "Trash" works.

**P1-6. Will page "Download" button has no onClick.**
`app/will/page.tsx:258-261`. Renders after a will is uploaded; pressing it does nothing.

**P1-7. "Update Will" and "Parse & Link Assets" cards on Will page are dead.**
`app/will/page.tsx:320, 334`. Cards with `hover className="cursor-pointer"` and no `onClick`. "Parse & Link Assets" is also marked "Coming soon" with `opacity-50` — it shouldn't simultaneously advertise the affordance and refuse the click.

**P1-8. Will/create wizard "Add Beneficiary" and "Add Gift from Vault" are dead.**
`app/will/create/page.tsx:343, 374`.

**P1-9. Will/create beneficiary dropdown options are hardcoded.**
`app/will/create/page.tsx:269-286`. "John Smith (Spouse)", "Sarah Johnson (Child)" — not linked to `beneficiariesList` or `setup_beneficiaries`.

**P1-10. Settings buttons across security/devices/backup are dead.**
`app/settings/page.tsx:124, 129, 147, 179, 211, 240, 246`. Change Email, Change Password, Manage MFA, Remove (device), Reconfigure Shards, Download Backup, Restore Backup — none wired. The two working buttons hardcode `window.location.href` instead of using the router.

**P1-11. Triggers config buttons all dead.**
`app/triggers/page.tsx:106, 145, 216, 220`. Disarm All Triggers, Configure, Edit Configuration, Test Trigger.

**P1-12. Sidebar can't reach Activity, Triggers, Help, or the My-Estate flow.**
`components/layout/Sidebar.tsx:18-24`. Nav array is missing those routes. Unused `User` import on line 10 suggests the Profile entry was deliberately removed but no replacement was added. The active-state check on line 68 only specials-cases `/my-estate/about` startsWith `/my-estate`; deep routes like `/will/builder` and `/will/create` don't get the parent "Will" entry highlighted.

**P1-13. Beneficiary "suggested family" flow doesn't reach the new wizard.**
`app/profile-old/page.tsx:284-309` writes `pendingBeneficiaries`. `app/beneficiaries/page.tsx:73-78` reads it. `app/my-estate/people/page.tsx` never checks for it. If you go through the new wizard, family suggestions are silently lost.

**P1-14. profile-old "Add to Vault Instead" button is cosmetic.**
`app/profile-old/page.tsx:2694`. Suggests an action; does nothing.

**P1-15. profile-old emergency contact inputs never persist.**
`app/profile-old/page.tsx:2095-2100`. Name/relationship/phone inputs have no onChange. (profile-old isn't navigated to from anywhere in the new flow, but it still ships.)

**P1-16. Three parallel storage keys for "the will."**
`uploaded_will` (will/page.tsx), `will_template` (will/create/page.tsx), `will-draft-{id}` (will/builder/page.tsx). They don't reconcile. A user who uploads, then opens the builder, sees no draft; vice versa.

**P1-17. Will status enum is inferred locally per page.**
`app/my-estate/complete/page.tsx:29` defines `"created" | "uploaded" | "none"` ad hoc. `app/will/page.tsx` just checks "is uploaded_will set." No single function answers "does the user have a will."

**P1-18. activityLogger is barely used.**
`lib/activityLogger.ts` is well-built but only called from `app/will/page.tsx` (3 sites) and `app/beneficiaries/page.tsx:113`. Triggers, Settings, Vault, profile-old never log.

### P2 — Polish / dev-only / latent

**P2-1. Next.js dev warning: scroll-behavior smooth.**
`app/globals.css:219-222` sets `scroll-behavior: smooth` on `html`. `app/layout.tsx:16` doesn't set `data-scroll-behavior="smooth"`. Next 15.5 warns about this on every page load. Adding the attribute silences it.

**P2-2. `types/index.ts` is out of date.**
Still defines `RecordType` as the 6 old types (line 5–11) and `BeneficiaryRole` as `executor | beneficiary | contact` (line 23). Nothing in the running app imports these types — pages define their own.

**P2-3. README documents the old 6-category world.**
`README.md` lines 22–52 describe Identity / Financial / Assets / Documents / Instructions / Credentials as the canonical types, and lists routes that no longer exist (e.g., the README doesn't mention `/will/*`, `/my-estate/*`, `/help`, `/profile-old`).

**P2-4. Dashboard "Across 6 categories" copy disagrees with the 4-category Vault.**
`app/page.tsx:173`. Trivially fixable; flagging here so it doesn't drift back the other way.

**P2-5. Sidebar "Proof of Life" status is hardcoded.**
`components/layout/Sidebar.tsx:101-115`. "Active" / "Next check-in: 23 days" — should derive from settings.

**P2-6. Sidebar user identity hardcoded.**
Same file, 122-145. "U" avatar, "User Account", "user@example.com".

**P2-7. profile-old digital-legacy transfer targets hardcoded.**
`app/profile-old/page.tsx:2422-2426`. Strings like `"spouse"`, `"child1"`, `"child2"`, `"executor"` used as transfer targets; not joined to the real beneficiary list.

**P2-8. Triggers execution timeline is mock with relative dates.**
`app/triggers/page.tsx:65-87`. Timestamps like "6 hours ago" / "45 days ago" hardcoded.

**P2-9. `services.ts` uses both "Financial" and "Credentials" for `createsVaultType`.**
`lib/services.ts:416, 433, 450` (Financial) vs others (Credentials). Per the new 4-category world, bank logins should be Credentials and email/social should be Accounts. Right now PayPal/Venmo/Stripe become Financial (a legacy type with no tab home in Vault).

**P2-10. `Card` primitive enables dead cards.**
`components/ui/Card.tsx:25`. `hover` prop applies `cursor-pointer` regardless of `onClick`. Consider warning in dev if `hover` is true and `onClick` is unset.

**P2-11. `Header.tsx` style claim (from subagent) — verified false.**
The subagent reported a CSS-variable bug; the file uses Tailwind classes correctly. Flagging here so it doesn't get changed by mistake.

**P2-12. `app/will/builder/page.tsx:15` uses `window.location.search` instead of `useSearchParams()`.**
Not a bug but inconsistent with the rest of the App Router code.

### Disputed findings from Chrome's report

These were called out in the Chrome session as dead but are actually wired. Verify by clicking once more (a Turbopack first-compile pause can look like inertness):

- **Dashboard "Start Setup"** — `app/page.tsx:92` → `router.push("/my-estate/about")`. Wired.
- **Dashboard "Create Will"** — `app/page.tsx:128` → `router.push("/will")`. Wired.
- **Dashboard "Configure Triggers"** — `app/page.tsx:155` → `router.push("/triggers")`. Wired. (But there's no sidebar entry for /triggers, see P1-12.)
- **Will "Start with Template"** — `app/will/page.tsx:183` → `router.push("/will/create")`. Wired.
- **Vault record card click** — `app/vault/page.tsx:901` → `handleViewRecord(record)` opens a `SlideOverPanel`. Wired. (It's possible the panel renders off-screen or behind something; worth a visual re-check.)

If you can reproduce dead behavior on these specific controls after a fresh page load, that's a different class of bug (likely a render race or a z-index/portal issue) and worth a follow-up.

---

## 6. Prioritized fix plan

Ordered by impact-per-effort. Each line is a unit of work; bracketed estimate is a rough person-day count for a developer familiar with this codebase.

### Phase 1 — Stop lying (1–2 days)

> **✅ Done (2026-05-24)** — store wired into all read surfaces; dashboard, vault, beneficiaries, and the readiness score now agree.

1. **Pick one storage shape for "vault records" and write everywhere to it.** I recommend keeping `vault_records` (it's what `estate-score.ts` already reads) and consolidating `uploadedDocuments`, `profileAssets`, `profileAccounts`, `vaultCredentials`, `profileIdentities` into one normalized array. Write a one-time migration in a `useEffect` at app boot that reads the old keys and rewrites them under `vault_records`, then deletes the old keys. **[1 day]**

2. **Pick one storage shape for "beneficiaries."** Merge `beneficiariesList`, `setup_beneficiaries`, `pendingBeneficiaries` into one key. Update `app/my-estate/people` and `app/profile-old` to write to it. **[0.5 day]**

3. **Replace dashboard mock numbers with reads from the unified store.** `app/page.tsx:28-32, 181, 186, 173`. Compute `totalRecords`, beneficiary count, and category count from the live data. The Estate Readiness Score will then agree with the tile next to it. **[0.5 day]**

### Phase 2 — Finish the category migration (1–2 days)

> **✅ Done (2026-05-24)** — the 6→4 collapse is live in the vault and `services.ts` uses Credentials. (`types/index.ts` still carries the old enum — see Resolution → Still open.)

4. **Migrate seeded mock records to the 4 new types.** `app/vault/page.tsx:448-541`. Map `financial → credentials` (where it's a bank login) or `wallets` (where it's a crypto wallet); `identity → accounts` is wrong semantically — Identity records aren't login accounts, so consider whether the new "4 types" actually has room for legal documents. Either rename "Documents" to cover identity papers or add Identity back as a 5th type. **[0.5 day, blocked on a product decision]**

5. **Delete the legacy types from `lib/constants.ts` (lines 32-56) and `app/vault/page.tsx` (75-80, 79).** Once mock data is migrated, the legacy mapping becomes dead code. **[0.25 day]**

6. **Fix `lib/services.ts` `createsVaultType`.** Change PayPal/Venmo/Stripe (lines 416, 433, 450) from `Financial` to `Credentials`. Audit the rest — email/social/cloud should be `Accounts` per the new naming. **[0.5 day]**

7. **Update `types/index.ts` and `README.md` to the new model.** **[0.25 day]**

### Phase 3 — Wire dead controls (2–3 days)

> **✅ Done (2026-05-24)** — every dead CTA is wired or gated as a disabled "Coming soon"; `Card` no longer fakes `cursor-pointer` without an `onClick`.

8. **Decide which CTAs are intentional skeletons vs. shipping bugs.** Tag each with one of: (a) wire it now, (b) gate behind a "Coming soon" badge that disables the click, (c) remove the button. A simple sweep can take 1 day if you keep the implementations minimal (most need a modal or a `router.push`).

9. **Make `Card` refuse to render `cursor-pointer` when `onClick` is unset, or warn in dev.** `components/ui/Card.tsx:25`. Catches this class of bug at the type level. **[0.25 day]**

10. **Wire the Settings form controls or remove them.** Either store every dropdown/checkbox value in state and persist to a `settings` localStorage key, or hide the unwired sections behind a "preview only" banner. The current state is worse than either option. **[1 day]**

11. **Wire the Triggers arm/disarm toggle.** Move the execution-state literal from the Dashboard and Triggers page into a shared `localStorage["executionStatus"]` written by Triggers and read by both. **[0.5 day]**

### Phase 4 — Information architecture (1 day)

> **✅ Done (2026-05-24)** — sidebar covers all 9 routes with deep-route active-state; `profile-old` deleted; `pendingBeneficiaries` flow removed; `logActivity` added across pages.

12. **Add the missing sidebar entries** (Activity, Triggers, Help, optionally a Profile/My-Estate top entry). `components/layout/Sidebar.tsx:18-24`. **[0.25 day]**

13. **Decide what to do with `profile-old`.** Either delete it (and migrate any unique features into `my-estate/*`) or restore the link to it. Right now it's dead weight that will rot. **[0.25 day to delete, 2+ days to merge features]**

14. **Wire `pendingBeneficiaries` into `my-estate/people`.** So suggested family from profile-old shows up in the wizard. (Or delete the suggestion code if profile-old is going away.) **[0.25 day]**

15. **Call `logActivity()` from the other pages.** Triggers (arm/disarm), Settings (save), Vault (create/edit/delete), profile changes. Most are one-line additions next to existing state writes. **[0.5 day]**

### Phase 5 — Polish (0.5 day)

> **✅ Done (2026-05-24)** — `data-scroll-behavior` added; the `User` import is now used (My Estate nav); Proof-of-Life status and identity derive from real data.

16. **Add `data-scroll-behavior="smooth"` to `<html>`** in `app/layout.tsx:16`. **[5 min]**

17. **Remove the unused `User` import in Sidebar.** Or use it for a Profile entry. **[5 min]**

18. **Replace hardcoded "Proof of Life" status and user identity in the Sidebar** with reads from settings / auth state. **[0.25 day]**

---

## 7. What this audit didn't cover

- Visual regressions / responsive behavior. Code-side only.
- Accessibility (keyboard nav, ARIA, focus management). Worth a separate pass.
- Performance (bundle size, Turbopack-specific behavior). Worth a separate pass.
- Backend wiring intent. The codebase claims "zero-knowledge encryption" in copy and `README.md`; there is no encryption layer in code (only an `encrypted: boolean` field on records). When a real backend goes in, the localStorage shapes here will need to map to API contracts — worth scoping that mapping *before* unifying the localStorage keys in Phase 1, since you may want to skip straight to the API shape.
- The Will Generator (`lib/willGenerator.ts`) ↔ Will Create form schema gap (subagent flagged at lines 23–35, 48–51, 58, 75, 98–105). Worth a focused review when you wire the "Generate PDF" action.

---

*Audit produced 2026-05-22. Cross-reference: behavioral findings from Chrome session by `user/aaron` on the same day.*
