---
document_id: partB_will_template
title: "Part B — Last Will and Testament (Template)"
source_document: "MetaLaw Will Kit NSW 2025"
source_publisher: "Meta Law Pty Ltd (ABN 90 612 591 830)"
edition: 2025
jurisdiction: "New South Wales, Australia"
governing_law:
  - "Succession Act 2006 (NSW)"
  - "Probate and Administration Act 1898 (NSW)"
  - "Trustee Act 1925 (NSW)"
  - "Perpetuities Act 1984 (NSW)"
document_type: will_template
related_documents:
  - schedule1_assets_liabilities
  - schedule2_super_insurance
  - schedule3_testamentary_trust
  - schedule4_digital_assets
e3tate_role: >
  Canonical structure of a NSW Will. Use as the source of truth for the
  Will domain model, form schemas, conditional clause logic, and PDF/print
  output in E3tate. Field IDs in this file are stable and intended to be
  used directly as keys in the application data model.
---

# Part B — Last Will and Testament (Template)

> **For Claude Code / E3tate ingestion**
>
> Each clause below has three layers:
>
> 1. **Purpose & rules** — what the clause does, when to include it, how it should behave in the product.
> 2. **Field schema** — a flat table of `field_id`, `label`, `type`, `required`, and notes. Use these as the canonical keys for the Will entity in E3tate.
> 3. **Operative clause text (verbatim)** — the exact legal text from the MetaLaw kit, with `{{field_id}}` placeholders inserted where the original document had blanks. This is what the PDF/print engine must render.
>
> Where a clause is conditional (e.g. minor children, spouse, joint tenancy), the `include_when` rule is given in machine-readable form.

---

## How to Use This Template (from the source kit)

> Step 1: Read Part A (Guidance Notes) in full before completing this template.
> Step 2: Complete all fields marked `[  ]` by typing your details directly into this document.
> Step 3: Delete any clauses that do not apply to you (e.g. if you have no minor children, delete the Guardian clause).
> Step 4: Delete all instructional text shown in `[SQUARE BRACKETS]` before execution.
> Step 5: Have the completed Will reviewed by a solicitor before signing (strongly recommended).
> Step 6: Execute the Will strictly in accordance with the execution procedure in Section A3.3 of the kit.

**E3tate implementation note:** All `[INSTRUCTION]` blocks shown below are *editor-time guidance only* and MUST NOT appear in the generated/printed Will. The PDF engine should strip them from output.

---

## Testator Identification (header block)

### Field schema

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `testator.full_legal_name` | Full Legal Name | string | yes | Must match name on photographic ID. Used in attestation block. |
| `testator.residential_address` | Residential Address | string (multi-line) | yes | Australian address; used to establish NSW domicile presumption. |
| `testator.date_of_birth` | Date of Birth | date (DD/MM/YYYY) | yes | Used to verify age ≥ 18 (or s.5 exception). See Part A2. |
| `testator.occupation` | Occupation | string | yes | Conventional in NSW Wills; aids identity verification. |
| `testator.has_prior_will` | Has prior Will or codicils? | boolean | no | If true, surface revocation warning. |
| `testator.contemplated_marriage` | Will made in contemplation of marriage? | boolean | no | If true, expand standard revocation language under s.12 Succession Act. |

### Operative text (verbatim, with placeholders)

> **THIS IS THE LAST WILL AND TESTAMENT**
>
> **of**
>
> Full Legal Name: `{{testator.full_legal_name}}`
>
> of Residential Address: `{{testator.residential_address}}`
>
> Date of Birth: `{{testator.date_of_birth}}`    Occupation: `{{testator.occupation}}`
>
> (referred to throughout this Will as 'I', 'me', or 'my')

---

## Clause 1 — Revocation of Prior Wills

**Always included.** Standard opening revocation. No fields.

> 1.  I REVOKE all former Wills, codicils, and testamentary dispositions previously made by me and declare that this document is my last Will and Testament.

---

## Clause 2 — Appointment of Executor

**Always included.** Primary + at least one substitute executor required.

> **[INSTRUCTION — editor only, do not render]** Appoint your primary executor and at least one substitute. Both should be individuals (or a trustee company) who are willing and able to act. You may appoint up to two co-executors. Delete any sub-clause that does not apply.

### Field schema

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `executor.primary.full_name` | Primary Executor — Full Name | string | yes |  |
| `executor.primary.residential_address` | Primary Executor — Residential Address | string | yes |  |
| `executor.primary.relationship` | Primary Executor — Relationship to testator | string | yes | e.g. spouse, child, friend, solicitor. |
| `executor.substitute_1.full_name` | First Substitute Executor — Full Name | string | yes | Strongly recommended — see Part A7.1. |
| `executor.substitute_1.residential_address` | First Substitute Executor — Residential Address | string | yes |  |
| `executor.substitute_1.relationship` | First Substitute Executor — Relationship | string | yes |  |
| `executor.substitute_2.enabled` | Include second substitute executor? | boolean | no | Drives include_when below. |
| `executor.substitute_2.full_name` | Second Substitute Executor — Full Name | string | conditional | Required iff `executor.substitute_2.enabled = true`. |
| `executor.substitute_2.residential_address` | Second Substitute Executor — Residential Address | string | conditional | Required iff `executor.substitute_2.enabled = true`. |
| `executor.co_executors_act_jointly` | Multiple executors act jointly? | boolean | yes | Default true; renders the final operative sentence. |

### Operative text

> 2.  I APPOINT as my Executor and Trustee of this Will:
>
> (a)  **PRIMARY EXECUTOR:**
>   Full Name: `{{executor.primary.full_name}}`
>   Residential Address: `{{executor.primary.residential_address}}`
>   Relationship to me: `{{executor.primary.relationship}}`
>
> (b)  **SUBSTITUTE EXECUTOR** (to act if my primary Executor is unable or unwilling to act, predeceases me, or fails to obtain Probate):
>   Full Name: `{{executor.substitute_1.full_name}}`
>   Residential Address: `{{executor.substitute_1.residential_address}}`
>   Relationship to me: `{{executor.substitute_1.relationship}}`
>
> *(c) — render only if `executor.substitute_2.enabled = true`)*
>
> (c)  **SECOND SUBSTITUTE EXECUTOR** (to act if both primary and first substitute Executors are unable or unwilling to act):
>   Full Name: `{{executor.substitute_2.full_name}}`
>   Residential Address: `{{executor.substitute_2.residential_address}}`
>
> Where I appoint more than one Executor, they shall act jointly. A reference to 'my Executor' or 'my Trustee' includes any substitute or co-executor duly appointed.

---

## Clause 3 — Trustee Powers

**Always included.** Boilerplate set of fiduciary powers. No fields.

> 3.  I GRANT to my Trustee (including any substitute trustee) all powers necessary or desirable for the administration of my estate and any trust created by this Will, including (without limitation) the following powers:
>
> (a)  To sell, dispose of, mortgage, lease, or otherwise deal with any asset of my estate or any trust created by this Will on such terms and at such times as my Trustee thinks fit, without being liable for any loss arising from the exercise of such powers in good faith;
>
> (b)  To invest in any form of investment (including shares, managed funds, real property, fixed income instruments, and cash) without being restricted to authorised trustee investments under the Trustee Act 1925 (NSW), and to vary investments from time to time;
>
> (c)  To borrow money and give security over estate or trust assets for any purpose connected with the administration of the estate or any trust;
>
> (d)  To appropriate any asset of my estate in or towards satisfaction of any legacy, share, or entitlement at its value at the date of appropriation;
>
> (e)  To apply income or capital for the education, maintenance, advancement, or benefit of any minor beneficiary without requiring the consent of any other person;
>
> (f)  To postpone the sale of any asset of my estate for such period as my Trustee thinks fit, without being liable for any loss arising from such postponement;
>
> (g)  To employ solicitors, accountants, investment advisers, agents, or other professionals in connection with the administration of my estate and to pay their reasonable fees from my estate;
>
> (h)  To register any investment in the names of nominees;
>
> (i)  To compromise, settle, or abandon claims by or against my estate;
>
> (j)  To grant receipts and give discharges; and
>
> (k)  Generally to do all acts and things that a beneficial owner could do in relation to the assets of my estate and any trust created under this Will.

---

## Clause 4 — Appointment of Guardian (for minor children)

**Conditional.** `include_when: testator.has_minor_children = true`. If false, omit the entire clause.

> **[INSTRUCTION — editor only]** Complete this clause only if you have minor children (under 18). If both parents are living and the other parent will have parental responsibility, the guardian you appoint would act only if both parents are deceased. Delete this entire clause if it does not apply to you.

### Field schema

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `testator.has_minor_children` | Has minor children? | boolean | yes | Drives entire clause. |
| `guardian.primary.full_name` | Primary Guardian — Full Name | string | conditional | Required iff has_minor_children. |
| `guardian.primary.residential_address` | Primary Guardian — Residential Address | string | conditional |  |
| `guardian.primary.relationship` | Primary Guardian — Relationship | string | conditional |  |
| `guardian.substitute.full_name` | Substitute Guardian — Full Name | string | conditional |  |
| `guardian.substitute.residential_address` | Substitute Guardian — Residential Address | string | conditional |  |

### Operative text

> 4.  I APPOINT as Guardian of any minor child of mine who is living at the date of my death:
>
> (a)  **PRIMARY GUARDIAN:**
>   Full Name: `{{guardian.primary.full_name}}`
>   Residential Address: `{{guardian.primary.residential_address}}`
>   Relationship to me: `{{guardian.primary.relationship}}`
>
> (b)  **SUBSTITUTE GUARDIAN** (to act if the primary Guardian is unable or unwilling to act):
>   Full Name: `{{guardian.substitute.full_name}}`
>   Residential Address: `{{guardian.substitute.residential_address}}`
>
> The Guardian appointed under this clause shall have the same rights and responsibilities as a parent in relation to my minor child(ren), and my Trustee shall pay from the income and/or capital of any trust established for a minor child's benefit such amounts as are reasonably necessary for the child's maintenance, education, and welfare, as agreed with the Guardian from time to time.

---

## Clause 5 — Specific Gifts

**Conditional repeating group.** Omit clause if no specific gifts.

> **[INSTRUCTION — editor only]** List any specific items of property you wish to leave to named individuals. Be precise in describing each asset. If a listed asset no longer exists at your death, the gift fails (ademption). If you have no specific gifts to make, delete this clause. Do not list superannuation or jointly owned property here — see Part A.

### Field schema — `specific_gifts[]` (repeating group)

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `specific_gifts[].asset_description` | Description of Asset | string | yes | Be precise: VIN/title/serial where applicable. Risk of ademption (Part A8.1). |
| `specific_gifts[].beneficiary_full_name` | Full Name of Beneficiary | string | yes |  |
| `specific_gifts[].relationship` | Relationship | string | yes | e.g. spouse, child, sibling, friend, charity. |
| `specific_gifts[].lapses_to_residue` | If beneficiary predeceases, lapse to residue? | boolean | yes | Default true (matches operative text). If false, app should require a substitute beneficiary. |
| `specific_gifts[].substitute_beneficiary` | Substitute beneficiary (if not lapsing to residue) | string | conditional |  |

**Validation rules**
- `specific_gifts.length` should warn if > 20 (consider Schedule of Gifts approach in advice).
- Each asset description should pass a non-empty check.
- App should cross-check that asset is not also listed in Schedule 1 as a jointly-owned asset (joint tenancy passes by survivorship — see Part A4.2).

### Operative text

> 5.  I GIVE the following specific gifts, free of all encumbrances and estate duties (if any), to the persons named:
>
> | Description of Asset | Full Name of Beneficiary | Relationship |
> |---|---|---|
> | `{{specific_gifts[0].asset_description}}` | `{{specific_gifts[0].beneficiary_full_name}}` | `{{specific_gifts[0].relationship}}` |
> | … repeat for each row … | | |
>
> If a named beneficiary predeceases me, the specific gift to that beneficiary lapses and falls into the residuary estate, unless otherwise indicated above.

---

## Clause 6 — Cash Legacies

**Conditional repeating group.** Omit clause if no pecuniary legacies.

> **[INSTRUCTION — editor only]** List any fixed cash amounts you wish to leave to named individuals or charities. If you have no cash legacies, delete this clause. Cash legacies are paid before the residuary estate is distributed. Ensure your estate will have sufficient liquid assets.

### Field schema — `cash_legacies[]` (repeating group)

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `cash_legacies[].amount_aud` | Amount (AUD) | currency (AUD) | yes | Positive decimal. |
| `cash_legacies[].recipient_full_name` | Full Name / Organisation | string | yes |  |
| `cash_legacies[].relationship` | Relationship | string | yes | e.g. friend, charity, nephew. |
| `cash_legacies[].is_charity` | Is this a registered charity? | boolean | no | Drives ABN field. |
| `cash_legacies[].abn` | ABN (if charity) | string (11 digits) | conditional | Validate against ABR if possible. |

**Validation rules**
- App should warn if `sum(cash_legacies[].amount_aud)` approaches or exceeds estimated liquid estate value (cross-check against Schedule 1 totals).
- ABN format: 11 numeric digits, optional Luhn-like checksum (ATO algorithm).

### Operative text

> 6.  I GIVE the following cash legacies, free of all estate duties (if any), to the persons or organisations named:
>
> | Amount (AUD) | Full Name / Organisation | Relationship | ABN (if charity) |
> |---|---|---|---|
> | $`{{cash_legacies[0].amount_aud}}` | `{{cash_legacies[0].recipient_full_name}}` | `{{cash_legacies[0].relationship}}` | `{{cash_legacies[0].abn}}` |
> | … repeat for each row … | | | |

---

## Clause 7 — Residuary Estate

**Always included.** Most critical clause. Two mutually exclusive options.

> **[INSTRUCTION — editor only]** The residuary clause is the most critical clause in your Will. It captures everything not otherwise disposed of. Complete Option A (if you are married or in a de facto relationship) OR Option B (if you are single or widowed), and delete the other. You may use both options in combination with a survivorship condition.

### Branch selector

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `residuary.option` | Residuary option | enum: `A` \| `B` | yes | A = spouse-first with substitution; B = explicit shares table. |

### Option A — Spouse/Partner first (with substitution for children)

**Active when** `residuary.option = "A"`.

#### Field schema

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `residuary.optionA.spouse.full_name` | Spouse/Partner Full Name | string | yes |  |
| `residuary.optionA.spouse.address` | Spouse/Partner Address | string | yes |  |
| `residuary.optionA.spouse.relationship` | Relationship | enum: `spouse` \| `de_facto_partner` \| `civil_partner` | yes |  |
| `residuary.optionA.children_vesting_age` | Children vesting age | integer (18–30) | yes | Common values 18 / 21 / 25. Below 18 not permitted. |
| `residuary.optionA.stirpital_substitution` | Grandchildren take parent's share (per stirpes)? | boolean | yes | Default true (matches operative text). |

#### Operative text (Option A)

> 7.  I GIVE my residuary estate (being everything remaining after the payment of all my debts, taxes, funeral and testamentary expenses, costs of administration, and all specific gifts and cash legacies under this Will) as follows:
>
> (a)  **PRIMARY GIFT — to my spouse/partner:**
> To Spouse/Partner Full Name: `{{residuary.optionA.spouse.full_name}}` of Address: `{{residuary.optionA.spouse.address}}`, my Relationship (e.g. spouse, de facto partner): `{{residuary.optionA.spouse.relationship}}`, absolutely and beneficially, if they survive me by 30 days (the 'Survivorship Period').
>
> (b)  **SUBSTITUTION** — if my spouse/partner does not survive me by 30 days:
>
> My residuary estate shall be held on the following trusts:
>
> (i)   In equal shares for those of my children who survive me and attain the age of `{{residuary.optionA.children_vesting_age}}` years;
>
> (ii)  If any child of mine predeceases me or dies before attaining the specified age, leaving children of their own ('grandchildren'), those grandchildren shall take equally the share their parent would have received (stirpital distribution);
>
> (iii) Any share held for a child or grandchild who is a minor at the relevant vesting date shall be held on trust by my Trustee until that person attains the specified vesting age, with power to apply income and capital for their maintenance, education, and advancement.

### Option B — Single / widowed / alternative residuary gift

**Active when** `residuary.option = "B"`.

#### Field schema — `residuary.optionB.shares[]` (repeating group)

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `residuary.optionB.shares[].beneficiary_full_name` | Beneficiary (Full Name) | string | yes |  |
| `residuary.optionB.shares[].relationship` | Relationship | string | yes |  |
| `residuary.optionB.shares[].share_percent` | Share (%) | decimal (0–100) | yes | App must enforce `sum = 100`. |

**Validation rules**
- `sum(residuary.optionB.shares[].share_percent) == 100` — hard validation. Block save otherwise.
- Each share ≥ 0.01 and ≤ 100.

#### Operative text (Option B)

> (a)  My residuary estate shall be divided as follows:
>
> | Beneficiary (Full Name) | Relationship | Share (%) |
> |---|---|---|
> | `{{residuary.optionB.shares[0].beneficiary_full_name}}` | `{{residuary.optionB.shares[0].relationship}}` | `{{residuary.optionB.shares[0].share_percent}}`% |
> | … repeat for each row … | | |
> | **TOTAL** | | **100%** |
>
> Any beneficiary named in the table above who does not survive me by the Survivorship Period shall be treated as having predeceased me, and their share shall fall into the residue and be distributed as if they had not been named.

---

## Clause 8 — Investment and Business Assets

**Conditional sub-clauses.** Each sub-clause has its own include flag.

> **[INSTRUCTION — editor only]** This clause is particularly important for executives, investors, and business owners. Modify or delete sub-clauses that do not apply to you. If you hold assets in a discretionary trust or SMSF, note that those assets are NOT part of your estate — see Part A, Sections A4 and A6.

### Field schema

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `investments.includes_share_portfolio` | Include share/managed fund sub-clause? | boolean | yes |  |
| `investments.includes_private_company` | Hold private company interests? | boolean | yes | Triggers sub-clause (b). |
| `investments.includes_investment_property` | Hold investment property in sole name? | boolean | yes | Triggers sub-clause (c). |
| `investments.includes_loans_receivable` | Hold loans/debts receivable? | boolean | yes | Triggers sub-clause (d). |
| `investments.forgive_debt.enabled` | Forgive a specific debt? | boolean | no | Triggers optional forgiveness sentence in (d). |
| `investments.forgive_debt.debtor_name` | Name of debtor (debt to forgive) | string | conditional |  |
| `investments.forgive_debt.amount_aud` | Amount of debt to forgive | currency (AUD) | conditional |  |
| `investments.superannuation_bdbn_status` | BDBN status | enum: `in_place` \| `intend_to_make` | yes | See Clause 8(e). Cross-link to Schedule 2. |

### Operative text

> 8.  In respect of investment and business assets forming part of my estate, I direct as follows:
>
> *(render (a) iff `investments.includes_share_portfolio`)*
>
> (a)  **SHARE PORTFOLIOS AND MANAGED FUNDS:** My Executor shall have full power to hold, sell, transfer, or otherwise deal with any listed securities, unlisted shares, managed fund interests, or exchange-traded funds forming part of my estate at such time and on such terms as my Executor in their absolute discretion thinks fit. Subject to any specific gift in Clause 5, these investments shall form part of my residuary estate.
>
> *(render (b) iff `investments.includes_private_company`)*
>
> (b)  **PRIVATE COMPANY INTERESTS:** If I hold shares or interests in any private company at the date of my death, my Executor shall be entitled to:
> (i)   Continue to hold those shares or interests as part of my estate;
> (ii)  Exercise all voting rights attached to those shares or interests;
> (iii) Sell or transfer those shares or interests (subject to any shareholders' agreement or company constitution) on such terms as my Executor thinks fit; and
> (iv)  Receive and deal with any dividends, distributions, or other income derived from those interests.
>
> *(render (c) iff `investments.includes_investment_property`)*
>
> (c)  **INVESTMENT PROPERTY:** Any real property held in my sole name as an investment (as distinct from the family home) shall, unless otherwise directed by a specific gift in Clause 5, form part of my residuary estate. My Executor shall have power to lease, manage, sell, or otherwise deal with such property.
>
> *(render (d) iff `investments.includes_loans_receivable`; final sentence iff `investments.forgive_debt.enabled`)*
>
> (d)  **LOANS AND DEBTS OWING TO ME:** I direct my Executor to collect all debts, loans, and amounts owing to me at the date of my death. [OPTIONAL: I forgive the debt of Name of debtor: `{{investments.forgive_debt.debtor_name}}` in the amount of $`{{investments.forgive_debt.amount_aud}}`.]
>
> (e)  **SUPERANNUATION:** I acknowledge that my superannuation death benefit does not automatically form part of my estate and may not be dealt with by this Will. I confirm that I `{{investments.superannuation_bdbn_status: "have" | "intend to"}}` make a Binding Death Benefit Nomination with my superannuation fund(s). My Executor is directed to take all reasonable steps to ensure my BDBN is current and valid at the date of execution of this Will and to review it periodically. [See Schedule 2 — Superannuation Summary]

---

## Clause 9 — Family Home and Real Property

**Conditional.** `include_when: real_property.has_sole_or_tic_holding = true`. Omit entirely if all property is held as joint tenants.

> **[INSTRUCTION — editor only]** Complete only the sub-clauses relevant to you. If you own real property jointly with a spouse as JOINT TENANTS, that property does not pass under your Will and you may delete this clause entirely, or retain it for any investment properties you hold as tenants in common.

### Field schema

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `real_property.family_home.address` | Property Address | string | yes |  |
| `real_property.family_home.folio_identifier` | Certificate of Title / Folio Identifier | string | no | Optional; helps locator. |
| `real_property.family_home.beneficiary_full_name` | Beneficiary Full Name | string | yes |  |
| `real_property.family_home.title_type` | Title type | enum: `sole` \| `tenants_in_common` \| `joint_tenants` | yes | If `joint_tenants`, surface warning that clause has no effect (preserved by sub-clause c). |

### Operative text

> 9.  In relation to my interest in real property held in my sole name or as a tenant in common:
>
> (a)  **FAMILY HOME:** My interest in the property known as or situated at:
>   Property Address: `{{real_property.family_home.address}}`
>   Certificate of Title / Folio Identifier (optional): `{{real_property.family_home.folio_identifier}}`
> shall be given to Full Name of Beneficiary: `{{real_property.family_home.beneficiary_full_name}}` absolutely, if they survive me by the Survivorship Period.
>
> (b)  If the named beneficiary does not survive me by the Survivorship Period, my interest in the family home shall fall into my residuary estate.
>
> (c)  **JOINT TENANCY NOTE:** If I hold the above property as a joint tenant at the date of my death, this clause shall have no effect and the property shall pass by survivorship to the remaining joint tenant(s). I acknowledge that this Will cannot override the right of survivorship in a joint tenancy.

---

## Clause 10 — Funeral and Burial Directions

**Optional.** Always *can* be included; not legally binding but morally weighty.

> **[INSTRUCTION — editor only]** Funeral directions in a Will are not legally binding but carry significant moral weight. Note that your Will may not be read until after your funeral — communicate your wishes directly to your executor and family as well. You may delete any direction that does not apply.

### Field schema

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `funeral.disposition` | Disposition preference | enum: `buried` \| `cremated` \| `no_preference` | yes |  |
| `funeral.preferred_location` | Preferred location of burial/interment | string | no |  |
| `funeral.religious_or_cultural` | Religious or cultural observances | string | no | Free text or `"None"`. |
| `funeral.other_wishes` | Any other wishes | string (long) | no |  |

### Operative text

> 10.  I express the following wishes regarding my funeral and burial (these are wishes only and are not legally binding):
>
> (a)  I wish my remains to be: `{{funeral.disposition}}`
> Preferred location or place of burial/interment (if any): `{{funeral.preferred_location}}`
>
> (b)  Religious or cultural observances:
> Specify any preferences (or 'None'): `{{funeral.religious_or_cultural}}`
>
> (c)  Any other wishes: `{{funeral.other_wishes}}`

---

## Clause 11 — General Provisions

**Always included.** Boilerplate; no user fields. App should expose values as **read-only** constants of the Will entity.

| constant | value |
|---|---|
| `survivorship_period_days` | 30 |
| `governing_law` | New South Wales, Australia |
| `executor_commission_authority` | s.86 Probate and Administration Act 1898 (NSW) |
| `trustee_act_reference` | Trustee Act 1925 (NSW) |

> 11.  The following general provisions apply to this Will:
>
> (a)  **SURVIVORSHIP:** A beneficiary must survive me by 30 days ('the Survivorship Period') to receive any gift under this Will. If a beneficiary fails to survive me by the Survivorship Period, they shall be treated as having predeceased me for the purposes of this Will.
>
> (b)  **CHILDREN:** In this Will, 'children' means my biological and legally adopted children and, where the context permits, their issue. Step-children are not included unless expressly named.
>
> (c)  **SPOUSE / DE FACTO PARTNER:** In this Will, 'spouse' means the person to whom I am legally married or with whom I am in a de facto relationship as defined by the Succession Act 2006 (NSW) at the date of my death.
>
> (d)  **EXECUTOR'S COMMISSION:** My Executor shall be entitled to claim executor's commission pursuant to section 86 of the Probate and Administration Act 1898 (NSW) from the assets of my estate, but only if my Executor is not also a beneficiary of the residuary estate or a person who would otherwise benefit from the estate.
>
> (e)  **CHARGING CLAUSE:** Any professional person (including a solicitor, accountant, or licensed trustee company) appointed as Executor or Trustee shall be entitled to charge and be paid from the estate all usual professional fees and charges for work done in connection with the administration of my estate and any trust, as if they were not a fiduciary.
>
> (f)  **GOVERNING LAW:** This Will shall be governed by and construed in accordance with the laws of New South Wales, Australia.
>
> (g)  **SEVERABILITY:** If any provision of this Will is found to be void, invalid, or unenforceable, that provision shall be severed, and the remainder of the Will shall continue in full force and effect.
>
> (h)  **TRUSTEE ACT:** The powers of my Trustee under this Will shall be in addition to, and not in derogation of, the powers conferred by the Trustee Act 1925 (NSW).

---

## Execution — Signature and Attestation

> ⚠️ **CRITICAL — DO NOT MODIFY**
>
> The following execution procedure is mandatory for a valid Will under section 6 of the Succession Act 2006 (NSW). ANY deviation may invalidate this Will. Read Section A3 of the Guidance Notes before proceeding.

**E3tate implementation note:** The execution block is for *wet-ink* signing only. The app must:
- Generate this page exactly as below.
- Require both witnesses present simultaneously (witnessing rules under s.6 Succession Act 2006 (NSW)).
- Prevent any beneficiary, or spouse/de facto/civil partner of a beneficiary, from being selected as a witness (s.10 — interested witness rule).
- Surface a final-step checklist matching the “Step-by-step execution procedure” in Part A3.3 of the source kit.

### Field schema

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `execution.date` | Date of execution | date (DD/MM/YYYY) | yes |  |
| `execution.city_suburb` | Place of execution — City/Suburb | string | yes |  |
| `witness_1.full_name` | Witness 1 — Full Name | string | yes | Must not be a beneficiary or spouse/de facto/civil partner of one. |
| `witness_1.address` | Witness 1 — Address | string | yes |  |
| `witness_1.occupation` | Witness 1 — Occupation | string | yes |  |
| `witness_1.date_signed` | Witness 1 — Date signed | date | yes |  |
| `witness_2.full_name` | Witness 2 — Full Name | string | yes | Same restrictions as Witness 1. |
| `witness_2.address` | Witness 2 — Address | string | yes |  |
| `witness_2.occupation` | Witness 2 — Occupation | string | yes |  |
| `witness_2.date_signed` | Witness 2 — Date signed | date | yes |  |

### Operative text

> SIGNED, PUBLISHED, AND DECLARED by the above-named Testator as their last Will and Testament on the date written below, in the presence of both witnesses present at the same time, who at the Testator's request and in the Testator's presence and in the presence of each other have hereunto subscribed their names as witnesses:
>
> ```
> ____________________________________________________
> TESTATOR'S SIGNATURE
> Full Legal Name: {{testator.full_legal_name}}
> Date (DD/MM/YYYY): {{execution.date}}
>
> Page Initials (each page): _______
> Place of Execution:
> City/Suburb: {{execution.city_suburb}}
> ```
>
> **ATTESTATION:** We, the undersigned, being present at the same time, witness that the above-named Testator signed the foregoing instrument as their last Will in our joint presence, and that they appeared to be of sound mind and testamentary capacity:
>
> ```
> WITNESS 1                                     WITNESS 2
> _____________________________                 _____________________________
> Signature                                     Signature
>
> Full Name: {{witness_1.full_name}}            Full Name: {{witness_2.full_name}}
> Address:   {{witness_1.address}}              Address:   {{witness_2.address}}
> Occupation:{{witness_1.occupation}}           Occupation:{{witness_2.occupation}}
> Date:      {{witness_1.date_signed}}          Date:      {{witness_2.date_signed}}
> ```
>
> ✦ **LEGAL NOTE:** Neither Witness 1 nor Witness 2 is a beneficiary under this Will, nor are they the spouse, de facto partner, or civil partner of any beneficiary. Both witnesses were present simultaneously throughout the signing of this Will.

---

## Cross-document linkage

- Specific gifts and residuary calculations should cross-check against **Schedule 1 — Asset and Liability Inventory** to detect ademption risk and ensure liquidity for cash legacies.
- Clause 8(e) (Superannuation) MUST link to **Schedule 2 — Superannuation and Insurance Summary**. Surface a warning if no BDBN is recorded.
- Where the user enables a testamentary trust, insert clauses from **Schedule 3 — Testamentary Trust Provisions** after Clause 7 and before Clause 11, renumbering the General Provisions clause accordingly.
- Digital assets are tracked in **Schedule 4** but are NOT part of the Will text.

## Validation summary (machine-readable)

```yaml
validations:
  - id: testator_age
    rule: testator.date_of_birth implies age >= 18 OR s.5 Succession Act 2006 (NSW) exception applies
  - id: residuary_option_exclusive
    rule: exactly one of residuary.option in [A, B]
  - id: residuary_b_total
    rule: residuary.option == "B" => sum(residuary.optionB.shares[].share_percent) == 100
  - id: witnesses_not_beneficiaries
    rule: witness_1.full_name and witness_2.full_name not in beneficiary_set
  - id: substitute_executor_required
    rule: executor.substitute_1.full_name is required (strongly recommended)
  - id: guardian_conditional
    rule: testator.has_minor_children == true => guardian.primary.full_name is required
  - id: vesting_age_range
    rule: residuary.option == "A" => 18 <= residuary.optionA.children_vesting_age <= 30
  - id: forgive_debt_completeness
    rule: investments.forgive_debt.enabled == true => debtor_name and amount_aud are required
```
