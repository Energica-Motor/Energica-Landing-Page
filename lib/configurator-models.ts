// Models available in the configurator (backend ids use underscores).
export const CONFIGURATOR_MODELS = ["eva_ribelle", "essesse9", "ego", "experia"] as const;

export type ConfiguratorModel = (typeof CONFIGURATOR_MODELS)[number];

export function isConfiguratorModel(value: unknown): value is ConfiguratorModel {
  return typeof value === "string" && (CONFIGURATOR_MODELS as readonly string[]).includes(value);
}

// Site ids whose configurator id differs beyond "-" → "_".
const SITE_TO_CONFIGURATOR: Record<string, ConfiguratorModel> = {
  esseesse9: "essesse9",
};

/** Maps a site model id (e.g. "eva-ribelle") to its configurator id, if it has one. */
export function configuratorModelFor(siteModelId: string): ConfiguratorModel | undefined {
  const id = SITE_TO_CONFIGURATOR[siteModelId] ?? siteModelId.replace(/-/g, "_");
  return isConfiguratorModel(id) ? id : undefined;
}
