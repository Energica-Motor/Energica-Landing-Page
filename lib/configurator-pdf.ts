// Builds a one-page PDF summary of a configurator build in the browser:
// bike image + selected options + link back to the build. No prices.
// jsPDF is loaded on demand so it doesn't weigh on the configurator page.

export interface PdfOptionGroup {
  label: string;
  options: string[];
}

export interface ConfiguratorPdfInput {
  modelName: string;
  imageUrl: string | null; // current preview (object URL or http URL)
  groups: PdfOptionGroup[];
  buildUrl: string;
}

const LOGO_SRC = "/images/Logo/energica-wordmark-tricolore-white.webp";
const GREEN: [number, number, number] = [120, 190, 32];

/** Draws an image (any browser-supported format) to a canvas and returns a data URL jsPDF accepts. */
async function toDataUrl(
  src: string,
  type: "image/jpeg" | "image/png",
): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    if (type === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    return { data: canvas.toDataURL(type, 0.9), w: img.naturalWidth, h: img.naturalHeight };
  } catch {
    return null;
  }
}

export async function downloadConfiguratorPdf({ modelName, imageUrl, groups, buildUrl }: ConfiguratorPdfInput) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = pageW - margin * 2;

  // ── Header band with wordmark
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageW, 24, "F");
  const logo = await toDataUrl(LOGO_SRC, "image/png");
  if (logo) {
    const h = 7;
    doc.addImage(logo.data, "PNG", margin, (24 - h) / 2, (logo.w / logo.h) * h, h);
  } else {
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("ENERGICA", margin, 15);
  }

  // ── Title
  let y = 38;
  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("YOUR BUILD", margin, y);
  doc.text(
    new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    pageW - margin,
    y,
    { align: "right" },
  );
  y += 9;
  doc.setTextColor(18, 18, 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(`Energica ${modelName}`, margin, y);
  y += 4;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.8);
  doc.line(margin, y, margin + 18, y);
  y += 6;

  // ── Bike image
  if (imageUrl) {
    const img = await toDataUrl(imageUrl, "image/jpeg");
    if (img) {
      const maxH = 95;
      let w = contentW;
      let h = (img.h / img.w) * w;
      if (h > maxH) { h = maxH; w = (img.w / img.h) * h; }
      doc.addImage(img.data, "JPEG", margin + (contentW - w) / 2, y, w, h);
      y += h + 6;
    }
  }

  // ── Selected options (two columns)
  doc.setTextColor(18, 18, 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SELECTED OPTIONS", margin, y);
  y += 2;
  doc.setDrawColor(224, 224, 224);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  const colW = (contentW - 8) / 2;
  const footerTop = pageH - 34;
  let colY = [y, y];
  for (const group of groups) {
    const lines = group.options.flatMap((o) => doc.splitTextToSize(`• ${o}`, colW) as string[]);
    const blockH = 5 + lines.length * 4.6 + 3;
    // Place each section in the shorter column; start a new page if neither fits.
    let col = colY[0] <= colY[1] ? 0 : 1;
    if (colY[col] + blockH > footerTop) {
      doc.addPage();
      colY = [margin, margin];
      col = 0;
    }
    const x = margin + col * (colW + 8);
    let cy = colY[col];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GREEN);
    doc.text(group.label.toUpperCase(), x, cy);
    cy += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    for (const line of lines) { doc.text(line, x, cy); cy += 4.6; }
    colY[col] = cy + 3;
  }

  // ── Footer: build link + note (on the last page)
  const fy = pageH - 26;
  doc.setDrawColor(224, 224, 224);
  doc.line(margin, fy - 5, pageW - margin, fy - 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Open this build online:", margin, fy);
  doc.setTextColor(...GREEN);
  doc.textWithLink("energicamotor.com/configurator", margin + 33, fy, { url: buildUrl });
  doc.setTextColor(140, 140, 140);
  doc.setFontSize(7.5);
  doc.text(
    "This is a summary of your configuration, not a quotation. Pricing, availability and final specification are confirmed by your Energica dealer.",
    margin,
    fy + 6,
    { maxWidth: contentW },
  );

  doc.save(`Energica-${modelName.replace(/\s+/g, "-")}-build.pdf`);
}
