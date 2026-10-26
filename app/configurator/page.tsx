import type { Metadata } from "next";
import ConfiguratorShell from "@/components/configurator/ConfiguratorShell";
import { isConfiguratorModel } from "@/lib/configurator-models";

export const metadata: Metadata = {
  title: "Configurator | Energica Motor Company",
  description:
    "Build and personalise your Energica motorcycle. Choose your model, colour, and options.",
};

export default async function ConfiguratorPage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string | string[] }>;
}) {
  // ?model=<id> (from a model page's "Configure" button or a shared link)
  // opens the configurator on that model; anything else uses the default.
  const { model } = await searchParams;
  const requested = Array.isArray(model) ? model[0] : model;
  const initialModel = isConfiguratorModel(requested) ? requested : undefined;

  return <ConfiguratorShell initialModel={initialModel} />;
}
