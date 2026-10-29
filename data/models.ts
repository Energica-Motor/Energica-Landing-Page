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
        type: "Permanent Magnet Assisted Synchronous Reluctance Motor (PMASynRM) — 306V nominal, 96% efficiency peak",
        power: "Continuous 60 kW / 80 HP at 7000 rpm — Peak 75 kW / 102 HP at 7500 rpm",
        torque: "115 Nm / 85 ft lb. – 900 Nm / 664 ft lb. at wheel",
        topSpeed: "Limited at 180 km/h (112 mph)",
        acceleration: "0-100 km/h (0-60 mph): 3.5 sec",
        range: "City: 420 km (261 miles) / Combined: 256 km (160 miles) / Extra-Urban: 208 km (130 miles) / WMTC: 222 km (138 miles)",
      },
      battery: {
        capacity: "Max. 22.5 kWh / Nominal 19.6 kWh – lithium polymer",
        life: "1200 Cycles @ 80% Capacity (100% DOD)",
        batteryCharger: "Onboard, 3kW 90-264Vac 50/60Hz [1kW 90-177Vac range]. Conforms to Standards SAE J1772 and IEC 62196-2 with pilot signal for charging station interface",
        charging: "Fast Charge DCFC Level 3 Mode 4: 400 km/h o 6,7 km/min (248 miles/h o 4 miles/min) / Slow Charge Level 2 Mode 2 or 3: 63,5 km/h (39,5 miles/h)",
        lprFunction: "Long Period Rest: allows the maintenance and automatic balancing of the batteries during long period of non-use",
        chargeInterruption: "AC and DC up to requested State Of Charge, AC and DC CCS charge completion with balancing, CHAdeMO 95% (depending on environmental conditions).",
        warranty: "3 years / 31,000 miles",
      },
      electronics: {
        dashboard: "5\" IPS 1000 nits bonded 848×480 TFT Color Display",
        vehicleControlUnit: "Dual Microcontroller ARM Based",
        tractionControl: "Six levels of intervention combined with the existing eABS and the Cornering Bosch 9.3 MP",
        cruiseControl: "Cruise control system that uses the electronic brake to maintain speed and increase braking energy",
        ridingProfiles: "7 Profiles: Energica 1–4 (factory preset), Custom 1–3 (Customizable)",
        ridingModes: "4 Riding Modes: Eco, Urban, Rain, Sport",
        regenMaps: "4 Regenerative Modes: High, Medium, Low, Off",
        parkAssistant: "Forward and Reverse (Slow speed)",
      },
      dimensions: {
        height: "1461 mm / 57.5\"",
        seatHeight: "847 mm (33.3\")",
        width: "867 mm / 34.1\" (mirrors not included)",
        wheelbase: "1513 mm (59.5\")",
        length: "2132 mm (83.9\")",
        weight: "260 kg (573 lbs)",
      },
      cycleParts: {
        frame: "Front Steel Tubular Trellis / Aluminium side plates",
        frontSuspension: "ZF Sachs Ø43 mm — 150 mm travel, adjustable preload, extension and compression",
        rearSuspension: "ZF Sachs — 55 mm travel, 150 mm wheel travel, adjustable extension and preload",
        frontBrake: "Brembo, Double Floating Discs Ø330 mm, 4 Pistons Radial Caliper",
        rearBrake: "Brembo, Single Disc Ø240 mm, 2 Pistons Caliper",
        frontTyre: "Pirelli Scorpion Trail II 120/70-17",
        rearTyre: "Pirelli Scorpion Trail II 180/55-17",
      },
    },
  },
  {
    id: "esseesse9",
    name: "EsseEsse9",
    tagline: "Naked. No apologies.",
    headline: "207 Nm. Instant.",
    description:
      "Stripped of everything unnecessary. The EsseEsse9 delivers 207 Nm of wheel torque at 0 rpm and reaches 100 km/h in under 3.5 seconds. Same EMCE motor architecture as the MotoE race machines.",
    storyParagraphs: [
      "Every component has a function. Nothing is decorative. The EsseEsse9 is Energica's most direct expression of what the motor platform can do when weight and restraint are the design brief.",
      "207 Nm at the wheel. Available from 0 rpm. The RS Version 0–60 mph sprint takes 2.8 seconds. It is clinical, repeatable, and quiet.",
      "The EMCE motor shares its architecture with the MotoE race machines — the same platform that has powered every FIM Enel MotoE grid since 2019. This is that technology on a public road.",
    ],
    callout: {
      stat: "207 Nm",
      label: "Wheel torque — from the moment you twist the throttle",
    },
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
    keySpecs: [
      { label: "Peak Power", value: "107", unit: "HP" },
      { label: "0–60 mph (RS)", value: "2.8", unit: "sec" },
      { label: "City Range", value: "420", unit: "km" },
      { label: "Top Speed", value: "201", unit: "km/h" },
    ],
    specs: {
      motor: {
        type: "HSM (Hybrid Synchronous Motor) Liquid-Cooled 3-Phase – 300 V – 12,000 rpm with Adaptive Control Inverter",
        power: "80 kW / 107 HP (EMCE)",
        torque: "207 Nm / 153 lb ft at wheel",
        topSpeed: "201 km/h (125 mph)",
        acceleration: "RS Version 0–60 mph in 2.8 sec · Standard 0–60 mph in 3.0 sec",
      },
      battery: {
        capacity: "Max 21.5 kWh / Nominal 18.9 kWh – lithium polymer",
        life: "1200 Cycles @ 80% Capacity (100% DOD)",
        warranty: "on vehicle 2 years – on battery 3 years / 31.000 miles",
        charging: "DC Fast Charge Mode 4: 250 mph, 80% charge in 40 min / Slow Charge Mode 2 or 3: 42 mph",
        batteryCharger: "Onboard, [110-220]V [50-60]Hz, 3 kW. Conforms to Standards SAE J1772 and IEC 62196-2 with pilot signal for charging station interface",
        lprFunction: "Long Period Rest: allows the maintenance and automatic balancing of the batteries during long period of non-use",
        chargeInterruption: "The vehicle can be configured to autonomously stop the charge at a certain level. The user can configure this function through the dashboard",
      },
      electronics: {
        dashboard: "Cobo, 4.3\" WQVGA 480×272 TFT 16.7 million colors Display; integrated GPS receiver; 9 Warning Lights; 6 + 6 Current Consumption Lights; Ambient Light Sensor; Real Time Clock; GPS 10Hz.",
        vehicleControlUnit: "A Vehicle Control Unit implementing a multi-map adaptive energy and power management algorithm manages the vehicle. It constantly monitors batteries, even in key off position. RS version implements a dedicated mapping and parameterization to highlight the high-performing and thrilling nature of Energica, developed within the racing world.",
      },
      dimensions: {
        seatHeight: "789 mm (31.1\")",
        wheelbase: "1466 mm (57.7\")",
        length: "2139 mm (84.2\")",
        weight: "260 kg (573 lbs)",
      },
      cycleParts: {
        frame: "Steel Tubular Trellis",
        frontSuspension: "Marzocchi Ø43 mm — Adjustable Rebound, Compression Damping, Spring Preload",
        rearSuspension: "Bitubo Rear Mono Shock — Adjustable Rebound, Spring Preload",
        frontBrake: "Brembo, Double Floating Discs Ø330 mm, 4 Pistons Radial Caliper",
        rearBrake: "Brembo, Single Disc Ø240 mm, 2 Pistons Caliper",
        frontTyre: "Pirelli Diablo Rosso III 120/70 ZR17",
        rearTyre: "Pirelli Diablo Rosso III 180/55 ZR17",
      },
    },
  },
  {
    id: "eva-ribelle",
    name: "Eva Ribelle",
    tagline: "Italian design. Electric advantage.",
    headline: "147 HP. Built in Modena.",
    description:
      "Italian design, Modena engineering, EMCE motor platform. The Eva Ribelle carries 147 HP sustained (169 HP peak) and 222 Nm — the new EMCE drivetrain — inside a body shaped by Italian design masters.",
    storyParagraphs: [
      "Eva Ribelle. The name is a design decision. This motorcycle is built for riders who choose their machine deliberately — not for spectacle, but for what it does when the road gets interesting.",
      "147 HP sustained. 222 Nm at the wheel. ~420 km city range. New EMCE motor architecture shared with the MotoE race machines. Same DC fast charge infrastructure as the Experia. Different silhouette.",
      "Three colourways. Stealth Grey. Rosso Corsa. Tricolore. Each is the same motorcycle underneath. The choice is yours.",
    ],
    callout: {
      stat: "147 HP",
      label: "EMCE-derived platform. Road legal.",
    },
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
        image: "/images/Pagina%20Eva/EVA%20Ribelle%20RS_Tricolore.webp",
      },
    ],
    keySpecs: [
      { label: "Peak Power", value: "147", unit: "HP" },
      { label: "0–60 mph (RS)", value: "2.6", unit: "sec" },
      { label: "City Range", value: "420", unit: "km" },
      { label: "Top Speed", value: "201", unit: "km/h" },
    ],
    specs: {
      motor: {
        type: "HSM (Hybrid Synchronous Motor) Liquid-Cooled 3-Phase – 300 V – 12,000 rpm with Adaptive Control Inverter",
        power: "Sustained 110 kW / 147 HP — Peak 126 kW / 169 HP (EMCE)",
        torque: "222 Nm / 164 lb ft at wheel",
        topSpeed: "201 km/h (125 mph)",
        acceleration: "RS Version 0–60 mph in 2.6 sec · Standard 0–60 mph in 2.8 sec",
      },
      battery: {
        capacity: "Max 21.5 kWh / Nominal 18.9 kWh – lithium polymer",
        life: "1200 Cycles @ 80% Capacity (100% DOD)",
        warranty: "on vehicle 2 years – on battery 3 years / 31.000 miles",
        charging: "DC Fast Charge Mode 4: 250 mph, 80% charge in 40 min / Slow Charge Mode 2 or 3: 42 mph",
        batteryCharger: "Onboard, [110-220]V [50-60]Hz, 3 kW. Conforms to Standards SAE J1772 and IEC 62196-2 with pilot signal for charging station interface",
        lprFunction: "Long Period Rest: allows the maintenance and automatic balancing of the batteries during long period of non-use",
        chargeInterruption: "The vehicle can be configured to autonomously stop the charge at a certain level. The user can configure this function through the dashboard",
      },
      electronics: {
        dashboard: "Cobo, 4.3\" WQVGA 480×272 TFT 16.7 million colors Display; integrated GPS receiver; 9 Warning Lights; 6 + 6 Current Consumption Lights; Ambient Light Sensor; Real Time Clock; GPS 10Hz.",
        vehicleControlUnit: "A Vehicle Control Unit implementing a multi-map adaptive energy and power management algorithm manages the vehicle. It constantly monitors batteries, even in key off position. RS version implements a dedicated mapping and parameterization to highlight the high-performing and thrilling nature of Energica, developed within the racing world.",
      },
      dimensions: {
        seatHeight: "789 mm (31.1\")",
        wheelbase: "1466 mm (57.7\")",
        length: "2139 mm (84.2\")",
        weight: "260 kg (573 lbs)",
      },
      cycleParts: {
        frame: "Steel Tubular Trellis",
        frontSuspension: "Marzocchi Ø45 mm — Adjustable Rebound, Compression Damping, Spring Preload",
        rearSuspension: "Bitubo Rear Mono Shock — Adjustable Rebound, Spring Preload",
        frontBrake: "Brembo, Double Floating Discs Ø330 mm, 4 Pistons Radial Caliper",
        rearBrake: "Brembo, Single Disc Ø240 mm, 2 Pistons Caliper",
        frontTyre: "Pirelli Diablo Rosso III 120/70 ZR17",
        rearTyre: "Pirelli Diablo Rosso III 180/55 ZR17",
      },
    },
  },
  {
    id: "ego",
    name: "Ego",
    tagline: "Derived from racing. Proven on track.",
    headline: "147 HP. MotoE architecture. Road legal.",
    description:
      "Four MotoE seasons produced this motor. 147 HP sustained, 169 HP peak. 0–60 mph in 2.6 seconds. Brembo brakes, race-derived chassis geometry. Street registered.",
    storyParagraphs: [
      "Four seasons of MotoE. One motor platform. The Ego is built from what Energica learned on the grid — not inspired by it. The same EMCE architecture. Different application.",
      "147 HP sustained — 169 HP peak. 222 Nm at the wheel. RS Version 0–60 mph in 2.6 seconds. 241 km/h top speed. These numbers were earned on circuits, then certified for public roads.",
      "Marzocchi suspension front and rear. Brembo radial brakes. Chassis geometry tuned on the same circuits where MotoE champions compete. Road legal. No exceptions.",
    ],
    callout: {
      stat: "147 HP",
      label: "EMCE-derived peak power — road legal",
    },
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
        image: "/images/Pagina%20EGO/EGO%20RS_Tricolore.webp",
      },
    ],
    keySpecs: [
      { label: "Peak Power", value: "169", unit: "HP" },
      { label: "0–60 mph (RS)", value: "2.6", unit: "sec" },
      { label: "City Range", value: "261", unit: "miles" },
      { label: "Top Speed", value: "150", unit: "mph" },
    ],
    specs: {
      motor: {
        type: "HSM (Hybrid Synchronous Motor) Liquid-Cooled 3-Phase – 300 V – 12,000 rpm with Adaptive Control Inverter",
      },
      performance: {
        maxSpeed: "Limited at 150 mph",
        acceleration: "EGO+ RS Version 0-60 mph: 2.6 sec (EMCE) / EGO+ 0-60 mph: 2.8 sec (EMCE)",
        torque: "222 Nm / 164 lb. ft (EMCE)",
        power: "Peak 169 hp (126 kW) (EMCE) / Sustained 147 hp (110 kW) (EMCE)",
        range: "City: 261 miles – Combined: 160 miles – Extra-Urban: 130 miles (EMCE)",
        ridingModes: "4 Riding Modes: Eco, Standard, Wet, Sport / 4 Regenerative Maps: Low, Medium, High, Off",
        parkAssistant: "Back and Forth (Slow Speed)",
      },
      battery: {
        capacity: "Max 21.5 kWh / Nominal 18.9 kWh – lithium polymer",
        life: "1200 Cycles @ 80% Capacity (100% DOD)",
        warranty: "on vehicle 2 years – on battery 3 years / 31.000 miles",
        charging: "DC Fast Charge Mode 4: 250 mph, 80% charge in 40 min / Slow Charge Mode 2 or 3: 42 mph",
        batteryCharger: "Onboard, [110-220]V [50-60]Hz, 3 kW. Conforms to Standards SAE J1772 and IEC 62196-2 with pilot signal for charging station interface",
        lprFunction: "Long Period Rest: allows the maintenance and automatic balancing of the batteries during long period of non-use",
        chargeInterruption: "The vehicle can be configured to autonomously stop the charge at a certain level. The user can configure this function through the dashboard",
      },
      electronics: {
        dashboard: "Cobo, 4.3\" WQVGA 480×272 TFT 16.7 million colors Display; integrated GPS receiver; 9 Warning Lights; 6 + 6 Current Consumption Lights; Ambient Light Sensor; Real Time Clock; GPS 10Hz.",
        vehicleControlUnit: "A Vehicle Control Unit implementing a multi-map adaptive energy and power management algorithm manages the vehicle. It constantly monitors batteries, even in key off position. RS version implements a dedicated mapping and parameterization to highlight the high-performing and thrilling nature of Energica, developed within the racing world.",
        tractionControl: "Six levels of intervention combined with the existing eABS and the Bosch ABS",
        cruiseControl: "Sophisticated cruise control system that uses the electronic brake to maintain speed and increase braking energy",
      },
      dimensions: {
        seatHeight: "31.9\"",
        wheelbase: "57.7\"",
        length: "84.2\"",
        width: "34.25\"",
        height: "45.9\" (mirrors not included)",
        weight: "573 lbs. (EMCE)",
      },
      cycleParts: {
        frame: "Steel Tubular Trellis",
        frontSuspension: "Marzocchi Ø43 mm — Adjustable Rebound, Compression Damping, Spring Preload",
        rearSuspension: "Bitubo Rear Mono Shock — Adjustable Rebound, Spring Preload",
        frontBrake: "Brembo, Double Floating Discs Ø330 mm, 4 Pistons Radial Caliper",
        rearBrake: "Brembo, Single Disc Ø240 mm, 2 Pistons Caliper",
        frontTyre: "Pirelli Diablo Rosso III 120/70 ZR17",
        rearTyre: "Pirelli Diablo Rosso III 180/55 ZR17",
      },
    },
  },
];

export function getModelById(id: string): BikeModel | undefined {
  return models.find((m) => m.id === id);
}
