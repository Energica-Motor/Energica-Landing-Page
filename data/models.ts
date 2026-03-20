export interface ColorOption {
  name: string;
  hex: string;
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
}

export interface BatterySpecs {
  capacity?: string;
  chemistry?: string;
  range?: string;
  charging?: string;
  chargingTime?: string;
  warranty?: string;
}

export interface ElectronicsSpecs {
  abs?: string;
  tractionControl?: string;
  ridingModes?: string;
  display?: string;
  connectivity?: string;
  dataRecorder?: string;
}

export interface CyclePartsSpecs {
  frame?: string;
  frontSuspension?: string;
  rearSuspension?: string;
  frontBrake?: string;
  rearBrake?: string;
  frontTyre?: string;
  rearTyre?: string;
}

export interface DimensionSpecs {
  seatHeight?: string;
  wheelbase?: string;
  length?: string;
  weight?: string;
  fuelCapacity?: string;
}

export interface ModelSpecs {
  motor: MotorSpecs;
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
    name: "Experia",
    tagline: "Further, quieter, faster.",
    headline: "22.5 kWh. 420 km. One charge.",
    description:
      "Built on a decade of MotoE engineering. The Experia carries 22.5 kWh — the largest battery of any production electric motorcycle — and turns every public DC network into a fuel station.",
    storyParagraphs: [
      "A decade of MotoE engineering produced the platform. The Experia is not a compromise — it is a decision. Same motor architecture as the race machines. Different mission.",
      "22.5 kWh gross. 420 km city range. 256 km combined. These are measured numbers, not marketing estimates. The largest battery of any production electric motorcycle, period.",
      "CCS Combo DC fast charging. 0 to 80% in under 40 minutes. Every public rapid network in Europe and beyond. The charging grid is your infrastructure.",
    ],
    callout: {
      stat: "22.5 kWh",
      label: "Largest battery of any production electric motorcycle",
    },
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
    keySpecs: [
      { label: "Peak Power", value: "102", unit: "HP" },
      { label: "0–100 km/h", value: "3.5", unit: "sec" },
      { label: "City Range", value: "420", unit: "km" },
      { label: "Top Speed", value: "180", unit: "km/h" },
    ],
    specs: {
      motor: {
        type: "Permanent Magnet Assisted Synchronous Reluctance (PMASynRM)",
        power: "75 kW / 102 HP peak",
        torque: "115 Nm — 900 Nm at wheel",
        topSpeed: "180 km/h",
        acceleration: "0–100 km/h in 3.5 sec",
      },
      battery: {
        capacity: "22.5 kWh gross (19.6 kWh nominal)",
        chemistry: "Lithium Polymer",
        range: "City: 420 km / Combined: 256 km / Highway: 161 km",
        charging: "DC Fast Charge Level 3 — CCS Combo",
        chargingTime: "0–80% in under 40 min (DC fast)",
        warranty: "3 years / 31,000 miles",
      },
      electronics: {
        abs: "Bosch 9.3MP ABS + Cornering ABS",
        tractionControl: "Bosch MSC — Motorcycle Stability Control",
        ridingModes: "Urban · Eco · Rain · Sport · Boost · Custom",
        display: "5\" TFT full-colour touchscreen",
        connectivity: "My Energica App — iOS & Android · Bluetooth · 4G",
        dataRecorder: "On-board data logger — ride telemetry",
      },
      dimensions: {
        seatHeight: "847 mm",
        wheelbase: "1,513 mm",
        length: "2,132 mm",
        weight: "260 kg",
        fuelCapacity: "Equivalent 22.5 kWh",
      },
      cycleParts: {
        frame: "Tubular steel trellis",
        frontSuspension: "48 mm USD Marzocchi fork — 120 mm travel",
        rearSuspension: "Öhlins TTX36 monoshock — 127 mm travel",
        frontBrake: "Brembo M4.32 radial — 330 mm disc",
        rearBrake: "Brembo single piston — 260 mm disc",
        frontTyre: "120/70-ZR17",
        rearTyre: "180/55-ZR17",
      },
    },
  },
  {
    id: "esseesse9",
    name: "EsseEsse9",
    tagline: "Naked. No apologies.",
    headline: "200 Nm. Instant.",
    description:
      "Stripped of everything unnecessary. The EsseEsse9 delivers 200 Nm of wheel torque at 0 rpm and reaches 100 km/h in 3.2 seconds. Same motor architecture as the MotoE race machines.",
    storyParagraphs: [
      "Every component has a function. Nothing is decorative. The EsseEsse9 is Energica's most direct expression of what the motor platform can do when weight and restraint are the design brief.",
      "200 Nm at the wheel. Available from 0 rpm. The 0–100 km/h sprint takes 3.2 seconds. It is clinical, repeatable, and quiet.",
      "The motor shares its architecture with the MotoE race machines — the same platform that has powered every FIM Enel MotoE grid since 2019. This is that technology on a public road.",
    ],
    callout: {
      stat: "200 Nm",
      label: "Wheel torque — from the moment you twist the throttle",
    },
    heroImage: "/images/Pagina%20SS9/EsseEsse9%20RS_Sunrise%20Red.webp",
    lifestyleImages: [
      "/images/Pagina%20SS9/ss9_featured_740x660_7766.jpg",
      "/images/Pagina%20SS9/ANN7756.jpg",
      "/images/Pagina%20SS9/ANN7824.jpg",
      "/images/Pagina%20SS9/ss9_mosaico_ANN4384.jpg",
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
    keySpecs: [
      { label: "Peak Power", value: "107", unit: "HP" },
      { label: "0–100 km/h", value: "3.2", unit: "sec" },
      { label: "City Range", value: "261", unit: "km" },
      { label: "Top Speed", value: "200", unit: "km/h" },
    ],
    specs: {
      motor: {
        type: "Permanent Magnet Assisted Synchronous Reluctance (PMASynRM)",
        power: "80 kW / 107 HP peak",
        torque: "200 Nm at wheel",
        topSpeed: "200 km/h",
        acceleration: "0–100 km/h in 3.2 sec",
      },
      battery: {
        capacity: "21.5 kWh gross",
        chemistry: "Lithium Polymer",
        range: "City: 261 km / Combined: 180 km",
        charging: "DC Fast Charge Level 3 — CCS Combo",
        chargingTime: "0–80% in under 40 min (DC fast)",
        warranty: "3 years / 31,000 miles",
      },
      electronics: {
        abs: "Bosch 9.3MP ABS + Cornering ABS",
        tractionControl: "Bosch MSC — Motorcycle Stability Control",
        ridingModes: "Urban · Eco · Rain · Sport · Boost · Custom",
        display: "5\" TFT full-colour touchscreen",
        connectivity: "My Energica App — iOS & Android · Bluetooth · 4G",
        dataRecorder: "On-board data logger — ride telemetry",
      },
      dimensions: {
        seatHeight: "820 mm",
        wheelbase: "1,440 mm",
        length: "2,060 mm",
        weight: "260 kg",
      },
      cycleParts: {
        frame: "Tubular steel trellis",
        frontSuspension: "48 mm USD Marzocchi fork — 120 mm travel",
        rearSuspension: "Öhlins TTX36 monoshock — 127 mm travel",
        frontBrake: "Brembo M4.32 radial — 330 mm disc",
        rearBrake: "Brembo single piston — 260 mm disc",
        frontTyre: "120/70-ZR17",
        rearTyre: "180/55-ZR17",
      },
    },
  },
  {
    id: "eva-ribelle",
    name: "Eva Ribelle",
    tagline: "Italian design. Electric advantage.",
    headline: "107 HP. Built in Modena.",
    description:
      "Italian design, Modena engineering, MotoE motor platform. The Eva Ribelle carries 107 HP and 200 Nm — same drivetrain as the race machines — inside a body shaped by Italian design masters.",
    storyParagraphs: [
      "Eva Ribelle. The name is a design decision. This motorcycle is built for riders who choose their machine deliberately — not for spectacle, but for what it does when the road gets interesting.",
      "107 HP. 200 Nm at the wheel. 261 km city range. Same motor architecture as the MotoE race machines. Same DC fast charge infrastructure as the Experia. Different silhouette.",
      "Three colourways. Stealth Grey. Rosso Corsa. Tricolore. Each is the same motorcycle underneath. The choice is yours.",
    ],
    callout: {
      stat: "107 HP",
      label: "MotoE-derived platform. Road legal.",
    },
    heroImage: "/images/Pagina%20Eva/EVA%20Ribelle%20RS_Stealth%20Grey.webp",
    lifestyleImages: [
      "/images/Pagina%20Eva/evaribelle_slider1440x930_5533-1.jpg",
      "/images/Pagina%20Eva/ANN5461.jpg",
      "/images/Pagina%20Eva/ANN5814.jpg",
      "/images/Pagina%20Eva/evaribelle_mosaico_ANN4110.jpg",
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
        image: "/images/Pagina%20Eva/EVA%20Ribelle%20RS_Tricolore.webp",
      },
    ],
    keySpecs: [
      { label: "Peak Power", value: "107", unit: "HP" },
      { label: "0–100 km/h", value: "3.2", unit: "sec" },
      { label: "City Range", value: "261", unit: "km" },
      { label: "Top Speed", value: "200", unit: "km/h" },
    ],
    specs: {
      motor: {
        type: "Permanent Magnet Assisted Synchronous Reluctance (PMASynRM)",
        power: "80 kW / 107 HP peak",
        torque: "200 Nm at wheel",
        topSpeed: "200 km/h",
        acceleration: "0–100 km/h in 3.2 sec",
      },
      battery: {
        capacity: "21.5 kWh gross",
        chemistry: "Lithium Polymer",
        range: "City: 261 km / Combined: 180 km",
        charging: "DC Fast Charge Level 3 — CCS Combo",
        chargingTime: "0–80% in under 40 min (DC fast)",
        warranty: "3 years / 31,000 miles",
      },
      electronics: {
        abs: "Bosch 9.3MP ABS + Cornering ABS",
        tractionControl: "Bosch MSC — Motorcycle Stability Control",
        ridingModes: "Urban · Eco · Rain · Sport · Boost · Custom",
        display: "5\" TFT full-colour touchscreen",
        connectivity: "My Energica App — iOS & Android · Bluetooth · 4G",
        dataRecorder: "On-board data logger — ride telemetry",
      },
      dimensions: {
        seatHeight: "830 mm",
        wheelbase: "1,440 mm",
        length: "2,070 mm",
        weight: "260 kg",
      },
      cycleParts: {
        frame: "Tubular steel trellis",
        frontSuspension: "48 mm USD Marzocchi fork — 120 mm travel",
        rearSuspension: "Öhlins TTX36 monoshock — 127 mm travel",
        frontBrake: "Brembo M4.32 radial — 330 mm disc",
        rearBrake: "Brembo single piston — 260 mm disc",
        frontTyre: "120/70-ZR17",
        rearTyre: "180/55-ZR17",
      },
    },
  },
  {
    id: "ego",
    name: "Ego",
    tagline: "Derived from racing. Proven on track.",
    headline: "147 HP. MotoE architecture. Road legal.",
    description:
      "Four MotoE seasons produced this motor. 147 HP. 0–100 in 2.6 seconds. Öhlins suspension, Brembo brakes, race-derived chassis geometry. Street registered.",
    storyParagraphs: [
      "Four seasons of MotoE. One motor platform. The Ego is built from what Energica learned on the grid — not inspired by it. The same architecture. Different application.",
      "147 HP. 215 Nm at the wheel. 0–100 km/h in 2.6 seconds. 200 km/h top speed. These numbers were earned on circuits, then certified for public roads.",
      "Öhlins suspension front and rear. Brembo M4.32 radial brakes. Chassis geometry tuned on the same circuits where MotoE champions compete. Road legal. No exceptions.",
    ],
    callout: {
      stat: "147 HP",
      label: "MotoE-derived peak power — road legal",
    },
    heroImage: "/images/Pagina%20EGO/EGO%20RS_Metal%20Black.webp",
    lifestyleImages: [
      "/images/Pagina%20EGO/ego_mosaico_ANN4320.jpg",
      "/images/Pagina%20EGO/ANN4778.jpg",
      "/images/Pagina%20EGO/ANN4779.jpg",
      "/images/Pagina%20EGO/ANN4787.jpg",
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
        image: "/images/Pagina%20EGO/EGO%20RS_Tricolore.webp",
      },
    ],
    keySpecs: [
      { label: "Peak Power", value: "145", unit: "HP" },
      { label: "0–100 km/h", value: "2.6", unit: "sec" },
      { label: "City Range", value: "261", unit: "km" },
      { label: "Top Speed", value: "200", unit: "km/h" },
    ],
    specs: {
      motor: {
        type: "Permanent Magnet Assisted Synchronous Reluctance (PMASynRM)",
        power: "110 kW / 147 HP peak",
        torque: "215 Nm at wheel",
        topSpeed: "200 km/h",
        acceleration: "0–100 km/h in 2.6 sec",
      },
      battery: {
        capacity: "21.5 kWh gross",
        chemistry: "Lithium Polymer",
        range: "City: 261 km / Combined: 180 km",
        charging: "DC Fast Charge Level 3 — CCS Combo",
        chargingTime: "0–80% in under 40 min (DC fast)",
        warranty: "3 years / 31,000 miles",
      },
      electronics: {
        abs: "Bosch 9.3MP ABS + Cornering ABS",
        tractionControl: "Bosch MSC — Motorcycle Stability Control",
        ridingModes: "Urban · Eco · Rain · Sport · Boost · Custom",
        display: "5\" TFT full-colour touchscreen",
        connectivity: "My Energica App — iOS & Android · Bluetooth · 4G",
        dataRecorder: "On-board data logger — MotoE-spec telemetry",
      },
      dimensions: {
        seatHeight: "805 mm",
        wheelbase: "1,430 mm",
        length: "2,050 mm",
        weight: "260 kg",
      },
      cycleParts: {
        frame: "Tubular steel trellis — MotoE derived",
        frontSuspension: "48 mm USD Marzocchi fork — 120 mm travel",
        rearSuspension: "Öhlins TTX36 monoshock — 127 mm travel",
        frontBrake: "Brembo M4.32 radial — 330 mm disc",
        rearBrake: "Brembo single piston — 260 mm disc",
        frontTyre: "120/70-ZR17",
        rearTyre: "180/55-ZR17",
      },
    },
  },
];

export function getModelById(id: string): BikeModel | undefined {
  return models.find((m) => m.id === id);
}
