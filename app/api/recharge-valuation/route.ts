import { NextRequest, NextResponse } from "next/server";
import { calculateValuation, RechargeCondition, RechargeModel } from "@/lib/recharge-pricing";

const VALID_MODELS: RechargeModel[] = ["ego", "ribelle", "ss9", "experia"];
const VALID_CONDITIONS: RechargeCondition[] = ["mint", "good", "acceptable", "damaged"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model, year, mileageKm, condition, batteryOk, accident, modified } = body;

    if (!VALID_MODELS.includes(model)) {
      return NextResponse.json({ error: "Unsupported model" }, { status: 400 });
    }
    if (!VALID_CONDITIONS.includes(condition)) {
      return NextResponse.json({ error: "Invalid condition" }, { status: 400 });
    }
    if (accident === true || modified === true) {
      // Frame damage or powertrain modifications disqualify the bike from
      // the automated programme — never quote a price for these.
      return NextResponse.json({ error: "Disqualified", disqualified: true }, { status: 200 });
    }

    const result = calculateValuation({
      model,
      year: Number(year),
      mileageKm: Number(mileageKm),
      condition,
      batteryOk: batteryOk !== false,
    });

    if (!result) {
      return NextResponse.json({ error: "No coverage for this model/year", disqualified: true }, { status: 200 });
    }

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[recharge-valuation]", err);
    return NextResponse.json({ error: "Failed to calculate valuation" }, { status: 500 });
  }
}
