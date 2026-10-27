import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { ENQUIRY_TO, ENQUIRY_CC, enquirySubject } from "@/lib/email-routing";
import { verifyVerifiedToken } from "@/lib/recharge-verify";
import { calculateValuation, RechargeCondition, RechargeModel } from "@/lib/recharge-pricing";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Energica Motor <hello@energicamotor.com>";

const LOGO_URL =
  "https://energica-website-tau.vercel.app/images/Logo/energica-logo@2x.png";

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("[recharge-lead] TURNSTILE_SECRET_KEY not configured — skipping captcha check");
    return true;
  }
  if (!token) return false;

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    }),
  });
  const data = await res.json();
  return data.success === true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      model, year, mileageKm, condition, batteryOk,
      fullName, email, phone, collectionAddress,
      iban, accountHolder,
      verifiedToken, turnstileToken, honeypot,
    } = body;

    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    if (!fullName || !email || !phone || !collectionAddress || !iban || !accountHolder) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!verifyVerifiedToken(verifiedToken, email)) {
      return NextResponse.json({ error: "Email not verified" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for");
    const captchaOk = await verifyTurnstile(turnstileToken, ip);
    if (!captchaOk) {
      return NextResponse.json({ error: "Captcha verification failed" }, { status: 400 });
    }

    const valuation = calculateValuation({
      model: model as RechargeModel,
      year: Number(year),
      mileageKm: Number(mileageKm),
      condition: condition as RechargeCondition,
      batteryOk: batteryOk !== false,
    });

    if (!valuation) {
      return NextResponse.json({ error: "Could not recalculate valuation" }, { status: 400 });
    }

    const ref = `ER-${Math.floor(10000 + Math.random() * 90000)}`;
    const fmtEUR = (n: number) => `€${Math.round(n).toLocaleString("en-US")}`;

    const { error: err1 } = await resend.emails.send({
      from: FROM,
      to: ENQUIRY_TO,
      cc: ENQUIRY_CC,
      replyTo: email,
      subject: enquirySubject("ReCharge", `New ReCharge Lead — ${valuation.modelLabel} (${ref})`),
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <div style="background: #0A0A0A; padding: 24px 32px; border-bottom: 3px solid #78BE20;">
            <img src="${LOGO_URL}" alt="Energica Motor" height="32" />
          </div>
          <div style="padding: 32px; background: #f9f9f9;">
            <h2 style="margin: 0 0 24px; font-size: 20px;">New ReCharge Buyback Lead — Ref ${ref}</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #666; width: 160px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${fullName}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #78BE20;">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;">${phone}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Collection address</td><td style="padding: 8px 0;">${collectionAddress}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Bike</td><td style="padding: 8px 0; font-weight: 600;">${year} ${valuation.modelLabel}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Mileage</td><td style="padding: 8px 0;">${Number(mileageKm).toLocaleString("en-US")} km · band ${valuation.mileageBand}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Condition</td><td style="padding: 8px 0;">${condition}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Battery working</td><td style="padding: 8px 0;">${batteryOk ? "Yes" : "No — Repack tier"}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Indicative offer</td><td style="padding: 8px 0; font-weight: 600;">${fmtEUR(valuation.price)}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Account holder</td><td style="padding: 8px 0;">${accountHolder}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">IBAN</td><td style="padding: 8px 0; font-family: monospace;">${iban}</td></tr>
            </table>
          </div>
          <div style="padding: 16px 32px; background: #0A0A0A; color: #555; font-size: 12px;">
            Sent from energicamotor.com · Energica ReCharge
          </div>
        </div>
      `,
    });
    if (err1) throw new Error(err1.message);

    const { error: err2 } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Your Energica ReCharge offer — Ref ${ref}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <div style="background: #0A0A0A; padding: 24px 32px; border-bottom: 3px solid #78BE20;">
            <img src="${LOGO_URL}" alt="Energica Motor" height="32" />
          </div>
          <div style="padding: 32px; background: #f9f9f9;">
            <h2 style="margin: 0 0 12px; font-size: 20px;">Thanks, ${fullName.split(" ")[0]}.</h2>
            <p style="margin: 0 0 24px; color: #444; line-height: 1.6;">
              Your indicative offer for the ${year} ${valuation.modelLabel} is <strong>${fmtEUR(valuation.price)}</strong> (Ref ${ref}).
              Our team will send a formal offer letter and collection slot options within 60 minutes.
            </p>
            <p style="margin: 0; color: #888; font-size: 13px;">Progress, Ridden.</p>
          </div>
          <div style="padding: 16px 32px; background: #0A0A0A; color: #555; font-size: 12px;">
            Energica Motor Company · energicamotor.com
          </div>
        </div>
      `,
    });
    if (err2) throw new Error(err2.message);

    return NextResponse.json({ success: true, ref });
  } catch (err) {
    console.error("[recharge-lead]", err);
    return NextResponse.json({ error: "Failed to submit lead" }, { status: 500 });
  }
}
