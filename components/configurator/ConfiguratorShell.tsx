"use client";

import { useState } from "react";
import EnergiccaConfigurator from "./EnergiccaConfigurator";
import type { ConfiguratorModel } from "@/lib/configurator-models";
import { COLOR } from "./theme";

type Model = ConfiguratorModel;

const API_URL =
  process.env.NEXT_PUBLIC_CONFIGURATOR_API_URL ?? "/api/backend";

export default function ConfiguratorShell({ initialModel, initialLayers }: { initialModel?: Model; initialLayers?: string[] }) {
  const [activeModel, setActiveModel] = useState<Model>(initialModel ?? "eva_ribelle");

  const switchModel = (m: Model) => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${window.location.pathname}?model=${m}`);
    }
    setActiveModel(m);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLOR.paper, paddingTop: "80px" }}>
      {/* The configurator always uses the native pointer. This style tag only
          exists while the configurator is mounted, so it overrides any leftover
          custom-cursor rule (cursor:none) regardless of load order or
          navigation timing. */}
      <style>{`
        body { cursor: auto !important; }
        body .cursor-none { cursor: pointer !important; }
      `}</style>

      <EnergiccaConfigurator
        key={activeModel}
        model={activeModel}
        apiUrl={API_URL}
        initialLayers={activeModel === initialModel ? initialLayers : undefined}
        onModelChange={switchModel}
      />
    </div>
  );
}
