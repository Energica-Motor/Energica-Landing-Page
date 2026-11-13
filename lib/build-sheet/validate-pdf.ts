// Server-side check for the build-sheet PDF attached to configurator enquiries.

// Build sheets are about 0.5-1 MB; anything far bigger isn't ours.
const MAX_PDF_BYTES = 2_500_000;

/**
 * Checks a submitted build-sheet PDF: real PDF bytes, within the size limit,
 * and stamped (in its document keywords) with the same build ref as the
 * submitted build code. Returns the decoded bytes or an error message.
 */
export function checkBuildPdf(pdf: unknown, buildCode: unknown): { ok: true; bytes: Buffer } | { ok: false; error: string } {
  if (typeof pdf !== "string" || !pdf) return { ok: false, error: "Missing PDF" };
  if (pdf.length > Math.ceil(MAX_PDF_BYTES / 3) * 4) return { ok: false, error: "PDF too large" };
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(pdf)) return { ok: false, error: "PDF is not base64" };
  const bytes = Buffer.from(pdf, "base64");
  if (bytes.length > MAX_PDF_BYTES) return { ok: false, error: "PDF too large" };
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-" || !bytes.subarray(-1024).toString("latin1").includes("%%EOF")) {
    return { ok: false, error: "Not a PDF" };
  }
  if (typeof buildCode !== "string" || !/^[0-9A-Za-z]{8}$/.test(buildCode)) return { ok: false, error: "Missing build ref" };
  const ref = bytes.toString("latin1").match(/BUILDREF:([0-9A-Za-z]{8})/)?.[1];
  if (ref !== buildCode) return { ok: false, error: "PDF build ref does not match" };
  return { ok: true, bytes };
}
