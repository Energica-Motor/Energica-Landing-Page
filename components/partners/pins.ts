// Map pin artwork (inline SVG). Used by MapLibre (as images) and the static fallback.
import type { Partner } from "@/data/partners";

export type PinKind = "country" | "dealer" | "service";

// Light map: dealer green, country partner near-black, service grey with a wrench.
const COLORS: Record<PinKind, { fill: string; stroke: string; dot: string }> = {
  country: { fill: "#141517", stroke: "#FFFFFF", dot: "#FFFFFF" },
  dealer: { fill: "#78BE20", stroke: "#141517", dot: "#141517" },
  service: { fill: "#8A8E92", stroke: "#FFFFFF", dot: "#FFFFFF" },
};

// 28 × 36 teardrop pin; tip at bottom centre.
const PIN_PATH = "M14 1C7.1 1 1.5 6.5 1.5 13.3c0 9.1 10.6 20.4 11.6 21.4a1.3 1.3 0 0 0 1.8 0c1-1 11.6-12.3 11.6-21.4C26.5 6.5 20.9 1 14 1Z";
const WRENCH =
  "M17.6 9.2a3.9 3.9 0 0 1-4.9 4.9l-3.5 3.5a1.3 1.3 0 0 1-1.8-1.8l3.5-3.5a3.9 3.9 0 0 1 4.9-4.9l-2.3 2.3.4 1.4 1.4.4 2.3-2.3Z";

/** withService: a sales partner (country/dealer) that also does service gets a small wrench dot. */
export function pinSvg(kind: PinKind, scale = 1, withService = false): string {
  const c = COLORS[kind];
  const w = 28 * scale;
  const h = 36 * scale;
  const glyph =
    kind === "service"
      ? `<path d="${WRENCH}" fill="${c.dot}"/>`
      : `<circle cx="14" cy="13.3" r="4.2" fill="${c.dot}"/>`;
  const dot =
    withService && kind !== "service"
      ? `<g transform="translate(17.5 0)"><circle cx="5.5" cy="5.5" r="5.5" fill="#8A8E92" stroke="#FFFFFF" stroke-width="1.2"/><path d="${WRENCH}" fill="#FFFFFF" transform="translate(-0.9 -1.1) scale(0.5)"/></g>`
      : "";
  // Extra room on the right/top so the dot isn't clipped.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 28 36" overflow="visible"><path d="${PIN_PATH}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>${glyph}${dot}</svg>`;
}

/** Country partner (white) wins over dealer (green) over service-only (grey). */
export function pinKind(p: Partner): PinKind {
  if (p.types.includes("country")) return "country";
  if (p.types.includes("dealer")) return "dealer";
  return "service";
}

export const hasServiceDot = (p: Partner) => p.types.includes("service") && pinKind(p) !== "service";
