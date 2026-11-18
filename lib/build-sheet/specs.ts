// SOURCE OF TRUTH for every model figure on the site: 2026 sheets, confirmed by Energica.
//   data/source/specs/Technical_Sheets_ENERGICA_2026_-_ENG.pdf      (Ego+, Eva Ribelle+, EE9+)
//   data/source/specs/Technical_Sheets_ENERGICA_2026_RS_-_ENG.pdf   (same models, RS)
//   data/source/specs/Technical_Sheet_Energica_EXPERIA_2026_-_ENG.pdf
// Model pages, spec tables, meta/Open Graph text, the home showcase, the
// Technology page, the configurator and the build-sheet PDF all read from here.
// Metric first, imperial in brackets: imperial values are copied from the English
// sheets (never converted here) so rounding matches the PDFs. Change a figure here
// and nowhere else.
import type { ModelId } from "./catalog";
import { MODEL_NAMES } from "./catalog";

export interface SheetFigures {
  motor: string;
  voltage: number; // V
  efficiency: number; // % peak
  sustainedKw: number;
  sustainedHp: number;
  sustainedRpm: number;
  peakKw: number;
  peakHp: number;
  peakRpm: number;
  torqueNm: number;
  wheelTorqueNm?: number;
  topSpeedKmh: number;
  accel: number; // 0–100 km/h, s
  accelRs?: number; // RS version, s (no RS: undefined)
  range: { city: number; combined: number; extraUrban: number; wmtc?: number };
  battery: { maxKwh: number; nominalKwh: number; cycles: number };
  charging: { dcKmPerH: number; dcKmPerMin: number; acKmPerH: number; onboardKw: number; acVolts: string };
  weightKg: number;
  dims: { seat: number; height: number; width: number; wheelbase: number; length: number };
  brakes: { frontDiscs: number; frontMm: number; rearMm: number; abs: string };
  suspension: { front: string; rear: string };
  tyres: { name: string; front: string; rear: string };
  chain: string;
  frame: string;
  warranty: { vehicleYears: number; batteryYears: number; batteryKm: number };
  /** Imperial values exactly as printed on the English 2026 sheets. */
  imp: {
    torqueFtLb: number;
    wheelTorqueFtLb?: number;
    topSpeedMph: number;
    range: { city: number; combined: number; extraUrban: number; wmtc?: number }; // mi
    dcMiPerH: number;
    acMiPerH: number;
    weightLb: number;
    batteryWarrantyMi: number;
    dims: { seat: number; height: number; width: number; wheelbase: number; length: number }; // in
  };
}

const PLUS_SHARED = {
  motor: "PMASynRM (permanent magnet assisted synchronous reluctance), liquid cooled",
  voltage: 300,
  efficiency: 96.5,
  range: { city: 420, combined: 246, extraUrban: 198 },
  battery: { maxKwh: 21.5, nominalKwh: 18.9, cycles: 1200 },
  charging: { dcKmPerH: 400, dcKmPerMin: 6.7, acKmPerH: 63.5, onboardKw: 3, acVolts: "110–230 V, 50–60 Hz" },
  weightKg: 260,
  brakes: { frontDiscs: 2, frontMm: 330, rearMm: 240, abs: "Bosch switchable" },
  suspension: { front: "Marzocchi Ø43 mm", rear: "Bitubo" },
  tyres: { name: "Pirelli Diablo Rosso III", front: "120/70 ZR17", rear: "180/55 ZR17" },
  chain: "Regina 16/44 525 O-ring", // RS: 15/44
  frame: "Steel tubular trellis",
  warranty: { vehicleYears: 2, batteryYears: 3, batteryKm: 50000 },
};
const PLUS_IMP = { range: { city: 261, combined: 153, extraUrban: 123 }, dcMiPerH: 248, acMiPerH: 39.5, weightLb: 573, batteryWarrantyMi: 31000 };

export const SPECS: Record<ModelId, SheetFigures> = {
  ego: {
    ...PLUS_SHARED,
    sustainedKw: 110, sustainedHp: 149, sustainedRpm: 8500,
    peakKw: 126, peakHp: 171, peakRpm: 8500,
    torqueNm: 215, topSpeedKmh: 240, accel: 2.8, accelRs: 2.6,
    dims: { seat: 810, height: 1166, width: 870, wheelbase: 1465, length: 2140 },
    imp: { ...PLUS_IMP, torqueFtLb: 159, topSpeedMph: 150, dims: { seat: 31.9, height: 45.9, width: 34.3, wheelbase: 57.7, length: 84.2 } },
  },
  eva_ribelle: {
    ...PLUS_SHARED,
    sustainedKw: 110, sustainedHp: 149, sustainedRpm: 8500,
    peakKw: 126, peakHp: 171, peakRpm: 8500,
    torqueNm: 215, topSpeedKmh: 200, accel: 2.8, accelRs: 2.6,
    dims: { seat: 790, height: 1152, width: 870, wheelbase: 1465, length: 2140 },
    imp: { ...PLUS_IMP, torqueFtLb: 159, topSpeedMph: 125, dims: { seat: 31.1, height: 45.4, width: 34.3, wheelbase: 57.7, length: 84.2 } },
  },
  essesse9: {
    ...PLUS_SHARED,
    sustainedKw: 80, sustainedHp: 109, sustainedRpm: 8500,
    peakKw: 80, peakHp: 109, peakRpm: 8500,
    torqueNm: 200, topSpeedKmh: 200, accel: 3.0, accelRs: 2.8,
    dims: { seat: 790, height: 1152, width: 870, wheelbase: 1465, length: 2140 },
    imp: { ...PLUS_IMP, torqueFtLb: 148, topSpeedMph: 125, dims: { seat: 31.1, height: 45.4, width: 34.3, wheelbase: 57.7, length: 84.2 } },
  },
  experia: {
    motor: "PMASynRM (permanent magnet assisted synchronous reluctance), liquid cooled",
    voltage: 306,
    efficiency: 96,
    sustainedKw: 60, sustainedHp: 80, sustainedRpm: 7000,
    peakKw: 75, peakHp: 102, peakRpm: 7500,
    torqueNm: 115, wheelTorqueNm: 900, topSpeedKmh: 180, accel: 3.5,
    range: { city: 420, combined: 256, extraUrban: 208, wmtc: 222 },
    battery: { maxKwh: 22.5, nominalKwh: 19.6, cycles: 1200 },
    charging: { dcKmPerH: 400, dcKmPerMin: 6.7, acKmPerH: 63.5, onboardKw: 3, acVolts: "90–264 V AC, 50/60 Hz" },
    weightKg: 260,
    dims: { seat: 847, height: 1461, width: 867, wheelbase: 1513, length: 2132 },
    brakes: { frontDiscs: 2, frontMm: 330, rearMm: 240, abs: "Cornering Bosch 9.3 MP" },
    suspension: { front: "ZF Sachs Ø43 mm, 150 mm travel", rear: "ZF Sachs, 150 mm wheel travel" },
    tyres: { name: "Pirelli Scorpion Trail II", front: "120/70 ZR17", rear: "180/55 ZR17" },
    chain: "Regina 16/52 520 O-ring",
    frame: "Front steel tubular trellis / aluminium side plates",
    warranty: { vehicleYears: 2, batteryYears: 3, batteryKm: 50000 },
    imp: {
      torqueFtLb: 85, wheelTorqueFtLb: 664, topSpeedMph: 112,
      range: { city: 261, combined: 160, extraUrban: 130, wmtc: 138 },
      dcMiPerH: 248, acMiPerH: 39.5, weightLb: 573, batteryWarrantyMi: 31000,
      dims: { seat: 33.3, height: 57.5, width: 34.1, wheelbase: 59.5, length: 83.9 },
    },
  },
};

/** Display names live in catalog.MODEL_NAMES (switch to Ego+ / Eva Ribelle+ / EE9+ there). */
export const displayName = (m: ModelId) => MODEL_NAMES[m];

/** Site model slug ("eva-ribelle") → spec id ("eva_ribelle"). */
export const specIdFor = (slug: string): ModelId => slug.replace(/-/g, "_") as ModelId;

// ── Formatting ────────────────────────────────────────────────────────────
const n = (v: number) => v.toLocaleString("en-GB"); // 50,000
const s1 = (v: number) => v.toFixed(1); // 3.0

export const fmt = {
  peakPower: (f: SheetFigures) => `${f.peakHp} HP`,
  power: (f: SheetFigures) =>
    f.sustainedKw === f.peakKw
      ? `${f.peakKw} kW / ${f.peakHp} HP (sustained and peak) at ${n(f.peakRpm)} rpm`
      : `Sustained ${f.sustainedKw} kW / ${f.sustainedHp} HP at ${n(f.sustainedRpm)} rpm – Peak ${f.peakKw} kW / ${f.peakHp} HP at ${n(f.peakRpm)} rpm`,
  torque: (f: SheetFigures) =>
    `${f.torqueNm} Nm (${f.imp.torqueFtLb} ft lb)` +
    (f.wheelTorqueNm ? `, ${f.wheelTorqueNm} Nm (${f.imp.wheelTorqueFtLb} ft lb) at the wheel` : ""),
  torqueMetric: (f: SheetFigures) => (f.wheelTorqueNm ? `${f.torqueNm} Nm (${f.wheelTorqueNm} Nm at the wheel)` : `${f.torqueNm} Nm`),
  topSpeed: (f: SheetFigures) => `${f.topSpeedKmh} km/h (${f.imp.topSpeedMph} mph)`,
  accel: (f: SheetFigures) =>
    f.accelRs ? `0–100 km/h (0–60 mph): ${s1(f.accel)} s (RS ${s1(f.accelRs)} s)` : `0–100 km/h (0–60 mph): ${s1(f.accel)} s`,
  range: (f: SheetFigures) =>
    `City ${f.range.city} km (${f.imp.range.city} mi) / Combined ${f.range.combined} km (${f.imp.range.combined} mi) / Extra-urban ${f.range.extraUrban} km (${f.imp.range.extraUrban} mi)` +
    (f.range.wmtc ? ` / WMTC ${f.range.wmtc} km (${f.imp.range.wmtc} mi)` : ""),
  battery: (f: SheetFigures) => `${f.battery.maxKwh} kWh max / ${f.battery.nominalKwh} kWh nominal – lithium polymer`,
  charging: (f: SheetFigures) =>
    `DC fast charge (Mode 4): ${f.charging.dcKmPerH} km (${f.imp.dcMiPerH} mi) of range per hour / AC (Mode 2 or 3): ${f.charging.acKmPerH} km (${f.imp.acMiPerH} mi) of range per hour`,
  warranty: (f: SheetFigures) =>
    `${f.warranty.vehicleYears} years vehicle, ${f.warranty.batteryYears} years / ${n(f.warranty.batteryKm)} km (${n(f.imp.batteryWarrantyMi)} mi) battery`,
  brakes: (f: SheetFigures) => `Brembo ${f.brakes.frontDiscs} x ${f.brakes.frontMm} mm front, ${f.brakes.rearMm} mm rear`,
  mm: (v: number, inches: number) => `${n(v)} mm (${inches} in)`,
  weight: (f: SheetFigures) => `${f.weightKg} kg (${f.imp.weightLb} lb)`,
};

// Non-breaking spaces keep "0–60 mph" together, so narrow screens break before the bracket.
const ACCEL_LABEL = "0–100 km/h (0–60 mph)";

/** Figure for the key-stat row: 0–100 km/h (0–60 mph), RS value when the model has one. */
export function accelStat(f: SheetFigures, rs: boolean): Stat {
  const useRs = rs && f.accelRs !== undefined;
  return { label: useRs ? ACCEL_LABEL + " RS" : ACCEL_LABEL, value: s1(useRs ? f.accelRs! : f.accel), unit: "sec" };
}

/** sub: the imperial value, shown as a small line under the big metric figure. */
export interface Stat { label: string; value: string; unit: string; sub?: string }

/** The four headline stats (model page key bar, configurator, PDF). */
export function keyStats(m: ModelId, opts: { rs: boolean }): [Stat, Stat, Stat, Stat] {
  const f = SPECS[m];
  return [
    { label: "Peak Power", value: String(f.peakHp), unit: "HP" },
    accelStat(f, opts.rs),
    { label: "City Range", value: String(f.range.city), unit: "km", sub: `${f.imp.range.city} mi` },
    { label: "Top Speed", value: String(f.topSpeedKmh), unit: "km/h", sub: `${f.imp.topSpeedMph} mph` },
  ];
}

/** Headline callout per model (model page story, PDF page 3). Labels are the existing copy. */
export function callout(m: ModelId): { stat: string; label: string } {
  const f = SPECS[m];
  switch (m) {
    case "experia": return { stat: `${f.battery.maxKwh} kWh`, label: "Largest battery of any production electric motorcycle" };
    case "essesse9": return { stat: `${f.torqueNm} Nm`, label: "Torque — from the moment you twist the throttle" };
    case "eva_ribelle": return { stat: `${f.peakHp} HP`, label: "EMCE-derived platform. Road legal." };
    case "ego": return { stat: `${f.peakHp} HP`, label: "EMCE-derived peak power — road legal" };
  }
}

/** Full spec table for a model page (text blocks follow the sheets). */
export function specTable(m: ModelId) {
  const f = SPECS[m];
  const isExperia = m === "experia";
  return {
    motor: {
      type: `${f.motor} — ${f.voltage} V nominal, ${f.efficiency}% peak efficiency`,
      power: fmt.power(f),
      torque: fmt.torque(f),
      topSpeed: `Limited at ${fmt.topSpeed(f)}`,
      acceleration: fmt.accel(f),
      range: fmt.range(f),
    },
    battery: {
      capacity: fmt.battery(f),
      life: `${n(f.battery.cycles)} cycles @ 80% capacity (100% DOD)`,
      batteryCharger: `Onboard, ${f.charging.onboardKw} kW, ${f.charging.acVolts}. Conforms to Standards SAE J1772 and IEC 62196-2 with pilot signal for charging station interface`,
      charging: fmt.charging(f),
      lprFunction: "Long Period Rest: allows the maintenance and automatic balancing of the batteries during long period of non-use",
      chargeInterruption: isExperia
        ? "AC and DC up to requested State Of Charge, AC and DC CCS charge completion with balancing, CHAdeMO 95% (depending on environmental conditions)."
        : "The vehicle can be configured to autonomously stop the charge at a certain level. The user can configure this function through the dashboard",
      warranty: fmt.warranty(f),
    },
    electronics: isExperia
      ? {
          dashboard: "5\" IPS 1000 nits bonded 848×480 TFT Color Display",
          vehicleControlUnit: "Dual Microcontroller ARM Based",
          tractionControl: "Six levels of intervention combined with the existing eABS and the Cornering Bosch 9.3 MP",
          cruiseControl: "Cruise control system that uses the electronic brake to maintain speed and increase braking energy",
          ridingProfiles: "7 Profiles: Energica 1–4 (factory preset), Custom 1–3 (Customizable)",
          ridingModes: "4 Riding Modes: Eco, Urban, Rain, Sport",
          regenMaps: "4 Regenerative Modes: High, Medium, Low, Off",
          parkAssistant: "Forward and Reverse (Slow speed)",
          abs: f.brakes.abs,
        }
      : {
          dashboard: "Cobo, 4.3\" WQVGA 480×272 TFT 16.7 million colors Display; integrated GPS receiver; 9 Warning Lights; 6 + 6 Current Consumption Lights; Ambient Light Sensor; Real Time Clock; GPS 10Hz.",
          vehicleControlUnit: "A Vehicle Control Unit implementing a multi-map adaptive energy and power management algorithm manages the vehicle. It constantly monitors batteries, even in key off position. RS version implements a dedicated mapping and parameterization to highlight the high-performing and thrilling nature of Energica, developed within the racing world.",
          tractionControl: "Six levels of intervention combined with the existing eABS and the Bosch ABS",
          cruiseControl: "Sophisticated cruise control system that uses the electronic brake to maintain speed and increase braking energy",
          ridingModes: "4 Riding Modes: Urban, Eco, Wet, Sport",
          regenMaps: "4 Regenerative Modes: High, Medium, Low, Off",
          parkAssistant: "Back and Forth (Slow speed)",
          abs: f.brakes.abs,
        },
    dimensions: {
      height: `${fmt.mm(f.dims.height, f.imp.dims.height)} (mirrors not included)`,
      seatHeight: fmt.mm(f.dims.seat, f.imp.dims.seat),
      width: fmt.mm(f.dims.width, f.imp.dims.width),
      wheelbase: fmt.mm(f.dims.wheelbase, f.imp.dims.wheelbase),
      length: fmt.mm(f.dims.length, f.imp.dims.length),
      weight: fmt.weight(f),
    },
    cycleParts: {
      frame: f.frame,
      frontSuspension: f.suspension.front,
      rearSuspension: f.suspension.rear,
      frontBrake: `Brembo, double floating discs Ø${f.brakes.frontMm} mm, 4-piston radial caliper`,
      rearBrake: `Brembo, single disc Ø${f.brakes.rearMm} mm, 2-piston caliper`,
      frontTyre: `${f.tyres.name} ${f.tyres.front}`,
      rearTyre: `${f.tyres.name} ${f.tyres.rear}`,
      chain: f.accelRs ? `${f.chain} (RS: Regina 15/44 525 O-ring)` : f.chain,
    },
  };
}

/** Schema.org figures for a model page. */
export function schemaSpecs(m: ModelId) {
  const f = SPECS[m];
  return {
    power: `Peak ${f.peakKw} kW / ${f.peakHp} HP`,
    torque: fmt.torqueMetric(f),
    topSpeed: `${f.topSpeedKmh} km/h`,
    range: `${f.range.city} km city / ${f.range.combined} km combined`,
  };
}

/** Site-wide maxima/minima for the Technology page. */
export const LINEUP = (() => {
  const all = Object.values(SPECS);
  return {
    maxPeakHp: Math.max(...all.map((f) => f.peakHp)),
    maxTorqueNm: Math.max(...all.map((f) => f.torqueNm)),
    maxTorqueFtLb: Math.max(...all.map((f) => f.imp.torqueFtLb)),
    minEfficiency: Math.min(...all.map((f) => f.efficiency)),
    batteries: [...new Set(all.map((f) => f.battery.maxKwh))].sort((a, b) => a - b),
    maxCityKm: Math.max(...all.map((f) => f.range.city)),
    maxCityMi: Math.max(...all.map((f) => f.imp.range.city)),
    onboardKw: Math.max(...all.map((f) => f.charging.onboardKw)),
  };
})();

// ── Build sheet (configurator + PDF page 3) ───────────────────────────────
export interface PerformanceView {
  grid: Stat[];
  callout: { stat: string; label: string };
  note: string;
}

/** The PDF keeps its own shorter callout wording (no em dashes in the PDF). */
const PDF_CALLOUT_LABEL: Partial<Record<ModelId, string>> = {
  ego: "EMCE-derived peak power. Road legal.",
  essesse9: "Torque",
};

/** Page-3 figures for a model. RS changes only 0–100 km/h. Throws for an unknown model. */
export function performanceFor(model: ModelId, modelName: string, opts: { rs?: boolean } = {}): PerformanceView {
  if (!SPECS[model]) throw new Error(`[build-sheet] unknown model ${model}`);
  const grid = keyStats(model, { rs: !!opts.rs }).map((s) => ({ ...s, label: s.label.toUpperCase() }));
  return {
    grid,
    callout: { ...callout(model), label: PDF_CALLOUT_LABEL[model] ?? callout(model).label },
    note: `Figures from Energica's 2026 technical sheet for the ${modelName}.`,
  };
}
