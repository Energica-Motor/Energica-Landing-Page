// Per-model figures and links shared by the lineup cards. Figures come from
// the locked build-sheet specs (lib/build-sheet/specs.ts), exactly as stated.
import { MODEL_SPECS, type Stat } from "@/lib/build-sheet/specs";
import { configuratorModelFor } from "@/lib/configurator-models";

/** The model's peak power stat (value, unit, label) from specs.ts. */
export function peakPower(siteModelId: string): Stat | undefined {
  const id = configuratorModelFor(siteModelId);
  return id ? MODEL_SPECS[id].stats.find((s) => s.label === "PEAK POWER") : undefined;
}

/** The configurator with this model selected. */
export function configureHref(siteModelId: string): string {
  const id = configuratorModelFor(siteModelId);
  return id ? `/configurator?model=${id}` : "/configurator";
}

/**
 * Search description for a model page: a short lead, then the page's four
 * headline stats from specs.ts with their own labels ("169 HP peak power").
 */
export function metaDescription(siteModelId: string, lead: string, tail = ""): string {
  const id = configuratorModelFor(siteModelId);
  const stats = id ? MODEL_SPECS[id].stats : [];
  const label = (l: string) => l.toLowerCase().replace("(rs)", "(RS)");
  const figures = stats.map((s) => `${s.value} ${s.unit} ${label(s.label)}`).join(", ");
  return [lead, figures ? `${figures}.` : "", tail].filter(Boolean).join(" ");
}

/** First full sentence of a description, preferring one without figures. */
export function leadSentence(description: string): string {
  const sentences = description.match(/[^.!?]+[.!?]+(\s|$)/g)?.map((s) => s.trim()) ?? [description];
  return sentences.find((s) => !/\d/.test(s)) ?? sentences[0];
}
