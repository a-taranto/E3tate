---
document_id: schedule3_testamentary_trust
title: "Schedule 3 — Testamentary Trust Provisions"
source_document: "MetaLaw Will Kit NSW 2025"
source_publisher: "Meta Law Pty Ltd (ABN 90 612 591 830)"
edition: 2025
jurisdiction: "New South Wales, Australia"
governing_law:
  - "Succession Act 2006 (NSW)"
  - "Trustee Act 1925 (NSW)"
  - "Perpetuities Act 1984 (NSW), s.8"
  - "Income Tax Assessment Act 1936 (Cth), s.102AG (Division 6AA)"
  - "Superannuation Industry (Supervision) Act 1993 (Cth)"
document_type: optional_will_addendum
forms_part_of_will: true
inserts_into_will_after: "Part B Clause 7 (Residuary Estate)"
inserts_into_will_before: "Part B Clause 11 (General Provisions)"
related_documents:
  - partB_will_template
  - schedule1_assets_liabilities
e3tate_role: >
  Optional addendum that inserts a discretionary testamentary trust into
  the Will. Driven by a recommendation engine using Schedule 1 net estate
  and beneficiary risk factors. When enabled, clauses below are renumbered
  and inserted between Part B Clause 7 and Clause 11.
---

# Schedule 3 — Testamentary Trust Provisions

## ⚠️ Mandatory Warning (from the source kit)

> This Schedule contains testamentary trust provisions of significant legal and tax complexity. Using these provisions without proper legal advice carries real risk of error, including trust provisions that fail to achieve their intended tax or asset protection purposes. Meta Law strongly recommends that you engage a qualified NSW solicitor with estate planning expertise to review and if necessary redraft these provisions for your specific circumstances.
>
> These provisions are intended for use in your Will only where **all** of the following apply:
>
> (a) your net estate is likely to exceed $500,000;
> (b) your beneficiaries include minor children or financially dependent persons, or beneficiaries with creditor/relationship risk; and
> (c) you have investment-income-producing assets (shares, property, managed funds).
>
> If you are unsure, seek advice before including this Schedule.

**E3tate must:**
- Force-display this warning before any user can enable testamentary trust provisions.
- Require an explicit acknowledgement (`testamentary_trust.acknowledged_warning = true`) before continuing.
- Strongly recommend, in-flow, that a solicitor is engaged. Provide a "Request review by solicitor" CTA.

---

## When to Use a Testamentary Trust — Decision Guide

Encode this matrix as a recommendation engine. Each row maps user-state to a recommendation strength.

| circumstance_id | circumstance | recommendation | priority |
|---|---|---|---|
| `minors_with_income_assets` | Minor children will benefit from income-producing estate assets | YES — strongly recommended | High |
| `beneficiary_creditor_risk` | Beneficiaries have creditor risk, business exposure, or bankruptcy risk | YES — strongly recommended | High |
| `beneficiary_divorce_risk` | Beneficiaries in volatile relationships (divorce risk) | YES — recommended | High |
| `beneficiary_vulnerable` | Adult children with disability or financial vulnerability | YES — recommended | High |
| `large_investment_portfolio` | Large investment portfolio (shares, property) passing to family | YES — recommended | High |
| `executive_high_net_worth` | Executive with significant accumulated wealth (>$500k estate) | YES — consider | Medium |
| `simple_estate_independent_adults` | Simple estate, financially independent adult beneficiaries, no minors | Probably not necessary | Low |
| `modest_estate` | Modest estate — costs may outweigh benefits | Consider carefully | Low |

### E3tate recommendation logic (suggested)

```yaml
testamentary_trust.recommendation:
  high_if_any:
    - has_minor_beneficiaries AND has_income_producing_assets    # → minors_with_income_assets
    - any_beneficiary.creditor_risk == true                       # → beneficiary_creditor_risk
    - any_beneficiary.relationship_risk == true                   # → beneficiary_divorce_risk
    - any_beneficiary.vulnerability == true                       # → beneficiary_vulnerable
    - schedule1.computed.net_estate_aud >= 1_000_000              # → large_investment_portfolio
  medium_if:
    - schedule1.computed.net_estate_aud >= 500_000
  low_otherwise: true
```

---

# Testamentary Trust Deed Provisions

> **Insert location:** If you elect to include testamentary trust provisions in your Will, insert the following clauses into Part B of your Will (after the Residuary Estate clause and before the General Provisions clause), replacing or supplementing the residuary trust provisions as appropriate.

**Numbering note:** All clause numbers below are shown as `[ ]` placeholders in the source kit. E3tate must renumber on insertion to follow the existing Part B sequence (next clause = 8, with subsequent clauses shifted).

---

## Clause [ ] — Establishment of Testamentary Trust

### Field schema

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `tt.surname` | Testator's surname (used in trust name) | string | yes | Drives `[Testator's Surname] Family Testamentary Trust`. Default to `testator.full_legal_name` last token. |
| `tt.trust_name_override` | Override trust name | string | no | If present, replaces the default `[Surname] Family Testamentary Trust`. |
| `tt.election_window_months` | Election window (months from Grant of Probate) | integer | yes | Source kit uses **24 months**. Allow override only with advice. |

### Operative text

> 1.  **ESTABLISHMENT:** I direct that, upon my death, such part of my residuary estate as my Trustee (in their absolute discretion) determines, or as my Executor and the Primary Beneficiary (as defined below) agree in writing within `{{tt.election_window_months}}` months of the Grant of Probate, shall be settled on the terms of the Testamentary Trust set out in this Schedule ('the Trust') rather than being distributed outright.
>
> 2.  **TRUSTEE DISCRETION:** My Trustee may establish one or more Testamentary Trusts (one per Primary Beneficiary family group if appropriate) and may determine the assets settled into each Trust. The establishment of a Testamentary Trust is at the election of the relevant beneficiary(ies) and is not mandatory. A beneficiary may elect to receive their share outright in lieu of the Trust.
>
> 3.  **TRUST NAME:** Each Testamentary Trust shall be named the `{{tt.trust_name_override OR (tt.surname + ' Family Testamentary Trust')}}` or such other name as the Trustee determines.

---

## Clause [ ] — Definitions

**No user-editable fields.** This block is statutory boilerplate.

### Constants exposed to the application

| key | value |
|---|---|
| `vesting_period_years` | 80 (Perpetuities Act 1984 (NSW) s.8) |
| `sis_act_reference` | Superannuation Industry (Supervision) Act 1993 (Cth) |
| `itaa_1936_reference` | Income Tax Assessment Act 1936 (Cth) |

### Operative text

> 4.  In this Schedule, unless the context requires otherwise:
>
> (a)  **'Primary Beneficiary'** means each of my children, or such other person as I nominate in writing, in respect of their own Testamentary Trust;
>
> (b)  **'General Beneficiaries'** means, in respect of each Testamentary Trust, the Primary Beneficiary, their spouse or de facto partner, their children and grandchildren (born or unborn), and any company, trust, or other entity controlled by or for the benefit of any of the foregoing persons;
>
> (c)  **'Income'** means income as determined in accordance with trust accounting principles and applicable taxation law;
>
> (d)  **'Capital'** means the assets settled on the Trust and any accretions thereto, including capital gains;
>
> (e)  **'Appointed Day'** means the earlier of the date on which the Trust vests and the date on which the Trust is wound up;
>
> (f)  **'Vesting Date'** means the date 80 years after the date of my death (consistent with the perpetuity period under section 8 of the Perpetuities Act 1984 (NSW));
>
> (g)  **'Trustee'** means the trustee of the relevant Testamentary Trust for the time being, being initially the person appointed under the Trustee clause below;
>
> (h)  **'SIS Act'** means the Superannuation Industry (Supervision) Act 1993 (Cth);
>
> (i)  **'ITAA 1936'** means the Income Tax Assessment Act 1936 (Cth).

---

## Clause [ ] — Trustee of Testamentary Trust

### Branch selector

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `tt.initial_trustee.option` | Initial trustee structure | enum: `A_primary_sole` \| `B_primary_plus_co` | yes | If Primary Beneficiary is a minor, Option B (or an independent trustee) is required. |
| `tt.initial_trustee.co_trustee_name` | Co-trustee Name | string | conditional | Required iff option == `B_primary_plus_co`. |

### Operative text

> 5.  **INITIAL TRUSTEE:** The initial Trustee of each Testamentary Trust shall be:
>
> *(render Option A if `tt.initial_trustee.option == "A_primary_sole"`)*
>
> **[OPTION A]** The Primary Beneficiary of that Trust, acting as sole trustee;
>
> *(render Option B if `tt.initial_trustee.option == "B_primary_plus_co"`)*
>
> **[OPTION B]** The Primary Beneficiary of that Trust together with `{{tt.initial_trustee.co_trustee_name}}` acting as co-trustees;
>
> 6.  **CHANGE OF TRUSTEE:** The Primary Beneficiary (if an adult of full legal capacity) shall have the power to remove any trustee and appoint a new trustee (including themselves as sole trustee) at any time by written instrument, without requiring the consent of any other person. This power is personal and non-delegable.
>
> 7.  **TRUSTEE PROTECTION:** A Trustee shall not be liable for any loss to the Trust arising from a bona fide exercise of a power conferred by this Schedule except in the case of fraud, wilful breach of trust, or gross negligence.

---

## Clause [ ] — Income and Capital Distribution

**No user-editable fields.** Boilerplate discretionary clauses.

### Operative text

> 8.  **INCOME — DISCRETIONARY:** In each financial year during the Trust period, the Trustee may, in their absolute discretion:
>
> (a)  Distribute all or any part of the income of the Trust to any one or more of the General Beneficiaries in such proportions as the Trustee determines;
>
> (b)  Accumulate all or any part of the income and add it to the capital of the Trust;
>
> (c)  Apply any income for the benefit of a General Beneficiary who is a minor by paying it to the minor's guardian or parent, or applying it directly for the minor's maintenance, education, and advancement.

### ✦ Tax note (verbatim — surface to user)

> **TAX NOTE:** Income distributed from a testamentary trust to a minor beneficiary is taxed at the minor's individual marginal tax rate (not the children's tax rate of 66%), under the exception in section 102AG of Division 6AA of the ITAA 1936 — provided the income is 'excepted trust income' from a testamentary trust. This can provide significant annual tax savings on investment income distributed to children. The Trustee should obtain tax advice each year to optimise distributions.

> 9.  **CAPITAL — DISCRETIONARY:** The Trustee may at any time pay, transfer, or apply capital of the Trust to or for the benefit of any one or more General Beneficiaries in such amounts and proportions as the Trustee determines in their absolute discretion.
>
> 10.  **MINOR BENEFICIARIES:** Until a minor beneficiary attains the age of 18 years, the Trustee shall not make any outright capital distribution to that beneficiary but may apply income or capital for their maintenance, education, or advancement, or accumulate it.

---

## Clause [ ] — Trustee Powers

**No user-editable fields.** Standard wide-power clause.

### Operative text

> 11.  In addition to any powers conferred by law or the general provisions of this Will, the Trustee of each Testamentary Trust shall have the following powers:
>
> (a)  **INVESTMENT:** To invest the Trust fund in any form of investment without being restricted to those authorised by the Trustee Act 1925 (NSW), including real property, listed and unlisted securities, managed funds, term deposits, and alternative assets;
>
> (b)  **BORROWING:** To borrow money and give security over Trust assets for investment purposes, subject to a prudent investor standard;
>
> (c)  **BUSINESS:** To carry on or participate in any business as part of the Trust's investments;
>
> (d)  **COMPANIES:** To incorporate, hold shares in, and manage a company to act as trustee or to hold Trust assets, and to appoint the Trustee or the Primary Beneficiary as director thereof;
>
> (e)  **RESETTLEMENT:** To transfer any part of the Trust fund to a new trust on substantially the same terms, or on such varied terms as the Trustee sees fit, for the benefit of one or more General Beneficiaries ('resettlement'), provided that such resettlement does not trigger a tax liability that would be prejudicial to the beneficiaries. *[Obtain tax advice before exercising this power];*
>
> (f)  **PROFESSIONALS:** To engage and pay solicitors, accountants, financial advisers, property managers, and other agents from the Trust fund;
>
> (g)  **INSURANCE:** To insure any Trust asset against loss or damage and to pay premiums from the Trust fund;
>
> (h)  **RECEIPTS AND DISCHARGES:** To give receipts and discharges for money paid to the Trustee; and
>
> (i)  **GENERAL:** Generally to do all such acts and things as a beneficial owner could do in relation to the Trust fund.

---

## Clause [ ] — Vesting and Termination

### Operative text

> 12.  **VESTING DATE:** Each Testamentary Trust shall vest on the earlier of:
>
> (a)  The Vesting Date (80 years from the date of my death);
>
> (b)  The date on which the Trustee determines, with the written consent of the Primary Beneficiary, to wind up the Trust;
>
> (c)  The date on which the Trust fund is exhausted; or
>
> (d)  Such earlier date as the Trustee determines in their absolute discretion.
>
> 13.  **DISTRIBUTION ON VESTING:** On the Vesting Date or upon termination, the Trustee shall distribute the Trust fund (including accumulated income) to the General Beneficiaries in such proportions as the Trustee determines, or, in default of such determination, to the Primary Beneficiary absolutely.

---

## Clause [ ] — Asset Protection

### Operative text

> 14.  The Trustee and Primary Beneficiary acknowledge that one purpose of this Testamentary Trust is to provide asset protection for General Beneficiaries. Accordingly:
>
> (a)  The Trustee shall not be required to make any distribution that would render the Trust fund, or any part of it, available to the creditors of any beneficiary;
>
> (b)  If any beneficiary becomes bankrupt or enters into any arrangement with creditors, the Trustee may suspend distributions to that beneficiary for such period as the Trustee thinks fit; and
>
> (c)  The Trustee may (but is not required to) take into account the interests of other General Beneficiaries in making distribution decisions.

### ✦ Legal note (verbatim — surface to user)

> **Note:** The asset protection effectiveness of a testamentary trust depends on correct structuring and the trust not being a 'sham'. The Trustee must act genuinely and maintain proper records. The Trust fund should not be treated as an extension of the Primary Beneficiary's personal assets. Independent legal and accounting advice is strongly recommended.

---

## Clause [ ] — Trustee Appointment of Primary Beneficiary as Trustee

### Operative text

> 15.  Notwithstanding anything else in this Schedule, where a Primary Beneficiary is appointed as sole Trustee of their own Testamentary Trust, that Primary Beneficiary/Trustee shall be entitled to:
>
> (a)  Exercise all discretions in relation to the Trust (including distribution of income and capital) in their favour or in favour of any General Beneficiary;
>
> (b)  Benefit personally from the exercise of any power; and
>
> (c)  Act in a dual capacity as both Trustee and Primary Beneficiary without thereby committing a breach of trust or conflict of interest.
>
> This clause is necessary to prevent the rule against self-dealing from invalidating distributions by a beneficiary/trustee in their own favour.

---

## Executor's Checklist for Testamentary Trust Implementation

Surface this as an **on-death** executor workflow (separate from the Will-drafting flow). Each step has state `pending` | `in_progress` | `done` and an attachment slot for evidence.

1. Obtain a Grant of Probate for the estate.
2. Consult a solicitor to prepare a Testamentary Trust Deed (separate to the Will) implementing the above provisions.
3. Apply for a Tax File Number and ABN for the Trust.
4. Open a separate bank account in the name of the Trustee of the Trust.
5. Transfer the relevant estate assets into the Trust.
6. Register the Trust with the ATO.
7. Engage an accountant to advise on income tax, CGT, and land tax implications of the Trust.
8. **Note:** The transfer of assets to a testamentary trust may trigger CGT — seek tax advice. There is generally a CGT exemption for the first 2 years after death for estate assets.
9. Prepare annual Trust tax returns (the Trust is a separate taxpayer).

### E3tate field schema — `testamentary_trust.executor_checklist.items[]`

| field_id | label | type | notes |
|---|---|---|---|
| `step` | Step number | integer | 1–9, fixed. |
| `description` | Step description | string | As above. |
| `status` | Status | enum: `pending` \| `in_progress` \| `done` | Defaults to `pending`. |
| `completed_at` | Date completed | date | Required when status = done. |
| `evidence_attachments` | Attachments | document_reference[] | e.g. Grant of Probate PDF, ABN registration certificate. |

---

## Cross-document linkage

- Enabling Schedule 3 must update Part B to insert these clauses **between Clause 7 (Residuary) and Clause 11 (General Provisions)**, with automatic renumbering.
- When enabled, the residuary clause in Part B should expose a per-beneficiary toggle: "Take share outright" vs. "Take share via Testamentary Trust" (this is the election mechanism in Clause 1).
- The 80-year vesting date and SIS Act / ITAA 1936 references are surfaced as constants so the app's glossary/explainer screens stay synchronised with the legal text.
