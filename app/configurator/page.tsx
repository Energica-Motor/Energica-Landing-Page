import type { Metadata } from "next";
import ConfiguratorShell from "@/components/configurator/ConfiguratorShell";

export const metadata: Metadata = {
  title: "Configurator | Energica Motor Company",
  description:
    "Build and personalise your Energica motorcycle. Choose your model, colour, and options.",
};

export default function ConfiguratorPage() {
  return <ConfiguratorShell />;
}
