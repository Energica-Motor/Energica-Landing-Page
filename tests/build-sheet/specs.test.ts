import { describe, expect, it } from "vitest";
import { SPECS, fmt, keyStats, performanceFor, specTable } from "@/lib/build-sheet/specs";
import { models } from "@/data/models";

// Figures from Energica's 2026 technical sheets (data/source/specs/).
// If one of these fails, a figure was changed: it must match the sheets.
const SHEET = {
  ego: { peak: "PEAK POWER 171 HP", std: "0–100 KM/H 2.8 sec", rs: "0–100 KM/H (RS) 2.6 sec", city: "CITY RANGE 420 km", top: "TOP SPEED 240 km/h" },
  eva_ribelle: { peak: "PEAK POWER 171 HP", std: "0–100 KM/H 2.8 sec", rs: "0–100 KM/H (RS) 2.6 sec", city: "CITY RANGE 420 km", top: "TOP SPEED 200 km/h" },
  essesse9: { peak: "PEAK POWER 109 HP", std: "0–100 KM/H 3.0 sec", rs: "0–100 KM/H (RS) 2.8 sec", city: "CITY RANGE 420 km", top: "TOP SPEED 200 km/h" },
  experia: { peak: "PEAK POWER 102 HP", std: "0–100 KM/H 3.5 sec", rs: "0–100 KM/H 3.5 sec", city: "CITY RANGE 420 km", top: "TOP SPEED 180 km/h" },
} as const;

const line = (s: { label: string; value: string; unit: string }) => `${s.label} ${s.value} ${s.unit}`;

describe("2026 sheet figures", () => {
  it.each(Object.keys(SHEET) as (keyof typeof SHEET)[])("%s: standard and RS grids (RS changes only 0–100 km/h)", (m) => {
    const e = SHEET[m];
    expect(performanceFor(m, "X").grid.map(line)).toEqual([e.peak, e.std, e.city, e.top]);
    expect(performanceFor(m, "X", { rs: true }).grid.map(line)).toEqual([e.peak, e.rs, e.city, e.top]);
  });

  it("shared Plus figures", () => {
    for (const m of ["ego", "eva_ribelle", "essesse9"] as const) {
      const f = SPECS[m];
      expect([f.voltage, f.efficiency, f.range.city, f.range.combined, f.range.extraUrban]).toEqual([300, 96.5, 420, 246, 198]);
      expect([f.battery.maxKwh, f.battery.nominalKwh, f.charging.onboardKw, f.weightKg]).toEqual([21.5, 18.9, 3, 260]);
      expect([f.dims.wheelbase, f.dims.length, f.dims.width]).toEqual([1465, 2140, 870]);
    }
    expect(SPECS.ego.dims.seat).toBe(810);
    expect(SPECS.eva_ribelle.dims.height).toBe(1152);
  });

  it("Experia figures", () => {
    const f = SPECS.experia;
    expect(fmt.torque(f)).toBe("115 Nm (900 Nm at the wheel)");
    expect(f.range).toEqual({ city: 420, combined: 256, extraUrban: 208, wmtc: 222 });
    expect(f.dims).toEqual({ seat: 847, height: 1461, width: 867, wheelbase: 1513, length: 2132 });
    expect(f.accelRs).toBeUndefined();
  });

  it("warranty wording", () => {
    expect(fmt.warranty(SPECS.ego)).toBe("2 years vehicle, 3 years / 50,000 km battery");
  });

  it("no imperial units or old figures in any model page data", () => {
    const text = JSON.stringify(models) + JSON.stringify(Object.keys(SPECS).map((m) => specTable(m as keyof typeof SPECS)));
    expect(text).not.toMatch(/\bmph\b|miles|lbs|ft ?lb|HSM|222 Nm|\b(147|169|207|201|241)\b/);
  });

  it("model page key bar shows the RS 0–100 km/h", () => {
    expect(keyStats("ego", { rs: true })[1]).toEqual({ label: "0–100 km/h (RS)", value: "2.6", unit: "sec" });
  });

  it("throws for an unknown model", () => {
    // @ts-expect-error deliberately wrong id
    expect(() => performanceFor("nope", "Nope")).toThrow(/unknown model/);
  });
});
