// Published performance figures per model, keyed by model and version, for
// page 3 of the build sheet. Source: data/models.ts (Energica's published
// specification). A missing value hides its cell. Range is recorded but never
// rendered until confirmed.
import type { ModelId, Version } from "./catalog";

export interface Figure { value: string; unit: string }
export interface Spec { value: string; verified: boolean }

export interface ModelSpec {
  peakPower: { hp: number; kw: number };
  torque: { nm: number; label: string };
  topSpeed: { kmh: number; limited: boolean };
  acceleration: { label: string; seconds: Partial<Record<"RS" | "Standard" | "all", number>> };
  battery?: Spec;
  dcFastCharge?: Spec;
  weight?: Spec;
  seatHeight?: Spec;
  range?: Spec; // never rendered
}

const ok = (value: string): Spec => ({ value, verified: true });
const unverified = (value: string): Spec => ({ value, verified: false });

export const MODEL_SPECS: Record<ModelId, ModelSpec> = {
  eva_ribelle: {
    peakPower: { hp: 169, kw: 126 },
    torque: { nm: 222, label: "TORQUE AT THE WHEEL" },
    topSpeed: { kmh: 201, limited: false },
    acceleration: { label: "0 TO 60 MPH", seconds: { RS: 2.6, Standard: 2.8 } },
    battery: ok("21.5 kWh max"),
    dcFastCharge: ok("80% in 40 min"),
    weight: ok("260 kg"),
    seatHeight: ok("789 mm"),
    range: unverified("420 km city"),
  },
  ego: {
    peakPower: { hp: 169, kw: 126 },
    torque: { nm: 222, label: "TORQUE AT THE WHEEL" },
    topSpeed: { kmh: 241, limited: true },
    acceleration: { label: "0 TO 60 MPH", seconds: { RS: 2.6, Standard: 2.8 } },
    battery: ok("21.5 kWh max"),
    dcFastCharge: ok("80% in 40 min"),
    weight: ok("260 kg"),
    seatHeight: ok("810 mm"), // 31.9 in
    range: unverified("261 mi city"),
  },
  essesse9: {
    peakPower: { hp: 107, kw: 80 },
    torque: { nm: 207, label: "TORQUE AT THE WHEEL" },
    topSpeed: { kmh: 201, limited: false },
    acceleration: { label: "0 TO 60 MPH", seconds: { RS: 2.8, Standard: 3.0 } },
    battery: ok("21.5 kWh max"),
    dcFastCharge: ok("80% in 40 min"),
    weight: unverified("260 kg"),
    seatHeight: unverified("789 mm"),
    range: unverified("420 km city"),
  },
  experia: {
    peakPower: { hp: 102, kw: 75 },
    // 115 Nm is motor torque (the published wheel figure is 900 Nm), so the label says so.
    torque: { nm: 115, label: "MOTOR TORQUE" },
    topSpeed: { kmh: 180, limited: true },
    acceleration: { label: "0 TO 100 KM/H", seconds: { all: 3.5 } },
    battery: ok("22.5 kWh max"),
    // DC fast-charge time not in the published spec: hidden until confirmed.
    weight: ok("260 kg"),
    seatHeight: ok("847 mm"),
    range: unverified("420 km city"),
  },
};

/** Throws with a clear message if a spec entry is malformed. */
export function validateSpec(model: string, spec: ModelSpec): void {
  const fail = (what: string) => { throw new Error(`[build-sheet] invalid spec for ${model}: ${what}`); };
  const pos = (n: unknown) => typeof n === "number" && Number.isFinite(n) && n > 0;
  if (!pos(spec.peakPower?.hp) || !pos(spec.peakPower?.kw)) fail("peakPower");
  if (!pos(spec.torque?.nm) || !spec.torque.label) fail("torque");
  if (!pos(spec.topSpeed?.kmh)) fail("topSpeed");
  if (!spec.acceleration?.label || !Object.values(spec.acceleration.seconds).some(pos)) fail("acceleration");
  for (const k of ["battery", "dcFastCharge", "weight", "seatHeight", "range"] as const) {
    const s = spec[k];
    if (s && (typeof s.value !== "string" || !s.value.trim())) fail(k);
  }
}
for (const [m, s] of Object.entries(MODEL_SPECS)) validateSpec(m, s);

export interface Cell { label: string; figure: Figure; unitSuffix?: string }
export interface StripCell { label: string; value: string }
export interface PerformanceView {
  grid: Cell[]; // 2 x 2 headline figures
  strip: StripCell[]; // battery, DC fast charge, weight, seat height (missing ones dropped)
  note: string;
}

/** Page-3 figures for a model and version. Throws for an unknown model. */
export function performanceFor(model: ModelId, modelName: string, version: Version): PerformanceView {
  const spec = MODEL_SPECS[model];
  if (!spec) throw new Error(`[build-sheet] unknown model ${model}`);
  const secs = spec.acceleration.seconds;
  const accel = (version && secs[version]) ?? secs.all ?? secs.Standard ?? secs.RS;
  const accelVersion = version && secs[version] ? version : null;

  const grid: Cell[] = [
    { label: "PEAK POWER", figure: { value: String(spec.peakPower.hp), unit: `HP · ${spec.peakPower.kw} kW` } },
    { label: spec.torque.label, figure: { value: String(spec.torque.nm), unit: "Nm" } },
  ];
  if (accel) {
    grid.push({
      label: accelVersion ? `${spec.acceleration.label}, ${accelVersion.toUpperCase()}` : spec.acceleration.label,
      figure: { value: accel.toFixed(1), unit: "s" },
    });
  }
  grid.push({
    label: spec.topSpeed.limited ? "TOP SPEED, LIMITED" : "TOP SPEED",
    figure: { value: String(spec.topSpeed.kmh), unit: "km/h" },
  });

  const strip: StripCell[] = [];
  if (spec.battery) strip.push({ label: "BATTERY", value: spec.battery.value });
  if (spec.dcFastCharge) strip.push({ label: "DC FAST CHARGE", value: spec.dcFastCharge.value });
  if (spec.weight) strip.push({ label: "WEIGHT", value: spec.weight.value });
  if (spec.seatHeight) strip.push({ label: "SEAT HEIGHT", value: spec.seatHeight.value });

  const note =
    `Figures for the ${modelName} from Energica's published specification.` +
    (accelVersion ? ` Acceleration shown for the ${accelVersion} version.` : "");
  return { grid, strip, note };
}
