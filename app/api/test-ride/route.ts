import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Energica Motor <hello@energicamotor.com>";
const TO   = "keshav@energicamotor.com";

const MODEL_NAMES: Record<string, string> = {
  experia: "Experia",
  esseesse9: "EsseEsse9",
  "eva-ribelle": "Eva Ribelle",
  ego: "Ego+",
};

const LOGO_URL =
  "https://energica-website-tau.vercel.app/images/Logo/energica-logo@2x.png";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, model, dealer, message } = body;
    const modelName = MODEL_NAMES[model] ?? model;

    // Basic server-side guard
    if (!firstName || !lastName || !email || !model || !dealer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Send notification to the team
    await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `New Test Ride Request — ${modelName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <div style="background: #0A0A0A; padding: 24px 32px; border-bottom: 3px solid #78BE20;">
            <img src="${LOGO_URL}" alt="Energica Motor" height="32" />
          </div>
          <div style="padding: 32px; background: #f9f9f9;">
            <h2 style="margin: 0 0 24px; font-size: 20px;">New Test Ride Request</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #666; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${firstName} ${lastName}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #78BE20;">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;">${phone || "—"}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Model</td><td style="padding: 8px 0; font-weight: 600;">${modelName}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Dealer</td><td style="padding: 8px 0;">${dealer}</td></tr>
              ${message ? `<tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Message</td><td style="padding: 8px 0;">${message}</td></tr>` : ""}
            </table>
          </div>
          <div style="padding: 16px 32px; background: #0A0A0A; color: #555; font-size: 12px;">
            Sent from energicamotor.com · Test Ride Form
          </div>
        </div>
      `,
    });

    // Send confirmation to the user
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Your Energica Test Ride Request",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <div style="background: #0A0A0A; padding: 24px 32px; border-bottom: 3px solid #78BE20;">
            <img src="${LOGO_URL}" alt="Energica Motor" height="32" />
          </div>
          <div style="padding: 32px; background: #f9f9f9;">
            <h2 style="margin: 0 0 12px; font-size: 20px;">Thanks, ${firstName}.</h2>
            <p style="margin: 0 0 24px; color: #444; line-height: 1.6;">
              We've received your test ride request for the <strong>${modelName}</strong> at ${dealer}.
              Our team will be in touch shortly to confirm your booking.
            </p>
            <p style="margin: 0; color: #888; font-size: 13px;">Progress, Ridden.</p>
          </div>
          <div style="padding: 16px 32px; background: #0A0A0A; color: #555; font-size: 12px;">
            Energica Motor Company · energicamotor.com
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[test-ride]", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
