// Where the bike sits inside a compositor preview. The compositor image
// (4938×3292) has wide white margins; the stage shows only the bike's
// region. The compositor output itself is unchanged (the PDF uses it).

/** Columns of the outline used to keep the bike clear of the stage title. */
export const SKY_COLS = 120;
const SAMPLE_W = 480; // downscaled width used for measuring
const NEAR_WHITE = 236; // a pixel darker than this in any channel is bike

/** All values are fractions of the full image (0–1). */
export interface BikeBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Per column across the full image width: the bike's top edge, or 1 where the column is empty. */
  sky: number[];
  /** Image width / height. */
  aspect: number;
}

/** Bounding box and outline of the bike in a preview, or null when it can't be measured. */
export async function measureBike(blob: Blob): Promise<BikeBox | null> {
  if (typeof createImageBitmap === "undefined" || typeof document === "undefined") return null;
  try {
    const bmp = await createImageBitmap(blob);
    const w = SAMPLE_W;
    const h = Math.max(1, Math.round((bmp.height * w) / bmp.width));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(bmp, 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h).data;
    const sky = new Array<number>(SKY_COLS).fill(1);
    let minX = w, maxX = -1, minY = h, maxY = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (d[i + 3] > 24 && (d[i] < NEAR_WHITE || d[i + 1] < NEAR_WHITE || d[i + 2] < NEAR_WHITE)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          const c = Math.min(SKY_COLS - 1, Math.floor((x * SKY_COLS) / w));
          if (y / h < sky[c]) sky[c] = y / h;
        }
      }
    }
    const aspect = bmp.width / bmp.height;
    bmp.close();
    if (maxX < 0) return null;
    return { x0: minX / w, y0: minY / h, x1: (maxX + 1) / w, y1: (maxY + 1) / h, sky, aspect };
  } catch {
    return null;
  }
}

/** The smallest box holding both, so a model's crop only ever grows. */
export function unionBox(a: BikeBox | null, b: BikeBox | null): BikeBox | null {
  if (!a || !b) return a ?? b;
  return {
    x0: Math.min(a.x0, b.x0),
    y0: Math.min(a.y0, b.y0),
    x1: Math.max(a.x1, b.x1),
    y1: Math.max(a.y1, b.y1),
    sky: a.sky.map((v, i) => Math.min(v, b.sky[i] ?? 1)),
    aspect: b.aspect,
  };
}

export const sameBox = (a: BikeBox | null, b: BikeBox | null) =>
  a === b || (!!a && !!b && a.x0 === b.x0 && a.y0 === b.y0 && a.x1 === b.x1 && a.y1 === b.y1);

/** The displayed region: the bike plus `pad` of its size on every side, kept inside the image. */
export function paddedRegion(box: BikeBox, pad = 0.03) {
  const pw = (box.x1 - box.x0) * pad;
  const ph = (box.y1 - box.y0) * pad;
  const x0 = Math.max(0, box.x0 - pw), x1 = Math.min(1, box.x1 + pw);
  const y0 = Math.max(0, box.y0 - ph), y1 = Math.min(1, box.y1 + ph);
  return {
    x0, y0, x1, y1,
    /** Width / height of the region in pixels. */
    ratio: ((x1 - x0) * box.aspect) / (y1 - y0),
    /** How far the bike's bottom edge sits above the region's bottom, as a fraction of its height. */
    floor: (y1 - box.y1) / (y1 - y0),
  };
}

export interface Rect { left: number; top: number; right: number; bottom: number }

/**
 * Largest bike width (px) that fits `area` (width × height), sits on its
 * floor, is centred and nudged right, and keeps the bike's actual outline
 * clear of `avoid` (the title, in area coordinates) by `gap`.
 */
export function fitBike(
  box: BikeBox,
  area: { width: number; height: number },
  avoid: Rect | null,
  { nudge = 0.03, gap = 16, floorPad = 12 }: { nudge?: number; gap?: number; floorPad?: number } = {},
) {
  const r = paddedRegion(box);
  const usableH = Math.max(0, area.height - floorPad);
  const maxW = Math.min(area.width, usableH * r.ratio);
  const place = (w: number) => {
    const h = w / r.ratio;
    const left = Math.min(Math.max(0, (area.width - w) / 2 + area.width * nudge), Math.max(0, area.width - w));
    return { width: w, height: h, left, top: usableH - h };
  };
  const collides = (p: ReturnType<typeof place>) => {
    if (!avoid) return false;
    for (let c = 0; c < SKY_COLS; c++) {
      const top = box.sky[c];
      if (top >= 1) continue;
      const fx0 = c / SKY_COLS, fx1 = (c + 1) / SKY_COLS;
      if (fx1 <= r.x0 || fx0 >= r.x1) continue;
      const sx0 = p.left + ((fx0 - r.x0) / (r.x1 - r.x0)) * p.width;
      const sx1 = p.left + ((fx1 - r.x0) / (r.x1 - r.x0)) * p.width;
      if (sx1 < avoid.left - gap || sx0 > avoid.right + gap) continue;
      const sy = p.top + ((top - r.y0) / (r.y1 - r.y0)) * p.height;
      if (sy < avoid.bottom + gap) return true;
    }
    return false;
  };
  if (!collides(place(maxW))) return { ...place(maxW), region: r };
  // Shrink the bike (never the title) until its outline clears the title
  let lo = 0, hi = maxW;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (collides(place(mid))) hi = mid; else lo = mid;
  }
  return { ...place(lo), region: r };
}
