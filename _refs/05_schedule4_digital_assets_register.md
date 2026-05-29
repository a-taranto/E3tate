---
document_id: schedule4_digital_assets
title: "Schedule 4 — Digital Assets Register"
source_document: "MetaLaw Will Kit NSW 2025"
source_publisher: "Meta Law Pty Ltd (ABN 90 612 591 830)"
edition: 2025
jurisdiction: "New South Wales, Australia"
document_type: companion_schedule
forms_part_of_will: false
public_on_probate: false
related_documents:
  - partB_will_template
  - schedule1_assets_liabilities
  - schedule2_super_insurance
e3tate_role: >
  Tracks digital accounts, cryptocurrency, social media, domains, and other
  digital property to enable the executor. Storage of secrets (passwords,
  PINs, seed phrases, private keys) is EXPRESSLY forbidden in this document —
  the data model must enforce that. Credentials live in an external password
  manager; this register tracks how to reach them.
---

# Schedule 4 — Digital Assets Register

## ⚠️ Security Notice (from the source kit)

> This schedule should **NOT** contain passwords, PINs, or private cryptographic keys. Store those in a separate, encrypted password manager (e.g. 1Password, Bitwarden, LastPass) and give your executor written instructions for accessing that manager — but **NOT** the master password in this document, as Wills become public upon Probate.
>
> **For cryptocurrency:** store seed phrases and private keys in a physically secure, separate document (e.g. a sealed envelope in a safe or with your solicitor). Do NOT store them in a Will or this schedule.

**E3tate must enforce this rule.** The data model below has no field for a password or private key. The app should:
- Refuse to save any field containing what looks like a private key, mnemonic, or password.
- Run a regex/heuristic scan on free-text fields (BIP-39 wordlists, base58 keys, "password:" patterns) and warn before save.
- Even though Schedule 4 does *not* form part of the Will and does *not* become public on Probate, the app should still treat it as a sensitive document and encrypt at rest.

---

## A. Online Financial Accounts

### Field schema — `digital.financial_accounts.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `digital.financial_accounts.items[].platform` | Platform | string | yes | e.g. CommBank, ING, Stake, SelfWealth. |
| `digital.financial_accounts.items[].account_type` | Account Type | string | yes | e.g. transaction, brokerage, neobank, FX. |
| `digital.financial_accounts.items[].username_email` | Username / Email | string | yes |  |
| `digital.financial_accounts.items[].twofa_method` | 2FA Method | enum: `sms` \| `authenticator_app` \| `hardware_key` \| `email` \| `none` | yes | If `authenticator_app` or `hardware_key`, prompt for "Recovery device location" in instructions. |
| `digital.financial_accounts.items[].access_instructions_location` | Access Instructions Location | string | yes | E.g. "1Password vault 'Personal'", "Sealed envelope with solicitor". **MUST NOT contain the credentials themselves.** |

### Source layout

> | Platform | Account Type | Username / Email | 2FA Method | Access Instructions Location |
> |---|---|---|---|---|

---

## B. Cryptocurrency and Digital Assets of Value

### Field schema — `digital.crypto.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `digital.crypto.items[].asset_type` | Asset Type | string | yes | e.g. BTC, ETH, SOL. |
| `digital.crypto.items[].exchange_wallet` | Exchange / Wallet | string | yes | e.g. Coinbase, Ledger Nano X, MetaMask. |
| `digital.crypto.items[].approx_value_aud` | Approx Value AUD | currency (AUD) | yes |  |
| `digital.crypto.items[].seed_phrase_key_location` | Seed Phrase / Key Location | string | yes | **Location reference ONLY.** e.g. "Safe deposit box, NAB Pitt St"; "Sealed envelope with solicitor". App must reject inputs that look like a 12/24-word BIP-39 phrase. |
| `digital.crypto.items[].notes` | Notes | string | no | Free-text instructions. |

### Source layout

> | Asset Type (e.g. BTC, ETH) | Exchange / Wallet | Approx Value AUD | Seed Phrase / Key Location | Notes |
> |---|---|---|---|---|

### Implementation guard rails

```yaml
forbidden_in_field: digital.crypto.items[].seed_phrase_key_location
  patterns:
    - regex: "^(\\w+\\s+){11,23}\\w+$"     # 12–24 word mnemonic
    - regex: "^(0x)?[0-9a-fA-F]{64}$"      # raw hex private key
    - bip39_wordlist: any match of >= 6 consecutive words
  action: block_save_with_explanatory_modal
```

---

## C. Social Media and Online Accounts (Memorialisation / Closure)

> For each account below, indicate whether you wish it to be memorialised, closed, or transferred.

### Field schema — `digital.social_media.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `digital.social_media.items[].platform` | Platform | string | yes | e.g. Facebook, Instagram, X, LinkedIn, TikTok, YouTube. |
| `digital.social_media.items[].username_profile_url` | Username / Profile URL | string | yes |  |
| `digital.social_media.items[].instruction` | Instruction | enum: `close` \| `memorialise` \| `transfer` | yes |  |
| `digital.social_media.items[].authorised_person_notes` | Person Authorised to Act / Notes | string | no | e.g. Facebook Legacy Contact, transfer-to recipient. |

### Source layout

> | Platform | Username / Profile URL | Instruction (close/memorialise/transfer) | Person Authorised to Act / Notes |
> |---|---|---|---|

### Platform-specific E3tate hints

- **Facebook / Instagram:** Surface "Set Legacy Contact" prompt linked to Meta's tool.
- **X (Twitter):** Only closure available; "memorialise" should warn that the platform does not support it.
- **Google account (Gmail, YouTube, Drive):** Recommend setting up [Inactive Account Manager](https://myaccount.google.com/inactive) — note: do not auto-link in stored data; just surface help text.
- **Apple ID:** Recommend setting a Legacy Contact in iCloud settings.

---

## D. Domain Names, Websites, and Intellectual Property

### Field schema — `digital.domains_ip.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `digital.domains_ip.items[].asset` | Asset (domain/website/IP) | string | yes |  |
| `digital.domains_ip.items[].registrar_platform` | Registrar / Platform | string | yes | e.g. GoDaddy, Cloudflare Registrar, AWS Route53, IP Australia. |
| `digital.domains_ip.items[].approx_value_aud` | Approx Value | currency (AUD) | yes |  |
| `digital.domains_ip.items[].instructions_for_executor` | Instructions for Executor | string | yes | e.g. "Transfer domain to spouse's account", "Maintain registration for 2 years pending sale". |
| `digital.domains_ip.items[].renewal_date` | Renewal Date | date | no | Recommended; drives lapse warning. |

### Source layout

> | Asset (domain/website/IP) | Registrar / Platform | Approx Value | Instructions for Executor |
> |---|---|---|---|

---

## E. Password Manager Details

> The single most important record for the executor. Note: **never include the master password here.**

### Field schema — `digital.password_manager`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `digital.password_manager.application` | Password Manager Application | string | yes | e.g. 1Password, Bitwarden, LastPass. |
| `digital.password_manager.email_username` | Email / Username for access | string | yes |  |
| `digital.password_manager.master_password_location` | Location of master password | string | yes | Default placeholder: `"sealed envelope with solicitor — NOT in this document"`. App must reject any input that looks like an actual password. |
| `digital.password_manager.recovery_emergency_access` | Recovery / emergency access | string | yes | e.g. 1Password Emergency Kit location, Bitwarden Emergency Access contact. |

### Source layout

> | Password Manager Application | |
> | Email / Username for access | |
> | Location of master password | [e.g. sealed envelope with solicitor — NOT in this document] |
> | Recovery / emergency access | |

### Implementation guard rails

```yaml
forbidden_in_field: digital.password_manager.master_password_location
  patterns:
    - heuristic: looks_like_password    # mixed case + digit + length >= 8 and not containing words like "envelope", "safe", "solicitor"
  action: block_save_with_explanatory_modal
```

---

## F. Other Digital Assets

> Include here: loyalty and rewards programs (Qantas Points, hotel points), digital content libraries (iTunes, Kindle — note these are generally licensed, not owned), gaming accounts, NFTs, online business accounts, cloud storage (Google Drive, Dropbox, iCloud), email accounts, and any other digital property of value.

### Field schema — `digital.other.items[]`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `digital.other.items[].asset_description` | Asset Description | string | yes |  |
| `digital.other.items[].platform_provider` | Platform / Provider | string | yes |  |
| `digital.other.items[].approx_value_or_points` | Approx Value / Points | string | yes | Accept either AUD currency or a points balance (free-text). Future enhancement: structured value or points with unit. |
| `digital.other.items[].instructions` | Instructions | string | yes |  |
| `digital.other.items[].category` | Category | enum: `loyalty_program` \| `digital_content` \| `gaming` \| `nft` \| `cloud_storage` \| `email` \| `online_business` \| `other` | no | Aids filtering and reporting. |

### Source layout

> | Asset Description | Platform / Provider | Approx Value / Points | Instructions |
> |---|---|---|---|

---

## Register Maintenance

### Field schema — `digital.metadata`

| field_id | label | type | required | notes |
|---|---|---|---|---|
| `digital.metadata.last_updated` | Date of last update | date | yes | Drives annual review reminder (Schedule 2 §C). |
| `digital.metadata.updated_by` | Updated by | string | yes | Usually the testator; could be a delegated assistant. |

### Source layout

> Register last updated:
>
> | Date of last update | |
> | Updated by | |

---

## ✦ Legal note (verbatim — surface to user)

> This Schedule is a private document. It does not form part of your Will and does not become a public document upon Probate. Store it with your Will in a secure location known to your executor.

---

## Cross-document linkage

- Items here are **separate** from Schedule 1 assets, but values from §B (Crypto), §D (Domains/IP), and §F (NFTs, online businesses) should be **summed into the gross estate calculation** in Schedule 1's computed fields. The application should treat them as digital sub-categories of "Other Assets" for total-value purposes.
- Password manager details (§E) are referenced indirectly by §A (financial accounts), §C (social media), and §F (other digital). The "Access Instructions Location" field in those sections should ideally be a controlled reference to `digital.password_manager` or to a discrete physical-document record.

## Suggested derived alerts

```yaml
alerts:
  - id: domain_renewal_due
    when: any(digital.domains_ip.items[].renewal_date) <= today + 30 days
    severity: warning
  - id: password_manager_missing
    when: count(digital.financial_accounts.items[]) > 0 AND digital.password_manager.application is empty
    severity: critical
  - id: register_stale
    when: digital.metadata.last_updated < today - 365 days
    severity: info
  - id: credential_leak_detected
    when: any field matches forbidden pattern (mnemonic / private key / raw password)
    severity: critical
    action: block_save
```
