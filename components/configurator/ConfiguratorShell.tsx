"use client";

import { useState } from "react";
import EnergiccaConfigurator from "./EnergiccaConfigurator";

type Model = "eva_ribelle" | "essesse9" | "ego" | "experia";

const MODELS: { id: Model; label: string }[] = [
  { id: "eva_ribelle", label: "EVA RIBELLE" },
  { id: "essesse9",   label: "ESSESSE9" },
  { id: "ego",        label: "EGO" },
  { id: "experia",    label: "EXPERIA" },
];

const API_URL =
  process.env.NEXT_PUBLIC_CONFIGURATOR_API_URL ?? "http://localhost:8000";

export default function ConfiguratorShell() {
  const [activeModel, setActiveModel] = useState<Model>("eva_ribelle");

  const switchModel = (m: Model) => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
    setActiveModel(m);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        color: "#121212",
        fontFamily: "var(--font-barlow, 'Barlow Condensed', sans-serif)",
      }}
    >
      {/* Model selector tabs */}
      <nav
        style={{
          display: "flex",
          borderBottom: "1px solid #e5e5e5",
          backgroundColor: "#fff",
          padding: "0 40px",
        }}
        aria-label="Model selector"
      >
        {MODELS.map(({ id, label }) => {
          const active = id === activeModel;
          return (
            <button
              key={id}
              type="button"
              onClick={() => switchModel(id)}
              aria-selected={active}
              role="tab"
              style={{
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "16px 20px",
                cursor: "pointer",
                border: "none",
                borderBottom: active
                  ? "2px solid #78BE20"
                  : "2px solid transparent",
                backgroundColor: "transparent",
                color: active ? "#121212" : "#757575",
                transition: "color 150ms ease, border-color 150ms ease",
                marginBottom: "-1px",
              }}
            >
              {label}
            </button>
          );
        })}
      </nav>

      <EnergiccaConfigurator
        key={activeModel}
        model={activeModel}
        apiUrl={API_URL}
      />
    </div>
  );
}
