import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { ENQUIRY_TO, ENQUIRY_CC, enquirySubject, escapeHtml } from "@/lib/email-routing";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Energica Motor <hello@energicamotor.com>";

const LOGO_URL =
  "https://energica-website-tau.vercel.app/images/Logo/energica-logo@2x.png";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, model, message } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const name = `${escapeHtml(firstName)} ${escapeHtml(lastName)}`;
    const safeEmail = escapeHtml(email);

    // Send notification to the team
    const { error: err1 } = await resend.emails.send({
      from: FROM,
      to: ENQUIRY_TO,
      cc: ENQUIRY_CC,
      replyTo: email,
      subject: enquirySubject("Contact Form", `New Enquiry — ${model || "General"}`),
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <div style="background: #0A0A0A; padding: 24px 32px; border-bottom: 3px solid #78BE20;">
            <img src="${LOGO_URL}" alt="Energica Motor" height="32" />
          </div>
          <div style="padding: 32px; background: #f9f9f9;">
            <h2 style="margin: 0 0 24px; font-size: 20px;">New Website Enquiry</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #666; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #78BE20;">${safeEmail}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;">${escapeHtml(phone) || "—"}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Model of interest</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(model) || "—"}</td></tr>
              ${message ? `<tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Message</td><td style="padding: 8px 0; white-space: pre-wrap;">${escapeHtml(message)}</td></tr>` : ""}
            </table>
          </div>
          <div style="padding: 16px 32px; background: #0A0A0A; color: #555; font-size: 12px;">
            Sent from energicamotor.com · Contact Form
          </div>
        </div>
      `,
    });
    if (err1) throw new Error(err1.message);

    // Send confirmation to the visitor
    const { error: err2 } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Your Energica Enquiry — We'll Be In Touch",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <div style="background: #0A0A0A; padding: 24px 32px; border-bottom: 3px solid #78BE20;">
            <img src="${LOGO_URL}" alt="Energica Motor" height="32" />
          </div>
          <div style="padding: 32px; background: #f9f9f9;">
            <h2 style="margin: 0 0 12px; font-size: 20px;">Thanks, ${escapeHtml(firstName)}.</h2>
            <p style="margin: 0 0 24px; color: #444; line-height: 1.6;">
              We've received your enquiry and a member of our team will be in touch shortly.
            </p>
            <p style="margin: 0; color: #444; line-height: 1.6;">
              Looking for an Energica near you? <a href="https://energicamotor.com/dealers" style="color: #78BE20;">Find a dealer</a>.
            </p>
          </div>
          <div style="padding: 16px 32px; background: #0A0A0A; color: #555; font-size: 12px;">
            Energica Motor Company · energicamotor.com
          </div>
        </div>
      `,
    });
    if (err2) console.error("[contact] confirmation email failed:", err2.message);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
