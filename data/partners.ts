// Official Energica partners shown on /dealers.
//
// One list for the whole site. A partner can be several types at once
// (e.g. dealer + service): it appears once and counts in each filter.
//
// lat/lng were geocoded once from the address (OpenStreetMap Nominatim,
// 13 Nov 2026) and are committed here — never geocode at runtime. A partner
// without a confirmed address has no lat/lng: no pin, "Contact for location".

export type PartnerType = "dealer" | "importer" | "service";
export type PartnerService = "Sales" | "Test rides" | "Service";
export type Region = "Europe" | "Asia Pacific" | "North America" | "Middle East & Africa";

export interface Partner {
  id: string;
  name: string;
  types: PartnerType[];
  region: Region;
  country: string;
  city?: string;
  address?: string;
  lat?: number;
  lng?: number;
  /** "building" = matched to the house number; "street" = street only. */
  geocodePrecision?: "building" | "street";
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  /** Shown as small tags. Only what the partner has confirmed. */
  services?: PartnerService[];
  /** Service partners: what they offer (e.g. "Warranty work"). */
  servicesOffered?: string[];
  /** Kept for later: test rides are not shown until confirmed per partner. */
  testRides?: boolean;
  /** Placeholder data for design previews. Never included in production. */
  sample?: boolean;
}

export const partners: Partner[] = [
  {
    id: "future-mobility", name: "Future Mobility", types: ["importer"], region: "Europe", country: "Belgium",
    // Antwerp address awaiting confirmation — no pin until then.
  },
  {
    id: "infidel", name: "Infidel j.d.o.o.", types: ["importer"], region: "Europe", country: "Croatia", city: "Split",
    address: "ul. Vukovarska 99, 21000 Split", lat: 43.51317, lng: 16.46507, geocodePrecision: "building",
  },
  {
    id: "alwin-otten", name: "Alwin Otten", types: ["dealer"], region: "Europe", country: "Germany", city: "Meppen",
    address: "Industriestr. 22, 49716 Meppen", lat: 52.66205, lng: 7.30159, geocodePrecision: "building",
  },
  {
    id: "richter-zech", name: "Autohaus Richter & Zech GmbH", types: ["dealer"], region: "Europe", country: "Germany", city: "Wendelstein",
    address: "Richtweg 55, 90530 Wendelstein", lat: 49.35249, lng: 11.16431, geocodePrecision: "building",
  },
  {
    id: "ramsperger", name: "Ramsperger Automobile GmbH & Co. KG", types: ["dealer"], region: "Europe", country: "Germany", city: "Nürtingen",
    address: "Robert-Bosch-Str. 9-11, 72622 Nuertingen", lat: 48.61529, lng: 9.33082, geocodePrecision: "building",
  },
  {
    id: "mobelec-83", name: "Mob'Elec 83", types: ["dealer"], region: "Europe", country: "France", city: "Toulon",
    address: "470 avenue Colonel Picot, 83100 Toulon", lat: 43.13048, lng: 5.97145, geocodePrecision: "street",
  },
  {
    id: "rydu", name: "Rydu", types: ["importer"], region: "Asia Pacific", country: "Hong Kong", city: "Tsuen Wan",
    address: "B3 G/F, Superluck Industrial Centre Phase 2, 30-38 Tai Chung Rd, Tsuen Wan", lat: 22.37163, lng: 114.10969, geocodePrecision: "street",
  },
];

// ── SAMPLE service partners (design preview only) ──────────────────────
// Placeholder until the real service partner list is provided. Filtered out
// of production builds by visiblePartners(). Replace with real entries.
export const samplePartners: Partner[] = [
  {
    id: "sample-service-modena", name: "Sample Service Centre Modena", types: ["service"], region: "Europe", country: "Italy", city: "Modena",
    address: "Via Emilia Est 1, 41121 Modena", lat: 44.6471, lng: 10.9252, sample: true,
    phone: "+39 000 000 0000", email: "service-modena@example.com", website: "https://example.com", hours: "Mon–Fri 09:00–18:00",
    services: ["Service"], servicesOffered: ["Maintenance", "Warranty work", "Software updates"],
  },
  {
    id: "sample-service-milano", name: "Sample Service Centre Milano", types: ["service"], region: "Europe", country: "Italy", city: "Milano",
    address: "Piazza del Duomo 1, 20122 Milano", lat: 45.4642, lng: 9.19, sample: true,
    email: "service-milano@example.com", services: ["Service"], servicesOffered: ["Maintenance", "Tyres"],
  },
  {
    id: "sample-dealer-service-munich", name: "Sample Dealer & Service München", types: ["dealer", "service"], region: "Europe", country: "Germany", city: "München",
    address: "Marienplatz 1, 80331 München", lat: 48.1374, lng: 11.5755, sample: true,
    phone: "+49 000 000 000", website: "https://example.com", hours: "Mon–Sat 09:00–18:00",
    services: ["Sales", "Service"], servicesOffered: ["Maintenance", "Warranty work"],
  },
  {
    id: "sample-service-amsterdam", name: "Sample Service Centre Amsterdam", types: ["service"], region: "Europe", country: "Netherlands", city: "Amsterdam",
    address: "Dam 1, 1012 JS Amsterdam", lat: 52.3731, lng: 4.8926, sample: true,
    phone: "+31 00 000 0000", services: ["Service"], servicesOffered: ["Maintenance"],
  },
];

/** Real partners always; sample partners only outside production. */
export function visiblePartners(env = process.env.VERCEL_ENV ?? process.env.NODE_ENV): Partner[] {
  return env === "production" ? partners : [...partners, ...samplePartners];
}

export const TYPE_LABELS: Record<PartnerType, { plural: string; badge: string }> = {
  dealer: { plural: "Dealers", badge: "Dealer" },
  importer: { plural: "Importers", badge: "Importer" },
  service: { plural: "Service", badge: "Service" },
};
