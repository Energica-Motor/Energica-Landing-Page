// Draws the three-page build sheet with jsPDF from prepared content and
// images. Pure: no DOM access, so it also runs in tests. All geometry and
// colours come from ./layout.
import { jsPDF } from "jspdf";
import type { BuildSheetContent, Marker, SheetRow } from "./catalog";
import { performanceFor } from "./specs";
import {
  ACCENT, BUILD, CLOSING, COLOR, CONTENT_W, COVER, FONT_FILES, HEADER, PAGE, PERF, RIGHT, SECTION, TEXT,
  TRICOLOUR_RULE, type FontKey, type TextStyle,
} from "./layout";

export interface ImageAsset { data: string; w: number; h: number; format: "PNG" | "JPEG" }

export interface SheetAssets {
  fonts: Record<FontKey, string>; // base64 TTF
  logo?: ImageAsset | null; // white wordmark for dark bands
  hero?: ImageAsset | null; // cover panel below the masthead, render blended onto the paper
  crops?: Record<string, ImageAsset>; // by SheetRow.optionId || catalogKey
}

export interface SheetInput {
  content: BuildSheetContent;
  customerName?: string;
  buildCode: string;
  buildUrl: string;
  date: Date;
}

export interface DrawnText { page: number; text: string; x: number; width: number }

const PX_TO_PT = 0.75;

export function renderBuildSheet(input: SheetInput, assets: SheetAssets) {
  const { content, buildCode, buildUrl, date } = input;
  const doc = new jsPDF({ unit: "px", format: "a4", hotfixes: ["px_scaling"], compress: true });
  const log: DrawnText[] = [];
  const page = () => doc.getCurrentPageInfo().pageNumber;

  for (const [key, file] of Object.entries(FONT_FILES)) {
    if (!assets.fonts[key as FontKey]) throw new Error(`[build-sheet] missing font ${file}`);
    doc.addFileToVFS(file, assets.fonts[key as FontKey]);
    doc.addFont(file, key, "normal");
  }
  doc.setProperties({
    title: `Energica ${content.modelName} build ${buildCode}`,
    subject: "Energica configurator build sheet",
    keywords: `BUILDREF:${buildCode}`,
    creator: "energicamotor.com",
  });

  // ── Text helpers (letter-spacing aware) ────────────────────────────────
  const applyStyle = (s: TextStyle, size = s.size) => {
    doc.setFont(s.font, "normal");
    doc.setFontSize(size * PX_TO_PT);
    doc.setTextColor(s.color);
  };
  const spacing = (s: TextStyle, size = s.size) => (s.tracking ?? 0) * size;
  const widthOf = (text: string, s: TextStyle, size = s.size) => {
    applyStyle(s, size);
    return doc.getTextWidth(text) + spacing(s, size) * Math.max(0, text.length - 1);
  };
  const text = (str: string, x: number, y: number, s: TextStyle, opts: { align?: "left" | "right"; size?: number; color?: string } = {}) => {
    const size = opts.size ?? s.size;
    const w = widthOf(str, s, size);
    if (opts.color) doc.setTextColor(opts.color);
    const left = opts.align === "right" ? x - w : x;
    doc.text(str, left, y, { charSpace: spacing(s, size) });
    log.push({ page: page(), text: str, x: left, width: w });
    return w;
  };
  /** Shortens with an ellipsis until it fits maxW. */
  const fit = (str: string, s: TextStyle, maxW: number, size = s.size) => {
    if (widthOf(str, s, size) <= maxW) return str;
    let t = str;
    while (t.length > 1 && widthOf(`${t}…`, s, size) > maxW) t = t.slice(0, -1).trimEnd();
    return `${t}…`;
  };
  const wrap = (str: string, s: TextStyle, maxW: number): string[] => {
    applyStyle(s);
    return doc.splitTextToSize(str, maxW) as string[];
  };

  const rect = (x: number, y: number, w: number, h: number, fill: string) => {
    doc.setFillColor(fill);
    doc.rect(x, y, w, h, "F");
  };
  const hline = (x1: number, x2: number, y: number, color: string, weight = 1) => {
    doc.setDrawColor(color);
    doc.setLineWidth(weight);
    doc.line(x1, y, x2, y);
  };
  const tricolour = (x: number, y: number, w: number, h: number) => {
    COLOR.tricolour.forEach((c, i) => rect(x + (w / 3) * i, y, w / 3, h, c));
  };
  const logoH = (w: number) => (assets.logo ? (assets.logo.h / assets.logo.w) * w : 0);
  const logo = (x: number, y: number, w: number) => {
    if (!assets.logo) return;
    doc.addImage(assets.logo.data, assets.logo.format, x, y, w, logoH(w), "logo", "FAST");
  };
  const versionLabel = content.version === "RS" ? "RS" : content.version === "Standard" ? "STANDARD" : "";
  const darkHeader = () => {
    rect(0, 0, PAGE.w, HEADER.h, COLOR.ink);
    logo(PAGE.pad, (HEADER.h - logoH(HEADER.logoW)) / 2, HEADER.logoW);
    const right = [content.modelName.toUpperCase(), versionLabel].filter(Boolean).join(" ") + ` · REF ${buildCode.toUpperCase()}`;
    text(right, RIGHT, HEADER.h / 2 + 4, TEXT.labelDark, { align: "right" });
  };
  const sectionTitle = (kicker: string, heading: string, kickerY: number, headingY: number, accentY: number, size: number = TEXT.heading.size) => {
    text(kicker, PAGE.pad, kickerY, TEXT.label);
    text(heading, PAGE.pad, headingY, TEXT.heading, { size });
    rect(PAGE.pad, accentY, ACCENT.w, ACCENT.h, COLOR.green);
  };
  const shortUrl = buildUrl.replace(/^https?:\/\//, "").toUpperCase();
  const dateStr = date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  // ══ Page 1: cover ═══════════════════════════════════════════════════════
  rect(0, 0, PAGE.w, PAGE.h, COLOR.paper);
  rect(0, 0, PAGE.w, COVER.mastheadH, COLOR.ink);
  logo(PAGE.pad, COVER.logoTop, COVER.logoW);
  text("MODENA · ITALY", RIGHT, COVER.cornerBaseline, TEXT.labelDark, { align: "right" });
  if (input.customerName?.trim()) {
    const prepared = fit(`PREPARED FOR ${input.customerName.trim().toUpperCase()}`, TEXT.labelDark, CONTENT_W);
    text(prepared, PAGE.pad, COVER.preparedBaseline, TEXT.labelDark);
  }
  // Model name, shrunk to fit the width
  const titleStyle: TextStyle = { font: COVER.title.font, size: COVER.title.size, color: COVER.title.color };
  const title = content.modelName.toUpperCase();
  let titleSize: number = COVER.title.size;
  while (titleSize > COVER.title.minSize && widthOf(title, titleStyle, titleSize) > CONTENT_W) titleSize -= 2;
  text(fit(title, titleStyle, CONTENT_W, titleSize), PAGE.pad, COVER.title.baseline, titleStyle, { size: titleSize });
  // Version (green) + colourway
  const versionStyle: TextStyle = { font: COVER.version.font, size: COVER.version.size, color: COLOR.green };
  let vx: number = PAGE.pad;
  if (content.version === "RS") vx += text("RS", vx, COVER.version.baseline, versionStyle) + COVER.version.gap;
  if (content.colourway) {
    text(fit(content.colourway, versionStyle, RIGHT - vx), vx, COVER.version.baseline, versionStyle, { color: "#D9DBDD" });
  }
  tricolour(PAGE.pad, COVER.tricolourY, TRICOLOUR_RULE.w, TRICOLOUR_RULE.h);

  // The hero asset is the whole panel below the masthead, bike already placed
  if (assets.hero) {
    doc.addImage(assets.hero.data, assets.hero.format, 0, COVER.mastheadH, PAGE.w, PAGE.h - COVER.mastheadH, "hero", "FAST");
  }

  hline(PAGE.pad, RIGHT, COVER.stripRuleY, COLOR.rowRule);
  const coverCells = [
    { label: "COLOURWAY", value: content.colourway },
    { label: "VERSION", value: content.version ?? "" },
    { label: "CONFIGURED", value: dateStr },
    { label: "BUILD REF", value: buildCode.toUpperCase() },
  ].filter((c) => c.value);
  const coverColW = CONTENT_W / coverCells.length;
  coverCells.forEach((c, i) => {
    const x = PAGE.pad + coverColW * i;
    text(c.label, x, COVER.stripLabelY, TEXT.label);
    text(fit(c.value, TEXT.value, coverColW - 12), x, COVER.stripValueY, TEXT.value);
  });
  text(shortUrl, PAGE.pad, COVER.footerY, TEXT.label);
  text("01 / 03", RIGHT, COVER.footerY, TEXT.label, { align: "right" });

  // ══ Page 2: your build ══════════════════════════════════════════════════
  doc.addPage();
  rect(0, 0, PAGE.w, PAGE.h, COLOR.paper);
  darkHeader();
  sectionTitle("01 / CONFIGURATION", "YOUR BUILD", SECTION.kickerY, SECTION.headingBaseline, SECTION.accentY);

  const boxTop = BUILD.footerY - 28 - BUILD.box.h;
  const sectionHeadH = BUILD.sectionLabelToRule + 1;
  const sections = [
    { label: "BASE SPECIFICATION", rows: content.base, count: false },
    { label: "SELECTED UPGRADES", rows: content.upgrades, count: true },
  ].filter((s) => s.rows.length > 0);
  const totalRows = sections.reduce((n, s) => n + s.rows.length, 0);
  const fixedH = sections.length * sectionHeadH + (sections.length - 1) * BUILD.sectionGap;
  const available = boxTop - BUILD.box.gap - BUILD.firstSectionY - fixedH;
  const rowH = Math.max(BUILD.row.minH, Math.min(BUILD.row.maxH, available / Math.max(1, totalRows)));
  const thumb = Math.min(BUILD.row.thumbMax, rowH - BUILD.row.thumbPad * 2 + 8);
  const compact = rowH < 64;

  const marker = (m: Marker, cy: number) => {
    if (!m) return;
    if (m.kind === "plus") {
      text("+", RIGHT, cy + 4, TEXT.labelGreen, { align: "right" });
      return;
    }
    const { markerW: w, markerH: h } = BUILD.row;
    const x = RIGHT - w;
    m.colors.forEach((c, i) => rect(x + (w / m.colors.length) * i, cy - h / 2, w / m.colors.length, h, c));
    // Outline chips with a light colour so they stand off the paper
    const light = (hex: string) => parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) + parseInt(hex.slice(5, 7), 16) > 600;
    if (m.colors.some(light)) {
      doc.setDrawColor(COLOR.chipOutline);
      doc.setLineWidth(0.75);
      doc.rect(x, cy - h / 2, w, h, "S");
    }
  };
  const row = (r: SheetRow, top: number) => {
    const cy = top + rowH / 2;
    const crop = assets.crops?.[r.optionId || r.catalogKey] ?? assets.crops?.[r.catalogKey];
    if (crop) doc.addImage(crop.data, crop.format, PAGE.pad, cy - thumb / 2, thumb, thumb, `crop-${r.optionId || r.catalogKey}`, "FAST");
    text(r.label, BUILD.row.labelX, cy + 3.5, TEXT.rowLabel);
    const tx = BUILD.row.titleX;
    const maxW = RIGHT - BUILD.row.markerW - 16 - tx;
    const titleSize = compact ? 14 : TEXT.rowTitle.size;
    const descSize = compact ? 11.5 : TEXT.rowDesc.size;
    if (r.description) {
      text(fit(r.title, TEXT.rowTitle, maxW, titleSize), tx, cy - (compact ? 2 : 3), TEXT.rowTitle, { size: titleSize });
      text(fit(r.description, TEXT.rowDesc, maxW, descSize), tx, cy + (compact ? 13 : 17), TEXT.rowDesc, { size: descSize });
    } else {
      text(fit(r.title, TEXT.rowTitle, maxW, titleSize), tx, cy + 5, TEXT.rowTitle, { size: titleSize });
    }
    marker(r.marker, cy);
    hline(PAGE.pad, RIGHT, top + rowH, COLOR.rowRule, 0.75);
  };

  let y: number = BUILD.firstSectionY;
  sections.forEach((s, i) => {
    if (i > 0) y += BUILD.sectionGap;
    text(s.label, PAGE.pad, y, TEXT.label);
    if (s.count) text(`${s.rows.length} ITEM${s.rows.length === 1 ? "" : "S"}`, RIGHT, y, TEXT.labelGreen, { align: "right" });
    y += BUILD.sectionLabelToRule;
    hline(PAGE.pad, RIGHT, y, COLOR.sectionRule, 1);
    y += 1;
    s.rows.forEach((r) => { row(r, y); y += rowH; });
  });

  // "What happens next" box
  doc.setFillColor(COLOR.white);
  doc.setDrawColor(COLOR.boxBorder);
  doc.setLineWidth(1);
  doc.rect(PAGE.pad, boxTop, CONTENT_W, BUILD.box.h, "FD");
  const bx = PAGE.pad + BUILD.box.padX;
  text("WHAT HAPPENS NEXT", bx, boxTop + BUILD.box.labelY, TEXT.label);
  wrap(
    "Your build has been shared with our sales team. An Energica representative will contact you shortly to discuss pricing, availability and delivery.",
    { ...TEXT.rowDesc, size: 13.5, color: COLOR.text },
    BUILD.box.textW,
  ).slice(0, 3).forEach((line, i) => text(line, bx, boxTop + BUILD.box.textY + i * 18, { ...TEXT.rowDesc, size: 13.5, color: COLOR.text }));
  text("WE WILL BE IN TOUCH", RIGHT - BUILD.box.padX, boxTop + BUILD.box.h / 2 + 9, { font: "condSemi", size: BUILD.box.calloutSize, color: COLOR.greenText }, { align: "right" });

  text(`CONFIGURED ${dateStr.toUpperCase()}`, PAGE.pad, BUILD.footerY, TEXT.label);
  text("02 / 03", RIGHT, BUILD.footerY, TEXT.label, { align: "right" });

  // ══ Page 3: performance and next steps ══════════════════════════════════
  doc.addPage();
  rect(0, 0, PAGE.w, PAGE.h, COLOR.paper);
  darkHeader();
  sectionTitle("02 / PERFORMANCE", "WHAT IT DELIVERS", SECTION.kickerY, SECTION.headingBaseline, SECTION.accentY);

  const perf = performanceFor(content.model, content.modelName, content.version);
  hline(PAGE.pad, RIGHT, PERF.gridTopY, COLOR.sectionRule, 1);
  const half = CONTENT_W / 2;
  perf.grid.forEach((cell, i) => {
    const col = i % 2;
    const r = Math.floor(i / 2);
    const x = PAGE.pad + col * half + (col ? 24 : 0);
    const top = PERF.gridTopY + r * PERF.cellH;
    text(cell.label, x, top + PERF.cellLabelDy, TEXT.label);
    const fw = text(cell.figure.value, x, top + PERF.cellFigureDy, TEXT.figure);
    text(cell.figure.unit, x + fw + PERF.unitGap, top + PERF.cellFigureDy, TEXT.unit);
  });
  const gridRows = Math.ceil(perf.grid.length / 2);
  for (let r = 1; r <= gridRows; r++) hline(PAGE.pad, RIGHT, PERF.gridTopY + r * PERF.cellH, COLOR.rowRule, 0.75);
  doc.setDrawColor(COLOR.rowRule);
  doc.setLineWidth(0.75);
  doc.line(PAGE.pad + half, PERF.gridTopY, PAGE.pad + half, PERF.gridTopY + gridRows * PERF.cellH);

  let py = PERF.gridTopY + gridRows * PERF.cellH;
  if (perf.strip.length) {
    const colW = CONTENT_W / perf.strip.length;
    perf.strip.forEach((c, i) => {
      const x = PAGE.pad + colW * i;
      text(c.label, x, py + PERF.stripLabelDy, TEXT.label);
      text(fit(c.value, TEXT.value, colW - 12), x, py + PERF.stripValueDy, TEXT.value);
    });
    py += PERF.stripH;
    hline(PAGE.pad, RIGHT, py, COLOR.rowRule, 0.75);
  }
  py += PERF.noteDy;
  wrap(perf.note, TEXT.note, CONTENT_W).forEach((line, i) => text(line, PAGE.pad, py + i * 14, TEXT.note));

  py += PERF.nextKickerGap;
  sectionTitle("03 / WHAT HAPPENS NEXT", "WE WILL BE IN TOUCH", py, py + PERF.nextHeadingDy, py + PERF.nextHeadingDy + PERF.nextAccentDy, PERF.nextHeadingSize);
  py += PERF.nextHeadingDy + PERF.nextAccentDy + PERF.nextRuleDy;
  hline(PAGE.pad, PAGE.pad + PERF.nextRuleW, py, COLOR.sectionRule, 1);
  py += PERF.nextTextDy;
  wrap(
    `You can expect a call from our support team or a sales representative regarding your ${content.modelName} build.`,
    TEXT.body,
    PERF.nextTextW,
  ).forEach((line, i) => text(line, PAGE.pad, py + i * PERF.nextLineH, TEXT.body));

  // Closing band
  rect(0, CLOSING.top, PAGE.w, PAGE.h - CLOSING.top, COLOR.ink);
  const wm: TextStyle = { font: CLOSING.watermark.font, size: CLOSING.watermark.size, color: COLOR.watermark };
  text(buildCode.toUpperCase(), RIGHT, CLOSING.watermark.baseline, wm, { align: "right" });
  logo(PAGE.pad, CLOSING.logoY, CLOSING.logoW);
  text("03 / 03", RIGHT, CLOSING.pageNoY, TEXT.labelDark, { align: "right" });
  wrap(
    "This sheet summarises your configuration and is not a quotation. Pricing, availability and final specification will be shared by your Energica dealer or sales representative.",
    TEXT.disclaimer,
    CLOSING.disclaimerW,
  ).forEach((line, i) => text(line, PAGE.pad, CLOSING.disclaimerY + i * CLOSING.disclaimerLineH, TEXT.disclaimer));
  text(`${shortUrl} · MODENA · ITALY`, PAGE.pad, CLOSING.urlY, TEXT.labelDark);

  // Clickable build link on every page footer
  for (let p = 1; p <= doc.getNumberOfPages(); p++) {
    doc.setPage(p);
    const y0 = p === 3 ? CLOSING.urlY : p === 1 ? COVER.footerY : BUILD.footerY;
    if (p !== 2) doc.link(PAGE.pad, y0 - 10, 260, 14, { url: buildUrl });
  }
  doc.setPage(doc.getNumberOfPages());

  return { doc, log };
}
