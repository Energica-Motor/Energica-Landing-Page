// Official Energica partners shown on /dealers (Dealers, Importers & Service).
// One list for the whole site — add service centres here as type "Service".

export type PartnerType = "Dealer" | "Importer" | "Service";

export interface Partner {
  name: string;
  type: PartnerType;
  region: "Europe" | "Asia Pacific" | "North America" | "Middle East & Africa";
  country: string;
  city?: string;
  address?: string;
  /** Google Maps search text for directions and the map preview. */
  mapsQuery: string;
}

export const partners: Partner[] = [
  { name: "Future Mobility", type: "Importer", region: "Europe", country: "Belgium", mapsQuery: "Future Mobility Belgium" },
  { name: "Infidel j.d.o.o.", type: "Importer", region: "Europe", country: "Croatia", city: "Split", address: "ul. Vukovarska 99, 21000 Split", mapsQuery: "ul. Vukovarska 99, 21000 Split, Croatia" },
  { name: "Alwin Otten", type: "Dealer", region: "Europe", country: "Germany", city: "Meppen", address: "Industriestr. 22, 49716 Meppen", mapsQuery: "Industriestr. 22, 49716 Meppen, Germany" },
  { name: "Autohaus Richter & Zech GmbH", type: "Dealer", region: "Europe", country: "Germany", city: "Wendelstein", address: "Richtweg 55, 90530 Wendelstein", mapsQuery: "Richtweg 55, 90530 Wendelstein, Germany" },
  { name: "Ramsperger Automobile GmbH & Co. KG", type: "Dealer", region: "Europe", country: "Germany", city: "Nürtingen", address: "Robert-Bosch-Str. 9-11, 72622 Nuertingen", mapsQuery: "Robert-Bosch-Str. 9, 72622 Nürtingen, Germany" },
  { name: "Mob'Elec 83", type: "Dealer", region: "Europe", country: "France", city: "Toulon", address: "470 avenue Colonel Picot, 83100 Toulon", mapsQuery: "470 avenue Colonel Picot, 83100 Toulon, France" },
  { name: "Rydu", type: "Importer", region: "Asia Pacific", country: "Hong Kong", city: "Tsuen Wan", address: "B3 G/F, Superluck Industrial Centre Phase 2, 30-38 Tai Chung Rd, Tsuen Wan", mapsQuery: "30 Tai Chung Rd, Tsuen Wan, Hong Kong" },
];

export const PARTNER_TYPES: { type: PartnerType; label: string; short: string; description: string }[] = [
  {
    type: "Dealer",
    label: "Dealers",
    short: "Official Dealer",
    description: "See, ride and buy an Energica. Test rides and sales at authorised showrooms.",
  },
  {
    type: "Importer",
    label: "Importers",
    short: "Official Importer",
    description: "The official Energica importer for their country, for sales and partner enquiries.",
  },
  {
    type: "Service",
    label: "Service",
    short: "Authorised Service",
    description: "Authorised workshops for maintenance, warranty work and software updates.",
  },
];

export const SERVICE_EMAIL = "service-eu@energicamotor.com";
