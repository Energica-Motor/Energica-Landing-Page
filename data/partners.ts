// Official Energica partners shown on /dealers.
//
// The list itself is generated: data/partners.generated.ts is built by
// scripts/build-partners.py from data/source/Energica_Signed_Partners_Final.xlsx.
// Update the sheet, rerun the script, commit both.
//
// A partner can have several roles (e.g. country partner + service): it appears
// once and counts in each filter.
import { partners as generated } from "./partners.generated";

export type PartnerType = "country" | "dealer" | "service";
export type Region = "Europe" | "North America" | "Asia" | "Africa" | "Oceania";

export interface Partner {
  id: string;
  name: string;
  /** Ordered: country, dealer, service. */
  types: PartnerType[];
  region: Region;
  country: string;
  city: string;
  /** Exactly as written in the sheet. */
  address: string;
  lat?: number;
  lng?: number;
  /** "address" = matched to the address; "street" = street only; "town" = town centre. */
  geocodePrecision?: "address" | "street" | "town";
  /** Directions search text when the address isn't precise enough (name + town). */
  directionsQuery?: string;
  /** First is the main number. */
  phones?: string[];
  /** First is the main address. */
  emails?: string[];
  websites?: string[];
}

export const partners: Partner[] = generated;

export function visiblePartners(): Partner[] {
  return partners;
}

export const TYPE_ORDER: PartnerType[] = ["country", "dealer", "service"];

export const TYPE_LABELS: Record<PartnerType, { plural: string; badge: string }> = {
  country: { plural: "Country partners", badge: "Country partner" },
  dealer: { plural: "Dealers", badge: "Dealer" },
  service: { plural: "Service", badge: "Service" },
};
