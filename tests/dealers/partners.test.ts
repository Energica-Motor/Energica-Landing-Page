import { describe, expect, it } from "vitest";
import { partners, samplePartners, visiblePartners, type Partner } from "@/data/partners";
import {
  boundsOf,
  countByType,
  countriesFor,
  directionsUrl,
  distanceKm,
  filterPartners,
  formatKm,
  groupByRegion,
  parseState,
  sortByDistance,
  stateToQuery,
  summary,
  telHref,
} from "@/lib/partners";

const all = { type: "all" as const, country: "", q: "" };

describe("dealer data", () => {
  it("real partners: 7 partners, 5 countries, 2 regions", () => {
    expect(summary(partners)).toEqual({ partners: 7, countries: 5, regions: 2 });
  });

  it("counts per type from the data", () => {
    expect(countByType(partners)).toEqual({ all: 7, dealer: 4, importer: 3, service: 0 });
  });

  it("a dealer + service partner appears once and counts in both filters", () => {
    const list = [...partners, ...samplePartners];
    const munich = list.filter((p) => p.id === "sample-dealer-service-munich");
    expect(munich).toHaveLength(1);
    const c = countByType(list);
    expect(c.all).toBe(11);
    expect(c.dealer).toBe(5);
    expect(c.service).toBe(4);
    expect(filterPartners(list, { ...all, type: "dealer" }).map((p) => p.id)).toContain("sample-dealer-service-munich");
    expect(filterPartners(list, { ...all, type: "service" }).map((p) => p.id)).toContain("sample-dealer-service-munich");
  });

  it("sample partners never reach production", () => {
    expect(visiblePartners("production").some((p) => p.sample)).toBe(false);
    expect(visiblePartners("production")).toHaveLength(7);
    expect(visiblePartners("preview").some((p) => p.sample)).toBe(true);
  });

  it("every partner has a unique id; located partners have an address, unlocated have no pin", () => {
    const list = [...partners, ...samplePartners];
    expect(new Set(list.map((p) => p.id)).size).toBe(list.length);
    for (const p of list) {
      if (p.lat !== undefined || p.lng !== undefined) expect(p.address).toBeTruthy();
    }
    const fm = partners.find((p) => p.id === "future-mobility")!;
    expect(fm.lat).toBeUndefined();
    expect(directionsUrl(fm)).toBeNull();
  });

  it("no empty strings in optional fields (cards never show empty rows)", () => {
    for (const p of [...partners, ...samplePartners]) {
      for (const k of ["city", "address", "phone", "email", "website", "hours"] as const) {
        if (k in p) expect((p[k] ?? "").trim()).not.toBe("");
      }
      if (p.services) expect(p.services.length).toBeGreaterThan(0);
    }
  });

  it("coordinates fall inside their country's rough bounds", () => {
    const box: Record<string, [number, number, number, number]> = {
      Croatia: [42, 47, 13, 20], Germany: [47, 55.5, 5.5, 15.5], France: [41, 51.5, -5.5, 10],
      "Hong Kong": [22.1, 22.6, 113.8, 114.5], Italy: [36, 47.5, 6, 19], Netherlands: [50.7, 53.7, 3.3, 7.3],
    };
    for (const p of [...partners, ...samplePartners]) {
      if (p.lat === undefined) continue;
      const [s, n, w, e] = box[p.country];
      expect(p.lat).toBeGreaterThan(s); expect(p.lat).toBeLessThan(n);
      expect(p.lng).toBeGreaterThan(w); expect(p.lng).toBeLessThan(e);
    }
  });
});

describe("filters", () => {
  it("type filter", () => {
    expect(filterPartners(partners, { ...all, type: "dealer" })).toHaveLength(4);
    expect(filterPartners(partners, { ...all, type: "importer" })).toHaveLength(3);
    expect(filterPartners(partners, { ...all, type: "service" })).toHaveLength(0);
  });

  it("country filter", () => {
    expect(filterPartners(partners, { ...all, country: "Germany" }).map((p) => p.id)).toEqual(["alwin-otten", "richter-zech", "ramsperger"]);
  });

  it("search matches name, city, country and address, ignoring case and accents", () => {
    expect(filterPartners(partners, { ...all, q: "TOULON" }).map((p) => p.id)).toEqual(["mobelec-83"]);
    expect(filterPartners(partners, { ...all, q: "nurtingen" }).map((p) => p.id)).toEqual(["ramsperger"]);
    expect(filterPartners(partners, { ...all, q: "hong kong" }).map((p) => p.id)).toEqual(["rydu"]);
    expect(filterPartners(partners, { ...all, q: "richter" }).map((p) => p.id)).toEqual(["richter-zech"]);
    expect(filterPartners(partners, { ...all, q: "zzz" })).toHaveLength(0);
  });

  it("filters combine", () => {
    expect(filterPartners(partners, { type: "dealer", country: "Germany", q: "meppen" }).map((p) => p.id)).toEqual(["alwin-otten"]);
    expect(filterPartners(partners, { type: "importer", country: "Germany", q: "" })).toHaveLength(0);
  });

  it("countries follow the type filter", () => {
    expect(countriesFor(partners, "all")).toEqual(["Belgium", "Croatia", "France", "Germany", "Hong Kong"]);
    expect(countriesFor(partners, "importer")).toEqual(["Belgium", "Croatia", "Hong Kong"]);
  });

  it("groups by region in a fixed order", () => {
    expect(groupByRegion(partners).map((g) => g.region)).toEqual(["Europe", "Asia Pacific"]);
  });
});

describe("distance", () => {
  it("haversine is accurate (Paris–London ≈ 344 km)", () => {
    const d = distanceKm({ lat: 48.8566, lng: 2.3522 }, { lat: 51.5074, lng: -0.1278 });
    expect(d).toBeGreaterThan(340);
    expect(d).toBeLessThan(348);
    expect(distanceKm({ lat: 1, lng: 1 }, { lat: 1, lng: 1 })).toBe(0);
  });

  it("sorts nearest first and keeps partners without a location at the end", () => {
    const stuttgart = { lat: 48.7758, lng: 9.1829 };
    const ranked = sortByDistance(partners, stuttgart);
    expect(ranked[0].id).toBe("ramsperger");
    expect(ranked[ranked.length - 1].id).toBe("future-mobility");
    expect(ranked[ranked.length - 1].distanceKm).toBeUndefined();
    const d = ranked.filter((p) => p.distanceKm !== undefined).map((p) => p.distanceKm!);
    expect([...d].sort((a, b) => a - b)).toEqual(d);
  });

  it("no origin leaves order unchanged", () => {
    expect(sortByDistance(partners, null)).toBe(partners);
  });

  it("formats km", () => {
    expect(formatKm(3.456)).toBe("3.5 km");
    expect(formatKm(1234.4)).toBe("1,234 km");
  });
});

describe("URL state", () => {
  const countries = countriesFor(partners, "all");

  it("parses and normalises", () => {
    expect(parseState({ type: "Dealer", country: "germany", q: "meppen" }, countries)).toEqual({ type: "dealer", country: "Germany", q: "meppen" });
    expect(parseState({ type: "bogus", country: "Narnia" }, countries)).toEqual({ type: "all", country: "", q: "" });
  });

  it("round-trips", () => {
    const s = { type: "importer" as const, country: "Croatia", q: "split" };
    expect(parseState(Object.fromEntries(new URLSearchParams(stateToQuery(s))), countries)).toEqual(s);
    expect(stateToQuery(all)).toBe("");
  });
});

describe("links", () => {
  it("directions use the partner's own name and address", () => {
    const p = partners.find((x) => x.id === "alwin-otten") as Partner;
    const url = new URL(directionsUrl(p)!);
    expect(url.hostname).toBe("www.google.com");
    expect(url.searchParams.get("query")).toBe("Alwin Otten, Industriestr. 22, 49716 Meppen, Germany");
  });

  it("tel links strip formatting", () => {
    expect(telHref("+39 000 000-0000")).toBe("tel:+390000000000");
  });

  it("bounds cover located partners only", () => {
    const b = boundsOf(partners)!;
    expect(b[0][0]).toBeCloseTo(5.97145);
    expect(b[1][0]).toBeCloseTo(114.10969);
    expect(boundsOf([partners[0]])).toBeNull();
  });
});
