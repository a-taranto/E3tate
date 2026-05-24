# Keepr-E3tate — Overview & Basic Features

**Date:** 2026-05-24

---

## 1. Executive summary

E3tate is a supplement to your Last Will & Testament. It holds details of your assets, liabilities, beneficiaries and executors so they can find what they need when a person dies.

The app must keep track of the following:

1. **ASSETS** — The app must allow a person to enter details of the assets that generally form part of an "estate":

- Real property (land and buildings) held in your sole name;
- Personal property (furniture, jewellery, vehicles, artworks, collectibles);
- Bank accounts held in your sole name;
- Shares, managed funds (including superannuation), and investment portfolios held in your sole name;
- Interests in companies, partnerships, or sole-trader businesses;
- Intellectual property rights;
- Digital assets (including cryptocurrencies);
- Debts owed to you (loans, promissory notes);
- Contents of a safe or storage facility.

2. **LIABILITIES** — The app must allow a person to enter details of their liabilities so the Executor can close them before administering the estate. Common liabilities include:

- Mortgage;
- Loans (car loan, personal loan, business loan);
- Credit cards and lines of credit;
- Tax owed.

3. **KEY PERSONS** — The app must allow a person to enter details of the key people involved:

- **Executor** — the person (or trust company) responsible for:
  - Locating your Will and applying for a Grant of Probate from the NSW Supreme Court;
  - Collecting and preserving your assets;
  - Paying your debts, taxes, and the costs of administering your estate;
  - Distributing your estate to your beneficiaries in accordance with your Will;
  - Filing any outstanding tax returns and the estate's tax return; and
  - Keeping proper accounts of the estate.
- **Trustee** — holds and manages any assets left in trust (for example, for minor children or through a testamentary trust) until they pass to the intended beneficiary.
- **Beneficiaries** — the people or organisations who inherit under the Will.
- **Guardian** — the person nominated to care for any minor children.

4. **ADMINISTERING THE ESTATE** — The app must allow a person to record how they would like their estate administered:

- Specific Gifts;
- Pecuniary (Cash) Legacies;
- Residuary Estate;
- Survivorship Conditions;
- Gifts to Minors.

5. **DIGITAL ASSETS** — The app must allow a person to provide details of their digital life, including:

- Online banking accounts;
- Investment platforms;
- Cryptocurrency;
- Email accounts;
- Social media profiles;
- Cloud storage;
- Domain names;
- Digital content libraries (e.g. music, videos);
- Loyalty points;
- Online businesses.

---

## 2. Safety & Security

E3tate holds the most sensitive details a person owns, so security is the core promise. The model has three layers: how data is stored, who may see it, and when it is released.

### 2.1 Zero-knowledge storage
- All vault records are encrypted; the platform stores ciphertext and cannot read the contents.
- Each record carries an `encrypted` flag, and uploaded documents (e.g. the will) are held with the record.

### 2.2 Access & disclosure scopes
Every record and beneficiary has a disclosure scope that controls who sees what, both before and after execution:
- **Full** — visible to all beneficiaries.
- **Executor only** — visible only to executors (e.g. identity documents, account credentials).
- **Specific** — visible only to named beneficiaries.

### 2.3 Proof of Life & execution triggers
The estate is released only when the owner can no longer manage it. This is governed by:
- **Proof-of-Life check-ins** — the owner confirms they are active on a configurable cadence (e.g. every 30 / 60 / 90 days).
- **Inactivity trigger** — if no check-in occurs within the configured window (e.g. 90 / 120 / 180 days), the release process begins.
- **Manual executor trigger** — a designated executor can initiate release (optionally requiring the consensus of multiple executors).
- **Legal-proof trigger** — release on a verified death certificate or court order.
- **Cooling-off periods** — every trigger has a cooling-off window during which a false alarm can be cancelled.
- Triggers can be **armed or disarmed** at any time; the dashboard reflects the current execution status.

### 2.4 Account security & recovery
- **Multi-factor authentication** and a register of **trusted devices**.
- **Shamir Secret Sharing** — the recovery key is split into encrypted shards distributed to trusted parties, so the vault can be recovered from a threshold of shards (e.g. any 3 of 5).
- **Encrypted backups** that can be exported and restored.

### 2.5 Audit trail
- Every meaningful action (record changes, beneficiary changes, trigger arm/disarm, settings changes, will uploads) is written to an activity log the owner can review.

> **Prototype note:** several of these — real encryption, MFA, Shamir shards, backup/restore — are described in the UI but are not yet implemented. See §4.

---

## 3. Administration

"Administration" is the executor-facing workflow that runs after the estate is released — turning the stored information into action.

### 3.1 Release
Once a trigger fires and its cooling-off period expires, the nominated executors are granted access to the records within their disclosure scope.

### 3.2 Executor checklist
Guided by the data the owner entered, the executor can:
1. **Locate the Will** — find the stored/uploaded will and the physical-original's location, then apply for a Grant of Probate (NSW Supreme Court).
2. **Inventory the estate** — work through the recorded Assets and Liabilities to establish what is owned and owed.
3. **Contact key persons** — reach the beneficiaries, co-executors, trustee, and guardian.
4. **Close liabilities** — settle mortgages, loans, cards, and taxes before distribution.
5. **Distribute** — apply the administration instructions (specific gifts, pecuniary legacies, residuary split, survivorship conditions, gifts to minors).
6. **Handle digital assets** — for each digital account, carry out the owner's chosen action (close, delete, memorialise, transfer, or download-first).
7. **Keep accounts** — record actions taken; the activity log provides the audit trail.

### 3.3 Status tracking
Before death, the estate has a **readiness score** measuring how complete the owner's preparation is. After release, the same surface becomes a **progress view** of the executor's checklist.

> **Prototype note:** the executor checklist and post-release progress view are not yet built. See §4.

---

## 4. Implementation status — gap analysis (2026-05-24)

How each requirement maps to the current app (post audit Phases 1–4). This doubles as a build roadmap.

| Requirement | In the app today | Gap to close |
|---|---|---|
| **Assets** (real property, personal effects, bank, shares/super, business, IP, debts-owed, safe contents) | Partial. The `my-estate/assets` wizard step captures property / vehicle / bank / super / crypto; the vault has a **Wallets** category for crypto. Everything is stored as generic vault records. | Assets aren't a first-class, typed model — they're folded into the 4 vault categories (documents / wallets / credentials / accounts). No structured types for IP, business interests, debts-owed, personal effects, or safe contents. |
| **Liabilities** (mortgage, loans, cards, tax) | **None.** | Entirely new — there is no liabilities concept anywhere in the data model or UI. |
| **Key Persons** (Executor, Trustee, Beneficiaries, Guardian) | Partial. Beneficiaries page manages roles `executor / beneficiary / observer / contact`; the will/create wizard has a Guardians step. | No **Trustee** role; Guardian exists only inside the will wizard, not as a managed person; executor duties/checklist aren't tracked. |
| **Administering the estate** (specific gifts, pecuniary legacies, residuary, survivorship, gifts to minors) | Partial. The will/create wizard has steps for residuary % and specific gifts, and now reads real beneficiaries. | "Add gift from vault" is gated; residuary percentages aren't persisted; pecuniary legacies, survivorship conditions, and gifts-to-minors aren't modelled. |
| **Digital assets** (banking, investment, crypto, email, social, cloud, domains, content, loyalty, businesses) | **Good.** Vault **Accounts** / **Credentials** / **Wallets** categories plus a service catalog (`lib/services.ts`: email / social / cloud / photos / ai / financial / crypto) and the `my-estate/online` step, each with a per-service wish (close, delete, transfer, …). | No structured types for domain names, loyalty points, digital content libraries, or online businesses. |
| **Safety & Security** (§2) | Partial. Disclosure scopes, Proof-of-Life + the four trigger types, arm/disarm (shared across Triggers + dashboard), and an activity log all work. | Real encryption, MFA, Shamir shards, and backup/restore are UI-gated "Coming soon"; there is no backend yet. |
| **Administration** (§3) | Minimal. The pre-death **readiness score** exists. | No post-release executor checklist or progress view; no concept of a released/active-administration state. |

### Biggest gaps, in priority order
1. **Liabilities** — a whole missing pillar; needed before the executor checklist (§3) is meaningful.
2. **A first-class Assets/Liabilities model** — the current 4-category vault can't express the structured estate inventory this spec calls for.
3. **Finish "Administering the estate"** — persist residuary %, model pecuniary legacies / survivorship / gifts-to-minors, and un-gate specific gifts.
4. **Trustee + managed Guardian** as key-person roles.
5. **Security backend** — turn the gated security features (encryption, MFA, shards, backup) from UI promises into real implementations.
