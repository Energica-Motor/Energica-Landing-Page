import { describe, expect, it } from "vitest";
import { MODEL_SPECS, performanceFor, validateSpec } from "@/lib/build-sheet/specs";

// The figures are locked to what each energicamotor.com model page highlights.
// If one of these fails, the spec file was changed: get sign-off first.
const LOCKED = {
  eva_ribelle: {
    stats: ["PEAK POWER 147 HP", "0–60 MPH (RS) 2.6 sec", "CITY RANGE 420 km", "TOP SPEED 201 km/h"],
    callout: ["147 HP", "EMCE-derived platform. Road legal."],
  },
  ego: {
    stats: ["PEAK POWER 169 HP", "0–60 MPH (RS) 2.6 sec", "CITY RANGE 261 miles", "TOP SPEED 150 mph"],
    callout: ["147 HP", "EMCE-derived peak power. Road legal."],
  },
  essesse9: {
    stats: ["PEAK POWER 107 HP", "0–60 MPH (RS) 2.8 sec", "CITY RANGE 420 km", "TOP SPEED 201 km/h"],
    callout: ["207 Nm", "Wheel torque"],
  },
  experia: {
    stats: ["PEAK POWER 102 HP", "0–100 KM/H 3.5 sec", "CITY RANGE 420 km", "TOP SPEED 180 km/h"],
    callout: ["22.5 kWh", "Largest battery of any production electric motorcycle"],
  },
} as const;

describe("model specs", () => {
  it("are all valid", () => {
    for (const [m, s] of Object.entries(MODEL_SPECS)) expect(() => validateSpec(m, s)).not.toThrow();
  });

  it.each(Object.keys(LOCKED) as (keyof typeof LOCKED)[])("match the published %s page exactly", (m) => {
    const view = performanceFor(m, "X");
    expect(view.grid.map((s) => `${s.label} ${s.value} ${s.unit}`)).toEqual(LOCKED[m].stats);
    expect([view.callout.stat, view.callout.label]).toEqual(LOCKED[m].callout);
  });

  it("carry nothing beyond the four stats and the callout", () => {
    expect(Object.keys(MODEL_SPECS).sort()).toEqual(Object.keys(LOCKED).sort());
    for (const s of Object.values(MODEL_SPECS)) expect(Object.keys(s).sort()).toEqual(["callout", "stats"]);
  });

  it("note where the figures come from", () => {
    expect(performanceFor("ego", "Ego").note).toBe("Figures as published for the Ego on energicamotor.com.");
  });

  it("throw for an unknown model", () => {
    // @ts-expect-error deliberately wrong id
    expect(() => performanceFor("nope", "Nope")).toThrow(/unknown model/);
  });
});
