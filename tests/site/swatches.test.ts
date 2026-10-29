import { describe, expect, it } from "vitest";
import { models } from "@/data/models";
import { SWATCHES } from "@/components/configurator/config";

// Model-page colour → the configurator layer with the same colour
const LAYER: Record<string, Record<string, string>> = {
  experia: { "Bormio ICE": "ex_12_experia_bormio_ice", "White Flame": "ex_13_experia_white_flame", "Metal Black": "ex_01_base_experia_metal_black" },
  esseesse9: { "Bormio ICE": "es_01_base_esseesse9_bormio_ice", "Sunrise Red": "es_13_esseesse9_sunrise_red", "Riviera Green": "es_14_esseesse9_riviera_green" },
  "eva-ribelle": { "Stealth Grey": "er_01_base_ribelle_stealth_grey", "Rosso Corsa": "er_12_eva_rosso_corsa", Tricolore: "er_13_eva_tricolore" },
  ego: { "Metal Black": "eg_01_base_ego_metal_black", "Rosso Corsa": "eg_12_ego_rosso_corsa", Tricolore: "eg_13_tricolore" },
};

describe("model page swatches", () => {
  it.each(models.map((m) => [m.id, m] as const))("%s uses the configurator's colours", (_, model) => {
    for (const c of model.colors) {
      const swatch = SWATCHES[LAYER[model.id][c.name]];
      expect(swatch, c.name).toBeDefined();
      expect(c.stripes ?? [c.hex], c.name).toEqual(swatch);
    }
  });
});
