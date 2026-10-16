import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { generateCode, issueCodeToken } from "@/lib/recharge-verify";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Energica Motor <hello@energicamotor.com>";

const LOGO_URL =
  "https://energica-website-tau.vercel.app/images/Logo/energica-logo@2x.png";

// Very small in-memory rate limit per server instance — a serverless
// deployment resets this on cold start, but it still blunts naive spam
// scripts hammering a single warm function.
const recentRequests = new Map<string, number>();
const RATE_LIMIT_MS = 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, honeypot } = body;

    // Honeypot field — real users never fill this in.
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const last = recentRequests.get(email);
    if (last && Date.now() - last < RATE_LIMIT_MS) {
      return NextResponse.json({ error: "Please wait before requesting another code" }, { status: 429 });
    }
    recentRequests.set(email, Date.now());

    const code = generateCode();
    const token = issueCodeToken(email, code);

    const { error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Your Energica ReCharge verification code: ${code}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
          <div style="background: #0A0A0A; padding: 24px 32px; border-bottom: 3px solid #78BE20;">
            <img src="${LOGO_URL}" alt="Energica Motor" height="32" />
          </div>
          <div style="padding: 32px; background: #f9f9f9;">
            <h2 style="margin: 0 0 12px; font-size: 20px;">Verify your email</h2>
            <p style="margin: 0 0 24px; color: #444; line-height: 1.6;">
              Enter this code to confirm your ReCharge offer request:
            </p>
            <div style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 0.2em; color: #78BE20; text-align: center; padding: 16px; background: #fff; border: 1px solid #eee; border-radius: 8px;">
              ${code}
            </div>
            <p style="margin: 24px 0 0; color: #888; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
          </div>
          <div style="padding: 16px 32px; background: #0A0A0A; color: #555; font-size: 12px;">
            Energica Motor Company · energicamotor.com
          </div>
        </div>
      `,
    });
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, token });
  } catch (err) {
    console.error("[recharge-verify]", err);
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
  }
}
