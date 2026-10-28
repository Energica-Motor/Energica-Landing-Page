import { describe, expect, it, vi } from "vitest";
import type { ConfigSchema } from "@/lib/configurator-api";
import { decodeConfig, encodeConfig } from "@/lib/configurator-api";
import * as rules from "@/components/configurator/rules";
import { STEP_MAP, type Model } from "@/components/configurator/config";
import eva from "./fixtures/eva_ribelle.json";
import ss9 from "./fixtures/essesse9.json";
import ego from "./fixtures/ego.json";
import experia from "./fixtures/experia.json";

// Live /config/{model} responses saved from the backend
const CONFIGS = { eva_ribelle: eva, essesse9: ss9, ego, experia } as unknown as Record<Model, ConfigSchema>;
const EVA = CONFIGS.eva_ribelle;

/** Clicks an option the way the panel does (its section decides single/multi choice). */
function click(cfg: ConfigSchema, set: Set<string>, id: string) {
  const section = rules.sectionsFor(cfg, set).find((s) => s.options.some((o) => o.layer.id === id));
  if (!section) throw new Error(`${id} is not on screen`);
  return rules.toggleLayer(cfg, set, id, section.exclusive, section.peers);
}
const option = (cfg: ConfigSchema, set: Set<string>, id: string) =>
  rules.sectionsFor(cfg, set).flatMap((s) => s.options).find((o) => o.layer.id === id);
const sectionKeys = (cfg: ConfigSchema, set: Set<string>) => rules.sectionsFor(cfg, set).map((s) => s.key);

describe("rules engine", () => {
  it("makes a mutually exclusive set a single choice", () => {
    let s = rules.initialLayers(EVA);
    expect(s.has("eg_64_standard_cast_aluminium_wheels")).toBe(true);
    s = click(EVA, s, "eg_66_forged_aluminium_wheels");
    expect(s.has("eg_66_forged_aluminium_wheels")).toBe(true);
    expect(s.has("eg_64_standard_cast_aluminium_wheels")).toBe(false);
    // A required choice stays chosen when clicked again
    s = click(EVA, s, "eg_66_forged_aluminium_wheels");
    expect(s.has("eg_66_forged_aluminium_wheels")).toBe(true);
  });

  it("lets an optional single choice be cleared by clicking it again", () => {
    let s = rules.initialLayers(EVA);
    const ergal = rules.sectionsFor(EVA, s).find((x) => x.key === "ergal_screws")!;
    expect(ergal.hint).toBe("OPTIONAL");
    s = click(EVA, s, "er_78_kit_ergal_screws_gold");
    s = click(EVA, s, "er_79_kit_ergal_screws_black");
    expect([s.has("er_78_kit_ergal_screws_gold"), s.has("er_79_kit_ergal_screws_black")]).toEqual([false, true]);
    s = click(EVA, s, "er_79_kit_ergal_screws_black");
    expect(s.has("er_79_kit_ergal_screws_black")).toBe(false);
  });

  it("hides an option until its dependency is chosen, as before the redesign", () => {
    let s = rules.initialLayers(EVA);
    expect(option(EVA, s, "er_41_stickers_kit_rs_sport")).toBeUndefined();
    s = click(EVA, s, "er_40_rs_version");
    expect(option(EVA, s, "er_41_stickers_kit_rs_sport")).toMatchObject({ selected: false });
  });

  it("shows only the EsseEsse9 bellypans that fit the chosen colour", () => {
    const cfg = CONFIGS.essesse9;
    const bellypans = (set: Set<string>) => rules.sectionsFor(cfg, set).find((x) => x.key === "bellypan")?.options.map((o) => o.layer.id);
    let s = rules.initialLayers(cfg);
    expect(bellypans(s)).toEqual(["es_22_bellypan_bormio_grey_stripes", "es_25_bellypan_bormio_yellow_stripes"]);
    s = click(cfg, s, "es_13_esseesse9_sunrise_red");
    expect(bellypans(s)).toEqual(["es_23_bellypan_sunrise_red_grey_stripes", "es_26_bellypan_sunrise_red_yellow_stripes"]);
  });

  it("clears dependents when their dependency is removed", () => {
    let s = rules.initialLayers(EVA);
    s = click(EVA, s, "er_40_rs_version");
    s = click(EVA, s, "er_41_stickers_kit_rs_sport");
    s = click(EVA, s, "er_91_side_bags_kit");
    s = click(EVA, s, "er_92_bags_plates_red");
    s = click(EVA, s, "er_40_rs_version");
    s = click(EVA, s, "er_91_side_bags_kit");
    for (const id of ["er_40_rs_version", "er_41_stickers_kit_rs_sport", "er_91_side_bags_kit", "er_92_bags_plates_red"]) {
      expect(s.has(id)).toBe(false);
    }
  });

  it("hides a group whose options all depend on one layer until it is chosen", () => {
    let s = rules.initialLayers(EVA);
    expect(sectionKeys(EVA, s)).not.toContain("bags_plates");
    s = click(EVA, s, "er_91_side_bags_kit");
    const plates = rules.sectionsFor(EVA, s).find((x) => x.key === "bags_plates")!;
    expect(plates.options.map((o) => o.title)).toEqual(["Red", "Gun Metal"]);
  });

  it.each([
    ["eva_ribelle", "er_91_side_bags_kit", "er_93_bags_plates_gun_metal", "er_92_bags_plates_red"],
    ["essesse9", "es_96_side_bags_kit", "es_97_bags_plates_gun_metal", "er_98_bags_plates_blue"],
  ] as const)("keeps %s bag plates optional, as the backend defines them", (m, bags, gunMetal, other) => {
    const cfg = CONFIGS[m];
    let s = click(cfg, rules.initialLayers(cfg), bags);
    // No plate is picked for you, and the choice can be cleared
    expect([s.has(gunMetal), s.has(other)]).toEqual([false, false]);
    expect(rules.sectionsFor(cfg, s).find((x) => x.key === "bags_plates")?.hint).toBe("OPTIONAL");
    s = click(cfg, s, gunMetal);
    s = click(cfg, s, other);
    expect([s.has(gunMetal), s.has(other)]).toEqual([false, true]);
    // Removing the bags removes the plate
    const noBags = click(cfg, s, bags);
    expect(rules.selectedOptions(cfg, noBags).some((o) => o.groupKey === "bags_plates")).toBe(false);
    // Unchanged from before the redesign: clearing the plate also clears what
    // it pulled in, so the side bag kit goes with it
    s = click(cfg, s, other);
    expect([s.has(other), s.has(bags)]).toEqual([false, false]);
  });

  it("hides options that clash with the selection", () => {
    const cfg = CONFIGS.essesse9;
    let s = rules.initialLayers(cfg);
    expect(sectionKeys(cfg, s)).toContain("cnc_options");
    s = click(cfg, s, "es_13_esseesse9_sunrise_red");
    expect(sectionKeys(cfg, s)).not.toContain("cnc_options");
  });

  it("keeps the always-visible base and shows it as the colour choice", () => {
    let s = rules.initialLayers(EVA);
    expect(option(EVA, s, "er_01_base_ribelle_stealth_grey")).toMatchObject({ selected: true, title: "Stealth Grey" });
    s = click(EVA, s, "er_12_eva_rosso_corsa");
    expect(s.has("er_01_base_ribelle_stealth_grey")).toBe(true);
    expect(option(EVA, s, "er_01_base_ribelle_stealth_grey")?.selected).toBe(false);
    s = click(EVA, s, "er_01_base_ribelle_stealth_grey");
    expect(s.has("er_12_eva_rosso_corsa")).toBe(false);
    expect(option(EVA, s, "er_01_base_ribelle_stealth_grey")?.selected).toBe(true);
  });

  it("adds and removes Ego's seat cover without losing the seat", () => {
    // The compositor hides the seat under a cover (suppressed_by), so the seat stays chosen
    const cfg = CONFIGS.ego;
    let s = rules.initialLayers(cfg);
    s = click(cfg, s, "eg_67_cover_corsaclienti_black");
    s = click(cfg, s, "eg_66_cover_corsaclienti_white");
    expect([s.has("eg_67_cover_corsaclienti_black"), s.has("eg_66_cover_corsaclienti_white")]).toEqual([false, true]);
    expect(s.has("eg_62_passenger_seat_standard")).toBe(true);
    s = click(cfg, s, "eg_66_cover_corsaclienti_white");
    expect(s.has("eg_66_cover_corsaclienti_white")).toBe(false);
    expect(s.has("eg_62_passenger_seat_standard")).toBe(true);
  });

  it("restores a shared build exactly (layer encoding round-trips)", () => {
    let s = rules.initialLayers(EVA);
    for (const id of ["er_13_eva_tricolore", "er_40_rs_version", "er_91_side_bags_kit", "er_93_bags_plates_gun_metal", "eg_67_carbon_fiber_wheels"]) {
      s = click(EVA, s, id);
    }
    const restored = rules.initialLayers(EVA, decodeConfig(encodeConfig([...s])));
    expect([...restored].sort()).toEqual([...s].sort());
  });

  it("ignores a restored build from another model", () => {
    const s = rules.initialLayers(EVA, ["eg_13_tricolore"]);
    expect([...s].sort()).toEqual([...rules.defaultLayers(EVA)].sort());
  });
});

describe("step mapping", () => {
  it("groups Eva Ribelle as briefed", () => {
    const steps = rules.buildSteps("eva_ribelle", Object.keys(EVA.groups));
    expect(steps.map((s) => [s.label, s.groups])).toEqual([
      ["Colour", ["base_color"]],
      ["Performance", ["suspension", "rs_options"]],
      ["Wheels", ["wheels"]],
      ["Carbon", ["carbon_parts", "ergal_screws"]],
      ["Upgrades", ["optional_upgrades", "bags_plates"]],
    ]);
  });

  it.each(Object.keys(CONFIGS) as Model[])("maps every backend group of %s to a step", (m) => {
    const warn = vi.fn();
    const steps = rules.buildSteps(m, Object.keys(CONFIGS[m].groups), warn);
    expect(warn).not.toHaveBeenCalled();
    expect(steps.map((s) => s.label)).not.toContain("More");
    expect(steps.every((s) => s.groups.length > 0)).toBe(true);
  });

  it("puts unmapped groups in a final More step and warns", () => {
    const warn = vi.fn();
    const steps = rules.buildSteps("experia", ["base_color", "wheels", "heated_grips"], warn);
    expect(steps.map((s) => s.label)).toEqual(["Colour", "Wheels", "More"]);
    expect(steps.at(-1)?.groups).toEqual(["heated_grips"]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("heated_grips"));
  });

  it("skips steps with no groups for the model", () => {
    expect(STEP_MAP.experia.map((s) => s.label)).not.toContain("Performance");
  });
});

describe("summary", () => {
  it("lists the selections in step order with a count", () => {
    let s = rules.initialLayers(EVA);
    const steps = rules.buildSteps("eva_ribelle", Object.keys(EVA.groups));
    expect(rules.summarise(rules.selectedOptions(EVA, s), steps)).toEqual({
      count: 3,
      countLabel: "3 SELECTIONS",
      text: "Stealth Grey · Standard suspension · Cast aluminium wheels",
    });
    s = click(EVA, s, "er_91_side_bags_kit");
    s = click(EVA, s, "er_93_bags_plates_gun_metal");
    s = click(EVA, s, "er_35_front_mudguard_carbon");
    const summary = rules.summarise(rules.selectedOptions(EVA, s), steps);
    expect(summary.countLabel).toBe("6 SELECTIONS");
    expect(summary.text).toBe(
      "Stealth Grey · Standard suspension · Cast aluminium wheels · Carbon front mudguard · Side bag kit · Gun Metal bag plates",
    );
    expect(rules.stepCounts(rules.selectedOptions(EVA, s), steps)).toEqual([1, 1, 1, 1, 2]);
  });

  it("uses the singular for one selection", () => {
    expect(rules.summarise([{ id: "x", name: "ER-80-WINDSCREEN KIT", groupKey: "optional_upgrades" }], []).countLabel).toBe("1 SELECTION");
  });
});
