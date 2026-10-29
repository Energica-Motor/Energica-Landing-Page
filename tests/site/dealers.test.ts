import { describe, expect, it } from "vitest";
import { allDealers, dealerCounts, dealerCountries, dealerMapUrl, dealerRegions } from "@/data/dealers";

describe("dealer data", () => {
  it("works out the header counts from the list", () => {
    expect(dealerCounts).toEqual({ regions: dealerRegions.length, locations: allDealers.length, countries: dealerCountries.length });
    expect(dealerCounts).toEqual({ regions: 2, locations: 7, countries: 5 });
  });

  it("searches Maps for each dealer's own name and address", () => {
    for (const d of allDealers.filter((d) => d.address)) {
      const url = new URL(dealerMapUrl(d)!);
      expect(url.origin + url.pathname).toBe("https://www.google.com/maps/search/");
      expect(url.searchParams.get("api")).toBe("1");
      expect(url.searchParams.get("query")).toBe(`${d.name}, ${d.address}, ${d.country}`);
    }
  });

  it("has no map link without an address", () => {
    expect(dealerMapUrl(allDealers.find((d) => d.name === "Future Mobility")!)).toBeNull();
  });
});
