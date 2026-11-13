import { describe, expect, it, vi } from "vitest";
import { buildSheetContent, normaliseOptionName, rowFor } from "@/lib/build-sheet/catalog";
import fixtures from "./fixtures.json";

const title = (name: string, groupKey = "optional_upgrades") => rowFor({ id: "x", name, groupKey })?.title;

describe("display names", () => {
  it("maps raw option names to clean display names", () => {
    expect(title("ER-40-RS VERSION", "rs_options")).toBe("RS");
    expect(title("ER-93-BAGS PLATES GUN METAL", "bags_plates")).toBe("Gun Metal");
    expect(title("*ER-52-STANDARD SUSPENSIONS", "suspension")).toBe("Standard suspension");
    expect(title("*EG-64-STANDARD CAST ALUMINIUM WHEELS", "wheels")).toBe("Cast aluminium wheels");
    expect(title("ER-24-FRAME BLACK ")).toBe("Black frame");
    expect(title("ER-91-SIDE BAGS KIT")).toBe("Side bag kit");
    expect(title("ES-59CARBON FIBER WHEELS", "wheels")).toBe("Carbon fibre wheels");
  });

  it("labels colours COLOURWAY and strips the model name", () => {
    const row = rowFor({ id: "c", name: "EVA RIBELLE TRICOLORE", groupKey: "base_color" })!;
    expect(row.label).toBe("COLOURWAY");
    expect(row.title).toBe("Tricolore livery");
    expect(normaliseOptionName("#ES-01 BASE-EsseEsse9 BORMIO ICE")).toBe("bormio ice");
  });

  it("falls back to title case and warns for unknown options", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(title("XX-99-MYSTERY PART")).toBe("Mystery Part");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("knows every option of every model", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const m of ["eva_ribelle", "essesse9", "ego", "experia"] as const) {
      buildSheetContent(m, fixtures[m].max, fixtures[m].hasRs);
    }
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("splits the reference build into base specification and upgrades", () => {
    const c = buildSheetContent("eva_ribelle", fixtures.reference, true);
    expect(c.version).toBe("RS");
    expect(c.colourway).toBe("Tricolore");
    expect(c.base.map((r) => r.label)).toEqual(["COLOURWAY", "VERSION", "SUSPENSION", "WHEELS"]);
    expect(c.upgrades.map((r) => r.title)).toEqual(["Black frame", "Side bag kit", "Gun Metal"]);
  });

  it("shows Standard where an RS version exists but was not chosen, and no version for Experia", () => {
    const noRs = fixtures.reference.filter((o) => !/RS VERSION/.test(o.name));
    expect(buildSheetContent("eva_ribelle", noRs, true).version).toBe("Standard");
    const experia = buildSheetContent("experia", fixtures.experia.max, fixtures.experia.hasRs);
    expect(experia.version).toBeNull();
    expect(experia.base.some((r) => r.label === "VERSION")).toBe(false);
  });
});
