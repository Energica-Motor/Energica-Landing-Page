// Turns raw configurator options (e.g. "ER-91-SIDE BAGS KIT" in group
// "optional_upgrades") into the rows of the build sheet: display name,
// one-line description, row label, section and right-hand marker.
// Raw option names never reach the PDF; unknown ones fall back to title case
// and log a warning so they can be added here.

export type ModelId = "eva_ribelle" | "essesse9" | "ego" | "experia";
export type Version = "RS" | "Standard" | null; // null: the model has no RS version

export const MODEL_NAMES: Record<ModelId, string> = {
  eva_ribelle: "Eva Ribelle",
  essesse9: "EsseEsse9",
  ego: "Ego",
  experia: "Experia",
};

/** A selected option as the configurator knows it. */
export interface SelectedOption {
  id: string;
  name: string; // raw layer name
  groupKey: string; // configurator group, e.g. "wheels"
}

export type Marker =
  | { kind: "chip"; colors: string[] } // colour swatch (several = stripes)
  | { kind: "plus" } // an added upgrade
  | null;

export interface SheetRow {
  optionId: string;
  catalogKey: string; // normalised name, also the key for crop overrides
  label: string; // mono row label, e.g. "WHEELS"
  title: string;
  description: string;
  marker: Marker;
}

export interface BuildSheetContent {
  model: ModelId;
  modelName: string;
  version: Version;
  colourway: string;
  base: SheetRow[];
  upgrades: SheetRow[];
}

const SWATCH: Record<string, string> = {
  "rosso corsa": "#B3121F",
  "metal black": "#1C1D1F",
  "stealth grey": "#5B5F63",
  "sunrise red": "#C8262C",
  "riviera green": "#1F5B47",
  "bormio ice": "#DCE2E5",
  "white flame": "#F5F5F2",
  "gun metal": "#4A4E52",
  "titanium grey": "#8A8D90",
  red: "#C8262C",
  blue: "#1F4E9C",
};
const TRICOLOUR = ["#009246", "#FFFFFF", "#CE2B37"];

interface Entry { label: string; title: string; description: string; marker?: Marker; section?: "base" | "upgrade" }

const COLOURWAYS: Record<string, { title: string; description: string; colors: string[] }> = {
  tricolore: { title: "Tricolore livery", description: "Green, white and red Italian livery.", colors: TRICOLOUR },
  "rosso corsa": { title: "Rosso Corsa", description: "Rosso Corsa red livery.", colors: [SWATCH["rosso corsa"]] },
  "metal black": { title: "Metal Black", description: "Metal Black livery.", colors: [SWATCH["metal black"]] },
  "stealth grey": { title: "Stealth Grey", description: "Stealth Grey livery.", colors: [SWATCH["stealth grey"]] },
  "sunrise red": { title: "Sunrise Red", description: "Sunrise Red livery.", colors: [SWATCH["sunrise red"]] },
  "riviera green": { title: "Riviera Green", description: "Riviera Green livery.", colors: [SWATCH["riviera green"]] },
  "bormio ice": { title: "Bormio Ice", description: "Bormio Ice livery.", colors: [SWATCH["bormio ice"]] },
  "white flame": { title: "White Flame", description: "White Flame livery.", colors: [SWATCH["white flame"]] },
};

const ENTRIES: Record<string, Entry> = {
  // Version
  "rs version": { label: "VERSION", title: "RS", description: "RS version badge and sticker kit.", section: "base" },
  "stickers kit rs sport": { label: "GRAPHICS", title: "RS Sport sticker kit", description: "RS Sport graphics for the bodywork." },
  // Seat
  "standard seat": { label: "SEAT", title: "Standard seat", description: "Standard fitment.", section: "base" },
  "tech red seat": { label: "SEAT", title: "Tech Red seat", description: "Seat finished in Tech Red.", section: "base", marker: { kind: "chip", colors: [SWATCH.red] } },
  "tech green seat": { label: "SEAT", title: "Tech Green seat", description: "Seat finished in Tech Green.", section: "base", marker: { kind: "chip", colors: [SWATCH["riviera green"]] } },
  "sportred seat kit": { label: "SEAT", title: "Sport Red seat kit", description: "Sport seat finished in red." },
  // Suspension
  "standard suspensions": { label: "SUSPENSION", title: "Standard suspension", description: "Factory front fork and rear shock setup.", section: "base" },
  "kit ohlins suspensions": { label: "SUSPENSION", title: "Öhlins suspension kit", description: "Öhlins front and rear suspension.", section: "base", marker: { kind: "plus" } },
  // Wheels
  "standard cast aluminium wheels": { label: "WHEELS", title: "Cast aluminium wheels", description: "Standard fitment.", section: "base" },
  "red stripe cast wheels": { label: "WHEELS", title: "Red stripe cast wheels", description: "Cast aluminium wheels with a red rim stripe.", section: "base", marker: { kind: "plus" } },
  "forged aluminium wheels": { label: "WHEELS", title: "Forged aluminium wheels", description: "Forged aluminium rims.", section: "base", marker: { kind: "plus" } },
  "carbon fiber wheels": { label: "WHEELS", title: "Carbon fibre wheels", description: "Carbon fibre rims.", section: "base", marker: { kind: "plus" } },
  // Experia fitments
  "standard injection front fender": { label: "FRONT FENDER", title: "Standard front fender", description: "Standard fitment.", section: "base" },
  "standard windscreen": { label: "WINDSCREEN", title: "Standard windscreen", description: "Standard fitment.", section: "base" },
  "low windscreen smoky": { label: "WINDSCREEN", title: "Low smoked windscreen", description: "Lower screen with a smoked tint.", section: "base", marker: { kind: "plus" } },
  // Carbon
  "front mudguard carbon": { label: "CARBON", title: "Carbon front mudguard", description: "Front mudguard in carbon fibre." },
  "rear mudguard carbon": { label: "CARBON", title: "Carbon rear mudguard", description: "Rear mudguard in carbon fibre." },
  "bellypan carbon": { label: "CARBON", title: "Carbon bellypan", description: "Bellypan in carbon fibre." },
  "undertail cover carbon": { label: "CARBON", title: "Carbon undertail cover", description: "Undertail cover in carbon fibre." },
  "battery cover carbon": { label: "CARBON", title: "Carbon battery cover", description: "Battery cover in carbon fibre." },
  "tank rib carbon": { label: "CARBON", title: "Carbon tank rib", description: "Tank rib in carbon fibre." },
  // Hardware and finishes
  "frame black": { label: "FRAME", title: "Black frame", description: "Frame finished in black in place of the standard colour." },
  "kit ergal screws gold": { label: "HARDWARE", title: "Gold Ergal screw kit", description: "Ergal aluminium screws in gold." },
  "kit ergal screws black": { label: "HARDWARE", title: "Black Ergal screw kit", description: "Ergal aluminium screws in black." },
  "kit ergal screws blue": { label: "HARDWARE", title: "Blue Ergal screw kit", description: "Ergal aluminium screws in blue." },
  "cnc titanium grey": { label: "CNC FINISH", title: "Titanium Grey", description: "CNC-machined parts in Titanium Grey.", marker: { kind: "chip", colors: [SWATCH["titanium grey"]] } },
  // Touring and protection
  "windscreen kit": { label: "WINDSCREEN", title: "Windscreen kit", description: "Windscreen with mounting kit." },
  "splash guard": { label: "PROTECTION", title: "Splash guard", description: "Rear wheel splash guard." },
  handguards: { label: "PROTECTION", title: "Handguards", description: "Hand protection for the handlebars." },
  "central stand": { label: "STAND", title: "Central stand", description: "Centre stand for parking and maintenance." },
  "side bags kit": { label: "LUGGAGE", title: "Side bag kit", description: "Pair of side bags with mounting hardware." },
  "top case kit": { label: "LUGGAGE", title: "Top case kit", description: "Top case with mounting hardware." },
  "bags plates red": { label: "BAG PLATES", title: "Red", description: "Finish for the side bag mounting plates.", marker: { kind: "chip", colors: [SWATCH.red] } },
  "bags plates gun metal": { label: "BAG PLATES", title: "Gun Metal", description: "Finish for the side bag mounting plates.", marker: { kind: "chip", colors: [SWATCH["gun metal"]] } },
  "bags plates blue": { label: "BAG PLATES", title: "Blue", description: "Finish for the side bag mounting plates.", marker: { kind: "chip", colors: [SWATCH.blue] } },
};

// CorsaClienti covers and EsseEsse9 bellypans follow a pattern per colour.
function patternEntry(key: string): Entry | null {
  const cover = key.match(/^cover corsaclienti (grey|white|black|red)$/);
  if (cover) {
    const c = cover[1];
    return {
      label: "SEAT COVER",
      title: `${cap(c)} CorsaClienti cover`,
      description: "Racing cover for the passenger seat.",
      marker: { kind: "chip", colors: [{ grey: "#8A8D90", white: "#F5F5F2", black: "#1C1D1F", red: SWATCH.red }[c]!] },
    };
  }
  const belly = key.match(/^bellypan (bormio ice|sunrise red|riviera green) (grey|yellow) stripes$/);
  if (belly) {
    return {
      label: "BELLYPAN",
      title: `${titleCase(belly[1])} bellypan`,
      description: `Bellypan in ${titleCase(belly[1])} with ${belly[2]} stripes.`,
      marker: { kind: "chip", colors: [SWATCH[belly[1]], belly[2] === "grey" ? "#8A8D90" : "#E7C21E"] },
    };
  }
  return null;
}

const MODEL_WORDS = /^(eva ribelle|ribelle|eva|esseesse9|essesse9|ego|experia)\s+/;

/** "#ER-01 BASE-EVA RIBELLE TRICOLORE" → "tricolore"; "ES-59CARBON FIBER WHEELS" → "carbon fiber wheels". */
export function normaliseOptionName(raw: string): string {
  let s = raw
    .replace(/^[#*\s]+/, "")
    .replace(/^[A-Z]{2}-\d{1,3}[-\s]*/i, "")
    .replace(/^BASE[-\s]+/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  while (MODEL_WORDS.test(s)) s = s.replace(MODEL_WORDS, "");
  return s;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const titleCase = (s: string) =>
  s.replace(/\b([a-z])([a-z0-9]*)/gi, (_, a: string, rest: string) => a.toUpperCase() + rest.toLowerCase());

/** Row for one selected option. Unknown options fall back to title case and warn. */
export function rowFor(option: SelectedOption): (SheetRow & { section: "base" | "upgrade" }) | null {
  const key = normaliseOptionName(option.name);
  if (option.groupKey === "base_color") {
    const c = COLOURWAYS[key];
    if (!c) console.warn("[build-sheet] unknown colourway %s (%s)", key, option.id);
    return {
      optionId: option.id,
      catalogKey: "colourway",
      label: "COLOURWAY",
      title: c?.title ?? titleCase(key),
      description: c?.description ?? `${titleCase(key)} livery.`,
      marker: c ? { kind: "chip", colors: c.colors } : null,
      section: "base",
    };
  }
  const entry = ENTRIES[key] ?? patternEntry(key);
  if (!entry) {
    console.warn("[build-sheet] no display name for %s (%s); using title case", key, option.id);
    return {
      optionId: option.id,
      catalogKey: key,
      label: option.groupKey.replace(/_/g, " ").toUpperCase(),
      title: titleCase(key),
      description: "",
      marker: { kind: "plus" },
      section: "upgrade",
    };
  }
  const section = entry.section ?? "upgrade";
  return {
    optionId: option.id,
    catalogKey: key,
    label: entry.label,
    title: entry.title,
    description: entry.description,
    marker: entry.marker !== undefined ? entry.marker : section === "upgrade" ? { kind: "plus" } : null,
    section,
  };
}

const BASE_ORDER = ["COLOURWAY", "VERSION", "SEAT", "SUSPENSION", "WHEELS", "FRONT FENDER", "WINDSCREEN"];

/**
 * Builds the sheet content. `hasRsOption` tells whether the model offers an
 * RS version at all (Experia does not), so "Standard" is only shown where
 * the choice exists.
 */
export function buildSheetContent(model: ModelId, options: SelectedOption[], hasRsOption: boolean): BuildSheetContent {
  const rows = options.filter((o) => o.groupKey !== "other").map(rowFor).filter((r): r is NonNullable<typeof r> => !!r);
  const base = rows.filter((r) => r.section === "base");
  const upgrades = rows.filter((r) => r.section === "upgrade");

  const isRs = base.some((r) => r.label === "VERSION");
  const version: Version = isRs ? "RS" : hasRsOption ? "Standard" : null;
  if (version === "Standard") {
    base.push({
      optionId: "",
      catalogKey: "version-standard",
      label: "VERSION",
      title: "Standard",
      description: "Standard version.",
      marker: null,
      section: "base",
    });
  }
  base.sort((a, b) => BASE_ORDER.indexOf(a.label) - BASE_ORDER.indexOf(b.label));
  const colourwayRow = base.find((r) => r.label === "COLOURWAY");
  const strip = (r: SheetRow): SheetRow => ({
    optionId: r.optionId, catalogKey: r.catalogKey, label: r.label, title: r.title, description: r.description, marker: r.marker,
  });

  return {
    model,
    modelName: MODEL_NAMES[model],
    version,
    colourway: colourwayRow ? colourwayRow.title.replace(/ livery$/, "") : "",
    base: base.map(strip),
    upgrades: upgrades.map(strip),
  };
}
