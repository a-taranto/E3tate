# Keepr-E3tate — Build Plan

**Date:** 2026-05-24
**Basis:** the gap analysis in [OVERVIEW.md §4](OVERVIEW.md), plus observations from the Phases 1–4 audit work (see [AUDIT.md](../AUDIT.md)).
**Effort key:** **S** = under a day · **M** = 1–3 days · **L** = a week or more, for a developer familiar with this codebase.

The app today is a localStorage-only prototype. One normalized record shape (`VaultRecord` in `lib/store.ts`) spans four vault categories (documents / wallets / credentials / accounts), with a one-time migration + derived selectors + a boot-time `StoreBootstrap`. That foundation is solid and should be **extended, not replaced**.

---

## Phase A — Estate data model (foundation, do first)

The spec calls for a structured estate inventory; the 4-category vault can't express it. Add typed models alongside the existing store using the same pattern (canonical key + `load*/save*` + derived selectors + boot seed).

| # | Item | Where | Effort |
|---|---|---|---|
| A1 | **Liabilities** — new pillar (`EstateLiability`: kind = mortgage/loan/card/tax, lender, balance, account ref). New store slice `liabilities`. | `lib/store.ts`, new `app/liabilities` (or a tab under a new Estate view) | M |
| A2 | **First-class Assets** — `EstateAsset` with a real type union (real-property, vehicle, personal-effect, bank, shares/super, business, IP, debt-owed, safe-contents, digital). Migrate `my-estate/assets` + vault crypto into it. | `lib/store.ts`, `app/my-estate/assets`, vault | L |
| A3 | **Net estate computation** — derived selector `getEstateSummary()` = Σ assets − Σ liabilities, surfaced on the dashboard. | `lib/store.ts`, `app/page.tsx` | S |
| A4 | **Key persons: Trustee + managed Guardian** — extend `BeneficiaryRole` with `trustee`/`guardian`; make Guardian a first-class person rather than a will-wizard field. | `lib/store.ts`, `app/beneficiaries`, `app/will/create` | S |

> A2 is the keystone — gifts (Phase B) and the executor inventory (Phase C) both depend on assets being typed and addressable.

---

## Phase B — Finish "administering the estate"

The will/create wizard has the right steps but most are stubbed.

| # | Item | Where | Effort |
|---|---|---|---|
| B1 | **Unify the will model** — today `uploaded_will`, `will_template`, and `will-draft-*` don't reconcile (AUDIT P1-16). One `will` object with a status enum (`none/draft/created/uploaded`) and a single "do I have a will?" selector. | `lib/store.ts`, `app/will/*` | M |
| B2 | **Persist residuary allocation** — make the Step-3 percentage inputs controlled, persist per-beneficiary %, and validate the total to 100%. | `app/will/create` | S |
| B3 | **Pecuniary legacies, survivorship, gifts-to-minors** — model and capture these (currently absent). Gifts-to-minors links to the Trustee (A4). | `app/will/create`, `lib/store.ts` | M |
| B4 | **Specific gifts (un-gate)** — link a typed Asset (A2) to a beneficiary; replace the gated "Add Gift from Vault" button. | `app/will/create`, vault | M |

---

## Phase C — Executor / post-release mode

Everything above is pre-death prep. The executor workflow (OVERVIEW §3) is the payoff and is currently absent.

| # | Item | Where | Effort |
|---|---|---|---|
| C1 | **Released state** — when a trigger fires + cooling-off expires, flip to an "administration" mode that grants executors scoped access. | `lib/store.ts` (executionStatus → add `released`), triggers | M |
| C2 | **Executor checklist** — the 7-step workflow in OVERVIEW §3.2, driven by the recorded assets/liabilities/gifts, with per-step completion. | new `app/administration` | L |
| C3 | **Progress view** — after release, the readiness score surface becomes the executor's progress tracker. | `components/dashboard`, `lib/estate-score.ts` | M |

---

## Phase D — Digital assets & security completeness

| # | Item | Where | Effort |
|---|---|---|---|
| D1 | **Digital-asset types** — add domains, loyalty points, content libraries, online businesses to the service catalog. | `lib/services.ts` | S |
| D2 | **Real backup/export** — produce an encrypted export file; wire the gated Download/Restore. | `app/settings` | M |
| D3 | **Security backend** — the big one: real encryption at rest, MFA, Shamir shards. Currently UI-only "Coming soon". Needs a backend; scope separately. | platform | L+ |

---

## Functionality improvements (beyond the spec)

Things worth building that the spec doesn't call out, surfaced while wiring the app:

- **FN1 — Make the readiness score actionable.** It's currently a passive %. Each incomplete line ("Will uploaded", "Executor assigned") should deep-link to the screen that fixes it. High engagement-per-effort. **(S)**
- **FN2 — Disclosure-scope editor.** "Edit Scope" became a whole-record "Edit"; there's still no per-beneficiary visibility editor, which is the core privacy promise. **(M)**
- **FN3 — Vault record editing.** "Edit Record" is gated. With a typed model (A2) this becomes a real form. **(M)**
- **FN4 — Working notifications.** Settings has check-in/activity toggles but nothing fires. Wire at least in-app reminders driven by the check-in cadence. **(M)**
- **FN5 — Document-expiry reminders.** Identity records already carry `expiryDate`; surface upcoming expiries on the dashboard. Cheap, useful. **(S)**
- **FN6 — Multi-executor consensus.** The manual trigger advertises `requiresConsensus`/`requiredExecutors` but it's static config; implement the approval flow. **(M)**
- **FN7 — Activity-log coverage.** Vault create/edit/delete don't log yet (AUDIT RC-G remainder). One-liners next to existing store writes. **(S)**
- **FN8 — Data portability.** A plain JSON export/import (separate from encrypted backup) for the prototype, so a user's estate survives a browser change. **(S)**

---

## UX improvements

Observed rough edges, roughly ordered by impact:

- **UX1 — Replace `alert()` / `confirm()` with toasts + a confirm modal.** Wiring used native dialogs (Send Invite, deletes). Fine for a prototype, jarring for production; a small toast + modal primitive lifts the whole app. **(S–M)**
- **UX2 — A real "Coming soon" affordance.** Gated buttons use `disabled` + a hover `title`. A small visible "Soon" badge communicates intent without a mystery-disabled button. **(S)**
- **UX3 — Parameterize empty states.** The vault empty state always says "No documents yet" regardless of the active filter (AUDIT P1-3). Make copy reflect the category. **(S)**
- **UX4 — Real check-in countdown.** The sidebar/Settings show "Next check-in: N days" from the cadence, not an actual date. Track a last-check-in timestamp and count down to a real date, with a "Check in now" action. **(S)**
- **UX5 — Loading & hydration states.** Pages read localStorage in `useEffect`, so SSR renders defaults then snaps to real data. Add light skeletons / a hydration guard to avoid the flash. **(S)**
- **UX6 — Inline form validation.** Beneficiary/asset forms validate only on submit (empty name/email). Add inline email-format and required-field hints. **(S)**
- **UX7 — Responsive / mobile.** The sidebar is a fixed `w-64`; there's no mobile nav or breakpoint handling (not covered by the audit). A drawer + responsive grids. **(M)**
- **UX8 — Accessibility pass.** Custom toggles (the Triggers arm switch is a styled checkbox), focus management on the slide-over/modals, and ARIA on icon-only buttons. The audit explicitly deferred this. **(M)**
- **UX9 — Onboarding continuity.** The `my-estate` wizard and the dashboard "Complete Setup" CTA should guide users through the new Assets / Liabilities / Digital steps once they exist, and reflect real completion. **(M)**
- **UX10 — Provenance cues.** Records carry a `source` (`profile` / `vault` / `setup`); show a small origin chip so users understand where a record came from (e.g. "From setup"). **(S)**

---

## Suggested sequence

1. **Milestone 1 — Estate inventory:** Phase A (A1 Liabilities → A2 Assets → A3 net estate → A4 key persons) + FN1, UX1, UX3. Delivers the structured estate the spec is built around.
2. **Milestone 2 — A real will:** Phase B (B1 unify → B2 residuary → B3 legacies → B4 gifts) + FN2 scope editor.
3. **Milestone 3 — Executor handoff:** Phase C + FN6 consensus. This is the product's reason to exist.
4. **Milestone 4 — Completeness & polish:** Phase D, the remaining FN/UX items, and the responsive/a11y passes.
5. **Cross-cutting — backend:** D3 (encryption/MFA/shards) and real auth underpin everything claimed in OVERVIEW §2; scope as its own track once the data model (Phase A) is settled, since the localStorage shapes will map to API contracts.
