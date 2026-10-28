import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { ENQUIRY_TO, ENQUIRY_CC, enquirySubject, escapeHtml } from "@/lib/email-routing";
import { checkBuildPdf } from "@/lib/build-sheet/validate-pdf";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Energica Motor <hello@energicamotor.com>";

const LOGO_URL =
  "https://energica-website-tau.vercel.app/images/Logo/energica-logo@2x.png";

// What the visitor was doing when the form was sent — tells sales the intent.
const INTENT_LABELS: Record<string, string> = {
  contact: "Asked to be contacted by a dealer",
  link: "Copied a link to their build",
  pdf: "Downloaded the build PDF",
  whatsapp: "Shared their build on WhatsApp",
  update: "Changed their build after enquiring",
};


interface OptionItem { group: string; name: string }

type EmailPayload = Parameters<typeof resend.emails.send>[0];

// Resend occasionally can't be reached; one retry avoids losing the enquiry.
async function sendEmail(payload: EmailPayload) {
  let result = await resend.emails.send(payload);
  if (result.error) {
    await new Promise((r) => setTimeout(r, 1000));
    result = await resend.emails.send(payload);
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, email, phone, country, dealer, message,
      model, options, buildUrl, buildCode, pdf, pdfName, intent, confirm,
    } = body ?? {};

    if (!name || !email || !phone || !country) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    let attachment: { filename: string; content: string; contentType: string }[] | undefined;
    if (pdf) {
      const check = checkBuildPdf(pdf, buildCode);
      if (!check.ok) {
        console.warn("[configurator-contact] attachment rejected: %s", check.error);
        return NextResponse.json({ error: `Invalid attachment: ${check.error}` }, { status: 400 });
      }
      attachment = [{ filename: String(pdfName || "Energica-build.pdf").replace(/[^\w.-]/g, ""), content: pdf, contentType: "application/pdf" }];
    }

    const items: OptionItem[] = Array.isArray(options)
      ? options.filter((o: OptionItem) => o && typeof o.name === "string").slice(0, 200)
      : [];
    const byGroup = new Map<string, string[]>();
    for (const o of items) {
      const g = String(o.group || "Options");
      byGroup.set(g, [...(byGroup.get(g) ?? []), o.name]);
    }
    const optionsHtml = [...byGroup.entries()]
      .map(([g, names]) => `
        <tr><td style="padding: 6px 0; color: #666; vertical-align: top; width: 140px;">${escapeHtml(g)}</td>
        <td style="padding: 6px 0;">${names.map(escapeHtml).join("<br/>")}</td></tr>`)
      .join("");

    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      phone: escapeHtml(phone),
      country: escapeHtml(country),
      dealer: escapeHtml(dealer),
      message: escapeHtml(message).replace(/\n/g, "<br/>"),
      model: escapeHtml(model || "Configurator"),
      buildUrl: /^https?:\/\//.test(String(buildUrl)) ? escapeHtml(buildUrl) : "",
      buildCode: escapeHtml(buildCode),
      intent: escapeHtml(INTENT_LABELS[intent] ?? INTENT_LABELS.contact),
    };
    const isUpdate = intent === "update";

    const { error: err1 } = await sendEmail({
      from: FROM,
      to: ENQUIRY_TO,
      cc: ENQUIRY_CC,
      replyTo: String(email),
      subject: enquirySubject(
        "Configurator",
        `${isUpdate ? "Updated build" : "New build enquiry"} — ${model || "Configurator"} — ${name}${country ? ` (${country})` : ""}`,
      ),
      attachments: attachment,
      html: `
        <div style="font-family: sans-serif; max-width: 640px; margin: 0 auto; color: #111;">
          <div style="background: #0A0A0A; padding: 24px 32px; border-bottom: 3px solid #78BE20;">
            <img src="${LOGO_URL}" alt="Energica Motor" height="32" />
          </div>
          <div style="padding: 32px; background: #f9f9f9;">
            <h2 style="margin: 0 0 6px; font-size: 20px;">${isUpdate ? "Updated build" : "New build enquiry"} — Energica ${safe.model}</h2>
            <p style="margin: 0 0 24px; color: #666; font-size: 13px;">${safe.intent}. Please forward to the dealer for ${safe.country}${safe.dealer ? ` (preferred: ${safe.dealer})` : ""}.</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 6px 0; color: #666; width: 140px;">Name</td><td style="padding: 6px 0; font-weight: 600;">${safe.name}</td></tr>
              <tr><td style="padding: 6px 0; color: #666;">Email</td><td style="padding: 6px 0;"><a href="mailto:${safe.email}" style="color: #78BE20;">${safe.email}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #666;">Phone</td><td style="padding: 6px 0;">${safe.phone}</td></tr>
              <tr><td style="padding: 6px 0; color: #666;">Country / city</td><td style="padding: 6px 0;">${safe.country}</td></tr>
              ${safe.dealer ? `<tr><td style="padding: 6px 0; color: #666;">Preferred dealer</td><td style="padding: 6px 0;">${safe.dealer}</td></tr>` : ""}
              ${safe.message ? `<tr><td style="padding: 6px 0; color: #666; vertical-align: top;">Message</td><td style="padding: 6px 0;">${safe.message}</td></tr>` : ""}
              ${safe.buildUrl ? `<tr><td style="padding: 6px 0; color: #666;">Build link</td><td style="padding: 6px 0;"><a href="${safe.buildUrl}" style="color: #78BE20;">${safe.buildUrl}</a>${safe.buildCode ? ` <span style="color:#999;">(ref ${safe.buildCode})</span>` : ""}</td></tr>` : ""}
            </table>
            ${optionsHtml ? `
            <h3 style="margin: 28px 0 8px; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; color: #78BE20;">Selected options</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">${optionsHtml}</table>` : ""}
            ${attachment ? `<p style="margin: 24px 0 0; color: #666; font-size: 13px;">The build summary PDF is attached.</p>` : ""}
          </div>
          <div style="padding: 16px 32px; background: #0A0A0A; color: #555; font-size: 12px;">
            Sent from energicamotor.com · Configurator
          </div>
        </div>
      `,
    });
    if (err1) throw new Error(err1.message);

    // Visitor confirmation only for the first submission, not for build updates.
    if (confirm !== false && !isUpdate) {
      const { error: err2 } = await sendEmail({
        from: FROM,
        to: String(email),
        subject: `Your Energica ${model || ""} build — we'll be in touch`.replace(/\s+/g, " "),
        attachments: attachment,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
            <div style="background: #0A0A0A; padding: 24px 32px; border-bottom: 3px solid #78BE20;">
              <img src="${LOGO_URL}" alt="Energica Motor" height="32" />
            </div>
            <div style="padding: 32px; background: #f9f9f9;">
              <h2 style="margin: 0 0 12px; font-size: 20px;">Thanks, ${escapeHtml(String(name).split(" ")[0])}.</h2>
              <p style="margin: 0 0 16px; color: #444; line-height: 1.6;">
                We've received your Energica ${safe.model} build. Our team will connect you with your nearest dealer, who will be in touch with a quotation.
              </p>
              ${safe.buildUrl ? `<p style="margin: 0 0 16px; color: #444; line-height: 1.6;">Your build: <a href="${safe.buildUrl}" style="color: #78BE20;">${safe.buildUrl}</a></p>` : ""}
              ${attachment ? `<p style="margin: 0 0 24px; color: #444; line-height: 1.6;">A PDF summary of your build is attached.</p>` : ""}
              <p style="margin: 0; color: #888; font-size: 13px;">Progress, Ridden.</p>
            </div>
            <div style="padding: 16px 32px; background: #0A0A0A; color: #555; font-size: 12px;">
              Energica Motor Company · energicamotor.com
            </div>
          </div>
        `,
      });
      // The enquiry already reached sales; a failed confirmation is only logged.
      if (err2) console.error("[configurator-contact] confirmation not sent:", err2.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[configurator-contact]", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
