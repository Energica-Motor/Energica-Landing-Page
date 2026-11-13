import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { buildSheetContent, type ModelId, type SelectedOption } from "@/lib/build-sheet/catalog";
import { FONT_FILES, PAGE, type FontKey } from "@/lib/build-sheet/layout";
import { renderBuildSheet } from "@/lib/build-sheet/render";
import { checkBuildPdf } from "@/lib/build-sheet/validate-pdf";
import fixtures from "./fixtures.json";

const fonts = Object.fromEntries(
  Object.entries(FONT_FILES).map(([k, f]) => [k, readFileSync(path.join("public/fonts/build-sheet", f)).toString("base64")]),
) as Record<FontKey, string>;

const MODELS: ModelId[] = ["eva_ribelle", "essesse9", "ego", "experia"];

function render(model: ModelId, options: SelectedOption[] = fixtures[model].max, customerName = "Giritharan Mani") {
  return renderBuildSheet(
    {
      content: buildSheetContent(model, options, fixtures[model].hasRs),
      customerName,
      buildCode: "VDTYjycs",
      buildUrl: "https://energicamotor.com/b/VDTYjycs",
      date: new Date("2026-10-28"),
    },
    { fonts },
  );
}

describe("build sheet PDF", () => {
  it.each(MODELS)("renders exactly 3 A4 pages for %s (largest build)", (m) => {
    const { doc } = render(m);
    expect(doc.getNumberOfPages()).toBe(3);
    for (let p = 1; p <= 3; p++) {
      doc.setPage(p);
      const mm = (px: number) => (px * 25.4) / 96;
      expect(mm(doc.internal.pageSize.getWidth())).toBeCloseTo(210, 0);
      expect(mm(doc.internal.pageSize.getHeight())).toBeCloseTo(297, 0);
    }
  });

  it.each(MODELS)("draws no placeholders, em dashes, layer codes or prices for %s", (m) => {
    const all = render(m).log.map((t) => t.text).join("\n");
    expect(all).not.toMatch(/\[|\]|undefined|null|NaN/);
    expect(all).not.toMatch(/—/);
    expect(all).not.toMatch(/\b[A-Z]{2}-\d{2,3}/);
    expect(all).not.toMatch(/[€$£]/);
  });

  it.each(MODELS)("keeps all text inside the page margins for %s", (m) => {
    for (const t of render(m).log) {
      expect(t.x).toBeGreaterThanOrEqual(PAGE.pad - 0.5);
      expect(t.x + t.width).toBeLessThanOrEqual(PAGE.w - PAGE.pad + 0.5);
    }
  });

  it("fits a very long customer name on the cover", () => {
    const name = "Maximilian Alexander Konstantin von Hohenzollern-Sigmaringen-Wittelsbach the Third";
    const { log } = render("eva_ribelle", fixtures.reference, name);
    const prepared = log.find((t) => t.page === 1 && t.text.startsWith("PREPARED FOR"))!;
    expect(prepared.x + prepared.width).toBeLessThanOrEqual(PAGE.w - PAGE.pad + 0.5);
    expect(prepared.text.endsWith("…")).toBe(true);
  });

  it("stamps the build ref so the API can verify the attachment", () => {
    const b64 = render("ego").doc.output("datauristring").split(",")[1];
    expect(checkBuildPdf(b64, "VDTYjycs")).toMatchObject({ ok: true });
    expect(checkBuildPdf(b64, "AAAAAAAA")).toMatchObject({ ok: false, error: "PDF build ref does not match" });
    expect(checkBuildPdf(Buffer.from("hello world").toString("base64"), "VDTYjycs")).toMatchObject({ ok: false, error: "Not a PDF" });
    expect(checkBuildPdf("A".repeat(4_000_000), "VDTYjycs")).toMatchObject({ ok: false, error: "PDF too large" });
  });

  it("fails clearly when a font is missing", () => {
    const missing: Partial<Record<FontKey, string>> = { ...fonts };
    delete missing.mono;
    expect(() =>
      renderBuildSheet(
        { content: buildSheetContent("ego", fixtures.ego.max, true), buildCode: "VDTYjycs", buildUrl: "https://x", date: new Date() },
        { fonts: missing as Record<FontKey, string> },
      ),
    ).toThrow(/missing font/);
  });
});
