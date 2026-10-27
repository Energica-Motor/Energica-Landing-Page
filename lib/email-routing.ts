// Where website enquiries are delivered. Override per environment in Vercel
// (ENQUIRY_TO_EMAIL, ENQUIRY_CC_EMAIL — comma-separated for several) without
// a code change. Keshav stays in CC while the sales inbox is being confirmed,
// so no enquiry can be lost during the switch.
export const ENQUIRY_TO = process.env.ENQUIRY_TO_EMAIL || "sales@energicamotor.com";
export const ENQUIRY_CC = (process.env.ENQUIRY_CC_EMAIL ?? "keshav@energicamotor.com")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Which website form an enquiry came from — shown in the subject and body. */
export type EnquirySource = "Contact Form" | "Test Ride Form" | "Configurator" | "ReCharge";

export function enquirySubject(source: EnquirySource, subject: string): string {
  return `[${source}] ${subject}`;
}

/** Escapes visitor-supplied text before it is placed in email HTML. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
