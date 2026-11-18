import { describe, expect, it } from "vitest";
import { SPECS, fmt, keyStats, performanceFor, specTable } from "@/lib/build-sheet/specs";
import { models } from "@/data/models";

// Figures from Energica's 2026 technical sheets (data/source/specs/).
// If one of these fails, a figure was changed: it must match the sheets.
const SHEET = {
  ego: { peak: "PEAK POWER 171 HP", std: "0–100 KM/H (0–60 MPH) 2.8 sec", rs: "0–100 KM/H (0–60 MPH) RS 2.6 sec", city: "CITY RANGE 420 km (261 mi)", top: "TOP SPEED 240 km/h (150 mph)" },
  eva_ribelle: { peak: "PEAK POWER 171 HP", std: "0–100 KM/H (0–60 MPH) 2.8 sec", rs: "0–100 KM/H (0–60 MPH) RS 2.6 sec", city: "CITY RANGE 420 km (261 mi)", top: "TOP SPEED 200 km/h (125 mph)" },
  essesse9: { peak: "PEAK POWER 109 HP", std: "0–100 KM/H (0–60 MPH) 3.0 sec", rs: "0–100 KM/H (0–60 MPH) RS 2.8 sec", city: "CITY RANGE 420 km (261 mi)", top: "TOP SPEED 200 km/h (125 mph)" },
  experia: { peak: "PEAK POWER 102 HP", std: "0–100 KM/H (0–60 MPH) 3.5 sec", rs: "0–100 KM/H (0–60 MPH) 3.5 sec", city: "CITY RANGE 420 km (261 mi)", top: "TOP SPEED 180 km/h (112 mph)" },
} as const;

const line = (s: { label: string; value: string; unit: string; sub?: string }) => `${s.label.replace(/ /g, " ").replace(/⁠/g, "")} ${s.value} ${s.unit}${s.sub ? ` (${s.sub})` : ""}`;

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
    expect(fmt.torque(f)).toBe("115 Nm (85 ft lb), 900 Nm (664 ft lb) at the wheel");
    expect(f.range).toEqual({ city: 420, combined: 256, extraUrban: 208, wmtc: 222 });
    expect(f.dims).toEqual({ seat: 847, height: 1461, width: 867, wheelbase: 1513, length: 2132 });
    expect(f.accelRs).toBeUndefined();
  });

  it("warranty wording", () => {
    expect(fmt.warranty(SPECS.ego)).toBe("2 years vehicle, 3 years / 50,000 km (31,000 mi) battery");
  });

  it("imperial next to metric in the spec tables, as on the English sheets", () => {
    const t = specTable("ego");
    expect(t.motor.range).toBe("City 420 km (261 mi) / Combined 246 km (153 mi) / Extra-urban 198 km (123 mi)");
    expect(t.motor.topSpeed).toBe("Limited at 240 km/h (150 mph)");
    expect(t.dimensions.width).toBe("870 mm (34.3 in)");
    expect(t.dimensions.weight).toBe("260 kg (573 lb)");
    expect(specTable("experia").dimensions.height).toBe("1,461 mm (57.5 in) (mirrors not included)");
    expect(specTable("experia").motor.range).toContain("WMTC 222 km (138 mi)");
  });

  it("no old figures or old motor name in any model page data", () => {
    const text = JSON.stringify(models);
    expect(text).not.toMatch(/HSM|222 Nm|(147|169|207|201|241)|miles|lbs/);
  });

  it("model page key bar shows the RS 0–100 km/h", () => {
    expect({ ...keyStats("ego", { rs: true })[1], label: keyStats("ego", { rs: true })[1].label.replace(/ /g, " ").replace(/⁠/g, "") }).toEqual({ label: "0–100 km/h (0–60 mph) RS", value: "2.6", unit: "sec" });
  });

  it("throws for an unknown model", () => {
    // @ts-expect-error deliberately wrong id
    expect(() => performanceFor("nope", "Nope")).toThrow(/unknown model/);
  });
});
