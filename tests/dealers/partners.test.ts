import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { partners, type Partner } from "@/data/partners";
import {
  boundsOf,
  countByType,
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
  it("expected counts: All 24, Country partners 8, Dealers 8, Service 18, 18 countries", () => {
    expect(countByType(partners)).toEqual({ all: 24, country: 8, dealer: 8, service: 18 });
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

  it("phones: bracket notes stripped, area codes kept, 'Not found' skipped", () => {
    expect(byId("electric-motorcycles-nederland").phones).toEqual(["+31 6 55 711 412", "+31 85 401 6222"]);
    expect(byId("ramsperger-automobile").phones).toEqual(["+49 7021 50010"]);
    expect(byId("ocd-custom-cycles").phones).toEqual(["(505) 428-0646"]);
    expect(byId("nordic-motors").phones).toBeUndefined();
    expect(telHref("(07) 5645 6820")).toBe("tel:0756456820");
  });

  it("websites: notes stripped, two sites kept, 'None found' skipped", () => {
    expect(byId("nordic-motors").websites).toEqual(["https://nordicmotors.dk"]);
    expect(byId("electric-horses").websites).toEqual(["https://electric-horses.de", "https://richter-zech.de"]);
    expect(byId("energica-hrvatska").websites).toBeUndefined();
  });

  it("emails: first is the main address, the rest follow", () => {
    expect(byId("rydu").emails?.[0]).toBe("Gerald@rydu.com");
    expect(byId("rydu").emails).toHaveLength(4);
  });

  it("town-only addresses pin at the town; Directions searches name + town", () => {
    for (const id of ["projekt31", "e-mc-sweden"]) {
      const p = byId(id);
      expect(p.geocodePrecision).toBe("town");
      expect(decodeURIComponent(directionsUrl(p)!)).toContain(p.name);
    }
    expect(decodeURIComponent(directionsUrl(byId("projekt31"))!)).toContain("Strasshof an der Nordbahn");
    expect(byId("projekt31").address).toBe("Hauptstraße, A-2231 Strasshof (house no. not legible)");
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
    expect(formatKm(4.25)).toBe("4.3 km");
    expect(formatKm(1234.4)).toBe("1,234 km");
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
