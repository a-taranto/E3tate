---
document_id: schedule1_assets_liabilities
title: "Schedule 1 — Asset and Liability Inventory"
source_document: "MetaLaw Will Kit NSW 2025"
source_publisher: "Meta Law Pty Ltd (ABN 90 612 591 830)"
edition: 2025
jurisdiction: "New South Wales, Australia"
document_type: companion_schedule
forms_part_of_will: false
public_on_probate: false
related_documents:
  - partB_will_template
  - schedule2_super_insurance
  - schedule4_digital_assets
e3tate_role: >
  Inventory data model for the testator's net worth. Drives estimates of
  estate value, ademption checks against Part B Clause 5 (Specific Gifts),
  liquidity checks against Clause 6 (Cash Legacies), and thresholds that
  recommend Schedule 3 (Testamentary Trust). Does NOT form part of the Will
  and is not exposed on Probate.
---

# Schedule 1 — Asset and Liability Inventory

## Purpose (from the source kit)

> This schedule is a confidential record of your assets and liabilities to assist your executor. It does not form part of your Will and does not affect how assets are distributed. Keep it with your Will and update it annually or after any major financial change.
>
> ⚠️ Do **NOT** include passwords or access credentials in this document. Use Schedule 4 (Digital Assets Register) and an external encrypted password manager for credentials.

## E3tate behavioural rules

- Treat every section below as a **repeating group** keyed by `{section}.items[]`.
- All monetary fields are AUD decimals.
- Annual review prompt: notify the testator on the anniversary of the last `updated_at` timestamp.
- Cross-reference checks:
  - Each row's `title_type = joint_tenants` should be excluded from estate-value calculations (passes by survivorship — see Part A4.2).
  - Sum of estimated values minus liabilities = **net estate**. If `net_estate > 500,000` AUD, surface a recommendation to consider Schedule 3 (Testamentary Trust).
  - Any asset referenced in a Part B Clause 5 specific gift must exist in this inventory (ademption check).

---

## 1. Real Property

### Field schema — `real_property.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `real_property.items[].property_address` | Property Address | string | yes |  |
| `real_property.items[].title_type` | Title Type | enum: `sole` \| `joint_tenants` \| `tenants_in_common` | yes | `JT` excluded from estate value. |
| `real_property.items[].estimated_value_aud` | Estimated Value ($) | currency (AUD) | yes |  |
| `real_property.items[].mortgage_balance_aud` | Mortgage Balance ($) | currency (AUD) | yes | 0 if unencumbered. |

### Source layout

> | Property Address | Title Type (Sole/JT/TiC) | Estimated Value ($) | Mortgage Balance ($) |
> |---|---|---|---|

---

## 2. Bank and Financial Institution Accounts

### Field schema — `bank_accounts.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `bank_accounts.items[].institution` | Institution | string | yes |  |
| `bank_accounts.items[].account_type` | Account Type | enum: `transaction` \| `savings` \| `term_deposit` \| `offset` \| `other` | yes |  |
| `bank_accounts.items[].bsb` | BSB | string (6 digits, optional dash) | yes | Validate pattern `\d{3}-?\d{3}`. |
| `bank_accounts.items[].account_number_last4` | Account Number (last 4 digits) | string (4 digits) | yes | Privacy: store last 4 only. |
| `bank_accounts.items[].approx_balance_aud` | Approx Balance | currency (AUD) | yes |  |
| `bank_accounts.items[].joint_account` | Joint account? | boolean | no | If true, exclude from estate value. |

### Source layout

> | Institution | Account Type | BSB | Account Number (last 4 digits) | Approx Balance |
> |---|---|---|---|---|

---

## 3. Superannuation

> **Important:** Superannuation balances are listed here for reference only. Death benefits are controlled by the fund trustee and any BDBN — **not** by the Will. Full BDBN tracking is in **Schedule 2**.

### Field schema — `superannuation.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `superannuation.items[].fund_name` | Fund Name | string | yes |  |
| `superannuation.items[].member_number` | Member Number | string | yes |  |
| `superannuation.items[].bdbn_in_place` | BDBN in Place? | enum: `yes` \| `no` \| `non_lapsing` | yes |  |
| `superannuation.items[].bdbn_expiry_date` | BDBN Expiry Date | date | conditional | Required iff `bdbn_in_place == "yes"`. Lapse warning at expiry − 90 days. |
| `superannuation.items[].approx_balance_aud` | Approx Balance ($) | currency (AUD) | yes |  |

### Source layout

> | Fund Name | Member Number | BDBN in Place? | BDBN Expiry Date | Approx Balance ($) |
> |---|---|---|---|---|

---

## 4. Share and Investment Portfolio

### Field schema — `investments.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `investments.items[].asset_description` | Asset Description | string | yes | e.g. CBA shares, Vanguard VAS, BHP. |
| `investments.items[].platform_broker` | Platform / Broker | string | yes |  |
| `investments.items[].account_hin_number` | Account / HIN Number | string | yes | HIN for CHESS-sponsored holdings. |
| `investments.items[].approx_value_aud` | Approx Value ($) | currency (AUD) | yes |  |

### Source layout

> | Asset Description | Platform / Broker | Account/HIN Number | Approx Value ($) |
> |---|---|---|---|

---

## 5. Life Insurance Policies

> **Note:** Insurance proceeds usually pass to the named beneficiary directly and do NOT form part of the estate, unless the estate is named as the beneficiary. Full policy tracking is also in **Schedule 2**.

### Field schema — `life_insurance.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `life_insurance.items[].insurer` | Insurer | string | yes |  |
| `life_insurance.items[].policy_number` | Policy Number | string | yes |  |
| `life_insurance.items[].type` | Type | enum: `term_life` \| `tpd` \| `trauma` \| `income_protection` \| `whole_of_life` \| `other` | yes |  |
| `life_insurance.items[].sum_insured_aud` | Sum Insured ($) | currency (AUD) | yes |  |
| `life_insurance.items[].named_beneficiary` | Named Beneficiary | string | yes | If "estate", proceeds form part of estate. |

### Source layout

> | Insurer | Policy Number | Type | Sum Insured ($) | Named Beneficiary |
> |---|---|---|---|---|

---

## 6. Business Interests

### Field schema — `business_interests.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `business_interests.items[].name` | Business / Company Name | string | yes |  |
| `business_interests.items[].acn_or_abn` | ACN / ABN | string | yes | ACN = 9 digits; ABN = 11 digits. Validate. |
| `business_interests.items[].nature_of_interest` | Nature of Interest | string | yes | e.g. director, shareholder, partner, sole trader. |
| `business_interests.items[].approx_value_aud` | Approx Value ($) | currency (AUD) | yes |  |
| `business_interests.items[].shareholders_agreement_exists` | Shareholders' agreement exists? | boolean | no | If yes, warn that Will may be overridden by buy-out clauses. |

### Source layout

> | Business / Company Name | ACN / ABN | Nature of Interest (e.g. director, shareholder) | Approx Value ($) |
> |---|---|---|---|

---

## 7. Vehicles

### Field schema — `vehicles.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `vehicles.items[].make_model_year` | Vehicle (Make/Model/Year) | string | yes |  |
| `vehicles.items[].registration` | Registration | string | yes | NSW plate format if applicable. |
| `vehicles.items[].financed` | Financed? | boolean | yes | If true, prompt for outstanding finance in Liabilities. |
| `vehicles.items[].approx_value_aud` | Approx Value ($) | currency (AUD) | yes |  |

### Source layout

> | Vehicle (Make/Model/Year) | Registration | Financed? | Approx Value ($) |
> |---|---|---|---|

---

## 8. Other Assets (Trusts, Loans Receivable, Collectibles, etc.)

### Field schema — `other_assets.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `other_assets.items[].description` | Description | string | yes |  |
| `other_assets.items[].location_details` | Location / Details | string | yes | Where the asset is kept or how it is held. |
| `other_assets.items[].approx_value_aud` | Approx Value ($) | currency (AUD) | yes |  |
| `other_assets.items[].asset_class` | Asset class | enum: `trust_interest` \| `loan_receivable` \| `collectible` \| `jewellery` \| `art` \| `intellectual_property` \| `other` | no | Useful for downstream filtering. |

### Source layout

> | Description | Location / Details | Approx Value ($) |
> |---|---|---|

---

## 9. Liabilities

### Field schema — `liabilities.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `liabilities.items[].creditor` | Creditor | string | yes |  |
| `liabilities.items[].nature_of_debt` | Nature of Debt | string | yes | e.g. home loan, credit card, personal loan, tax. |
| `liabilities.items[].account_reference` | Account Reference | string | yes |  |
| `liabilities.items[].outstanding_balance_aud` | Outstanding Balance ($) | currency (AUD) | yes |  |
| `liabilities.items[].secured_against` | Secured against (asset_id) | reference → real_property.items / vehicles.items | no | Link mortgages and car loans to the secured asset. |

### Source layout

> | Creditor | Nature of Debt | Account Reference | Outstanding Balance ($) |
> |---|---|---|---|

---

## 10. Key Contacts for Executor

### Field schema — `key_contacts.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `key_contacts.items[].role` | Role | enum: `solicitor` \| `accountant` \| `financial_planner` \| `gp` \| `executor` \| `funeral_director` \| `other` | yes |  |
| `key_contacts.items[].name` | Name | string | yes |  |
| `key_contacts.items[].firm` | Firm / Organisation | string | no |  |
| `key_contacts.items[].phone_email` | Phone / Email | string | yes | Validate email if `@` present. |

### Source layout

> | Role | Name | Firm / Organisation | Phone / Email |
> |---|---|---|---|

---

## Executor Locator Checklist

The source kit closes the schedule with a non-binding reminder to the executor:

> **Note to Executor.** You should also locate and preserve: the original Will; any prior Wills; marriage/divorce/birth certificates; property title documents; tax file number; Medicare card; passport; and any trust deeds or corporate constitutions relevant to the estate.

### E3tate suggestion

Render this as a separate, **on-death** executor checklist (state = `pending` | `located` | `preserved`). Items:

- original_will
- prior_wills
- marriage_certificate
- divorce_certificate
- birth_certificate
- property_title_documents
- tax_file_number
- medicare_card
- passport
- trust_deeds
- corporate_constitutions

---

## Computed fields (suggested for E3tate)

```yaml
computed:
  gross_estate_aud: >
    sum of all .approx_value_aud (excluding items where title_type == "joint_tenants"
    or joint_account == true, and excluding superannuation.items unless BDBN points to estate)
  total_liabilities_aud: sum(liabilities.items[].outstanding_balance_aud)
  net_estate_aud: gross_estate_aud - total_liabilities_aud
  recommend_testamentary_trust: net_estate_aud > 500_000
  liquidity_ratio: >
    sum(bank_accounts.items[].approx_balance_aud where joint_account != true)
      / total_cash_legacies   # cross-references Part B Clause 6
```
