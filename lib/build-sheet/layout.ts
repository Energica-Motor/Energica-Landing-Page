// Every coordinate, size and colour used by the build-sheet PDF.
// Units are CSS px on a 794 x 1123 A4 page (jsPDF "px" unit with px_scaling);
// font sizes are CSS px too and converted to pt when drawn.

export const PAGE = { w: 794, h: 1123, pad: 48 } as const;
export const CONTENT_W = PAGE.w - PAGE.pad * 2;
export const RIGHT = PAGE.w - PAGE.pad;

export const COLOR = {
  ink: "#0F1012",
  paper: "#F2F2F0",
  text: "#141517",
  secondary: "#4A4E52",
  label: "#5E6266",
  labelOnDark: "#A3A7AC",
  sectionRule: "#141517",
  rowRule: "#D3D5D7",
  green: "#78BE20",
  greenText: "#3F6B10",
  tricolour: ["#009246", "#F1F2F1", "#CE2B37"],
  watermark: "#1E2023",
  white: "#FFFFFF",
  boxBorder: "#C9CBCD",
  chipOutline: "#B9BCBF", // around chips containing white
} as const;

// Font keys registered with jsPDF → file in /public/fonts/build-sheet
export const FONT_FILES = {
  condSemi: "BarlowCondensed-SemiBold.ttf",
  condBold: "BarlowCondensed-Bold.ttf",
  sans: "IBMPlexSans-Regular.ttf",
  sansSemi: "IBMPlexSans-SemiBold.ttf",
  mono: "IBMPlexMono-Regular.ttf",
} as const;
export type FontKey = keyof typeof FONT_FILES;

/** Text styles: font, size (px), colour, letter-spacing (em). */
export interface TextStyle { font: FontKey; size: number; color: string; tracking?: number }
export const TEXT = {
  label: { font: "mono", size: 10.5, color: COLOR.label, tracking: 0.14 },
  labelDark: { font: "mono", size: 10.5, color: COLOR.labelOnDark, tracking: 0.14 },
  labelGreen: { font: "mono", size: 10.5, color: COLOR.greenText, tracking: 0.14 },
  rowLabel: { font: "mono", size: 10, color: COLOR.label, tracking: 0.12 },
  heading: { font: "condSemi", size: 52, color: COLOR.text },
  value: { font: "sansSemi", size: 14, color: COLOR.text },
  rowTitle: { font: "sansSemi", size: 16, color: COLOR.text },
  rowDesc: { font: "sans", size: 13, color: COLOR.secondary },
  note: { font: "sans", size: 11, color: COLOR.label },
  body: { font: "sans", size: 16, color: COLOR.secondary },
  figure: { font: "condSemi", size: 56, color: COLOR.text },
  unit: { font: "condSemi", size: 22, color: COLOR.secondary },
  disclaimer: { font: "sans", size: 11, color: COLOR.labelOnDark },
} as const satisfies Record<string, TextStyle>;

export const ACCENT = { w: 48, h: 3 } as const; // green rule under headings
export const TRICOLOUR_RULE = { w: 120, h: 3 } as const;

export const COVER = {
  mastheadH: 420,
  logoW: 168,
  logoTop: 46,
  cornerBaseline: 60, // "MODENA · ITALY"
  preparedBaseline: 152,
  title: { font: "condSemi" as FontKey, size: 132, minSize: 64, color: COLOR.white, baseline: 278 },
  version: { font: "condSemi" as FontKey, size: 30, baseline: 334, gap: 14 },
  tricolourY: 368,
  hero: { w: 760, top: 446, maxH: 520 },
  shadow: { wRatio: 0.82, hRatio: 0.06, opacity: 0.22 }, // floor shadow under the bike, relative to hero size
  stripRuleY: 992,
  stripLabelY: 1020,
  stripValueY: 1042,
  footerY: 1084,
} as const;

export const HEADER = { h: 64, logoW: 112 } as const; // dark band on pages 2 and 3

export const SECTION = {
  kickerY: 112, // "01 / CONFIGURATION"
  headingBaseline: 172,
  accentY: 194,
} as const;

export const BUILD = {
  firstSectionY: 236, // label of "BASE SPECIFICATION"
  sectionLabelToRule: 12,
  sectionGap: 30, // space above the second section label
  row: { maxH: 97, minH: 44, thumbMax: 72, thumbPad: 12, labelX: 140, titleX: 290, markerW: 36, markerH: 10 },
  box: { h: 104, gap: 12, padX: 20, labelY: 26, textY: 46, textW: 420, calloutSize: 26 },
  footerY: 1084,
} as const;

export const PERF = {
  gridTopY: 226,
  cellH: 108,
  cellLabelDy: 26,
  cellFigureDy: 86,
  unitGap: 8,
  stripH: 64,
  stripLabelDy: 22,
  stripValueDy: 42,
  noteDy: 18,
  nextKickerGap: 44,
  nextHeadingSize: 44,
  nextHeadingDy: 58,
  nextAccentDy: 22,
  nextRuleDy: 28,
  nextRuleW: 560,
  nextTextDy: 32,
  nextTextW: 520,
  nextLineH: 25,
} as const;

export const CLOSING = {
  top: 963,
  logoW: 140,
  logoY: 992,
  pageNoY: 1004,
  disclaimerY: 1032,
  disclaimerW: 460,
  disclaimerLineH: 15,
  urlY: 1086,
  watermark: { font: "condBold" as FontKey, size: 104, baseline: 1062 },
} as const;

export const HERO_IMAGE = { maxPx: 1600, quality: 0.84 } as const; // cover panel image width (canvas px)
export const CROP_IMAGE = { px: 160, quality: 0.85, sourceMaxPx: 2400 } as const; // detail crop output size
