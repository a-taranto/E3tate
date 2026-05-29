// Printable companion documents generated from Vault data, to attach to the
// physical/printed Will:
//   • Asset & Liability Inventory  — what the estate holds and owes
//   • Digital Assets Register      — online accounts & digital assets (NO secrets)
//
// These are NOT will clauses. The Will references them generically ("recorded in
// my Digital Assets Register, kept with this Will"); these generators turn the
// data the user has already captured in the Vault into a clean schedule-style
// annexure. jsPDF is imported dynamically so it never runs during SSR.
//
// "Generate from current data": we render whatever has been captured. Sections
// always appear (so the annexure reads like a complete schedule) and show
// "None recorded." when empty. Granular fields (BSB, BDBN, seed-phrase location,
// etc.) can be layered in later without changing this surface.

import { getWillRender } from "./willRenderer";
import {
  loadAssets,
  loadLiabilities,
  loadVaultRecords,
  type EstateAsset,
  type EstateAssetType,
  type VaultRecord,
} from "@/lib/store";
import { loadDigitalRegister, type DigitalRegister } from "@/lib/model/digitalRegister";

const fmtAUD = (n: number) =>
  n.toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });

// ---------------------------------------------------------------------------
// Shared PDF scaffold — title page chrome + a light table renderer, so both
// annexures look like one family of documents.
// ---------------------------------------------------------------------------

type Align = "left" | "right";

interface Section {
  heading: string;
  headers: string[];
  colFracs: number[]; // must sum to ~1
  aligns?: Align[];
  rows: string[][];
  note?: string; // optional caption under the heading
}

async function buildAnnexure(opts: {
  title: string;
  subtitle: string;
  intro?: string[];
  sections: Section[];
  totals?: { label: string; value: string }[];
  fileName: string;
}): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 56;
  const contentW = pageW - margin * 2;
  let y = margin;

  const ensure = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };
  const para = (text: string, lineH = 14) => {
    if (text === "") {
      y += 7;
      return;
    }
    (doc.splitTextToSize(text, contentW) as string[]).forEach((line) => {
      ensure(lineH);
      doc.text(line, margin, y);
      y += lineH;
    });
  };

  // Title block
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.text(opts.title.toUpperCase(), pageW / 2, y, { align: "center" });
  y += 22;
  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(90);
  doc.text(opts.subtitle, pageW / 2, y, { align: "center" });
  doc.setTextColor(0);
  y += 24;

  if (opts.intro?.length) {
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(70);
    opts.intro.forEach((line) => para(line, 13));
    doc.setTextColor(0);
    doc.setFont("times", "normal");
    y += 8;
  }

  const drawSection = (s: Section) => {
    ensure(46);
    // Heading bar
    doc.setFillColor(238, 240, 244);
    doc.rect(margin, y - 11, contentW, 18, "F");
    doc.setFont("times", "bold");
    doc.setFontSize(11.5);
    doc.text(s.heading, margin + 6, y + 2);
    y += 18;

    if (s.note) {
      doc.setFont("times", "italic");
      doc.setFontSize(9);
      doc.setTextColor(110);
      para(s.note, 12);
      doc.setTextColor(0);
    }

    const xs = s.colFracs.map((_, i) =>
      margin + contentW * s.colFracs.slice(0, i).reduce((a, b) => a + b, 0)
    );
    const ws = s.colFracs.map((f) => contentW * f - 6);
    const aligns = s.aligns ?? s.colFracs.map(() => "left" as Align);

    const drawRow = (cells: string[], bold: boolean) => {
      doc.setFont("times", bold ? "bold" : "normal");
      doc.setFontSize(bold ? 9.5 : 10);
      const wrapped = cells.map((c, i) => doc.splitTextToSize(c || "", ws[i]) as string[]);
      const lines = Math.max(...wrapped.map((w) => w.length), 1);
      const rowH = lines * 12 + 6;
      ensure(rowH);
      wrapped.forEach((w, i) => {
        const x = aligns[i] === "right" ? xs[i] + ws[i] : xs[i];
        w.forEach((line, li) => {
          doc.text(line, x, y + 4 + li * 12, aligns[i] === "right" ? { align: "right" } : undefined);
        });
      });
      y += rowH;
      doc.setDrawColor(225);
      doc.line(margin, y - 3, margin + contentW, y - 3);
    };

    drawRow(s.headers, true);
    if (s.rows.length === 0) {
      doc.setFont("times", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(140);
      ensure(16);
      doc.text("None recorded.", margin + 6, y + 4);
      doc.setTextColor(0);
      y += 16;
    } else {
      s.rows.forEach((r) => drawRow(r, false));
    }
    y += 12;
  };

  opts.sections.forEach(drawSection);

  if (opts.totals?.length) {
    ensure(20 + opts.totals.length * 16);
    y += 4;
    doc.setDrawColor(120);
    doc.line(margin, y - 6, margin + contentW, y - 6);
    opts.totals.forEach((t) => {
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      ensure(16);
      doc.text(t.label, margin + 6, y + 6);
      doc.text(t.value, margin + contentW, y + 6, { align: "right" });
      y += 16;
    });
  }

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text(
      `${opts.title} · Page ${p} of ${pages} · Generated by E3tate from your Vault. Confirm details before relying on this annexure.`,
      pageW / 2,
      pageH - 24,
      { align: "center" }
    );
    doc.setTextColor(0);
  }

  doc.save(opts.fileName);
}

function annexureSubtitle(): string {
  const r = getWillRender();
  const name = r.testator.name?.trim() || "the testator";
  const date = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
  return `Annexure to the Last Will and Testament of ${name} · Generated ${date}`;
}

// ---------------------------------------------------------------------------
// Annexure A — Asset & Liability Inventory
// ---------------------------------------------------------------------------

// EstateAsset.type → inventory section. Order mirrors MetaLaw Schedule 1.
const ASSET_SECTIONS: { key: string; heading: string; types: EstateAssetType[] }[] = [
  { key: "property", heading: "1. Real Property", types: ["real-property"] },
  { key: "bank", heading: "2. Bank & Financial Accounts", types: ["bank"] },
  { key: "super", heading: "3. Superannuation", types: ["super"] },
  { key: "shares", heading: "4. Shares & Investments", types: ["shares"] },
  { key: "life", heading: "5. Life Insurance", types: ["life-insurance"] },
  { key: "business", heading: "6. Business Interests", types: ["business"] },
  { key: "vehicle", heading: "7. Vehicles", types: ["vehicle"] },
  {
    key: "other",
    heading: "8. Other Assets",
    types: ["personal-effect", "ip", "debt-owed", "safe-contents", "digital", "other"],
  },
];

// Short labels + ordering for the type-specific detail fields (EstateAsset.details).
const DETAIL_LABELS: Record<string, string> = {
  ownership: "Ownership",
  title_reference: "Title",
  bsb: "BSB",
  account_number: "Acct",
  account_type: "Type",
  member_number: "Member",
  bdbn_status: "BDBN",
  bdbn_expiry: "BDBN expiry",
  nominated_beneficiary: "Beneficiary",
  policy_number: "Policy",
  policy_type: "Type",
  sum_insured: "Sum insured",
  registry_hin: "Registry/HIN",
  holding: "Holding",
  abn: "ABN/ACN",
  ownership_pct: "Ownership",
  entity_type: "Entity",
  make_model: "Make/model",
  registration: "Rego",
  year: "Year",
};
const DETAIL_ORDER = Object.keys(DETAIL_LABELS);

const prettyDetail = (key: string, v: string): string => {
  if (key === "sum_insured") {
    const n = Number(v);
    return isFinite(n) && n > 0 ? fmtAUD(n) : v;
  }
  // enum-style values (joint_tenants, non_lapsing, term_life…) → readable text
  if (/^[a-z][a-z_]*$/.test(v)) return v.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  return v;
};

function detailSummary(a: EstateAsset): string {
  const d = a.details;
  if (!d) return "";
  return DETAIL_ORDER.filter((k) => d[k])
    .map((k) => `${DETAIL_LABELS[k]}: ${prettyDetail(k, d[k])}`)
    .join(" · ");
}

function assetRow(a: EstateAsset): string[] {
  const parts = [a.description, detailSummary(a)].filter(Boolean);
  const base = parts.length ? `${a.title} — ${parts.join(" · ")}` : a.title;
  const value = a.estimatedValue != null ? fmtAUD(a.estimatedValue) : "—";
  return [a.jointlyOwned ? `${base}  (jointly owned)` : base, a.institution || "—", value];
}

export async function downloadAssetInventoryPdf(): Promise<void> {
  const assets = loadAssets();
  const liabilities = loadLiabilities();

  const sections: Section[] = ASSET_SECTIONS.map((sec) => {
    const items = assets.filter((a) => sec.types.includes(a.type));
    return {
      heading: sec.heading,
      headers: ["Description", "Institution / Where held", "Estimated value"],
      colFracs: [0.55, 0.27, 0.18],
      aligns: ["left", "left", "right"] as Align[],
      rows: items.map(assetRow),
    };
  });

  sections.push({
    heading: "9. Liabilities",
    note: "Debts the executor must settle before distributing the estate.",
    headers: ["Liability", "Lender", "Outstanding balance"],
    colFracs: [0.45, 0.32, 0.23],
    aligns: ["left", "left", "right"] as Align[],
    rows: liabilities.map((l) => [l.name, l.lender || "—", l.balance != null ? fmtAUD(l.balance) : "—"]),
  });

  // Totals: gross excludes nothing here (a full inventory), net = assets − liabilities.
  const grossAssets = assets.reduce((s, a) => s + (a.estimatedValue || 0), 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + (l.balance || 0), 0);

  await buildAnnexure({
    title: "Asset & Liability Inventory",
    subtitle: annexureSubtitle(),
    intro: [
      "A summary of the assets and liabilities of the estate, prepared to assist the executor. " +
        "Values are estimates and should be confirmed at the date of administration. Jointly owned " +
        "assets that pass by survivorship are noted and may fall outside the estate.",
    ],
    sections,
    totals: [
      { label: "Total assets (estimated)", value: fmtAUD(grossAssets) },
      { label: "Total liabilities", value: fmtAUD(totalLiabilities) },
      { label: "Net (assets − liabilities)", value: fmtAUD(grossAssets - totalLiabilities) },
    ],
    fileName: "Asset and Liability Inventory.pdf",
  });
}

// ---------------------------------------------------------------------------
// Annexure B — Digital Assets Register
// ---------------------------------------------------------------------------

// Service-created Vault records carry subtype = service category. We group them
// into the register's lettered sections. Crypto/domains/etc. captured in the
// structured digital_register are merged in alongside.
const TWO_FA_LABEL: Record<string, string> = {
  sms: "SMS",
  authenticator_app: "Authenticator app",
  hardware_key: "Hardware key",
  email: "Email",
  none: "None",
};

function twoFAFromRecord(r: VaultRecord): string {
  const m = r.metadata?.twoFactorMethod || (r.metadata?.has2FA ? "enabled" : "");
  if (!m) return "—";
  return TWO_FA_LABEL[m] || String(m);
}

function digitalAccountDetail(r: VaultRecord): string {
  return (
    r.metadata?.accountDetails ||
    r.metadata?.username ||
    r.metadata?.email ||
    r.description ||
    "—"
  );
}

export async function downloadDigitalRegisterPdf(): Promise<void> {
  const records = loadVaultRecords().filter((r) => r.serviceId || r.subtype);
  const reg = loadDigitalRegister();
  const byCat = (cats: string[]) => records.filter((r) => cats.includes(r.subtype || ""));

  const accessNote = "Stored securely in the E3tate Vault";

  // A — Online financial accounts
  const finRows: string[][] = [
    ...byCat(["financial"]).map((r) => [r.title, digitalAccountDetail(r), twoFAFromRecord(r), accessNote]),
    ...reg.financial_accounts.map((a) => [
      a.platform,
      [a.account_type, a.username_email].filter(Boolean).join(" · ") || "—",
      a.twofa_method ? TWO_FA_LABEL[a.twofa_method] || a.twofa_method : "—",
      a.access_instructions_location || accessNote,
    ]),
  ];

  // B — Cryptocurrency & digital assets of value
  const cryptoRows: string[][] = [
    ...byCat(["crypto"]).map((r) => [r.title, digitalAccountDetail(r), accessNote]),
    ...reg.crypto.map((c) => [
      c.asset_type,
      c.exchange_wallet || "—",
      c.approx_value_aud ? fmtAUD(c.approx_value_aud) : accessNote,
    ]),
  ];

  // C — Social media & online accounts
  const socialRows: string[][] = [
    ...byCat(["social"]).map((r) => [r.title, digitalAccountDetail(r), accessNote]),
    ...reg.social_media.map((s) => [s.platform, s.username_profile_url || "—", s.instruction]),
  ];

  // D — Domains, websites & intellectual property
  const domainRows: string[][] = reg.domains_ip.map((d) => [
    d.asset,
    d.registrar_platform || "—",
    d.approx_value_aud ? fmtAUD(d.approx_value_aud) : "—",
  ]);

  // E — Password manager
  const pm = reg.password_manager;
  const pmRows: string[][] =
    pm.application || pm.email_username
      ? [[pm.application || "—", pm.email_username || "—", pm.master_password_location || accessNote]]
      : [];

  // F — Other digital assets (email, cloud, photos, AI, + structured "other")
  const otherRows: string[][] = [
    ...byCat(["email", "cloud", "photos", "ai", "other"]).map((r) => [
      r.title,
      r.subtype || "—",
      digitalAccountDetail(r),
      accessNote,
    ]),
    ...reg.other.map((o) => [
      o.asset_description,
      o.platform_provider || o.category || "—",
      o.approx_value_or_points || (o.approx_value_aud ? fmtAUD(o.approx_value_aud) : "—"),
      o.instructions || accessNote,
    ]),
  ];

  const sections: Section[] = [
    {
      heading: "A. Online Financial Accounts",
      headers: ["Platform", "Account", "2FA", "Access"],
      colFracs: [0.3, 0.34, 0.16, 0.2],
      rows: finRows,
    },
    {
      heading: "B. Cryptocurrency & Digital Assets of Value",
      headers: ["Asset", "Exchange / Wallet", "Value / Access"],
      colFracs: [0.34, 0.4, 0.26],
      aligns: ["left", "left", "right"] as Align[],
      rows: cryptoRows,
    },
    {
      heading: "C. Social Media & Online Accounts",
      headers: ["Platform", "Username / Profile", "Instruction"],
      colFracs: [0.32, 0.42, 0.26],
      rows: socialRows,
    },
    {
      heading: "D. Domains, Websites & Intellectual Property",
      headers: ["Asset", "Registrar / Platform", "Estimated value"],
      colFracs: [0.36, 0.4, 0.24],
      aligns: ["left", "left", "right"] as Align[],
      rows: domainRows,
    },
    {
      heading: "E. Password Manager",
      headers: ["Application", "Account", "Master access"],
      colFracs: [0.3, 0.36, 0.34],
      rows: pmRows,
    },
    {
      heading: "F. Other Digital Assets",
      headers: ["Asset", "Category", "Detail", "Access"],
      colFracs: [0.3, 0.2, 0.3, 0.2],
      rows: otherRows,
    },
  ];

  await buildAnnexure({
    title: "Digital Assets Register",
    subtitle: annexureSubtitle(),
    intro: [
      "A register of online accounts and digital assets, prepared to assist the executor and any " +
        "authorised person. This document contains NO passwords, PINs, seed phrases, or other secrets — " +
        "access credentials are held securely in the E3tate Vault and released under its access rules.",
    ],
    sections,
    fileName: "Digital Assets Register.pdf",
  });
}
