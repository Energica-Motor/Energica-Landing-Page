// Browser entry for the build-sheet PDF: prepares fonts and images (canvas
// multiply blend onto the paper colour, floor shadow, detail crops), then
// renders with ./render. jsPDF and this module load on demand.
import { buildSheetContent, type ModelId, type SelectedOption } from "./catalog";
import { cropFor, type LayerBox } from "./crops";
import { COLOR, COVER, CROP_IMAGE, FONT_FILES, HERO_IMAGE, PAGE, type FontKey } from "./layout";
import { renderBuildSheet, type ImageAsset } from "./render";

export interface PdfOption extends SelectedOption {
  filename: string; // layer PNG, used to find the part's position for its crop
  offsetX: number;
  offsetY: number;
}

export interface ConfiguratorPdfInput {
  model: ModelId;
  hasRsOption: boolean;
  imageUrl: string | null; // current render (object URL)
  canvas: { width: number; height: number }; // layer canvas size
  layerBaseUrl: string; // where layer PNGs live
  options: PdfOption[];
  buildUrl: string;
  buildCode: string;
  customerName?: string;
}

const FONT_DIR = "/fonts/build-sheet";
const LOGO_SRC = "/images/Logo/energica-wordmark-tricolore-white.webp";

let fontCache: Promise<Record<FontKey, string>> | null = null;
function loadFonts() {
  fontCache ??= Promise.all(
    Object.entries(FONT_FILES).map(async ([key, file]) => {
      const res = await fetch(`${FONT_DIR}/${file}`);
      if (!res.ok) throw new Error(`[build-sheet] missing font ${file} (${res.status})`);
      const bytes = new Uint8Array(await res.arrayBuffer());
      let bin = "";
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return [key, btoa(bin)] as const;
    }),
  ).then((entries) => Object.fromEntries(entries) as Record<FontKey, string>);
  fontCache.catch(() => { fontCache = null; });
  return fontCache;
}

async function loadImage(src: string) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  await img.decode();
  return img;
}

const canvasOf = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = Math.round(w);
  c.height = Math.round(h);
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("[build-sheet] canvas unavailable");
  return { c, ctx };
};
const jpeg = (c: HTMLCanvasElement, quality: number): ImageAsset => ({ data: c.toDataURL("image/jpeg", quality), w: c.width, h: c.height, format: "JPEG" });

async function loadLogo(): Promise<ImageAsset | null> {
  try {
    const img = await loadImage(LOGO_SRC);
    const { c, ctx } = canvasOf(img.naturalWidth, img.naturalHeight);
    ctx.drawImage(img, 0, 0);
    return { data: c.toDataURL("image/png"), w: c.width, h: c.height, format: "PNG" };
  } catch (err) {
    console.warn("[build-sheet] logo unavailable", err);
    return null;
  }
}

// The compositor's output carries a 1 px grey line along its last column and
// row (a few px in on some layers); the bike never reaches the edges, so
// that margin is left out.
const EDGE_PX = 8;
const drawRender = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) =>
  ctx.drawImage(img, 0, 0, img.naturalWidth - EDGE_PX, img.naturalHeight - EDGE_PX, x, y, w, h);

/** Render multiplied onto the paper colour, so its white background disappears. */
function blendOnPaper(img: HTMLImageElement, maxPx: number) {
  const scale = Math.min(1, maxPx / img.naturalWidth);
  const { c, ctx } = canvasOf(img.naturalWidth * scale, img.naturalHeight * scale);
  ctx.fillStyle = COLOR.paper;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.globalCompositeOperation = "multiply";
  drawRender(ctx, img, 0, 0, c.width, c.height);
  ctx.globalCompositeOperation = "source-over";
  return c;
}

/**
 * The whole lower panel of the cover (below the masthead, full page width)
 * as one image: paper, floor shadow, then the render multiplied on top. The
 * image edges fall on the page edge and the masthead, so JPEG's slight shift
 * of the flat paper colour never shows as a seam around the bike.
 */
function coverPanel(img: HTMLImageElement) {
  const panelW = PAGE.w;
  const panelH = PAGE.h - COVER.mastheadH;
  const k = HERO_IMAGE.maxPx / panelW; // canvas px per layout px
  const { c, ctx } = canvasOf(panelW * k, panelH * k);
  ctx.fillStyle = COLOR.paper;
  ctx.fillRect(0, 0, c.width, c.height);

  let w: number = COVER.hero.w;
  let h = (img.naturalHeight / img.naturalWidth) * w;
  if (h > COVER.hero.maxH) { h = COVER.hero.maxH; w = (img.naturalWidth / img.naturalHeight) * h; }
  const x = (panelW - w) / 2;
  const y = COVER.hero.top - COVER.mastheadH;

  // Soft elliptical floor shadow under the wheels
  const { wRatio, hRatio, opacity } = COVER.shadow;
  const rx = (w * wRatio * k) / 2;
  ctx.save();
  ctx.translate((x + w / 2) * k, (y + h * 0.93) * k);
  ctx.scale(1, (h * hRatio * k) / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, `rgba(0,0,0,${opacity})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.globalCompositeOperation = "multiply";
  drawRender(ctx, img, x * k, y * k, w * k, h * k);
  ctx.globalCompositeOperation = "source-over";
  return c;
}

/** Width/height of a PNG from its first 24 bytes (one small range request). */
async function pngSize(url: string): Promise<{ w: number; h: number } | null> {
  try {
    const res = await fetch(url, { headers: { Range: "bytes=0-31" } });
    if (!res.ok) return null;
    const b = new DataView(await res.arrayBuffer());
    if (b.byteLength < 24) return null;
    return { w: b.getUint32(16), h: b.getUint32(20) };
  } catch {
    return null;
  }
}

export async function createConfiguratorPdf(input: ConfiguratorPdfInput) {
  const content = buildSheetContent(input.model, input.options, input.hasRsOption);
  const [fonts, logo, render] = await Promise.all([
    loadFonts(),
    loadLogo(),
    input.imageUrl ? loadImage(input.imageUrl).catch((err) => { console.warn("[build-sheet] render unavailable", err); return null; }) : null,
  ]);

  let hero: ImageAsset | null = null;
  const crops: Record<string, ImageAsset> = {};
  if (render) {
    hero = jpeg(coverPanel(render), HERO_IMAGE.quality);
    try {
      const source = blendOnPaper(render, CROP_IMAGE.sourceMaxPx);
      const byId = new Map(input.options.map((o) => [o.id, o]));
      const rows = [...content.base, ...content.upgrades];
      await Promise.all(rows.map(async (row) => {
        const opt = byId.get(row.optionId);
        let box: LayerBox | null = null;
        if (opt) {
          const size = await pngSize(`${input.layerBaseUrl}/layers/${input.model}/${opt.filename}`);
          if (size) box = { x: opt.offsetX, y: opt.offsetY, w: size.w, h: size.h };
        }
        const crop = cropFor(row.catalogKey, box, input.canvas);
        if (!crop) return;
        const side = source.height / crop.zoom;
        const sx = Math.min(Math.max(0, crop.x * source.width - side / 2), source.width - side);
        const sy = Math.min(Math.max(0, crop.y * source.height - side / 2), source.height - side);
        const { c, ctx } = canvasOf(CROP_IMAGE.px, CROP_IMAGE.px);
        ctx.drawImage(source, sx, sy, side, side, 0, 0, c.width, c.height);
        crops[row.optionId || row.catalogKey] = jpeg(c, CROP_IMAGE.quality);
      }));
    } catch (err) {
      console.warn("[build-sheet] detail crops skipped", err);
    }
  }

  const { doc } = renderBuildSheet(
    { content, customerName: input.customerName, buildCode: input.buildCode, buildUrl: input.buildUrl, date: new Date() },
    { fonts, logo, hero, crops },
  );
  const fileName = `Energica-${content.modelName.replace(/\s+/g, "-")}-${input.buildCode || "build"}.pdf`;
  const dataUri = doc.output("datauristring");
  return {
    fileName,
    base64: dataUri.slice(dataUri.indexOf(",") + 1),
    save: () => doc.save(fileName),
    rows: [...content.base, ...content.upgrades],
  };
}
