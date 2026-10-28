import type { Metadata } from "next";
import ConfiguratorShell from "@/components/configurator/ConfiguratorShell";
import { isConfiguratorModel } from "@/lib/configurator-models";
import { loadBuild } from "@/lib/build-store";

export const metadata: Metadata = {
  title: "Configurator | Energica Motor Company",
  description:
    "Build and personalise your Energica motorcycle. Choose your model, colour, and options.",
};

export default async function ConfiguratorPage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string | string[]; build?: string | string[] }>;
}) {
  // ?build=<code> restores a saved build (short links); ?model=<id> (from a
  // model page's "Configure" button) opens that model; otherwise the default.
  const params = await searchParams;
  const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

  const build = first(params.build) ? await loadBuild(first(params.build)!) : null;
  if (build && isConfiguratorModel(build.model)) {
    return <ConfiguratorShell initialModel={build.model} initialLayers={build.layers} />;
  }

  const requested = first(params.model);
  const initialModel = isConfiguratorModel(requested) ? requested : undefined;
  return <ConfiguratorShell initialModel={initialModel} />;
}
