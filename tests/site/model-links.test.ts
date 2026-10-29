import { describe, expect, it } from "vitest";
import { models } from "@/data/models";
import { configureHref, leadSentence, metaDescription, peakPower } from "@/lib/model-links";

describe("lineup card helpers", () => {
  it("reads peak power for every model from specs.ts", () => {
    expect(models.map((m) => [m.id, peakPower(m.id)?.value, peakPower(m.id)?.unit])).toEqual([
      ["experia", "102", "HP"],
      ["esseesse9", "107", "HP"],
      ["eva-ribelle", "147", "HP"],
      ["ego", "169", "HP"],
    ]);
  });

  it("links each model to the configurator with it selected", () => {
    expect(models.map((m) => configureHref(m.id))).toEqual([
      "/configurator?model=experia",
      "/configurator?model=essesse9",
      "/configurator?model=eva_ribelle",
      "/configurator?model=ego",
    ]);
  });

  it("builds search descriptions from each page's own stats and labels", () => {
    expect(metaDescription("ego", "Track tested. Street legal.")).toBe(
      "Track tested. Street legal. 169 HP peak power, 2.6 sec 0–60 mph (RS), 261 miles city range, 150 mph top speed.",
    );
    expect(metaDescription("esseesse9", "The naked electric champion.")).toBe(
      "The naked electric champion. 107 HP peak power, 2.8 sec 0–60 mph (RS), 420 km city range, 201 km/h top speed.",
    );
    expect(metaDescription("experia", "Lead.", "Tail.")).toBe(
      "Lead. 102 HP peak power, 3.5 sec 0–100 km/h, 420 km city range, 180 km/h top speed. Tail.",
    );
  });

  it("uses a full first sentence, preferring one without figures", () => {
    expect(models.map((m) => leadSentence(m.description))).toEqual([
      "Built on a decade of MotoE engineering.",
      "Stripped of everything unnecessary.",
      "Italian design, Modena engineering, EMCE motor platform.",
      "Four MotoE seasons produced this motor.",
    ]);
    expect(leadSentence("147 HP. Quick.")).toBe("Quick.");
  });
});
