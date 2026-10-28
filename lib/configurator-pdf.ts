// Builds the PDF summary of a configurator build in the browser: hero image
// of the configured bike, then a card per selected part with its own image
// (the part's layer PNG, trimmed). No prices. jsPDF is loaded on demand so it
// doesn't weigh on the configurator page.
import type { jsPDF as JsPDF } from "jspdf";

export interface PdfPart {
  name: string;
  imageUrl: string | null; // layer PNG for this part
}

export interface PdfOptionGroup {
  label: string;
  parts: PdfPart[];
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
const CARD_BG: [number, number, number] = [245, 245, 245];
const CARD_BG_CSS = "#f5f5f5";

const loadImage = async (src: string) => {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  await img.decode();
  return img;
};

/** Draws an image to a canvas (downscaled to maxPx) and returns a data URL jsPDF accepts. */
async function toDataUrl(
  src: string,
  type: "image/jpeg" | "image/png",
  maxPx = 2000,
  background = "#ffffff",
): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const img = await loadImage(src);
    const scale = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    if (type === "image/jpeg") {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { data: canvas.toDataURL(type, 0.88), w: canvas.width, h: canvas.height };
  } catch {
    return null;
  }
}

/** A part's layer PNG, trimmed to its visible pixels, padded, on the card colour. */
async function partThumb(src: string): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const img = await loadImage(src);
    const scale = Math.min(1, 600 / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const src2d = document.createElement("canvas");
    src2d.width = w;
    src2d.height = h;
    const sctx = src2d.getContext("2d", { willReadFrequently: true });
    if (!sctx) return null;
    sctx.drawImage(img, 0, 0, w, h);

    // Bounding box of non-transparent pixels
    const { data } = sctx.getImageData(0, 0, w, h);
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 12) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return null; // fully transparent layer
    const bw = maxX - minX + 1;
    const bh = maxY - minY + 1;
    const pad = Math.round(Math.max(bw, bh) * 0.08);

    const out = document.createElement("canvas");
    out.width = bw + pad * 2;
    out.height = bh + pad * 2;
    const octx = out.getContext("2d");
    if (!octx) return null;
    octx.fillStyle = CARD_BG_CSS;
    octx.fillRect(0, 0, out.width, out.height);
    octx.drawImage(src2d, minX, minY, bw, bh, pad, pad, bw, bh);
    return { data: out.toDataURL("image/jpeg", 0.85), w: out.width, h: out.height };
  } catch {
    return null;
  }
}

async function buildDoc(input: ConfiguratorPdfInput): Promise<JsPDF> {
  const { modelName, imageUrl, groups, buildUrl, buildCode, customerName } = input;
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = pageW - margin * 2;
  const footerTop = pageH - 22;

  // Load everything up front, in parallel
  const parts = groups.flatMap((g) => g.parts.map((p) => ({ ...p, group: g.label })));
  const [logo, hero, ...thumbs] = await Promise.all([
    toDataUrl(LOGO_SRC, "image/png", 800),
    imageUrl ? toDataUrl(imageUrl, "image/jpeg", 2200) : Promise.resolve(null),
    ...parts.map((p) => (p.imageUrl ? partThumb(p.imageUrl) : Promise.resolve(null))),
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

  // ── Page 1: title + hero
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
  doc.text(`Energica ${modelName}`, margin, y);
  y += 4;
  // tricolore accent under the title
  const seg = 8;
  doc.setLineWidth(0.9);
  doc.setDrawColor(0, 146, 70); doc.line(margin, y, margin + seg, y);
  doc.setDrawColor(230, 230, 230); doc.line(margin + seg, y, margin + seg * 2, y);
  doc.setDrawColor(206, 43, 55); doc.line(margin + seg * 2, y, margin + seg * 3, y);
  y += 6;

  if (hero) {
    const maxH = 92;
    let w = contentW;
    let h = (hero.h / hero.w) * w;
    if (h > maxH) { h = maxH; w = (hero.w / hero.h) * h; }
    doc.addImage(hero.data, "JPEG", margin + (contentW - w) / 2, y, w, h);
    y += h + 8;
  }

  // ── Specification cards
  const sectionTitle = (title: string) => {
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`${parts.length} item${parts.length === 1 ? "" : "s"}`, pageW - margin, y, { align: "right" });
    y += 2.5;
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageW - margin, y);
    y += 5;
  };
  sectionTitle("YOUR SPECIFICATION");

  const cols = 4;
  const gap = 4;
  const cardW = (contentW - gap * (cols - 1)) / cols;
  const imgH = 27;
  const cardH = imgH + 17;
  parts.forEach((part, i) => {
    const col = i % cols;
    if (col === 0 && y + cardH > footerTop) {
      doc.addPage();
      y = header(true) + 10;
    }
    const x = margin + col * (cardW + gap);
    doc.setFillColor(...CARD_BG);
    doc.rect(x, y, cardW, cardH, "F");

    const thumb = thumbs[i];
    if (thumb) {
      const boxW = cardW - 6;
      let w = boxW;
      let h = (thumb.h / thumb.w) * w;
      if (h > imgH - 4) { h = imgH - 4; w = (thumb.w / thumb.h) * h; }
      doc.addImage(thumb.data, "JPEG", x + (cardW - w) / 2, y + 2 + (imgH - 4 - h) / 2, w, h);
    } else {
      doc.setTextColor(190, 190, 190);
      doc.setFontSize(7);
      doc.text("—", x + cardW / 2, y + imgH / 2, { align: "center" });
    }

    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.5);
    doc.line(x + 3, y + imgH + 1, x + 9, y + imgH + 1);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...GREEN);
    doc.text(part.group.toUpperCase(), x + 3, y + imgH + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    const lines = (doc.splitTextToSize(part.name, cardW - 6) as string[]).slice(0, 2);
    doc.text(lines, x + 3, y + imgH + 9.3);

    if (col === cols - 1 || i === parts.length - 1) y += cardH + gap;
  });

  // ── Footer on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    const fy = pageH - 14;
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.2);
    doc.line(margin, fy - 5, pageW - margin, fy - 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Open this build online:", margin, fy);
    doc.setTextColor(...GREEN);
    doc.textWithLink(buildUrl.replace(/^https?:\/\//, ""), margin + 33, fy, { url: buildUrl });
    doc.setTextColor(...MUTED);
    doc.text(`${p} / ${pages}`, pageW - margin, fy, { align: "right" });
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
