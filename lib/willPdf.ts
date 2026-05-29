// Client-side PDF of the will document, generated from the structured render.
// jsPDF is imported dynamically so it never runs during SSR.

import { getWillRender, includedClauses } from "./willRenderer";

export async function downloadWillPdf(): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const r = getWillRender();
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
  const para = (text: string, lineH = 15) => {
    if (text === "") {
      y += 8;
      return;
    }
    (doc.splitTextToSize(text, contentW) as string[]).forEach((line) => {
      ensure(lineH);
      doc.text(line, margin, y);
      y += lineH;
    });
  };

  // Title + testator
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text("LAST WILL AND TESTAMENT", pageW / 2, y, { align: "center" });
  y += 28;
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  para(`of ${r.testator.name}, of ${r.testator.address};`);
  para(`born ${r.testator.dob}; occupation ${r.testator.occupation}.`);
  y += 12;

  // Clauses (only those in the final document), renumbered
  includedClauses(r).forEach((c, i) => {
    ensure(30);
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    para(`${i + 1}. ${c.heading.toUpperCase()}`, 18);
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    c.lines.forEach((line) => para(line));
    y += 12;
  });

  // Execution / attestation
  ensure(40);
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  para("EXECUTION", 18);
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  [
    "Signed by the testator as their last Will in the presence of both witnesses present at the same time, who signed in the testator's presence and in the presence of each other:",
    "",
    `Testator: ${r.testator.name}`,
    `Date: ${r.execution.date}     Place: ${r.execution.city}`,
    "",
    `Witness 1: ${r.execution.witness1}`,
    `Witness 2: ${r.execution.witness2}`,
    "",
    "Neither witness is a beneficiary under this Will, nor the spouse, de facto partner, or civil partner of any beneficiary.",
  ].forEach((line) => para(line));

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text(
      `Page ${p} of ${pages}  ·  Governed by the laws of New South Wales, Australia  ·  Have a solicitor review before signing.`,
      pageW / 2,
      pageH - 24,
      { align: "center" }
    );
    doc.setTextColor(0);
  }

  doc.save("Last Will and Testament.pdf");
}
