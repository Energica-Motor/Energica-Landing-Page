// Energica ReCharge — buyback valuation pricing table.
// Reconstructed from the design mockup's pricing data (model/year base price,
// mileage band multiplier, condition multiplier). Server-side only — never
// ship this table to the client, since it's the basis of a financial offer.

export type RechargeModel = "ego" | "ribelle" | "ss9" | "experia";
export type RechargeCondition = "mint" | "good" | "acceptable" | "damaged";

interface ModelYearEntry {
  price: number;
  label: string;
}

const BASE_PRICES: Record<RechargeModel, Record<number, ModelYearEntry>> = {
  ego: {
    2019: { price: 12000, label: "Ego +" },
    2020: { price: 14000, label: "Ego + EMCE" },
    2021: { price: 15000, label: "Ego + EMCE" },
    2022: { price: 16000, label: "Ego + EMCE" },
    2023: { price: 17000, label: "Ego + EMCE" },
    2024: { price: 18000, label: "Ego + EMCE" },
  },
  ribelle: {
    2019: { price: 11000, label: "Eva Ribelle +" },
    2020: { price: 13000, label: "Eva Ribelle + EMCE" },
    2021: { price: 14000, label: "Eva Ribelle + EMCE" },
    2022: { price: 15000, label: "Eva Ribelle + EMCE" },
    2023: { price: 16000, label: "Eva Ribelle + EMCE" },
    2024: { price: 17000, label: "Eva Ribelle + EMCE" },
  },
  ss9: {
    2019: { price: 10000, label: "SS9 +" },
    2020: { price: 11000, label: "SS9 + EMCE" },
    2021: { price: 12000, label: "SS9 + EMCE" },
    2022: { price: 13000, label: "SS9 + EMCE" },
    2023: { price: 14000, label: "SS9 + EMCE" },
    2024: { price: 16000, label: "SS9 + EMCE" },
  },
  experia: {
    2022: { price: 18000, label: "Experia" },
    2023: { price: 19000, label: "Experia" },
    2024: { price: 20000, label: "Experia" },
  },
};

// [maxKm, multiplier] bands, evaluated in order.
const MILEAGE_BANDS: [number, number][] = [
  [10000, 1.0],
  [20000, 0.9],
  [Number.POSITIVE_INFINITY, 0.8],
];

const CONDITION_MULTIPLIERS: Record<RechargeCondition, number> = {
  mint: 1.0,
  good: 0.9,
  acceptable: 0.75,
  damaged: 0.5,
};

// Normalization factor applied to every quote.
const NORM_FACTOR = 0.7 / 1.22;

export interface ValuationInput {
  model: RechargeModel;
  year: number;
  mileageKm: number;
  condition: RechargeCondition;
  batteryOk: boolean;
}

export interface ValuationResult {
  price: number;
  mileageBand: string;
  modelLabel: string;
  tier: "standard" | "repack";
}

export function calculateValuation(input: ValuationInput): ValuationResult | null {
  const { model, year, mileageKm, condition, batteryOk } = input;

  if (!Number.isFinite(mileageKm) || mileageKm < 0) return null;

  const entry = BASE_PRICES[model]?.[year];
  if (!entry) return null;

  let bandIndex = MILEAGE_BANDS.length - 1;
  for (let i = 0; i < MILEAGE_BANDS.length; i++) {
    if (mileageKm <= MILEAGE_BANDS[i][0]) {
      bandIndex = i;
      break;
    }
  }
  const mileageMultiplier = MILEAGE_BANDS[bandIndex][1];

  // Dead-battery bikes are always priced at the "damaged" condition tier
  // (Repack track), regardless of declared cosmetic condition.
  const effectiveCondition: RechargeCondition = batteryOk ? condition : "damaged";
  const conditionMultiplier = CONDITION_MULTIPLIERS[effectiveCondition];
  if (!conditionMultiplier) return null;

  const raw = entry.price * NORM_FACTOR * mileageMultiplier * conditionMultiplier;
  if (!Number.isFinite(raw) || raw <= 0) return null;

  return {
    price: Math.round(raw / 50) * 50,
    mileageBand: String.fromCharCode(65 + bandIndex),
    modelLabel: entry.label,
    tier: batteryOk ? "standard" : "repack",
  };
}
