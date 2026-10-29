"use client";

import { useState } from "react";
import EnergiccaConfigurator from "./EnergiccaConfigurator";
import type { ConfiguratorModel } from "@/lib/configurator-models";
import { COLOR } from "./theme";

type Model = ConfiguratorModel;

const API_URL =
  process.env.NEXT_PUBLIC_CONFIGURATOR_API_URL ?? "/api/backend";

export default function ConfiguratorShell({ initialModel, initialLayers, buildNotFound }: { initialModel?: Model; initialLayers?: string[]; buildNotFound?: boolean }) {
  const [activeModel, setActiveModel] = useState<Model>(initialModel ?? "eva_ribelle");

  const switchModel = (m: Model) => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${window.location.pathname}?model=${m}`);
    }
    setActiveModel(m);
  };

  return (
    <div className="cfg-shell" style={{ minHeight: "100vh", backgroundColor: COLOR.paper, paddingTop: "var(--cfg-header)" }}>
      {/* The configurator always uses the native pointer. This style tag only
          exists while the configurator is mounted, so it overrides any leftover
          custom-cursor rule (cursor:none) regardless of load order or
          navigation timing. --cfg-header matches the fixed site header
          (h-20, md:h-24). */}
      <style>{`
        body { cursor: auto !important; }
        body .cursor-none { cursor: pointer !important; }
        .cfg-shell { --cfg-header: 80px; }
        @media (min-width: 768px) { .cfg-shell { --cfg-header: 96px; } }
      `}</style>

      <EnergiccaConfigurator
        key={activeModel}
        model={activeModel}
        apiUrl={API_URL}
        initialLayers={activeModel === initialModel ? initialLayers : undefined}
        buildNotFound={buildNotFound && activeModel === (initialModel ?? "eva_ribelle")}
        onModelChange={switchModel}
      />
    </div>
  );
}
