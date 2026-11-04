// Validation for enquiries sent from the Energica Lounge (lounge.energicamotor.com).
// Kept free of Next/Resend imports so it can be unit-tested on its own.

export const LOUNGE_LEAD_KINDS = {
  ride: "Ride request",
  plan: "Ride plan shared",
  product: "Product enquiry",
  selection: "Collection selection",
  service: "Service request",
  community: "Community sign-up",
} as const;

export type LoungeLeadKind = keyof typeof LOUNGE_LEAD_KINDS;

export interface LoungeLead {
  kind: LoungeLeadKind;
  name: string;
  email: string;
  phone: string;
  location: string;
  message: string;
  /** What the visitor was looking at: ride, product, motorcycle, etc. */
  context: [string, string][];
}

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const MAX_CONTEXT_FIELDS = 15;

function text(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  // Collapse control characters (header/line injection) except newlines in long text.
  return value.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, " ").trim().slice(0, max);
}

export type ValidationResult =
  | { ok: true; lead: LoungeLead }
  | { ok: false; error: string };

export function validateLoungeLead(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request." };
  const b = body as Record<string, unknown>;

  const kind = b.kind;
  if (typeof kind !== "string" || !(kind in LOUNGE_LEAD_KINDS)) {
    return { ok: false, error: "Unknown enquiry type." };
  }
  if (b.consent !== true) {
    return { ok: false, error: "Please confirm that Energica may contact you." };
  }

  const name = text(b.name, 80).replace(/\n/g, " ");
  const email = text(b.email, 150).replace(/\n/g, "");
  const phone = text(b.phone, 40).replace(/\n/g, " ");
  const location = text(b.location, 100).replace(/\n/g, " ");
  const message = text(b.message, 2000);

  if (!name) return { ok: false, error: "Please enter your name." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email address." };

  const context: [string, string][] = [];
  if (b.context && typeof b.context === "object" && !Array.isArray(b.context)) {
    for (const [k, v] of Object.entries(b.context as Record<string, unknown>)) {
      if (context.length >= MAX_CONTEXT_FIELDS) break;
      const key = text(k, 40).replace(/\n/g, " ");
      const val = Array.isArray(v)
        ? v.map((x) => text(x, 120)).filter(Boolean).join(", ").slice(0, 600)
        : text(typeof v === "number" ? String(v) : v, 600);
      if (key && val) context.push([key, val]);
    }
  }

  return { ok: true, lead: { kind: kind as LoungeLeadKind, name, email, phone, location, message, context } };
}

/** Requests must come from the lounge (or the main site / local dev / Vercel previews). */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const { hostname, protocol } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    if (protocol !== "https:") return false;
    return (
      hostname === "energicamotor.com" ||
      hostname.endsWith(".energicamotor.com") ||
      hostname.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}
