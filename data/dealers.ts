// Authorised Energica dealers and importers, grouped by region.

export interface Dealer {
  name: string;
  type: "Importer" | "Dealer";
  country: string;
  address?: string;
}

export const dealerRegions: { region: string; dealers: Dealer[] }[] = [
  {
    region: "Europe",
    dealers: [
      { name: "Future Mobility", type: "Importer", country: "Belgium" },
      { name: "Infidel j.d.o.o.", type: "Importer", country: "Croatia", address: "ul. Vukovarska 99, 21000 Split" },
      { name: "Alwin Otten", type: "Dealer", country: "Germany", address: "Industriestr. 22, 49716 Meppen" },
      { name: "Autohaus Richter & Zech GmbH", type: "Dealer", country: "Germany", address: "Richtweg 55, 90530 Wendelstein" },
      { name: "Ramsperger Automobile GmbH & Co. KG", type: "Dealer", country: "Germany", address: "Robert-Bosch-Str. 9-11, 72622 Nuertingen" },
      { name: "Mob'Elec 83", type: "Dealer", country: "France", address: "470 avenue Colonel Picot, 83100 Toulon" },
    ],
  },
  {
    region: "Asia Pacific",
    dealers: [
      { name: "Rydu", type: "Importer", country: "Hong Kong", address: "B3 G/F, Superluck Industrial Centre Phase 2, 30-38 Tai Chung Rd, Tsuen Wan" },
    ],
  },
];

export const allDealers = dealerRegions.flatMap((r) => r.dealers);

/** Header counts, worked out from the list. */
export const dealerCounts = {
  regions: dealerRegions.filter((r) => r.dealers.length).length,
  locations: allDealers.length,
  countries: new Set(allDealers.map((d) => d.country)).size,
};

/** Countries in list order, for the filter. */
export const dealerCountries = [...new Set(allDealers.map((d) => d.country))];

/** Google Maps search for the dealer's own name and address, or null without an address. */
export function dealerMapUrl(d: Dealer): string | null {
  if (!d.address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.name}, ${d.address}, ${d.country}`)}`;
}
