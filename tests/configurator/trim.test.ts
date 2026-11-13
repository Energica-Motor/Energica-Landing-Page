import { describe, expect, it } from "vitest";
import { SKY_COLS, fitBike, paddedRegion, unionBox, type BikeBox } from "@/components/configurator/trim";

// A bike in the middle of a 4938×3292 preview: 60% wide, 50% tall, its
// outline flat at the top of its box (worst case for the title)
const ASPECT = 4938 / 3292;
const bike = (over: Partial<BikeBox> = {}): BikeBox => {
  const b = { x0: 0.2, y0: 0.25, x1: 0.8, y1: 0.75, aspect: ASPECT, ...over };
  const sky = Array.from({ length: SKY_COLS }, (_, c) => ((c + 0.5) / SKY_COLS >= b.x0 && (c + 0.5) / SKY_COLS <= b.x1 ? b.y0 : 1));
  return { sky, ...b, ...over };
};

describe("bike region", () => {
  it("pads the bike by 3% of its size and keeps the floor offset", () => {
    const r = paddedRegion(bike());
    expect(r.x0).toBeCloseTo(0.2 - 0.6 * 0.03);
    expect(r.y1).toBeCloseTo(0.75 + 0.5 * 0.03);
    expect(r.ratio).toBeCloseTo(((r.x1 - r.x0) * ASPECT) / (r.y1 - r.y0));
    expect(r.floor).toBeCloseTo(0.03 / 1.06, 3);
  });

  it("never pads outside the image", () => {
    const r = paddedRegion(bike({ x0: 0, y0: 0, x1: 1, y1: 1 }));
    expect([r.x0, r.y0, r.x1, r.y1]).toEqual([0, 0, 1, 1]);
  });

  it("only grows when boxes are combined", () => {
    const u = unionBox(bike(), bike({ x0: 0.1, y1: 0.8 }))!;
    expect([u.x0, u.y0, u.x1, u.y1]).toEqual([0.1, 0.25, 0.8, 0.8]);
    expect(unionBox(null, bike())).toEqual(bike());
  });
});

describe("fitting the bike", () => {
  const area = { width: 1400, height: 560 };

  it("fills the height (or width) when nothing is in the way", () => {
    const f = fitBike(bike(), area, null);
    const r = paddedRegion(bike());
    expect(f.width).toBeCloseTo(Math.min(area.width, (area.height - 12) * r.ratio));
    expect(f.top + f.height).toBeCloseTo(area.height - 12);
    expect(f.left + f.width).toBeLessThanOrEqual(area.width + 0.01);
  });

  it("shrinks the bike, not the title, so its outline clears the title", () => {
    const title = { left: 0, top: 24, right: 420, bottom: 150 };
    const free = fitBike(bike(), area, null);
    const f = fitBike(bike(), area, title);
    expect(f.width).toBeLessThan(free.width);
    // The outline (flat top) sits below the title wherever they share columns
    const r = f.region;
    const outlineTop = f.top + ((0.25 - r.y0) / (r.y1 - r.y0)) * f.height;
    const bikeLeft = f.left + ((0.2 - r.x0) / (r.x1 - r.x0)) * f.width;
    expect(outlineTop >= title.bottom + 16 || bikeLeft >= title.right + 16 - (f.width / SKY_COLS) * 2).toBe(true);
  });

  it("can stay large when the corner under the title is empty", () => {
    // Outline low on the left (a tail), high only on the right (mirrors)
    const b = bike();
    b.sky = b.sky.map((v, c) => (v < 1 && c < SKY_COLS / 2 ? 0.55 : v));
    const title = { left: 0, top: 24, right: 300, bottom: 150 };
    expect(fitBike(b, area, title).width).toBeGreaterThan(fitBike(bike(), area, title).width);
  });
});
