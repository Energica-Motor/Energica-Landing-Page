import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { partners, type Partner } from "@/data/partners";
import {
  boundsOf,
  countByType,
  countryCounts,
  findNearby,
  countriesFor,
  directionsUrl,
  distanceKm,
  filterPartners,
  formatKm,
  groupByRegion,
  nearest,
  parseState,
  sortByDistance,
  sortPartners,
  stateToQuery,
  summary,
  telHref,
} from "@/lib/partners";

const all = { type: "all" as const, country: "", q: "" };
const byId = (id: string) => partners.find((p) => p.id === id)!;

describe("generated partner data (from the signed-partners sheet)", () => {
  it("expected counts: All 24, Country partners 8, Dealers 16 (8 + country partners), Service 18, 18 countries", () => {
    expect(countByType(partners)).toEqual({ all: 24, country: 8, dealer: 16, service: 18 });
    expect(summary(partners).countries).toBe(18);
    expect(countriesFor(partners, "all")).toHaveLength(18);
  });

  it("regions are the five continents", () => {
    expect(new Set(partners.map((p) => p.region))).toEqual(new Set(["Europe", "North America", "Asia", "Africa", "Oceania"]));
  });

  it("Future Mobility and all sample entries are gone", () => {
    expect(partners.some((p) => /future mobility|sample/i.test(p.name))).toBe(false);
  });

  it("every partner has a unique id, an address and a pin", () => {
    expect(new Set(partners.map((p) => p.id)).size).toBe(partners.length);
    for (const p of partners) {
      expect(p.address).toBeTruthy();
      expect(typeof p.lat).toBe("number");
      expect(typeof p.lng).toBe("number");
    }
  });

  it("no empty values in contact lists", () => {
    for (const p of partners)
      for (const k of ["phones", "emails", "websites"] as const) {
        if (p[k]) expect(p[k]!.length).toBeGreaterThan(0);
        for (const v of p[k] ?? []) expect(v.trim()).toBe(v);
      }
  });

  it("excluded sheet columns never reach the generated file", () => {
    // Header comment names the source file ("…Signed_Partners…"); check the data only.
    const src = fs
      .readFileSync("data/partners.generated.ts", "utf8")
      .split(/\r?\n/)
      .filter((l) => !l.startsWith("//"))
      .join("\n")
      .toLowerCase();
    for (const key of ["legal", "agreement", "signed", "signatory", "contacts", "per contract", "notes", "flags", "sources", "reg. no"]) {
      expect(src).not.toContain(key);
    }
    const allowed = new Set(["id", "name", "types", "region", "country", "city", "address", "lat", "lng", "geocodePrecision", "directionsQuery", "phones", "emails", "websites"]);
    for (const p of partners) for (const k of Object.keys(p)) expect(allowed.has(k)).toBe(true);
  });

  it("phones: notes and labels stripped, several kept, 'No company number found' skipped", () => {
    expect(byId("rydu").phones).toEqual(["+852 3188 3029", "+852 6348 0048"]); // "WhatsApp hotline" label dropped
    expect(byId("energica-of-new-england").phones).toEqual(["+1 978 895 1195", "+1 978 895 0441"]); // "(Rob's Dyno)" dropped
    expect(byId("ocd-custom-cycles").phones).toEqual(["+1 505 428 0646"]);
    expect(byId("ifyni").phones).toBeUndefined();
    expect(telHref("(07) 5645 6820")).toBe("tel:0756456820");
  });

  it("websites: notes stripped, two sites kept, 'None found' skipped", () => {
    expect(byId("nordic-motors").websites).toEqual(["https://nordicmotors.dk"]);
    expect(byId("electric-horses").websites).toEqual(["https://electric-horses.de", "https://richter-zech.de"]);
    expect(byId("energica-hrvatska").websites).toBeUndefined();
  });

  it("emails: generic addresses only, notes stripped, 'No generic address' skipped", () => {
    expect(byId("rydu").emails).toEqual(["info@rydu.com", "customer@rydu.com"]);
    expect(byId("nordic-motors").emails).toEqual(["info@nordicmotors.dk"]);
    expect(byId("pm-motor").emails).toEqual(["verksted@pmmotor.no", "salg@pmmotor.no"]);
    expect(byId("calmoto").emails).toBeUndefined();
  });

  it("an address without a house number pins at the town; Directions searches name + town", () => {
    const p = byId("e-mc-sweden");
    expect(p.geocodePrecision).toBe("town");
    expect(decodeURIComponent(directionsUrl(p)!)).toContain("E-MC Sweden, Marieholm");
    expect(byId("projekt31").geocodePrecision).toBe("address");
    expect(byId("projekt31").address).toBe("Hauptstraße 1a, 2231 Strasshof an der Nordbahn");
  });
});

describe("roles", () => {
  it("Importer → Country partner; agreements add Service", () => {
    expect(byId("electric-motorcycles-nederland").types).toEqual(["country", "service"]);
    expect(byId("australian-electric-motor-co").types).toEqual(["country"]);
    expect(byId("otten-kalte-klima-elektro").types).toEqual(["dealer", "service"]);
    expect(byId("volt-azur").types).toEqual(["dealer"]);
    expect(byId("calmoto").types).toEqual(["dealer", "service"]); // "Dealer / US service centre"
    expect(byId("ocd-custom-cycles").types).toEqual(["service"]);
  });

  it("Service filter includes country partners and dealers with service", () => {
    const ids = filterPartners(partners, { ...all, type: "service" }).map((p) => p.id);
    expect(ids).toHaveLength(18);
    expect(ids).toContain("rydu");
    expect(ids).toContain("ramsperger-automobile");
    expect(ids).not.toContain("volt-azur");
  });
});

describe("dealers tab and country dropdown", () => {
  it("country partners count as dealers and keep their badge", () => {
    const ids = filterPartners(partners, { ...all, type: "dealer" }).map((p) => p.id);
    for (const id of ["rydu", "electronia", "australian-electric-motor-co"]) expect(ids).toContain(id);
    expect(byId("rydu").types).toEqual(["country", "service"]);
  });
  it("dropdown always lists all 18 countries with per-tab counts (0 kept)", () => {
    const c = countryCounts(partners, "service");
    expect(c).toHaveLength(18);
    expect(c.find((x) => x.country === "Singapore")).toEqual({ country: "Singapore", count: 1 });
    expect(c.find((x) => x.country === "Australia")).toEqual({ country: "Australia", count: 0 });
    expect(countryCounts(partners, "dealer").find((x) => x.country === "Hong Kong")?.count).toBe(1);
  });
});

describe("use my location", () => {
  const singapore = { lat: 1.3521, lng: 103.8198 };
  const munich = { lat: 48.1374, lng: 11.5755 };
  const reykjavik = { lat: 64.1466, lng: -21.9426 };
  it("Singapore: IFYNI nearby, no partner beyond 500 km, nothing from the US", () => {
    const r = findNearby(partners, singapore, "all");
    expect(r.mode).toBe("nearby");
    expect(r.partners.map((p) => p.id)).toEqual(["ifyni"]);
    expect(r.partners.every((p) => p.distanceKm <= 500)).toBe(true);
  });
  it("Munich: lines to the 3 nearby partners", () => {
    const r = findNearby(partners, munich, "all");
    expect(r.partners.map((p) => p.id)).toEqual(["electric-horses", "ramsperger-automobile", "e-performance"]);
  });
  it("Tel Aviv, Dealers tab: no dealer within 500 km, so all types (Lee-Gal)", () => {
    const r = findNearby(partners, { lat: 32.0853, lng: 34.7818 }, "dealer");
    expect(r.type).toBe("all");
    expect(r.partners.map((p) => p.id)).toEqual(["lee-gal-motorbikes"]);
  });
  it("Reykjavik: nothing within 500 km → single nearest, no lines", () => {
    const r = findNearby(partners, reykjavik, "all");
    expect(r.mode).toBe("nearest");
    expect(r.partners).toHaveLength(1);
    expect(r.partners[0].distanceKm).toBeGreaterThan(500);
  });
});

describe("order", () => {
  const rank = (p: Partner) => (p.types.includes("country") ? 0 : p.types.includes("dealer") ? 1 : 2);
  it("country partners first, then dealers, then service-only; each by country then name", () => {
    const sorted = sortPartners(partners);
    const ranks = sorted.map(rank);
    expect(ranks).toEqual([...ranks].sort());
    expect(sorted[0].types[0]).toBe("country");
    for (let i = 1; i < sorted.length; i++) {
      const [a, b] = [sorted[i - 1], sorted[i]];
      if (rank(a) === rank(b)) expect(a.country.localeCompare(b.country) || a.name.localeCompare(b.name)).toBeLessThanOrEqual(0);
    }
  });

  it("groups by region, only regions with results", () => {
    const g = groupByRegion(sortPartners(filterPartners(partners, { ...all, country: "Germany" })));
    expect(g.map((x) => x.region)).toEqual(["Europe"]);
    expect(g[0].partners).toHaveLength(3);
  });
});

describe("URL state", () => {
  const countries = countriesFor(partners, "all");
  it("?type=importer maps to country partners", () => {
    expect(parseState({ type: "importer" }, countries).type).toBe("country");
    expect(parseState({ type: "country" }, countries).type).toBe("country");
    expect(stateToQuery({ ...all, type: "country" })).toBe("?type=country");
  });
  it("parses and round-trips", () => {
    const s = parseState({ type: "dealer", country: "germany", q: "meppen" }, countries);
    expect(s).toEqual({ type: "dealer", country: "Germany", q: "meppen" });
    expect(stateToQuery(s)).toBe("?type=dealer&country=Germany&q=meppen");
    expect(parseState({ type: "bogus" }, countries).type).toBe("all");
  });
});

describe("distance", () => {
  const munich = { lat: 48.1374, lng: 11.5755 };
  const sydney = { lat: -33.8688, lng: 151.2093 };

  it("haversine and formatting", () => {
    expect(distanceKm(munich, munich)).toBe(0);
    expect(Math.round(distanceKm(munich, { lat: 52.52, lng: 13.405 }))).toBe(504);
    expect(formatKm(4.25)).toBe("4.3 km");
    expect(formatKm(12.2)).toBe("12 km");
    expect(formatKm(14872)).toBe("14 872 km");
  });

  it("nearest 3 from Munich (All)", () => {
    expect(nearest(partners, munich, 3).map((p) => p.id)).toEqual(["electric-horses", "ramsperger-automobile", "e-performance"]);
  });

  it("nearest 3 respects the active filter", () => {
    const n = nearest(filterPartners(partners, { ...all, type: "country" }), munich, 3);
    expect(n).toHaveLength(3);
    expect(n.every((p) => p.types.includes("country"))).toBe(true);
    expect(n[0].distanceKm).toBeLessThanOrEqual(n[1].distanceKm);
  });

  it("nearest from Sydney is AEMC", () => {
    expect(nearest(partners, sydney, 1)[0].id).toBe("australian-electric-motor-co");
  });

  it("sortByDistance puts the nearest first", () => {
    expect(sortByDistance(partners, munich)[0].id).toBe("electric-horses");
  });

  it("bounds of nothing is null", () => {
    expect(boundsOf([])).toBeNull();
  });
});

describe("map worker", () => {
  it("public worker file matches the installed maplibre-gl version", () => {
    const { version } = JSON.parse(fs.readFileSync("node_modules/maplibre-gl/package.json", "utf8"));
    const src = fs.readFileSync("components/partners/PartnerMap.tsx", "utf8");
    expect(src).toContain(`MAPLIBRE_VERSION = "${version}"`);
    expect(fs.existsSync(`public/vendor/maplibre-gl-${version}-csp-worker.js`)).toBe(true);
  });
});
