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

const TYPES: PartnerType[] = ["country", "dealer", "service"];
/** Old URLs used ?type=importer. */
const TYPE_ALIASES: Record<string, PartnerType> = { importer: "country" };
const REGION_ORDER: Region[] = ["Europe", "North America", "Asia", "Africa", "Oceania"];

export const hasLocation = (p: Partner): p is Partner & LatLng =>
  typeof p.lat === "number" && typeof p.lng === "number";

/** Country partners also sell: they count as dealers (keeping their own badge). */
export function matchesType(p: Partner, type: TypeFilter): boolean {
  if (type === "all") return true;
  if (type === "dealer") return p.types.includes("dealer") || p.types.includes("country");
  return p.types.includes(type);
}

/** Partners per tab; a partner with several roles counts in each. */
export function countByType(list: Partner[]): Record<TypeFilter, number> {
  const counts: Record<TypeFilter, number> = { all: list.length, country: 0, dealer: 0, service: 0 };
  for (const p of list) for (const t of TYPES) if (matchesType(p, t)) counts[t]++;
  return counts;
}

/** Every country (A–Z) with its count for the given tab (0 = greyed out, still listed). */
export function countryCounts(list: Partner[], type: TypeFilter): { country: string; count: number }[] {
  return [...new Set(list.map((p) => p.country))]
    .sort((a, b) => a.localeCompare(b))
    .map((country) => ({ country, count: list.filter((p) => p.country === country && matchesType(p, type)).length }));
}

/** 0 = country partner, 1 = dealer, 2 = service only. */
const roleRank = (p: Partner) => (p.types.includes("country") ? 0 : p.types.includes("dealer") ? 1 : 2);

/** List order: country partners, dealers, service-only; then country A–Z, then name A–Z. */
export function sortPartners<T extends Partner>(list: T[]): T[] {
  return [...list].sort(
    (a, b) => roleRank(a) - roleRank(b) || a.country.localeCompare(b.country) || a.name.localeCompare(b.name),
  );
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
  return [...new Set(list.filter((p) => matchesType(p, type)).map((p) => p.country))].sort((a, b) =>
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
      matchesType(p, state.type) &&
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

/** The n nearest partners with a location, nearest first. */
export function nearest(list: Partner[], origin: LatLng, n = 3): (Partner & LatLng & { distanceKm: number })[] {
  return list
    .filter(hasLocation)
    .map((p) => ({ ...p, distanceKm: distanceKm(origin, p) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, n);
}

/** Lines are only drawn to partners this close; never across continents. */
export const NEARBY_KM = 500;

export type NearbyResult =
  | { mode: "nearby"; type: TypeFilter; partners: (Partner & LatLng & { distanceKm: number })[] }
  | { mode: "nearest"; type: TypeFilter; partners: (Partner & LatLng & { distanceKm: number })[] };

/**
 * "Use my location": up to 3 partners within NEARBY_KM in the active tab; if the tab
 * has none that close, any type within NEARBY_KM; if still none, the single nearest
 * partner (no lines).
 */
export function findNearby(list: Partner[], origin: LatLng, type: TypeFilter): NearbyResult {
  const inTab = list.filter((p) => matchesType(p, type));
  const close = (l: Partner[]) => nearest(l, origin, 3).filter((p) => p.distanceKm <= NEARBY_KM);
  const tabClose = close(inTab);
  if (tabClose.length) return { mode: "nearby", type, partners: tabClose };
  const anyClose = close(list);
  if (anyClose.length) return { mode: "nearby", type: "all", partners: anyClose };
  const one = nearest(inTab.length ? inTab : list, origin, 1);
  return { mode: "nearest", type: inTab.length ? type : "all", partners: one };
}

/** "12 km", "4.3 km", "14 872 km" (space-grouped, non-breaking). */
export function formatKm(km: number): string {
  const NBSP = " ";
  if (km < 10) return `${km.toFixed(1)}${NBSP}km`;
  return `${Math.round(km).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)}${NBSP}km`;
}

/** Group in region order, keeping each group's existing order (distance or data). */
export function groupByRegion<T extends Partner>(list: T[]): { region: Region; partners: T[] }[] {
  return REGION_ORDER.map((region) => ({ region, partners: list.filter((p) => p.region === region) })).filter(
    (g) => g.partners.length > 0,
  );
}

export function parseState(params: Record<string, string | string[] | undefined>, countries: string[]): LocatorState {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const raw = one(params.type).toLowerCase();
  const t = TYPE_ALIASES[raw] ?? raw;
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
  const q = p.directionsQuery ?? `${p.name}, ${p.address}, ${p.country}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
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
