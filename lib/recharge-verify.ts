import { createHmac, timingSafeEqual } from "crypto";

// Stateless email-verification tokens (no DB): sign email + code/purpose +
// expiry with a server secret, ship the signature to the client, and
// re-verify it on the next call. Keeps ReCharge lead submission gated behind
// a real inbox without needing persistent storage.

const SECRET = process.env.RECHARGE_VERIFY_SECRET;

function sign(payload: string): string {
  if (!SECRET) {
    throw new Error("RECHARGE_VERIFY_SECRET is not configured");
  }
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const VERIFIED_TTL_MS = 30 * 60 * 1000; // 30 minutes to complete the form after verifying

export function issueCodeToken(email: string, code: string): string {
  const expires = Date.now() + CODE_TTL_MS;
  const payload = `code|${email}|${code}|${expires}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}|${sig}`).toString("base64url");
}

export function verifyCodeToken(token: string, email: string, code: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split("|");
    if (parts.length !== 5 || parts[0] !== "code") return false;
    const [, tokenEmail, tokenCode, expiresStr, sig] = parts;
    const expires = Number(expiresStr);
    if (!Number.isFinite(expires) || Date.now() > expires) return false;
    if (tokenEmail !== email) return false;
    if (!safeEqual(tokenCode, code)) return false;

    const payload = `code|${tokenEmail}|${tokenCode}|${expiresStr}`;
    const expectedSig = sign(payload);
    return safeEqual(sig, expectedSig);
  } catch {
    return false;
  }
}

export function issueVerifiedToken(email: string): string {
  const expires = Date.now() + VERIFIED_TTL_MS;
  const payload = `verified|${email}|${expires}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}|${sig}`).toString("base64url");
}

export function verifyVerifiedToken(token: string, email: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split("|");
    if (parts.length !== 4 || parts[0] !== "verified") return false;
    const [, tokenEmail, expiresStr, sig] = parts;
    const expires = Number(expiresStr);
    if (!Number.isFinite(expires) || Date.now() > expires) return false;
    if (tokenEmail !== email) return false;

    const payload = `verified|${tokenEmail}|${expiresStr}`;
    const expectedSig = sign(payload);
    return safeEqual(sig, expectedSig);
  } catch {
    return false;
  }
}
