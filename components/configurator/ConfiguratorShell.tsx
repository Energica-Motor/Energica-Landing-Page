"use client";

import { useState } from "react";
import Image from "next/image";
import EnergiccaConfigurator from "./EnergiccaConfigurator";
import type { ConfiguratorModel } from "@/lib/configurator-models";

type Model = ConfiguratorModel;

const MODELS: { id: Model; label: string; image: string }[] = [
  {
    id: "eva_ribelle",
    label: "Eva Ribelle",
    image: "/images/Pagina%20Eva/EVA%20Ribelle%20RS_Stealth%20Grey.webp",
  },
  {
    id: "essesse9",
    label: "EsseEsse9",
    image: "/images/Pagina%20SS9/EsseEsse9%20RS_Sunrise%20Red.webp",
  },
  {
    id: "ego",
    label: "Ego",
    image: "/images/ego-showcase.png",
  },
  {
    id: "experia",
    label: "Experia",
    image: "/images/Pagina%20Experia/EXPERIA_Bormio%20Ice.webp",
  },
];

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
    <div
      className="cfg-shell"
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        color: "#121212",
        fontFamily: "'Barlow Condensed', sans-serif",
        paddingTop: "80px",
      }}
    >
      {/* Phones: the 160px sidebar becomes a compact strip across the top so
          the selected bike's preview and options get the full width. */}
      <style>{`
        /* The configurator always uses the native pointer. This style tag
           only exists while the configurator is mounted, so it overrides any
           leftover custom-cursor rule (cursor:none) regardless of load order
           or navigation timing. */
        body { cursor: auto !important; }
        body .cursor-none { cursor: pointer !important; }

        @media (max-width: 768px) {
          .cfg-shell { flex-direction: column !important; }
          .cfg-nav {
            width: 100% !important; height: auto !important; position: static !important;
            flex-direction: row !important; overflow-x: auto !important; overflow-y: hidden !important;
            border-right: none !important; border-bottom: 1px solid #e0e0e0; padding: 0 !important;
          }
          .cfg-nav-item {
            flex: 1 0 88px !important; width: auto !important; padding: 8px 8px 6px !important;
            border-left: none !important; align-items: center !important;
          }
          .cfg-nav-item[aria-selected="true"] { box-shadow: inset 0 -3px 0 #78BE20; }
          .cfg-nav-thumb { margin-bottom: 4px !important; }
        }
      `}</style>

      {/* Model selector sidebar */}
      <nav
        aria-label="Model selector"
        className="cfg-nav"
        style={{
          width: "160px",
          flexShrink: 0,
          backgroundColor: "#f5f5f5",
          borderRight: "1px solid #e0e0e0",
          position: "sticky",
          top: "80px",
          height: "calc(100vh - 80px)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          padding: "8px 0",
        }}
      >
        {MODELS.map(({ id, label, image }) => {
          const active = id === activeModel;
          return (
            <button
              key={id}
              type="button"
              onClick={() => switchModel(id)}
              aria-selected={active}
              role="tab"
              className="cfg-nav-item"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "100%",
                padding: "12px 12px 12px 16px",
                cursor: "pointer",
                border: "none",
                borderLeft: active ? "3px solid #78BE20" : "3px solid transparent",
                backgroundColor: active ? "rgba(120,190,32,0.07)" : "transparent",
                transition: "background-color 150ms ease, border-color 150ms ease",
                textAlign: "left",
              }}
            >
              {/* Thumbnail */}
              <div
                className="cfg-nav-thumb"
                style={{
                  width: "100%",
                  aspectRatio: "3/2",
                  position: "relative",
                  marginBottom: "8px",
                  overflow: "hidden",
                  borderRadius: "2px",
                  opacity: active ? 1 : 0.45,
                  transition: "opacity 150ms ease",
                  backgroundColor: "#e8e8e8",
                }}
              >
                <Image
                  src={image}
                  alt={label}
                  fill
                  style={{ objectFit: "cover", objectPosition: "center 40%" }}
                  sizes="160px"
                />
              </div>
              {/* Name */}
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: active ? "#121212" : "#999999",
                  transition: "color 150ms ease",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Configurator content */}
      <div style={{ flex: 1, minWidth: 0, backgroundColor: "#ffffff" }}>
        <EnergiccaConfigurator
          key={activeModel}
          model={activeModel}
          apiUrl={API_URL}
          initialLayers={activeModel === initialModel ? initialLayers : undefined}
        />
      </div>
    </div>
  );
}
