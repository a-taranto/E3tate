---
document_id: schedule2_super_insurance
title: "Schedule 2 — Superannuation and Life Insurance Summary"
source_document: "MetaLaw Will Kit NSW 2025"
source_publisher: "Meta Law Pty Ltd (ABN 90 612 591 830)"
edition: 2025
jurisdiction: "New South Wales, Australia"
governing_law:
  - "Superannuation Industry (Supervision) Act 1993 (Cth) (SIS Act)"
  - "Succession Act 2006 (NSW)"
document_type: companion_schedule
forms_part_of_will: false
public_on_probate: false
related_documents:
  - partB_will_template
  - schedule1_assets_liabilities
e3tate_role: >
  Tracks superannuation Binding Death Benefit Nominations (BDBNs) and life
  insurance policies that pass OUTSIDE the estate. Drives lapse warnings,
  the annual review cycle, and Part B Clause 8(e) (Superannuation
  acknowledgement) population.
---

# Schedule 2 — Superannuation and Life Insurance Summary

## Purpose (from the source kit)

> This schedule is a reference document for your executor. Your superannuation death benefit and life insurance proceeds do **NOT** automatically form part of your estate. Ensure you maintain a valid, current Binding Death Benefit Nomination (BDBN) with each of your superannuation funds. Review this schedule annually.

## E3tate behavioural rules

- This schedule is the **canonical source** for BDBN status. Part B Clause 8(e) and the dashboard surface should read from here.
- BDBN lapse logic:
  - If `bdbn_in_place == "yes"` and `bdbn_expiry_date` is within 90 days, emit `bdbn_expiring_soon` warning.
  - If `bdbn_expiry_date` has passed, emit `bdbn_lapsed` critical alert.
  - `bdbn_in_place == "non_lapsing"` suppresses lapse warnings but should still surface an annual confirmation prompt.
- If any super fund is an **SMSF** (`fund_type == "smsf"`), surface the SMSF warning in Section A below and link to the testator's SMSF trust deed in document storage.
- The annual review checklist in Section C is a *recurring task* — schedule on the anniversary of the user's first completion.

---

## A. Superannuation Fund Details

Each fund is a repeating record. The source kit prints templates for two funds; the data model is unbounded (`super_funds.items[]`).

### Field schema — `super_funds.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `super_funds.items[].fund_name` | Fund Name | string | yes |  |
| `super_funds.items[].fund_abn` | Fund ABN | string (11 digits) | yes | Validate ABN format. |
| `super_funds.items[].member_number` | Member Number | string | yes |  |
| `super_funds.items[].contact_number` | Contact Number | string | no | Fund helpdesk number for the executor. |
| `super_funds.items[].fund_type` | Fund type | enum: `retail` \| `industry` \| `corporate` \| `public_sector` \| `smsf` | yes | `smsf` triggers SMSF warning + document upload. |
| `super_funds.items[].bdbn_in_place` | BDBN in Place? | enum: `yes` \| `no` \| `non_lapsing` | yes |  |
| `super_funds.items[].bdbn_expiry_date` | BDBN Expiry Date | date | conditional | Required iff `bdbn_in_place == "yes"`. Most BDBNs lapse after 3 years. |
| `super_funds.items[].bdbn_beneficiaries` | BDBN Beneficiary(ies) | string (multi-line) | conditional | Required iff `bdbn_in_place != "no"`. |
| `super_funds.items[].bdbn_proportions` | BDBN Proportion | string | conditional | Free text, e.g. `"100% to spouse"` or `"50% estate, 50% spouse"`. Future enhancement: structured allocation table. |
| `super_funds.items[].approx_balance_aud` | Approximate Balance | currency (AUD) | yes |  |
| `super_funds.items[].insurance_inside_super` | Insurance inside super? | boolean | yes | If true, prompt for policy details (link to Section B or inline insurance sub-record). |

### Source layout — Fund 1

> | Fund Name | |
> | Fund ABN | |
> | Member Number | |
> | Contact Number | |
> | BDBN in Place? | Yes / No / Non-lapsing BDBN |
> | BDBN Expiry Date | |
> | BDBN Beneficiary(ies) | |
> | BDBN Proportion | e.g. 100% to spouse / or 50% estate, 50% spouse |
> | Approximate Balance | $ |
> | Insurance inside super? | Yes / No — If yes, see below |

### Source layout — Fund 2 (if applicable)

> | Fund Name | |
> | Fund ABN | |
> | Member Number | |
> | BDBN in Place? | Yes / No / Non-lapsing BDBN |
> | BDBN Expiry Date | |
> | BDBN Beneficiary(ies) | |
> | Approximate Balance | $ |

### ⚠️ SMSF holders

> **SMSF holders:** Attach a copy of your SMSF trust deed and any binding death benefit nomination documents. Ensure your Succession Memorandum or Enduring Power of Attorney is also current to deal with fund management if you lose capacity.

E3tate should require a document upload (`smsf_trust_deed`, `smsf_bdbn_documents`) when `fund_type == "smsf"`.

---

## B. Life Insurance Policies (Outside Superannuation)

### Field schema — `life_insurance_external.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `life_insurance_external.items[].insurer` | Insurer | string | yes |  |
| `life_insurance_external.items[].policy_no` | Policy No. | string | yes |  |
| `life_insurance_external.items[].type` | Type | enum: `term_life` \| `tpd` \| `trauma` \| `income_protection` \| `whole_of_life` \| `other` | yes |  |
| `life_insurance_external.items[].sum_insured_aud` | Sum Insured ($) | currency (AUD) | yes |  |
| `life_insurance_external.items[].beneficiary` | Beneficiary | string | yes | If `"estate"`, proceeds form part of estate (taxable consequences differ — flag for advice). |
| `life_insurance_external.items[].expiry_review_date` | Expiry/Review Date | date | yes | Emit review reminder 60 days before. |

### Source layout

> | Insurer | Policy No. | Type | Sum Insured ($) | Beneficiary | Expiry/Review Date |
> |---|---|---|---|---|---|

---

## C. Annual Review Checklist

> Complete the following checklist annually to ensure your estate plan remains current.

### Field schema — `annual_review.items[]` (fixed set)

| review_item_key | review_item_label | type | notes |
|---|---|---|---|
| `will_current` | Will is current and reflects my wishes | boolean + date | Cross-check `last_updated` on Part B. |
| `bdbn_current` | BDBN(s) are current (not expired) | boolean + date | Cross-check `super_funds.items[].bdbn_expiry_date`. |
| `beneficiaries_alive` | Named beneficiaries are still alive and correct | boolean + date |  |
| `life_insurance_adequate` | Life insurance cover is adequate and beneficiaries current | boolean + date |  |
| `schedule1_updated` | Asset and Liability Inventory (Schedule 1) updated | boolean + date | Cross-check `schedule1.updated_at`. |
| `schedule4_updated` | Digital Assets Register (Schedule 4) updated | boolean + date | Cross-check `schedule4.updated_at`. |
| `executor_contacts_current` | Executor and trustee contact details current | boolean + date |  |
| `epoa_current` | Enduring Power of Attorney current and registered | boolean + date | Out of scope of the Will, but tracked here. |
| `new_assets_addressed` | New assets acquired and dealt with in Will | boolean + date |  |
| `family_structure_changes` | Changes to family structure (marriage/divorce/birth/death) | boolean + date | Marriage triggers automatic Will revocation in NSW — block save with critical warning. |

Each review_item carries:

| field | type | notes |
|---|---|---|
| `date_reviewed` | date | When the item was last confirmed. |
| `action_required` | string | Free-text note of any follow-up. |
| `status` | enum: `ok` \| `action_required` \| `not_applicable` | Computed from boolean + presence of `action_required`. |

### Source layout

> | Review Item | Date Reviewed | Action Required |
> |---|---|---|
> | Will is current and reflects my wishes | | |
> | BDBN(s) are current (not expired) | | |
> | Named beneficiaries are still alive and correct | | |
> | Life insurance cover is adequate and beneficiaries current | | |
> | Asset and Liability Inventory (Schedule 1) updated | | |
> | Digital Assets Register (Schedule 4) updated | | |
> | Executor and trustee contact details current | | |
> | Enduring Power of Attorney current and registered | | |
> | New assets acquired and dealt with in Will | | |
> | Changes to family structure (marriage/divorce/birth/death) | | |

---

## Cross-document linkage

- `super_funds` here is the source of truth; `superannuation.items[]` in Schedule 1 mirrors a subset (fund_name, member_number, BDBN status, balance) for the consolidated inventory view. App should keep them in sync via a single underlying record.
- Part B Clause 8(e) consumes `super_funds.items[].bdbn_in_place` to render the `"have"` vs `"intend to"` text.
- Life insurance policies in Schedule 1 §5 and Schedule 2 §B should be backed by a single underlying record.

## Suggested derived alerts

```yaml
alerts:
  - id: bdbn_lapsing_soon
    when: any(super_funds.items[].bdbn_expiry_date) <= today + 90 days
    severity: warning
  - id: bdbn_lapsed
    when: any(super_funds.items[].bdbn_expiry_date) < today
    severity: critical
  - id: smsf_documents_missing
    when: super_funds.items[].fund_type == "smsf" AND smsf_trust_deed.uploaded != true
    severity: warning
  - id: annual_review_overdue
    when: annual_review.completed_at < today - 365 days
    severity: info
```
