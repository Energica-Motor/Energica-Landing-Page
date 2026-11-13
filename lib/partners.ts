// Pure dealer-locator logic (no React, no DOM) — unit-tested in tests/dealers.
import type { Partner, PartnerType, Region } from "@/data/partners";

export type TypeFilter = PartnerType | "all";

export interface LocatorState {
  type: TypeFilter;
  country: string; // "" = all countries
  q: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export type RankedPartner = Partner & { distanceKm?: number };

const TYPES: PartnerType[] = ["dealer", "importer", "service"];
const REGION_ORDER: Region[] = ["Europe", "Asia Pacific", "North America", "Middle East & Africa"];

export const hasLocation = (p: Partner): p is Partner & LatLng =>
  typeof p.lat === "number" && typeof p.lng === "number";

/** Partners per type; a partner with two types counts in both. */
export function countByType(list: Partner[]): Record<TypeFilter, number> {
  const counts: Record<TypeFilter, number> = { all: list.length, dealer: 0, importer: 0, service: 0 };
  for (const p of list) for (const t of p.types) counts[t]++;
  return counts;
}

export function summary(list: Partner[]) {
  return {
    partners: list.length,
    countries: new Set(list.map((p) => p.country)).size,
    regions: new Set(list.map((p) => p.region)).size,
  };
}

/** Countries (sorted) available for the current type filter. */
export function countriesFor(list: Partner[], type: TypeFilter): string[] {
  return [...new Set(list.filter((p) => type === "all" || p.types.includes(type)).map((p) => p.country))].sort((a, b) =>
    a.localeCompare(b),
  );
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function filterPartners(list: Partner[], state: LocatorState): Partner[] {
  const q = norm(state.q.trim());
  return list.filter(
    (p) =>
      (state.type === "all" || p.types.includes(state.type)) &&
      (!state.country || p.country === state.country) &&
      (!q || [p.name, p.country, p.city ?? "", p.address ?? ""].some((v) => norm(v).includes(q))),
  );
}

/** Great-circle distance in km (haversine). */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Nearest first; partners without a location keep their order at the end. */
export function sortByDistance(list: Partner[], origin: LatLng | null): RankedPartner[] {
  if (!origin) return list;
  const withLoc = list.filter(hasLocation).map((p) => ({ ...p, distanceKm: distanceKm(origin, p) }));
  withLoc.sort((a, b) => a.distanceKm - b.distanceKm);
  return [...withLoc, ...list.filter((p) => !hasLocation(p))];
}

export function formatKm(km: number): string {
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km).toLocaleString("en-GB")} km`;
}

/** Group in region order, keeping each group's existing order (distance or data). */
export function groupByRegion<T extends Partner>(list: T[]): { region: Region; partners: T[] }[] {
  return REGION_ORDER.map((region) => ({ region, partners: list.filter((p) => p.region === region) })).filter(
    (g) => g.partners.length > 0,
  );
}

export function parseState(params: Record<string, string | string[] | undefined>, countries: string[]): LocatorState {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const t = one(params.type).toLowerCase();
  const country = one(params.country);
  return {
    type: (TYPES as string[]).includes(t) ? (t as PartnerType) : "all",
    country: countries.find((c) => c.toLowerCase() === country.toLowerCase()) ?? "",
    q: one(params.q).slice(0, 80),
  };
}

export function stateToQuery(state: LocatorState): string {
  const p = new URLSearchParams();
  if (state.type !== "all") p.set("type", state.type);
  if (state.country) p.set("country", state.country);
  if (state.q.trim()) p.set("q", state.q.trim());
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function directionsUrl(p: Partner): string | null {
  if (!p.address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name}, ${p.address}, ${p.country}`)}`;
}

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** Bounding box [[west, south], [east, north]] of partners with a location. */
export function boundsOf(list: Partner[]): [[number, number], [number, number]] | null {
  const pts = list.filter(hasLocation);
  if (!pts.length) return null;
  const lngs = pts.map((p) => p.lng);
  const lats = pts.map((p) => p.lat);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}
