// LOCKED: page-3 figures for the build sheet. These are the stats highlighted
// on each energicamotor.com model page, exactly as displayed (value, unit,
// label), plus that page's callout. Do not change, convert or "correct" any
// value without sign-off from the site owner.
import type { ModelId } from "./catalog";

export interface Stat { label: string; value: string; unit: string }
export interface ModelSpec {
  stats: [Stat, Stat, Stat, Stat]; // 2 x 2 grid, in display order
  callout: { stat: string; label: string };
}

export const MODEL_SPECS: Record<ModelId, ModelSpec> = {
  eva_ribelle: {
    stats: [
      { label: "PEAK POWER", value: "147", unit: "HP" },
      { label: "0–60 MPH (RS)", value: "2.6", unit: "sec" },
      { label: "CITY RANGE", value: "420", unit: "km" },
      { label: "TOP SPEED", value: "201", unit: "km/h" },
    ],
    callout: { stat: "147 HP", label: "EMCE-derived platform. Road legal." },
  },
  ego: {
    stats: [
      { label: "PEAK POWER", value: "169", unit: "HP" },
      { label: "0–60 MPH (RS)", value: "2.6", unit: "sec" },
      { label: "CITY RANGE", value: "261", unit: "miles" },
      { label: "TOP SPEED", value: "150", unit: "mph" },
    ],
    callout: { stat: "147 HP", label: "EMCE-derived peak power. Road legal." },
  },
  essesse9: {
    stats: [
      { label: "PEAK POWER", value: "107", unit: "HP" },
      { label: "0–60 MPH (RS)", value: "2.8", unit: "sec" },
      { label: "CITY RANGE", value: "420", unit: "km" },
      { label: "TOP SPEED", value: "201", unit: "km/h" },
    ],
    callout: { stat: "207 Nm", label: "Wheel torque" },
  },
  experia: {
    stats: [
      { label: "PEAK POWER", value: "102", unit: "HP" },
      { label: "0–100 KM/H", value: "3.5", unit: "sec" },
      { label: "CITY RANGE", value: "420", unit: "km" },
      { label: "TOP SPEED", value: "180", unit: "km/h" },
    ],
    callout: { stat: "22.5 kWh", label: "Largest battery of any production electric motorcycle" },
  },
};

/** Throws with a clear message if a spec entry is malformed. */
export function validateSpec(model: string, spec: ModelSpec): void {
  const fail = (what: string) => { throw new Error(`[build-sheet] invalid spec for ${model}: ${what}`); };
  const filled = (s: unknown) => typeof s === "string" && s.trim().length > 0;
  if (spec.stats?.length !== 4) fail("stats must have 4 entries");
  spec.stats.forEach((s, i) => { if (!filled(s.label) || !filled(s.value) || !filled(s.unit)) fail(`stat ${i + 1}`); });
  if (!filled(spec.callout?.stat) || !filled(spec.callout?.label)) fail("callout");
}
for (const [m, s] of Object.entries(MODEL_SPECS)) validateSpec(m, s);

export interface PerformanceView {
  grid: Stat[];
  callout: { stat: string; label: string };
  note: string;
}

/** Page-3 figures for a model. Throws for an unknown model. */
export function performanceFor(model: ModelId, modelName: string): PerformanceView {
  const spec = MODEL_SPECS[model];
  if (!spec) throw new Error(`[build-sheet] unknown model ${model}`);
  return {
    grid: [...spec.stats],
    callout: spec.callout,
    note: `Figures as published for the ${modelName} on energicamotor.com.`,
  };
}
