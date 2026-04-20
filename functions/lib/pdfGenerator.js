/**
 * PDF Report Generator using PDFKit.
 * Generates an in-memory PDF buffer (no filesystem required in Cloud Functions).
 */
const PDFDocument = require("pdfkit");

function generatePdf(data) {
  const {
    innovationName,
    brief,
    frustration,
    frontier,
    bridge,
    validation,
    specification,
    code,
    marketGap,
  } = data;

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 60, bottom: 60, left: 60, right: 60 },
    info: {
      Title: `MERIDIAN Discovery Report: ${innovationName}`,
      Author: "MERIDIAN — Autonomous Innovation Discovery",
    },
  });

  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  // Colors
  const C = {
    bg: "#0D1117",
    teal: "#4ECDC4",
    text: "#E6EDF3",
    muted: "#8B949E",
    red: "#E74C3C",
    green: "#27AE60",
    white: "#FFFFFF",
  };

  // === COVER PAGE ===
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bg);

  doc
    .fontSize(36)
    .fillColor(C.teal)
    .text("MERIDIAN", 60, 200, { align: "center" });

  doc
    .fontSize(14)
    .fillColor(C.muted)
    .text("Autonomous Innovation Discovery Report", { align: "center" });

  doc.moveDown(3);

  doc
    .fontSize(24)
    .fillColor(C.white)
    .text(innovationName || "Discovery", { align: "center" });

  doc.moveDown(1);

  if (bridge) {
    doc
      .fontSize(12)
      .fillColor(C.muted)
      .text(`Discovered via ${bridge.field}`, { align: "center" });
  }

  doc.moveDown(4);

  doc
    .fontSize(10)
    .fillColor(C.muted)
    .text(`Generated: ${new Date().toISOString().split("T")[0]}`, {
      align: "center",
    });

  // === THE PROBLEM ===
  doc.addPage();
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bg);

  addSectionHeader(doc, "The Real Problem", C.red);

  if (frustration) {
    addParagraph(doc, frustration.painDescription, C.text);
    doc.moveDown(0.5);

    if (frustration.soQuestionTitle) {
      addLabel(doc, "Top Question", C.muted);
      addParagraph(doc, `"${frustration.soQuestionTitle}"`, C.text);
    }

    addLabel(doc, "Why Unsolved", C.muted);
    addParagraph(doc, frustration.whyUnsolved, C.text);
  }

  // === THE BRIDGE ===
  doc.addPage();
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bg);

  addSectionHeader(doc, "The Connection Nobody Made", C.teal);

  if (bridge) {
    addLabel(doc, "Field", C.muted);
    addParagraph(doc, bridge.field, C.teal);

    addLabel(doc, "Mechanism", C.muted);
    addParagraph(doc, bridge.mechanism, C.text);

    addLabel(doc, "Structural Analogy", C.muted);
    addParagraph(doc, bridge.structuralAnalogy, C.text);

    addLabel(doc, "Translation Concept", C.muted);
    addParagraph(doc, bridge.translationConcept, C.text);
  }

  // === VALIDATION ===
  doc.addPage();
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bg);

  addSectionHeader(doc, "Real People Need This", "#6C63FF");

  if (validation?.validationEntries) {
    for (const entry of validation.validationEntries) {
      addLabel(doc, `@${entry.username} (${entry.platform})`, C.muted);
      addQuote(doc, entry.exactQuote, C.text);
      addParagraph(doc, entry.howInnovationHelps, C.muted);
      doc.moveDown(0.5);
    }
  }

  // === THE CODE ===
  doc.addPage();
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bg);

  addSectionHeader(doc, "The Code", C.green);

  if (specification) {
    addLabel(doc, "Library", C.muted);
    addParagraph(doc, `${specification.libraryName} — ${specification.oneLiner}`, C.teal);

    addLabel(doc, "Core Algorithm", C.muted);
    addParagraph(doc, specification.coreAlgorithm, C.text);
  }

  if (code) {
    addLabel(doc, "Implementation (excerpt)", C.muted);
    doc
      .font("Courier")
      .fontSize(8)
      .fillColor(C.text)
      .text(code.substring(0, 1500), { lineGap: 2 });
    doc.font("Helvetica");
  }

  // === MARKET GAP ===
  doc.addPage();
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bg);

  addSectionHeader(doc, "Market Gap", "#F39C12");

  if (marketGap) {
    if (marketGap.competitors) {
      for (const comp of marketGap.competitors) {
        addLabel(doc, comp.name, C.white);
        addParagraph(doc, `Missing: ${comp.specificGap}`, C.muted);
        doc.moveDown(0.3);
      }
    }

    addLabel(doc, "The Gap", C.muted);
    addParagraph(doc, marketGap.marketGap, C.green);
  }

  // === FOOTER ===
  doc.addPage();
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bg);

  doc.moveDown(8);
  doc
    .fontSize(18)
    .fillColor(C.teal)
    .text("MERIDIAN", { align: "center" });
  doc
    .fontSize(11)
    .fillColor(C.muted)
    .text("Autonomous Innovation Discovery System", { align: "center" });
  doc.moveDown(2);
  doc
    .fontSize(10)
    .fillColor(C.muted)
    .text("This report was generated automatically by MERIDIAN.", {
      align: "center",
    });
  doc
    .text("Built for the Agentathon 2026, April", { align: "center" });

  doc.end();

  return Buffer.concat(chunks);
}

function addSectionHeader(doc, text, color) {
  doc.fontSize(22).fillColor(color).text(text);
  doc.moveDown(0.3);
  doc
    .moveTo(60, doc.y)
    .lineTo(200, doc.y)
    .strokeColor(color)
    .lineWidth(2)
    .stroke();
  doc.moveDown(1);
}

function addLabel(doc, text, color) {
  doc
    .fontSize(9)
    .fillColor(color)
    .text(text.toUpperCase(), { characterSpacing: 1 });
  doc.moveDown(0.2);
}

function addParagraph(doc, text, color) {
  if (!text) return;
  doc.fontSize(11).fillColor(color).text(text, { lineGap: 3 });
  doc.moveDown(0.5);
}

function addQuote(doc, text, color) {
  if (!text) return;
  doc.fontSize(10).fillColor(color).text(`"${text}"`, {
    indent: 20,
    lineGap: 2,
  });
  doc.moveDown(0.3);
}

module.exports = { generatePdf };
