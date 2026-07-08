"use client";

import { useState } from "react";
import Image from "next/image";
import EnergiccaConfigurator from "./EnergiccaConfigurator";

type Model = "eva_ribelle" | "essesse9" | "ego" | "experia";

const MODELS: {
  id: Model;
  label: string;
  tagline: string;
  image: string;
}[] = [
  {
    id: "eva_ribelle",
    label: "Eva Ribelle",
    tagline: "Italian design. Electric advantage.",
    image: "/images/eva-showcase.jpg",
  },
  {
    id: "essesse9",
    label: "EsseEsse9",
    tagline: "Naked. No apologies.",
    image: "/images/Immagini/ss9-1.png",
  },
  {
    id: "ego",
    label: "Ego",
    tagline: "Derived from racing. Proven on track.",
    image: "/images/ego-showcase.png",
  },
  {
    id: "experia",
    label: "Experia",
    tagline: "Further, quieter, faster.",
    image: "/images/experia-showcase.png",
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
        backgroundColor: "#0a0a0a",
        color: "#121212",
        fontFamily: "'Barlow Condensed', sans-serif",
        paddingTop: "80px",
      }}
    >
      {/* Model selector sidebar */}
      <nav
        aria-label="Model selector"
        style={{
          width: "200px",
          flexShrink: 0,
          backgroundColor: "#0a0a0a",
          borderRight: "1px solid #1f1f1f",
          position: "sticky",
          top: "80px",
          height: "calc(100vh - 80px)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          padding: "8px 0",
        }}
      >
        {MODELS.map(({ id, label, tagline, image }) => {
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
                padding: "16px 16px 16px 20px",
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
                  aspectRatio: "16/9",
                  position: "relative",
                  marginBottom: "10px",
                  overflow: "hidden",
                  borderRadius: "3px",
                  opacity: active ? 1 : 0.55,
                  transition: "opacity 150ms ease",
                  backgroundColor: "#1a1a1a",
                }}
              >
                <Image
                  src={image}
                  alt={label}
                  fill
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  sizes="180px"
                />
              </div>
              {/* Name */}
              <span
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: "13px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: active ? "#ffffff" : "#888888",
                  lineHeight: 1.2,
                  transition: "color 150ms ease",
                }}
              >
                {label}
              </span>
              {/* Tagline */}
              <span
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "10px",
                  color: active ? "#78BE20" : "#555555",
                  marginTop: "3px",
                  lineHeight: 1.4,
                  transition: "color 150ms ease",
                }}
              >
                {tagline}
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
