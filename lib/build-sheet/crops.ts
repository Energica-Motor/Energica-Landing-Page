// Detail crops for the "Your build" rows: a square taken from the hero render.
// x, y = crop centre as a fraction of the render's width/height;
// zoom = render height / crop side (2 shows half the height).
// Rows tied to a part default to that part's position on the render; the
// overrides below cover rows where the part's box isn't a good crop (whole-bike
// colour layers, wheels spread across the bike, rows without their own layer).

export interface Crop { x: number; y: number; zoom: number }

export const CROP_OVERRIDES: Record<string, Crop> = {
  colourway: { x: 0.56, y: 0.36, zoom: 3.4 }, // tank and fairing
  "version-standard": { x: 0.56, y: 0.6, zoom: 3.2 },
  "rs version": { x: 0.56, y: 0.6, zoom: 3.2 },
  "standard suspensions": { x: 0.37, y: 0.52, zoom: 3.4 }, // rear shock
  "kit ohlins suspensions": { x: 0.37, y: 0.52, zoom: 3.4 },
  "standard cast aluminium wheels": { x: 0.77, y: 0.7, zoom: 2.9 }, // front wheel
  "red stripe cast wheels": { x: 0.77, y: 0.7, zoom: 2.9 },
  "forged aluminium wheels": { x: 0.77, y: 0.7, zoom: 2.9 },
  "carbon fiber wheels": { x: 0.77, y: 0.7, zoom: 2.9 },
  "frame black": { x: 0.45, y: 0.45, zoom: 3.2 },
};

export interface LayerBox { x: number; y: number; w: number; h: number } // canvas px

/** Crop for a row: override, else centred on the part's box, else null (no thumbnail). */
export function cropFor(catalogKey: string, box: LayerBox | null, canvas: { width: number; height: number }): Crop | null {
  const override = CROP_OVERRIDES[catalogKey];
  if (override) return override;
  if (!box || box.w <= 0 || box.h <= 0) return null;
  const side = Math.max(box.w, box.h) * 1.2;
  return {
    x: (box.x + box.w / 2) / canvas.width,
    y: (box.y + box.h / 2) / canvas.height,
    zoom: Math.min(6, Math.max(1.8, canvas.height / side)),
  };
}
