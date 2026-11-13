"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as MLMap, Popup as MLPopup, GeoJSONSource, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Partner } from "@/data/partners";
import { TYPE_LABELS } from "@/data/partners";
import { boundsOf, directionsUrl, groupByRegion, hasLocation } from "@/lib/partners";
import { cn } from "@/lib/utils";
import { pinKind, pinSvg, type PinKind } from "./pins";

const KEY = process.env.NEXT_PUBLIC_MAP_KEY;
// Optional full style URL override (e.g. another provider); otherwise MapTiler dark.
const STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL || (KEY ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${KEY}` : "");

export interface MapFocus {
  id: string;
  /** Changes on every request so the same partner can be focused twice. */
  nonce: number;
  fly: boolean;
}

interface Props {
  partners: Partner[];
  activeId: string | null;
  hoverId: string | null;
  focus: MapFocus | null;
  onSelect: (id: string) => void;
  /** Hide the popup (mobile uses a bottom sheet instead). */
  popups?: boolean;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function popupHtml(p: Partner) {
  const dir = directionsUrl(p);
  return `<div class="pp">
    <p class="pp-type">${esc(p.types.map((t) => TYPE_LABELS[t].badge).join(" · "))} · ${esc(p.country)}</p>
    <p class="pp-name">${esc(p.name)}</p>
    ${p.address ? `<p class="pp-addr">${esc(p.address)}</p>` : ""}
    ${dir ? `<a class="pp-link" href="${esc(dir)}" target="_blank" rel="noopener noreferrer">Directions ↗</a>` : ""}
  </div>`;
}

export default function PartnerMap(props: Props) {
  return STYLE_URL ? <LiveMap {...props} /> : <StaticMap {...props} />;
}

/* ── Interactive map (MapLibre) ─────────────────────────────── */
function LiveMap({ partners, activeId, hoverId, focus, onSelect, popups = true }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  const popup = useRef<MLPopup | null>(null);
  const lib = useRef<typeof import("maplibre-gl") | null>(null);
  const [ready, setReady] = useState(false);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const byId = useMemo(() => new Map(partners.map((p) => [p.id, p])), [partners]);
  const byIdRef = useRef(byId);
  byIdRef.current = byId;

  // Create once.
  useEffect(() => {
    let cancelled = false;
    let m: MLMap | null = null;
    (async () => {
      const ml = await import("maplibre-gl");
      if (cancelled || !el.current) return;
      lib.current = ml;
      m = new ml.Map({
        container: el.current,
        style: STYLE_URL,
        center: [10, 47],
        zoom: 3.4,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
        cooperativeGestures: false,
      });
      m.touchZoomRotate.disableRotation();
      m.addControl(new ml.NavigationControl({ showCompass: false }), "bottom-right");
      map.current = m;

      m.on("load", async () => {
        tuneStyle(m!);
        await Promise.all((["dealer", "importer", "service"] as PinKind[]).map((k) => addPinImage(m!, k)));
        const font = firstTextFont(m!);
        m!.addSource("partners", { type: "geojson", data: toGeoJSON([]), cluster: true, clusterRadius: 44, clusterMaxZoom: 9, promoteId: "pid" });
        m!.addLayer({
          id: "clusters", type: "circle", source: "partners", filter: ["has", "point_count"],
          paint: {
            "circle-color": "#0F1012",
            "circle-stroke-color": "#78BE20",
            "circle-stroke-width": 2,
            "circle-radius": ["step", ["get", "point_count"], 16, 5, 20, 10, 24],
          },
        });
        m!.addLayer({
          id: "cluster-count", type: "symbol", source: "partners", filter: ["has", "point_count"],
          layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 13, "text-font": font, "text-allow-overlap": true },
          paint: { "text-color": "#FFFFFF" },
        });
        m!.addLayer({
          id: "pins", type: "symbol", source: "partners", filter: ["!", ["has", "point_count"]],
          layout: {
            "icon-image": ["get", "icon"],
            "icon-anchor": "bottom",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "icon-size": 1,
            "symbol-sort-key": 0,
          },
        });
        m!.on("click", "pins", (e) => {
          const id = e.features?.[0]?.properties?.pid as string | undefined;
          if (id) onSelectRef.current(id);
        });
        m!.on("click", "clusters", async (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const src = m!.getSource("partners") as GeoJSONSource;
          const zoom = await src.getClusterExpansionZoom(f.properties!.cluster_id as number);
          m!.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom: zoom + 0.5 });
        });
        for (const layer of ["pins", "clusters"]) {
          m!.on("mouseenter", layer, () => (m!.getCanvas().style.cursor = "pointer"));
          m!.on("mouseleave", layer, () => (m!.getCanvas().style.cursor = ""));
        }
        if (!cancelled) setReady(true);
      });
    })();
    return () => {
      cancelled = true;
      popup.current?.remove();
      m?.remove();
      map.current = null;
    };
  }, []);

  // Data + refit when the visible partners change.
  const located = useMemo(() => partners.filter(hasLocation), [partners]);
  const fitKey = located.map((p) => p.id).join("|");
  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    popup.current?.remove(); // its partner may no longer be in the results
    (m.getSource("partners") as GeoJSONSource).setData(toGeoJSON(located));
    const b = boundsOf(located);
    if (!b) return;
    if (located.length === 1) m.flyTo({ center: [located[0].lng!, located[0].lat!], zoom: 11, duration: 700 });
    else m.fitBounds(b, { padding: { top: 90, bottom: 50, left: 60, right: 60 }, maxZoom: 11, duration: 700 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fitKey]);

  // Highlight active / hovered pin.
  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    const hot = [activeId, hoverId].filter(Boolean) as string[];
    m.setLayoutProperty("pins", "icon-size", hot.length ? ["case", ["in", ["get", "pid"], ["literal", hot]], 1.3, 1] : 1);
    m.setLayoutProperty("pins", "symbol-sort-key", hot.length ? ["case", ["in", ["get", "pid"], ["literal", hot]], 1, 0] : 0);
  }, [ready, activeId, hoverId]);

  // Fly to + popup on focus requests.
  useEffect(() => {
    const m = map.current;
    const ml = lib.current;
    if (!ready || !m || !ml || !focus) return;
    const p = byIdRef.current.get(focus.id);
    popup.current?.remove();
    if (!p || !hasLocation(p)) return;
    if (focus.fly) m.flyTo({ center: [p.lng, p.lat], zoom: Math.max(m.getZoom(), 10), duration: 800 });
    if (popups) {
      popup.current = new ml.Popup({ offset: [0, -40], closeButton: true, maxWidth: "280px", className: "partner-popup", focusAfterOpen: false })
        .setLngLat([p.lng, p.lat])
        .setHTML(popupHtml(p))
        .addTo(m);
    }
  }, [ready, focus, popups]);

  // MapLibre sets position:relative on its container, so it needs a sized wrapper.
  return (
    <div className="absolute inset-0">
      <div ref={el} className="w-full h-full" aria-label="Map of Energica partners" role="region" />
    </div>
  );
}

function toGeoJSON(list: Partner[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: list.filter(hasLocation).map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: { pid: p.id, icon: `pin-${pinKind(p)}`, name: p.name },
    })),
  };
}

async function addPinImage(m: MLMap, kind: PinKind) {
  const img = new Image(56, 72);
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(pinSvg(kind, 2))}`;
  await img.decode();
  if (!m.hasImage(`pin-${kind}`)) m.addImage(`pin-${kind}`, img, { pixelRatio: 2 });
}

function firstTextFont(m: MLMap): string[] {
  for (const l of m.getStyle().layers ?? []) {
    const f = (l as { layout?: { "text-font"?: unknown } }).layout?.["text-font"];
    if (Array.isArray(f) && f.every((x) => typeof x === "string")) return f as string[];
  }
  return ["Noto Sans Regular"];
}

/** Site-matched dark look: #0F1012 base, muted roads, no POI clutter. */
function tuneStyle(m: MLMap) {
  const style = m.getStyle() as StyleSpecification;
  for (const layer of style.layers) {
    const id = layer.id.toLowerCase();
    const sl = ("source-layer" in layer ? layer["source-layer"] : "")?.toLowerCase() ?? "";
    try {
      if (layer.type === "background") m.setPaintProperty(layer.id, "background-color", "#0F1012");
      else if (sl === "poi" || id.includes("poi") || sl === "aerodrome_label" || id.includes("housenumber")) m.setLayoutProperty(layer.id, "visibility", "none");
      else if (sl === "building" || id.includes("building")) m.setLayoutProperty(layer.id, "visibility", "none");
      else if (layer.type === "fill" && (sl === "water" || id.includes("water"))) m.setPaintProperty(layer.id, "fill-color", "#08090B");
      else if (layer.type === "fill" && (sl === "landcover" || sl === "landuse" || sl === "park")) m.setPaintProperty(layer.id, "fill-color", "#13151A");
      else if (layer.type === "line" && sl === "transportation") m.setPaintProperty(layer.id, "line-color", "#262A31");
      else if (layer.type === "line" && sl === "boundary") m.setPaintProperty(layer.id, "line-color", "#3A3F47");
      else if (layer.type === "symbol" && (sl === "transportation_name" || sl === "mountain_peak" || sl === "water_name"))
        m.setLayoutProperty(layer.id, "visibility", "none");
      else if (layer.type === "symbol" && sl === "place" && /state|province|village|hamlet|suburb|neighbourhood|quarter|island|other/.test(id))
        m.setLayoutProperty(layer.id, "visibility", "none");
      else if (layer.type === "symbol") {
        if (sl === "place") m.setLayoutProperty(layer.id, "text-field", ["coalesce", ["get", "name:en"], ["get", "name_en"], ["get", "name:latin"], ["get", "name"]]);
        m.setPaintProperty(layer.id, "text-color", "#7A808A");
        m.setPaintProperty(layer.id, "text-halo-color", "#0F1012");
      }
    } catch {
      /* layer may not support this property — leave it */
    }
  }
}

/* ── Static fallback (no map key) ───────────────────────────── */
// One fitted panel per region, so far-apart regions (Europe, Hong Kong)
// don't squeeze each other's pins together.
function StaticMap({ partners, activeId, hoverId, onSelect }: Props) {
  const located = partners.filter(hasLocation);
  const regions = groupByRegion(located);
  return (
    <div className="absolute inset-0 bg-[#0F1012] overflow-hidden flex flex-col" role="region" aria-label="Partner locations">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {regions.map((g, i) => (
        <div
          key={g.region}
          className={cn("relative min-h-0", i > 0 && "border-t border-white/[0.08]")}
          style={{ flex: `${Math.sqrt(g.partners.length)} 1 0%`, minHeight: 160 }}
        >
          <span className="absolute left-4 top-3 text-[10px] uppercase tracking-[0.35em] text-white/45" style={{ fontFamily: "var(--font-ibm-mono)" }}>
            {g.region}
          </span>
          <RegionPins partners={g.partners} activeId={activeId} hoverId={hoverId} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}

function RegionPins({ partners, activeId, hoverId, onSelect }: Pick<Props, "partners" | "activeId" | "hoverId" | "onSelect">) {
  // Fixed-size pins placed by percentage inside a padded box (schematic, not to scale).
  const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  const xs = partners.map((p) => p.lng!);
  const ys = partners.map((p) => merc(p.lat!));
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const norm = (v: number, a: number, b: number) => (b - a < 1e-9 ? 0.5 : (v - a) / (b - a));
  const pos = (p: Partner) => ({ left: 12 + norm(p.lng!, x0, x1) * 76, top: 22 + (1 - norm(merc(p.lat!), y0, y1)) * 62 });

  return (
    <div className="absolute inset-0">
      {partners
        .slice()
        .sort((a, b) => Number(a.id === activeId || a.id === hoverId) - Number(b.id === activeId || b.id === hoverId))
        .map((p) => {
          const { left, top } = pos(p);
          const hot = p.id === activeId || p.id === hoverId;
          return (
            <button
              key={p.id}
              type="button"
              title={p.name}
              aria-label={p.name}
              onClick={() => onSelect(p.id)}
              className="absolute -translate-x-1/2 -translate-y-full cursor-pointer transition-transform duration-150 origin-bottom"
              style={{ left: `${left}%`, top: `${top}%`, transform: `translate(-50%, -100%) scale(${hot ? 1.35 : 1})`, zIndex: hot ? 2 : 1 }}
              dangerouslySetInnerHTML={{ __html: pinSvg(pinKind(p)) }}
            />
          );
        })}
    </div>
  );
}
