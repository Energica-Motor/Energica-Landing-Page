// Map pin artwork (inline SVG). Used by MapLibre (as images) and the static fallback.
import type { Partner } from "@/data/partners";

export type PinKind = "dealer" | "importer" | "service";

const COLORS: Record<PinKind, { fill: string; stroke: string; dot: string }> = {
  dealer: { fill: "#78BE20", stroke: "#0F1012", dot: "#0F1012" },
  importer: { fill: "#FFFFFF", stroke: "#0F1012", dot: "#0F1012" },
  service: { fill: "#8A8F98", stroke: "#0F1012", dot: "#0F1012" },
};

// 28 × 36 teardrop pin; tip at bottom centre.
const PIN_PATH = "M14 1C7.1 1 1.5 6.5 1.5 13.3c0 9.1 10.6 20.4 11.6 21.4a1.3 1.3 0 0 0 1.8 0c1-1 11.6-12.3 11.6-21.4C26.5 6.5 20.9 1 14 1Z";
const WRENCH =
  "M17.6 9.2a3.9 3.9 0 0 1-4.9 4.9l-3.5 3.5a1.3 1.3 0 0 1-1.8-1.8l3.5-3.5a3.9 3.9 0 0 1 4.9-4.9l-2.3 2.3.4 1.4 1.4.4 2.3-2.3Z";

export function pinSvg(kind: PinKind, scale = 1): string {
  const c = COLORS[kind];
  const w = 28 * scale;
  const h = 36 * scale;
  const glyph =
    kind === "service"
      ? `<path d="${WRENCH}" fill="${c.dot}"/>`
      : `<circle cx="14" cy="13.3" r="4.2" fill="${c.dot}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 28 36"><path d="${PIN_PATH}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1.5"/>${glyph}</svg>`;
}

/** Dealer wins over importer over service for the pin colour. */
export function pinKind(p: Partner): PinKind {
  if (p.types.includes("dealer")) return "dealer";
  if (p.types.includes("importer")) return "importer";
  return "service";
}
