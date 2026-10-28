import { describe, expect, it } from "vitest";
import { MODEL_SPECS, performanceFor, validateSpec } from "@/lib/build-sheet/specs";

describe("model specs", () => {
  it("are all valid", () => {
    for (const [m, s] of Object.entries(MODEL_SPECS)) expect(() => validateSpec(m, s)).not.toThrow();
  });

  it("pick acceleration by version and label it from the data", () => {
    const rs = performanceFor("eva_ribelle", "Eva Ribelle", "RS");
    expect(rs.grid.find((c) => c.label.startsWith("0 TO 60"))).toMatchObject({ label: "0 TO 60 MPH, RS", figure: { value: "2.6" } });
    expect(rs.note).toMatch(/Acceleration shown for the RS version\.$/);
    const std = performanceFor("essesse9", "EsseEsse9", "Standard");
    expect(std.grid.find((c) => c.label.startsWith("0 TO 60"))?.figure.value).toBe("3.0");
    const experia = performanceFor("experia", "Experia", null);
    expect(experia.grid.find((c) => c.label.startsWith("0 TO 100 KM/H"))?.figure.value).toBe("3.5");
    expect(experia.note).not.toMatch(/Acceleration shown/);
  });

  it("match the published figures", () => {
    const ego = performanceFor("ego", "Ego", "RS");
    expect(ego.grid[0].figure).toEqual({ value: "169", unit: "HP · 126 kW" });
    expect(ego.strip.find((c) => c.label === "SEAT HEIGHT")?.value).toBe("810 mm");
    expect(ego.grid.find((c) => c.label.startsWith("TOP SPEED"))?.figure.value).toBe("241");
  });

  it("hide Experia's DC fast charge cell and never show range", () => {
    expect(performanceFor("experia", "Experia", null).strip.map((c) => c.label)).toEqual(["BATTERY", "WEIGHT", "SEAT HEIGHT"]);
    for (const m of ["eva_ribelle", "essesse9", "ego", "experia"] as const) {
      expect(JSON.stringify(performanceFor(m, m, null))).not.toMatch(/RANGE|city/i);
    }
  });

  it("throw for an unknown model", () => {
    // @ts-expect-error deliberately wrong id
    expect(() => performanceFor("nope", "Nope", null)).toThrow(/unknown model/);
  });
});
