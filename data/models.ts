import { MODEL_NAMES } from "@/lib/build-sheet/catalog";
import { SPECS, callout, keyStats, specTable } from "@/lib/build-sheet/specs";

// Figures in copy come from lib/build-sheet/specs.ts (2026 technical sheets).
const X = SPECS.experia, S = SPECS.essesse9, E = SPECS.eva_ribelle, G = SPECS.ego;

export interface ColorOption {
  name: string;
  hex: string;
  stripes?: string[]; // multi-colour swatch (Tricolore), drawn as vertical stripes
  image: string;
}

export interface KeySpec {
  label: string;
  value: string;
  unit: string;
}

export interface MotorSpecs {
  type?: string;
  power?: string;
  torque?: string;
  topSpeed?: string;
  acceleration?: string;
  range?: string;
}

export interface PerformanceSpecs {
  maxSpeed?: string;
  acceleration?: string;
  torque?: string;
  power?: string;
  range?: string;
  ridingModes?: string;
  parkAssistant?: string;
}

export interface BatterySpecs {
  capacity?: string;
  life?: string;
  batteryCharger?: string;
  charging?: string;
  chargingTime?: string;
  lprFunction?: string;
  chargeInterruption?: string;
  warranty?: string;
}

export interface ElectronicsSpecs {
  abs?: string;
  tractionControl?: string;
  cruiseControl?: string;
  dashboard?: string;
  vehicleControlUnit?: string;
  ridingProfiles?: string;
  ridingModes?: string;
  regenMaps?: string;
  parkAssistant?: string;
}

export interface CyclePartsSpecs {
  frame?: string;
  frontSuspension?: string;
  rearSuspension?: string;
  frontBrake?: string;
  rearBrake?: string;
  frontTyre?: string;
  rearTyre?: string;
  chain?: string;
}

export interface DimensionSpecs {
  height?: string;
  seatHeight?: string;
  width?: string;
  wheelbase?: string;
  length?: string;
  weight?: string;
}

export interface ModelSpecs {
  motor: MotorSpecs;
  performance?: PerformanceSpecs;
  battery: BatterySpecs;
  electronics: ElectronicsSpecs;
  dimensions: DimensionSpecs;
  cycleParts: CyclePartsSpecs;
}

export interface BikeModel {
  id: string;
  name: string;
  tagline: string;
  headline: string;
  description: string;
  heroImage: string;
  lifestyleImages: string[];
  colors: ColorOption[];
  keySpecs: KeySpec[];
  specs: ModelSpecs;
  storyParagraphs?: string[];
  callout?: { stat: string; label: string };
}

// Note: paths with spaces are URL-encoded for browser safety
export const models: BikeModel[] = [
  {
    id: "experia",
    name: MODEL_NAMES.experia,
    tagline: "Further, quieter, faster.",
    headline: `${X.battery.maxKwh} kWh. ${X.range.city} km. One charge.`,
    description:
      `Built on a decade of MotoE engineering. The Experia carries ${X.battery.maxKwh} kWh — the largest battery of any production electric motorcycle — and turns every public DC network into a fuel station.`,
    storyParagraphs: [
      "A decade of MotoE engineering produced the platform. The Experia is not a compromise — it is a decision. Same motor architecture as the race machines. Different mission.",
      `${X.battery.maxKwh} kWh gross. ${X.range.city} km city range. ${X.range.combined} km combined. These are measured numbers, not marketing estimates. The largest battery of any production electric motorcycle, period.`,
      "CCS Combo DC fast charging. 0 to 80% in under 40 minutes. Every public rapid network in Europe and beyond. The charging grid is your infrastructure.",
    ],
    callout: callout("experia"),
    heroImage: "/images/Pagina%20Experia/EXPERIA_Bormio%20Ice.webp",
    lifestyleImages: [
      "/images/Pagina%20Experia/Experia_MM_0218.jpg",
      "/images/Pagina%20Experia/0N-Experia_MM_0656_mod.jpg",
      "/images/Pagina%20Experia/ANN7719_mod-rc.jpg",
    ],
    colors: [
      {
        name: "Bormio ICE",
        hex: "#8BB8D4",
        image: "/images/Pagina%20Experia/EXPERIA_Bormio%20Ice.webp",
      },
      {
        name: "White Flame",
        hex: "#F5F0E8",
        image: "/images/Pagina%20Experia/EXPERIA_White%20Flame.webp",
      },
      {
        name: "Metal Black",
        hex: "#1a1a1a",
        image: "/images/Pagina%20Experia/EXPERIA_Metal%20Black.webp",
      },
    ],
    keySpecs: keyStats("experia", { rs: true }),
    specs: specTable("experia"),
  },
  {
    id: "esseesse9",
    name: MODEL_NAMES.essesse9,
    tagline: "Naked. No apologies.",
    headline: `${S.torqueNm} Nm. Instant.`,
    description:
      `Stripped of everything unnecessary. The EsseEsse9 delivers ${S.torqueNm} Nm of torque at 0 rpm and reaches 100 km/h in ${S.accel.toFixed(1)} seconds. Same EMCE motor architecture as the MotoE race machines.`,
    storyParagraphs: [
      "Every component has a function. Nothing is decorative. The EsseEsse9 is Energica's most direct expression of what the motor platform can do when weight and restraint are the design brief.",
      `${S.torqueNm} Nm of torque. Available from 0 rpm. The RS Version 0–100 km/h sprint takes ${S.accelRs!.toFixed(1)} seconds. It is clinical, repeatable, and quiet.`,
      "The EMCE motor shares its architecture with the MotoE race machines — the same platform that has powered every FIM Enel MotoE grid since 2019. This is that technology on a public road.",
    ],
    callout: callout("essesse9"),
    heroImage: "/images/Pagina%20SS9/EsseEsse9%20RS_Sunrise%20Red.webp",
    lifestyleImages: [
      "/images/Pagina%20SS9/ANN7756.jpg",
      "/images/Pagina%20SS9/ANN7824.jpg",
      "/images/Pagina%20SS9/ss9_featured_740x660_7766.jpg",
    ],
    colors: [
      {
        name: "Bormio ICE",
        hex: "#8BB8D4",
        image: "/images/Pagina%20SS9/EsseEsse9%20RS_Bormio%20Ice.webp",
      },
      {
        name: "Sunrise Red",
        hex: "#CC2200",
        image: "/images/Pagina%20SS9/EsseEsse9%20RS_Sunrise%20Red.webp",
      },
      {
        name: "Riviera Green",
        hex: "#2E7D6E",
        image: "/images/Pagina%20SS9/EsseEsse9%20RS_Riviera%20Green.webp",
      },
    ],
    keySpecs: keyStats("essesse9", { rs: true }),
    specs: specTable("essesse9"),
  },
  {
    id: "eva-ribelle",
    name: MODEL_NAMES.eva_ribelle,
    tagline: "Italian design. Electric advantage.",
    headline: `${E.peakHp} HP. Built in Modena.`,
    description:
      `Italian design, Modena engineering, EMCE motor platform. The Eva Ribelle carries ${E.peakHp} HP peak (${E.sustainedHp} HP sustained) and ${E.torqueNm} Nm — the new EMCE drivetrain — inside a body shaped by Italian design masters.`,
    storyParagraphs: [
      "Eva Ribelle. The name is a design decision. This motorcycle is built for riders who choose their machine deliberately — not for spectacle, but for what it does when the road gets interesting.",
      `${E.sustainedHp} HP sustained. ${E.torqueNm} Nm of torque. ${E.range.city} km city range. New EMCE motor architecture shared with the MotoE race machines. Same DC fast charge infrastructure as the Experia. Different silhouette.`,
      "Three colourways. Stealth Grey. Rosso Corsa. Tricolore. Each is the same motorcycle underneath. The choice is yours.",
    ],
    callout: callout("eva_ribelle"),
    heroImage: "/images/Pagina%20Eva/EVA%20Ribelle%20RS_Stealth%20Grey.webp",
    lifestyleImages: [
      "/images/Pagina%20Eva/evaribelle_slider1440x930_5533-1.jpg",
      "/images/Pagina%20Eva/ANN5461.jpg",
      "/images/Pagina%20Eva/ANN5814.jpg",
    ],
    colors: [
      {
        name: "Stealth Grey",
        hex: "#4A4A52",
        image: "/images/Pagina%20Eva/EVA%20Ribelle%20RS_Stealth%20Grey.webp",
      },
      {
        name: "Rosso Corsa",
        hex: "#CC0000",
        image: "/images/Pagina%20Eva/EVA%20Ribelle%20RS_Rosso%20Corsa.webp",
      },
      {
        name: "Tricolore",
        hex: "#009246",
        stripes: ["#009246", "#F1F2F1", "#CE2B37"],
        image: "/images/Pagina%20Eva/EVA%20Ribelle%20RS_Tricolore.webp",
      },
    ],
    keySpecs: keyStats("eva_ribelle", { rs: true }),
    specs: specTable("eva_ribelle"),
  },
  {
    id: "ego",
    name: MODEL_NAMES.ego,
    tagline: "Derived from racing. Proven on track.",
    headline: `${G.peakHp} HP. MotoE architecture. Road legal.`,
    description:
      `Four MotoE seasons produced this motor. ${G.sustainedHp} HP sustained, ${G.peakHp} HP peak. 0–100 km/h in ${G.accelRs!.toFixed(1)} seconds (RS). Brembo brakes, race-derived chassis geometry. Street registered.`,
    storyParagraphs: [
      "Four seasons of MotoE. One motor platform. The Ego is built from what Energica learned on the grid — not inspired by it. The same EMCE architecture. Different application.",
      `${G.sustainedHp} HP sustained — ${G.peakHp} HP peak. ${G.torqueNm} Nm of torque. RS Version 0–100 km/h in ${G.accelRs!.toFixed(1)} seconds. ${G.topSpeedKmh} km/h top speed. These numbers were earned on circuits, then certified for public roads.`,
      "Marzocchi suspension front and rear. Brembo radial brakes. Chassis geometry tuned on the same circuits where MotoE champions compete. Road legal. No exceptions.",
    ],
    callout: callout("ego"),
    heroImage: "/images/Pagina%20EGO/EGO%20RS_Metal%20Black.webp",
    lifestyleImages: [
      "/images/Pagina%20EGO/ANN4779.jpg",
      "/images/Pagina%20EGO/ANN4787.jpg",
      "/images/Pagina%20EGO/ANN4778.jpg",
    ],
    colors: [
      {
        name: "Metal Black",
        hex: "#1a1a1a",
        image: "/images/Pagina%20EGO/EGO%20RS_Metal%20Black.webp",
      },
      {
        name: "Rosso Corsa",
        hex: "#CC0000",
        image: "/images/Pagina%20EGO/EGO%20RS_Rosso%20Corsa.webp",
      },
      {
        name: "Tricolore",
        hex: "#009246",
        stripes: ["#009246", "#F1F2F1", "#CE2B37"],
        image: "/images/Pagina%20EGO/EGO%20RS_Tricolore.webp",
      },
    ],
    keySpecs: keyStats("ego", { rs: true }),
    specs: specTable("ego"),
  },
];

export function getModelById(id: string): BikeModel | undefined {
  return models.find((m) => m.id === id);
}
