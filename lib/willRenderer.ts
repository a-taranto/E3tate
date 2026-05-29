// NSW Part B will renderer. Produces STRUCTURED clauses (for the on-screen
// document, the section navigator, and the PDF) from the testator profile + the
// Part B WillDocument, using the verbatim operative text from
// `_refs/01_partB_last_will_and_testament_template.md`.

import { loadProfile, loadVaultRecords } from "@/lib/store";
import { getEffectiveWillDoc } from "./model/will";
import { loadDigitalRegister } from "./model/digitalRegister";
import { loadTrust } from "./model/trust";
import { WILL_CONSTANTS, type WillDocument } from "./model/willTypes";

const BLANK = "________";
const b = (v?: string | number | null) =>
  v === undefined || v === null || v === "" ? BLANK : String(v);

function fmtDate(iso?: string): string {
  if (!iso) return BLANK;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

function money(n?: number): string {
  return typeof n === "number"
    ? n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 })
    : BLANK;
}

export interface WillClause {
  id: string;
  heading: string;
  lines: string[]; // rendered body; empty for an optional clause with no input
  complete: boolean; // has the required input
  optional: boolean; // not required for a valid will
}

export interface WillRender {
  testator: { name: string; address: string; dob: string; occupation: string };
  clauses: WillClause[];
  execution: { date: string; city: string; witness1: string; witness2: string };
}

function buildClauses(doc: WillDocument): WillClause[] {
  const ex = doc.executors ?? {};
  const g = doc.guardians ?? {};
  const gifts = doc.specific_gifts ?? [];
  const legacies = doc.cash_legacies ?? [];
  const res = doc.residuary ?? {};
  const inv = doc.investments ?? {};
  const home = doc.family_home;
  const f = doc.funeral;

  const clauses: WillClause[] = [];

  // 1 — Revocation (required boilerplate)
  clauses.push({
    id: "revocation",
    heading: "Revocation of Prior Wills",
    optional: false,
    complete: true,
    lines: [
      "I REVOKE all former Wills, codicils, and testamentary dispositions previously made by me and declare that this document is my last Will and Testament.",
    ],
  });

  // 2 — Appointment of Executor (required)
  const execLines = [
    "I APPOINT as my Executor and Trustee of this Will:",
    "",
    `(a) PRIMARY EXECUTOR — ${b(ex.primary?.full_name)}${ex.primary?.relationship ? `, my ${ex.primary.relationship}` : ""}${ex.primary?.residential_address ? `, of ${ex.primary.residential_address}` : ""}.`,
    `(b) SUBSTITUTE EXECUTOR (to act if my primary Executor is unable or unwilling to act) — ${b(ex.substitute_1?.full_name)}${ex.substitute_1?.relationship ? `, my ${ex.substitute_1.relationship}` : ""}.`,
  ];
  if (ex.substitute_2_enabled && ex.substitute_2?.full_name) {
    execLines.push(`(c) SECOND SUBSTITUTE EXECUTOR — ${b(ex.substitute_2.full_name)}.`);
  }
  execLines.push(
    "",
    "Where I appoint more than one Executor, they shall act jointly. A reference to 'my Executor' or 'my Trustee' includes any substitute or co-executor duly appointed."
  );
  clauses.push({
    id: "executor",
    heading: "Appointment of Executor",
    optional: false,
    complete: !!ex.primary?.full_name,
    lines: execLines,
  });

  // 3 — Trustee Powers. The Executor also serves as Trustee (Clause 2 appoints
  // "Executor and Trustee"); named here so the link is explicit.
  clauses.push({
    id: "trustee-powers",
    heading: "Trustee Powers",
    optional: false,
    complete: !!ex.primary?.full_name,
    lines: [
      `I GRANT to my Trustee${ex.primary?.full_name ? ` (${ex.primary.full_name}, who serves as both my Executor and Trustee under Clause 2)` : ""} all powers necessary or desirable for the administration of my estate and any trust created by this Will, including (without limitation):`,
      "(a) to sell, dispose of, mortgage, lease, or otherwise deal with any asset of my estate on such terms as my Trustee thinks fit;",
      "(b) to invest in any form of investment without being restricted to authorised trustee investments under the Trustee Act 1925 (NSW);",
      "(c) to borrow money and give security over estate or trust assets;",
      "(d) to appropriate any asset in or towards satisfaction of any legacy, share, or entitlement;",
      "(e) to apply income or capital for the maintenance, education, or advancement of any minor beneficiary;",
      "(f) to postpone the sale of any asset for such period as my Trustee thinks fit;",
      "(g) to employ and pay solicitors, accountants, and other professionals;",
      "(h) to register any investment in the names of nominees;",
      "(i) to compromise, settle, or abandon claims by or against my estate;",
      "(j) to grant receipts and give discharges; and",
      "(k) generally to do all acts that a beneficial owner could do in relation to the assets of my estate.",
    ],
  });

  // 4 — Guardian (optional; relevant for minor children)
  const guardianComplete = !!g.primary?.full_name;
  clauses.push({
    id: "guardian",
    heading: "Appointment of Guardian",
    optional: true,
    complete: guardianComplete,
    lines: guardianComplete
      ? [
          `I APPOINT ${b(g.primary?.full_name)}${g.primary?.relationship ? `, my ${g.primary.relationship}` : ""}${g.primary?.residential_address ? `, of ${g.primary.residential_address}` : ""} as Guardian of any minor child of mine living at the date of my death.`,
          ...(g.substitute?.full_name
            ? [`If the primary Guardian is unable or unwilling to act, I appoint ${g.substitute.full_name} as substitute Guardian.`]
            : []),
          "My Trustee shall pay from any trust established for a minor child's benefit such amounts as are reasonably necessary for that child's maintenance, education, and welfare.",
        ]
      : [],
  });

  // 5 — Specific Gifts (optional)
  clauses.push({
    id: "specific-gifts",
    heading: "Specific Gifts",
    optional: true,
    complete: gifts.length > 0,
    lines:
      gifts.length > 0
        ? [
            "I GIVE the following specific gifts, free of all encumbrances and estate duties (if any):",
            "",
            ...gifts.map(
              (gift) =>
                `• ${b(gift.asset_description)} — to ${b(gift.beneficiary_full_name)}${gift.relationship ? ` (${gift.relationship})` : ""}`
            ),
            "",
            "If a named beneficiary predeceases me, the specific gift to that beneficiary lapses and falls into the residuary estate, unless otherwise indicated.",
          ]
        : [],
  });

  // 6 — Cash Legacies (optional)
  clauses.push({
    id: "cash-legacies",
    heading: "Cash Legacies",
    optional: true,
    complete: legacies.length > 0,
    lines:
      legacies.length > 0
        ? [
            "I GIVE the following cash legacies, free of all estate duties (if any):",
            "",
            ...legacies.map(
              (l) =>
                `• ${money(l.amount_aud)} to ${b(l.recipient_full_name)}${l.relationship ? ` (${l.relationship})` : ""}${l.is_charity && l.abn ? ` — ABN ${l.abn}` : ""}`
            ),
          ]
        : [],
  });

  // 7 — Residuary Estate (required)
  const resComplete =
    (res.option === "A" && !!res.optionA?.spouse?.full_name) ||
    (res.option === "B" && (res.optionB?.shares?.length ?? 0) > 0);
  const resLines: string[] = [
    "I GIVE my residuary estate (everything remaining after payment of my debts, taxes, funeral and testamentary expenses, and all gifts and legacies under this Will) as follows:",
    "",
  ];
  if (res.option === "A") {
    const a = res.optionA ?? {};
    resLines.push(
      `(a) To my ${b(a.spouse_relationship)} ${b(a.spouse?.full_name)}, absolutely, if they survive me by 30 days; and`,
      `(b) if they do not, in equal shares to those of my children who attain the age of ${b(a.children_vesting_age)} years, with a deceased child's share passing to their own children (per stirpes).`
    );
  } else {
    const shares = res.optionB?.shares ?? [];
    if (shares.length > 0) {
      resLines.push("My residuary estate shall be divided as follows:", "");
      shares.forEach((s) =>
        resLines.push(`    ${b(s.share_percent)}% to ${b(s.beneficiary_full_name)}${s.relationship ? ` (${s.relationship})` : ""}`)
      );
      resLines.push(
        "",
        "Any beneficiary who does not survive me by 30 days shall be treated as having predeceased me, and their share shall fall into the residue."
      );
    } else {
      resLines.push(BLANK);
    }
  }
  clauses.push({ id: "residuary", heading: "Residuary Estate", optional: false, complete: resComplete, lines: resLines });

  // Testamentary Trust (Schedule 3) — optional addendum, inserted after the
  // residuary clause and before General Provisions when the user has enabled it.
  // Condenses the Schedule 3 operative provisions; the full deed is prepared by
  // a solicitor on death (see the executor checklist on the trust page).
  const trust = loadTrust();
  const trustName =
    trust.trust_name_override?.trim() ||
    (trust.surname?.trim() ? `${trust.surname.trim()} Family Testamentary Trust` : "[Surname] Family Testamentary Trust");
  const trusteeText =
    trust.initial_trustee_option === "B_primary_plus_co"
      ? `the Primary Beneficiary of that Trust together with ${b(trust.co_trustee_name)} acting as co-trustees`
      : "the Primary Beneficiary of that Trust, acting as sole trustee";
  clauses.push({
    id: "testamentary-trust",
    heading: "Testamentary Trust",
    optional: true,
    complete: trust.enabled,
    lines: trust.enabled
      ? [
          `(a) ESTABLISHMENT: Upon my death, such part of my residuary estate as my Trustee determines, or as my Executor and the Primary Beneficiary agree in writing within ${trust.election_window_months || 24} months of the Grant of Probate, shall be settled on the terms of the ${trustName} ("the Trust") rather than distributed outright. Establishing the Trust is at the beneficiary's election; a beneficiary may instead elect to take their share outright.`,
          "(b) PRIMARY BENEFICIARY: Each of my children (or such other person as I nominate in writing) is the Primary Beneficiary of their own Testamentary Trust. The General Beneficiaries of each Trust are the Primary Beneficiary, their spouse or de facto partner, their children and grandchildren, and entities controlled by or for any of them.",
          `(c) INITIAL TRUSTEE: The initial Trustee of each Testamentary Trust shall be ${trusteeText}. An adult Primary Beneficiary of full legal capacity may remove and appoint trustees (including themselves) by written instrument.`,
          "(d) INCOME AND CAPITAL: The Trustee may, in their absolute discretion, distribute or accumulate income and pay or apply capital to or for any one or more of the General Beneficiaries. No outright capital distribution shall be made to a beneficiary under 18 years, though income or capital may be applied for their maintenance, education, and advancement.",
          `(e) VESTING: Each Trust vests on the earlier of the date 80 years after my death (the perpetuity period under the Perpetuities Act 1984 (NSW)), the date the Trustee winds up the Trust with the Primary Beneficiary's consent, or the date the Trust fund is exhausted. On vesting, the Trustee shall distribute the Trust fund to the General Beneficiaries as they determine, or in default to the Primary Beneficiary absolutely.`,
          "(f) ASSET PROTECTION: A purpose of each Trust is to provide asset protection. The Trustee need not make any distribution that would expose the Trust fund to a beneficiary's creditors, and may suspend distributions to a beneficiary who becomes bankrupt or enters an arrangement with creditors.",
          `(g) TRUSTEE POWERS: The Trustee has the widest powers of investment and management, not restricted to authorised trustee investments under the ${WILL_CONSTANTS.trustee_act_reference}, including to invest, borrow for investment, carry on business, engage professionals, and resettle the Trust fund (subject to tax advice).`,
          "(h) TAX AND ADVICE: Income distributed from this testamentary trust to a minor is taxed at ordinary individual marginal rates as “excepted trust income” under section 102AG of the Income Tax Assessment Act 1936 (Cth), not the penalty minor rates. These provisions carry significant legal and tax complexity and should be reviewed by a qualified NSW solicitor before signing.",
        ]
      : [],
  });

  // 8 — Investment and Business Assets (optional)
  const anyInvestment =
    inv.includes_share_portfolio ||
    inv.includes_private_company ||
    inv.includes_investment_property ||
    inv.includes_loans_receivable ||
    !!inv.superannuation_bdbn_status;
  const invLines: string[] = [];
  if (anyInvestment) {
    invLines.push("In respect of investment and business assets forming part of my estate, I direct as follows:", "");
    if (inv.includes_share_portfolio)
      invLines.push("(a) My Executor may hold, sell, or transfer any listed securities, shares, or managed-fund interests; subject to any specific gift, these form part of my residuary estate.");
    if (inv.includes_private_company)
      invLines.push("(b) My Executor may hold, vote, and deal with any private company interests, subject to any shareholders' agreement or constitution.");
    if (inv.includes_investment_property)
      invLines.push("(c) Any investment property held in my sole name forms part of my residuary estate unless specifically gifted.");
    if (inv.includes_loans_receivable) {
      let d = "(d) I direct my Executor to collect all debts and amounts owing to me.";
      if (inv.forgive_debt?.enabled) d += ` I forgive the debt of ${b(inv.forgive_debt.debtor_name)} in the amount of ${money(inv.forgive_debt.amount_aud)}.`;
      invLines.push(d);
    }
    if (inv.superannuation_bdbn_status)
      invLines.push(`(e) I acknowledge my superannuation death benefit does not automatically form part of my estate; I ${inv.superannuation_bdbn_status === "in_place" ? "have" : "intend to"} make a Binding Death Benefit Nomination.`);
  }
  clauses.push({ id: "investments", heading: "Investment and Business Assets", optional: true, complete: anyInvestment, lines: invLines });

  // 9 — Family Home and Real Property (optional)
  const homeComplete = !!home && home.title_type !== "joint_tenants" && !!home.address;
  clauses.push({
    id: "family-home",
    heading: "Family Home and Real Property",
    optional: true,
    complete: homeComplete,
    lines: homeComplete
      ? [
          `My interest in the property at ${b(home!.address)}${home!.folio_identifier ? ` (Folio ${home!.folio_identifier})` : ""} shall be given to ${b(home!.beneficiary_full_name)} absolutely, if they survive me by 30 days; otherwise it shall fall into my residuary estate.`,
          "If I hold this property as a joint tenant, this clause has no effect and the property passes by survivorship.",
        ]
      : [],
  });

  // 10 — Funeral and Burial Directions (optional)
  const dispositionText =
    f?.disposition === "buried" ? "buried" : f?.disposition === "cremated" ? "cremated" : f?.disposition === "no_preference" ? "dealt with at my Executor's discretion" : undefined;
  const funeralComplete = !!(dispositionText || f?.preferred_location || f?.religious_or_cultural || f?.other_wishes);
  const funeralLines: string[] = [];
  if (funeralComplete) {
    funeralLines.push("I express the following wishes regarding my funeral and burial (these are wishes only and are not legally binding):", "");
    if (dispositionText) funeralLines.push(`I wish my remains to be ${dispositionText}.`);
    if (f?.preferred_location) funeralLines.push(`Preferred location: ${f.preferred_location}`);
    if (f?.religious_or_cultural) funeralLines.push(`Religious or cultural observances: ${f.religious_or_cultural}`);
    if (f?.other_wishes) funeralLines.push(`Other wishes: ${f.other_wishes}`);
  }
  clauses.push({ id: "funeral", heading: "Funeral and Burial Directions", optional: true, complete: funeralComplete, lines: funeralLines });

  // Digital assets & records — references the Digital Assets Register (an
  // annexure generated from the Vault and kept with the Will). Generic wording,
  // no internal "Schedule" numbering.
  const vaultDigital = loadVaultRecords().filter(
    (r) => r.type === "wallets" || r.type === "credentials" || r.type === "accounts"
  ).length;
  const dr = loadDigitalRegister();
  const digitalCount =
    vaultDigital +
    dr.crypto.length +
    dr.financial_accounts.length +
    dr.social_media.length +
    dr.domains_ip.length +
    dr.other.length;
  clauses.push({
    id: "digital-assets",
    heading: "Digital Assets and Records",
    optional: true,
    complete: digitalCount > 0,
    lines:
      digitalCount > 0
        ? [
            "My digital accounts, cryptocurrency, online services, and the means to access them are recorded in my Digital Assets Register, which is kept with this Will and stored securely in my E3tate Vault.",
            "This register does not form part of this Will and does not become public on probate. I direct my Executor to refer to it to identify, access, and deal with my digital assets in accordance with my recorded wishes.",
            `${digitalCount} digital record${digitalCount === 1 ? "" : "s"} ${digitalCount === 1 ? "is" : "are"} currently held in my Vault.`,
          ]
        : [],
  });

  // 11 — General Provisions (required boilerplate)
  clauses.push({
    id: "general-provisions",
    heading: "General Provisions",
    optional: false,
    complete: true,
    lines: [
      `(a) SURVIVORSHIP: A beneficiary must survive me by ${WILL_CONSTANTS.survivorship_period_days} days to receive any gift under this Will.`,
      "(b) CHILDREN: 'children' means my biological and legally adopted children; step-children are not included unless expressly named.",
      "(c) SPOUSE: 'spouse' means the person to whom I am legally married or in a de facto relationship under the Succession Act 2006 (NSW) at my death.",
      `(d) EXECUTOR'S COMMISSION: My Executor may claim commission under ${WILL_CONSTANTS.executor_commission_authority}, unless they are a residuary beneficiary.`,
      "(e) CHARGING: A professional appointed as Executor or Trustee may charge usual professional fees.",
      `(f) GOVERNING LAW: This Will is governed by the laws of ${WILL_CONSTANTS.governing_law}.`,
      "(g) SEVERABILITY: If any provision is void or unenforceable, it is severed and the remainder continues in force.",
      `(h) TRUSTEE ACT: My Trustee's powers are in addition to those conferred by the ${WILL_CONSTANTS.trustee_act_reference}.`,
    ],
  });

  return clauses;
}

export function getWillRender(): WillRender {
  const p = loadProfile();
  const doc = getEffectiveWillDoc();
  return {
    testator: {
      name: b(p.fullName),
      address: b(p.address),
      dob: fmtDate(p.dateOfBirth),
      occupation: b(p.occupation),
    },
    clauses: buildClauses(doc),
    execution: {
      date: fmtDate(doc.execution?.date),
      city: b(doc.execution?.city_suburb),
      witness1: b(doc.execution?.witness_1?.full_name),
      witness2: b(doc.execution?.witness_2?.full_name),
    },
  };
}

// Clauses that appear in the final document: all required ones, plus optional
// ones that have input.
export function includedClauses(r: WillRender): WillClause[] {
  return r.clauses.filter((c) => !c.optional || c.complete);
}

// Flatten the structured render to a plain-text document (for the preview modal).
export function renderWillText(): string {
  const r = getWillRender();
  const out: string[] = [
    "LAST WILL AND TESTAMENT",
    `of ${r.testator.name}, of ${r.testator.address}`,
    `Born ${r.testator.dob} · ${r.testator.occupation}`,
    "",
  ];
  includedClauses(r).forEach((c, i) => {
    out.push(`${i + 1}. ${c.heading.toUpperCase()}`, ...c.lines, "");
  });
  out.push(
    "EXECUTION",
    `Testator: ${r.testator.name}   Date: ${r.execution.date}   Place: ${r.execution.city}`,
    `Witness 1: ${r.execution.witness1}   Witness 2: ${r.execution.witness2}`,
    "",
    "Governed by the laws of New South Wales, Australia. Have a solicitor review before signing."
  );
  return out.join("\n");
}
