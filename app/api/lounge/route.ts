import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { ENQUIRY_TO, ENQUIRY_CC, enquirySubject, escapeHtml } from "@/lib/email-routing";
import { LOUNGE_LEAD_KINDS, isAllowedOrigin, validateLoungeLead } from "@/lib/lounge-lead";

const FROM = "Energica Motor <hello@energicamotor.com>";
const LOGO_URL = "https://energicamotor.com/images/Logo/energica-logo@2x.png";

// Best-effort per-IP limit (per server instance): 5 enquiries per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const row = (label: string, value: string) =>
  `<tr><td style="padding:8px 0;color:#666;width:140px;vertical-align:top">${escapeHtml(label)}</td>` +
  `<td style="padding:8px 0;font-weight:600;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`;

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production" && !isAllowedOrigin(req.headers.get("origin"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Bots: hidden field filled, or the form was submitted implausibly fast.
  // Answer "success" so they don't adapt; nothing is sent.
  const startedAt = Number(body?.startedAt);
  if (body?.company || (Number.isFinite(startedAt) && Date.now() - startedAt < 2500)) {
    return NextResponse.json({ success: true });
  }

  const result = validateLoungeLead(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  const lead = result.lead;

  // Counted only for enquiries that would send an email, so typos don't lock people out.
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[lounge] RESEND_API_KEY not configured");
    return NextResponse.json({ error: "Enquiries are temporarily unavailable." }, { status: 503 });
  }

  const label = LOUNGE_LEAD_KINDS[lead.kind];
  const headline = lead.context[0]?.[1];
  const subject = enquirySubject(
    "Lounge",
    `${label}${headline ? ` — ${headline.slice(0, 80)}` : ""} — ${lead.name}`,
  );

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
      <div style="background:#0A0A0A;padding:24px 32px;border-bottom:3px solid #78BE20">
        <img src="${LOGO_URL}" alt="Energica Motor" height="32" />
      </div>
      <div style="padding:32px;background:#f9f9f9">
        <h2 style="margin:0 0 24px;font-size:20px">${escapeHtml(label)}</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${row("Name", lead.name)}
          ${row("Email", lead.email)}
          ${lead.phone ? row("Phone", lead.phone) : ""}
          ${lead.location ? row("Location", lead.location) : ""}
          ${lead.message ? row("Message", lead.message) : ""}
          ${lead.context.map(([k, v]) => row(k, v)).join("")}
          ${row("Consent", "Agreed to be contacted about this request")}
        </table>
      </div>
      <div style="padding:16px 32px;background:#0A0A0A;color:#888;font-size:12px">
        Sent from lounge.energicamotor.com · ${escapeHtml(label)}
      </div>
    </div>`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM,
      to: ENQUIRY_TO,
      cc: ENQUIRY_CC,
      replyTo: lead.email,
      subject,
      html,
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[lounge] send failed", err);
    return NextResponse.json({ error: "Could not send right now. Please try again." }, { status: 502 });
  }
}
