"use client";

import { useState } from "react";
import Image from "next/image";
import EnergiccaConfigurator from "./EnergiccaConfigurator";

type Model = "eva_ribelle" | "essesse9" | "ego" | "experia";

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
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        color: "#121212",
        fontFamily: "'Barlow Condensed', sans-serif",
        paddingTop: "80px",
      }}
    >
      {/* Model selector sidebar */}
      <nav
        aria-label="Model selector"
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
        />
      </div>
    </div>
  );
}
