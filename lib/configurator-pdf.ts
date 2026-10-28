// Builds the PDF summary of a configurator build in the browser: the
// configured bike, then a specification table of the selected options.
// No prices. jsPDF is loaded on demand so it doesn't weigh on the configurator page.
import type { jsPDF as JsPDF } from "jspdf";

export interface PdfOptionGroup {
  label: string;
  parts: { name: string }[];
}

export interface ConfiguratorPdfInput {
  modelName: string;
  imageUrl: string | null; // current preview (object URL or http URL)
  groups: PdfOptionGroup[];
  buildUrl: string;
  buildCode?: string;
  customerName?: string;
}

const LOGO_SRC = "/images/Logo/energica-wordmark-tricolore-white.webp";
const GREEN: [number, number, number] = [120, 190, 32];
const INK: [number, number, number] = [18, 18, 18];
const MUTED: [number, number, number] = [120, 120, 120];
const RULE: [number, number, number] = [228, 228, 228];

/** Draws an image to a canvas (downscaled to maxPx) and returns a data URL jsPDF accepts. */
async function toDataUrl(
  src: string,
  type: "image/jpeg" | "image/png",
  maxPx = 2000,
): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    await img.decode();
    const scale = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    if (type === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { data: canvas.toDataURL(type, 0.88), w: canvas.width, h: canvas.height };
  } catch {
    return null;
  }
}

/** "EGO ROSSO CORSA" → "Ego Rosso Corsa"; keeps short codes like CNC upper-case. */
const titleCase = (s: string) =>
  s.toLowerCase().replace(/\b([a-z])([a-z]*)/g, (w, a, rest) =>
    /^(cnc|led|abs|tft|usb)$/.test(w) ? w.toUpperCase() : a.toUpperCase() + rest)
    .replace(/Esseesse9/g, "EsseEsse9");

async function buildDoc(input: ConfiguratorPdfInput): Promise<JsPDF> {
  const { modelName, imageUrl, groups, buildUrl, buildCode, customerName } = input;
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  const footerTop = pageH - 24;

  const [logo, hero] = await Promise.all([
    toDataUrl(LOGO_SRC, "image/png", 800),
    imageUrl ? toDataUrl(imageUrl, "image/jpeg", 2400) : Promise.resolve(null),
  ]);

  const header = (compact: boolean) => {
    const bandH = compact ? 14 : 24;
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageW, bandH, "F");
    const h = compact ? 5 : 7;
    if (logo) {
      doc.addImage(logo.data, "PNG", margin, (bandH - h) / 2, (logo.w / logo.h) * h, h);
    } else {
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(compact ? 11 : 16);
      doc.text("ENERGICA", margin, bandH / 2 + 2);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(170, 170, 170);
    doc.text(compact ? `Energica ${modelName} — your build` : "MODENA · ITALY", pageW - margin, bandH / 2 + 1.5, { align: "right" });
    return bandH;
  };

  // ── Title
  header(false);
  let y = 38;
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(customerName ? `PREPARED FOR ${customerName.toUpperCase()}` : "YOUR BUILD", margin, y);
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  doc.text(buildCode ? `${dateStr}  ·  Ref ${buildCode}` : dateStr, pageW - margin, y, { align: "right" });
  y += 10;
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(`Energica ${titleCase(modelName)}`, margin, y);
  y += 4;
  // tricolore accent under the title
  const seg = 8;
  doc.setLineWidth(0.9);
  doc.setDrawColor(0, 146, 70); doc.line(margin, y, margin + seg, y);
  doc.setDrawColor(230, 230, 230); doc.line(margin + seg, y, margin + seg * 2, y);
  doc.setDrawColor(206, 43, 55); doc.line(margin + seg * 2, y, margin + seg * 3, y);
  y += 6;

  // ── The configured bike
  if (hero) {
    const maxH = 112;
    let w = contentW;
    let h = (hero.h / hero.w) * w;
    if (h > maxH) { h = maxH; w = (hero.w / hero.h) * h; }
    doc.addImage(hero.data, "JPEG", margin + (contentW - w) / 2, y, w, h);
    y += h + 8;
  }

  // ── Specification table: section | selection
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("YOUR SPECIFICATION", margin, y);
  y += 3;
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);

  const labelW = 52;
  const valueX = margin + labelW;
  const valueW = contentW - labelW;
  const lineH = 5;
  groups.forEach((group) => {
    const lines = group.parts.flatMap((p) => doc.splitTextToSize(titleCase(p.name), valueW) as string[]);
    const rowH = Math.max(1, lines.length) * lineH + 5;
    if (y + rowH > footerTop) {
      doc.addPage();
      y = header(true) + 12;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...GREEN);
    doc.text(group.label.toUpperCase(), margin, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    lines.forEach((line, i) => doc.text(line, valueX, y + 6 + i * lineH));
    y += rowH;
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageW - margin, y);
  });

  // ── Footer on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    const fy = pageH - 14;
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.2);
    doc.line(margin, fy - 5, pageW - margin, fy - 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Open this build online:", margin, fy);
    doc.setTextColor(...GREEN);
    doc.textWithLink(buildUrl.replace(/^https?:\/\//, ""), margin + 33, fy, { url: buildUrl });
    if (pages > 1) {
      doc.setTextColor(...MUTED);
      doc.text(`${p} / ${pages}`, pageW - margin, fy, { align: "right" });
    }
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(6.8);
    doc.text(
      "This is a summary of your configuration, not a quotation. Pricing, availability and final specification are confirmed by your Energica dealer.",
      margin,
      fy + 5,
      { maxWidth: contentW },
    );
  }
  return doc;
}

export const pdfFileName = (modelName: string) => `Energica-${modelName.replace(/\s+/g, "-")}-build.pdf`;

/** Builds the PDF once; returns base64 (for the enquiry email) and a save() for the visitor. */
export async function createConfiguratorPdf(input: ConfiguratorPdfInput) {
  const doc = await buildDoc(input);
  const dataUri = doc.output("datauristring");
  return {
    fileName: pdfFileName(input.modelName),
    base64: dataUri.slice(dataUri.indexOf(",") + 1),
    save: () => doc.save(pdfFileName(input.modelName)),
  };
}
