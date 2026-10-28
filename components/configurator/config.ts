// Per-model configurator settings: names and categories, how backend option
// groups are arranged into steps, group copy, swatch colours, and display
// names for options (shared with the build sheet's catalog).
import { MODEL_NAMES, rowFor, type ModelId } from "@/lib/build-sheet/catalog";

export type Model = ModelId;

export const MODEL_INFO: Record<Model, { name: string; category: string }> = {
  eva_ribelle: { name: MODEL_NAMES.eva_ribelle, category: "Street fighter" },
  essesse9: { name: MODEL_NAMES.essesse9, category: "Naked sport" },
  ego: { name: MODEL_NAMES.ego, category: "Supersport" },
  experia: { name: MODEL_NAMES.experia, category: "Grand tourer" },
};
export const MODEL_ORDER: Model[] = ["eva_ribelle", "essesse9", "ego", "experia"];

export interface StepDef { label: string; groups: string[] }

// Backend groups per step. A group the backend sends that is not listed here
// lands in a final "More" step (with a console warning), so it never vanishes.
export const STEP_MAP: Record<Model, StepDef[]> = {
  eva_ribelle: [
    { label: "Colour", groups: ["base_color"] },
    { label: "Performance", groups: ["suspension", "rs_options"] },
    { label: "Wheels", groups: ["wheels"] },
    { label: "Carbon", groups: ["carbon_parts", "ergal_screws"] },
    { label: "Upgrades", groups: ["optional_upgrades", "bags_plates"] },
  ],
  essesse9: [
    { label: "Colour", groups: ["base_color", "cnc_options"] },
    { label: "Performance", groups: ["suspension", "rs_options"] },
    { label: "Wheels", groups: ["wheels"] },
    { label: "Carbon", groups: ["carbon_parts", "ergal_screws"] },
    { label: "Upgrades", groups: ["bellypan", "optional_upgrades", "bags_plates"] },
  ],
  ego: [
    { label: "Colour", groups: ["base_color"] },
    { label: "Performance", groups: ["suspension"] },
    { label: "Wheels", groups: ["wheels"] },
    { label: "Carbon", groups: ["carbon_parts", "ergal_screws"] },
    { label: "Seat", groups: ["passenger_seat", "covers"] },
    { label: "Upgrades", groups: ["optional_upgrades"] },
  ],
  experia: [
    { label: "Colour", groups: ["base_color"] },
    { label: "Wheels", groups: ["wheels"] },
    { label: "Bodywork", groups: ["front_fender", "windscreen"] },
    { label: "Details", groups: ["ergal_screws"] },
    { label: "Upgrades", groups: ["optional_upgrades"] },
  ],
};

export interface GroupConfig {
  label: string;
  description: string;
  exclusive: boolean; // true = single choice, false = any number
}

// Group headings and descriptions, worded as before the redesign (headings
// are shown in capitals by the section style).
export const GROUP_CONFIG: Record<string, GroupConfig> = {
  base_color: { label: "COLORS", description: "Select the primary finish for your motorcycle.", exclusive: true },
  suspension: { label: "SUSPENSION", description: "Choose your suspension setup.", exclusive: true },
  wheels: { label: "WHEELS", description: "Select rim style and finish.", exclusive: true },
  front_fender: { label: "FRONT FENDER", description: "Standard injection or optional carbon fibre.", exclusive: true },
  windscreen: { label: "WINDSCREEN", description: "Standard or low smoky windscreen.", exclusive: true },
  passenger_seat: { label: "SEAT", description: "Choose your seat configuration.", exclusive: true },
  covers: { label: "COVER CorsaClienti", description: "Racing cover for the passenger seat.", exclusive: true },
  carbon_parts: { label: "CARBON ACCESSORIES", description: "Add individual carbon-fibre components.", exclusive: false },
  bellypan: { label: "BELLYPAN", description: "Add a coloured bellypan with stripe finish.", exclusive: true },
  ergal_screws: { label: "ERGAL SCREWS", description: "Optional anodised ergal screw kit.", exclusive: true },
  optional_upgrades: { label: "OPTIONAL UPGRADES", description: "Performance and touring additions.", exclusive: false },
  bags_plates: { label: "BAG PLATE COLOUR", description: "Choose a colour for the side bag plates. Requires Side Bags Kit.", exclusive: true },
  cnc_options: { label: "CNC FINISH", description: "Optional CNC Titanium Grey finish. Available on Bormio Ice only.", exclusive: true },
  rs_options: { label: "RS OPTIONS", description: "RS version badge and sticker kit.", exclusive: false },
  other: { label: "ACCESSORIES", description: "Additional components.", exclusive: false },
};

export const groupConfig = (key: string): GroupConfig =>
  GROUP_CONFIG[key] ?? { label: key.replace(/_/g, " "), description: "", exclusive: false };

// Swatch colours for colour options, by layer id. Several colours = stripes.
const TRICOLORE = ["#009246", "#F1F2F1", "#CE2B37"];
export const SWATCHES: Record<string, string[]> = {
  er_01_base_ribelle_stealth_grey: ["#4E5257"],
  er_12_eva_rosso_corsa: ["#B3121F"],
  er_13_eva_tricolore: TRICOLORE,
  es_01_base_esseesse9_bormio_ice: ["#DCE2E5"],
  es_13_esseesse9_sunrise_red: ["#C8262C"],
  es_14_esseesse9_riviera_green: ["#1F5B47"],
  eg_01_base_ego_metal_black: ["#1C1D1F"],
  eg_12_ego_rosso_corsa: ["#B3121F"],
  eg_13_tricolore: TRICOLORE,
  ex_01_base_experia_metal_black: ["#1C1D1F"],
  ex_12_experia_bormio_ice: ["#DCE2E5"],
  ex_13_experia_white_flame: ["#F5F5F2"],
};

/**
 * Display name and one-line description for an option, from the same catalog
 * the build sheet and sales email use ("#ER-91-SIDE BAGS KIT" → "Side bag kit").
 */
export function cleanLayerName(layer: { id: string; name: string }, groupKey: string): { title: string; description: string } {
  const row = rowFor({ id: layer.id, name: layer.name, groupKey });
  if (!row) return { title: layer.name, description: "" };
  if (row.label === "COLOURWAY") return { title: row.title.replace(/ livery$/, ""), description: "" };
  if (row.label === "VERSION") return { title: `${row.title} version`, description: row.description };
  return { title: row.title, description: row.description };
}
