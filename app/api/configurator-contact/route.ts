import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Energica Motor <hello@energicamotor.com>";
const TO = "keshav@energicamotor.com";

const LOGO_URL =
  "https://energica-website-tau.vercel.app/images/Logo/energica-logo@2x.png";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, location, message, model, layers, configUrl, sendConfig } = body;

    if (!name || !email || !phone || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const configSection = sendConfig
      ? `
        <tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Model</td><td style="padding: 8px 0; font-weight: 600;">${model ?? "—"}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Configuration</td><td style="padding: 8px 0; font-size: 12px; color: #555;">${(layers ?? []).join(", ") || "—"}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Build Link</td><td style="padding: 8px 0;"><a href="${configUrl}" style="color: #78BE20; word-break: break-all;">${configUrl}</a></td></tr>
      `
      : "";

    await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `New Dealer Enquiry — ${model ?? "Configurator"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <div style="background: #0A0A0A; padding: 24px 32px; border-bottom: 3px solid #78BE20;">
            <img src="${LOGO_URL}" alt="Energica Motor" height="32" />
          </div>
          <div style="padding: 32px; background: #f9f9f9;">
            <h2 style="margin: 0 0 24px; font-size: 20px;">New Dealer Contact Request</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #666; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #78BE20;">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;">${phone}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Location</td><td style="padding: 8px 0;">${location}</td></tr>
              ${message ? `<tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Message</td><td style="padding: 8px 0;">${message}</td></tr>` : ""}
              ${configSection}
            </table>
          </div>
          <div style="padding: 16px 32px; background: #0A0A0A; color: #555; font-size: 12px;">
            Sent from energicamotor.com · Configurator
          </div>
        </div>
      `,
    });

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Your Energica Enquiry — We'll Be In Touch",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <div style="background: #0A0A0A; padding: 24px 32px; border-bottom: 3px solid #78BE20;">
            <img src="${LOGO_URL}" alt="Energica Motor" height="32" />
          </div>
          <div style="padding: 32px; background: #f9f9f9;">
            <h2 style="margin: 0 0 12px; font-size: 20px;">Thanks, ${name.split(" ")[0]}.</h2>
            <p style="margin: 0 0 24px; color: #444; line-height: 1.6;">
              We've received your enquiry and will connect you with your nearest dealer within 24 hours.
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
    console.error("[configurator-contact]", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
