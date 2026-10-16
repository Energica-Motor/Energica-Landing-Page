import { NextRequest, NextResponse } from "next/server";
import { verifyCodeToken, issueVerifiedToken } from "@/lib/recharge-verify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, token } = body;

    if (!email || !code || !token) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!verifyCodeToken(token, email, String(code))) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    const verifiedToken = issueVerifiedToken(email);
    return NextResponse.json({ success: true, verifiedToken });
  } catch (err) {
    console.error("[recharge-verify-confirm]", err);
    return NextResponse.json({ error: "Failed to verify code" }, { status: 500 });
  }
}
