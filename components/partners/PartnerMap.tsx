"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as MLMap, Popup as MLPopup, GeoJSONSource, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Partner } from "@/data/partners";
import { TYPE_LABELS } from "@/data/partners";
import { boundsOf, directionsUrl, hasLocation } from "@/lib/partners";
import { pinKind, pinSvg, type PinKind } from "./pins";

// Tiles: OpenFreeMap by default (no key, no cookies, loads immediately).
// MapTiler when NEXT_PUBLIC_MAP_KEY is set; NEXT_PUBLIC_MAP_STYLE_URL overrides both.
const KEY = process.env.NEXT_PUBLIC_MAP_KEY;
const STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
  (KEY ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${KEY}` : "https://tiles.openfreemap.org/styles/dark");

// Selected pin: larger, with a soft green ring around its head.
const ACTIVE_SIZE = 1.35;
const HEAD_OFFSET = Math.round(22.7 * ACTIVE_SIZE); // px from pin tip to head centre

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

/** Same anatomy as the partner card: badges, name, address, primary action. */
function popupHtml(p: Partner) {
  const dir = directionsUrl(p);
  const badges = p.types.map((t) => `<span class="pp-badge pp-${t}">${esc(TYPE_LABELS[t].badge)}</span>`).join("");
  return `<div class="pp">
    <div class="pp-top">${badges}<span class="pp-country">${esc(p.country)}</span></div>
    <p class="pp-name">${esc(p.name)}</p>
    ${p.address ? `<p class="pp-addr">${esc(p.address)}</p>` : ""}
    ${dir ? `<a class="pp-btn" href="${esc(dir)}" target="_blank" rel="noopener noreferrer">Directions <span aria-hidden="true">↗</span></a>` : ""}
  </div>`;
}

export default function PartnerMap(props: Props) {
  const [failed, setFailed] = useState(false);
  return failed ? <StaticMap {...props} /> : <LiveMap {...props} onFail={() => setFailed(true)} />;
}

/* ── Interactive map (MapLibre) ─────────────────────────────── */
function LiveMap({ partners, activeId, hoverId, focus, onSelect, popups = true, onFail }: Props & { onFail: () => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  const popup = useRef<MLPopup | null>(null);
  const lib = useRef<typeof import("maplibre-gl") | null>(null);
  const [ready, setReady] = useState(false);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onFailRef = useRef(onFail);
  onFailRef.current = onFail;
  const byId = useMemo(() => new Map(partners.map((p) => [p.id, p])), [partners]);
  const byIdRef = useRef(byId);
  byIdRef.current = byId;
  const initialBounds = useRef(boundsOf(partners.filter(hasLocation)));

  // Create once.
  useEffect(() => {
    let cancelled = false;
    let loaded = false;
    let m: MLMap | null = null;
    (async () => {
      const ml = await import("maplibre-gl");
      if (cancelled || !el.current) return;
      lib.current = ml;
      m = new ml.Map({
        container: el.current,
        style: STYLE_URL,
        // Start on the partners (no second set of tiles for a default view).
        ...(initialBounds.current
          ? { bounds: initialBounds.current, fitBoundsOptions: { padding: { top: 90, bottom: 50, left: 60, right: 60 }, maxZoom: 11 } }
          : { center: [10, 47] as [number, number], zoom: 3.4 }),
        // Attribution is required by OpenStreetMap; kept collapsed behind the (i).
        attributionControl: { compact: true },
        maplibreLogo: false,
        fadeDuration: 0, // no label fade frames
        dragRotate: false,
        pitchWithRotate: false,
      });
      m.touchZoomRotate.disableRotation();
      m.addControl(new ml.NavigationControl({ showCompass: false }), "bottom-right");
      map.current = m;
      if (process.env.NODE_ENV !== "production") (window as unknown as { __partnerMap?: MLMap }).__partnerMap = m;
      // Only a failed style (not a single tile or glyph) switches to the static fallback.
      m.on("error", (e) => {
        const ev = e as unknown as { sourceId?: string; tile?: unknown };
        if (process.env.NODE_ENV !== "production") console.warn("[map]", (e as { error?: Error }).error?.message);
        if (!loaded && !cancelled && !ev.sourceId && !ev.tile) onFailRef.current();
      });

      m.on("load", async () => {
        loaded = true;
        try {
        tuneStyle(m!);
        collapseAttribution(el.current);
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
        // Soft green ring behind the selected pin's head (above clusters, below pins).
        m!.addLayer({
          id: "active-ring", type: "circle", source: "partners", filter: ["==", ["get", "pid"], ""],
          paint: {
            "circle-radius": 22,
            "circle-color": "rgba(120,190,32,0.18)",
            "circle-stroke-color": "rgba(120,190,32,0.55)",
            "circle-stroke-width": 1.5,
            "circle-translate": [0, -HEAD_OFFSET],
            "circle-blur": 0.15,
          },
        });
        // Pins last: always drawn above cluster bubbles.
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
        } catch (err) {
          console.error("[map] setup failed", err);
        }
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
  const firstFit = useRef(true);
  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    popup.current?.remove(); // its partner may no longer be in the results
    (m.getSource("partners") as GeoJSONSource).setData(toGeoJSON(located));
    const b = boundsOf(located);
    if (!b) return;
    // First fit jumps (no animation frames on load); later filter changes animate.
    const duration = firstFit.current ? 0 : 700;
    firstFit.current = false;
    if (located.length === 1) m.flyTo({ center: [located[0].lng!, located[0].lat!], zoom: 11, duration });
    else m.fitBounds(b, { padding: { top: 90, bottom: 50, left: 60, right: 60 }, maxZoom: 11, duration });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fitKey]);

  // Highlight: selected pin larger with a ring; hovered pin larger.
  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    const hot = [activeId, hoverId].filter(Boolean) as string[];
    const isHot = ["in", ["get", "pid"], ["literal", hot]];
    m.setLayoutProperty("pins", "icon-size", hot.length ? ["case", isHot, ACTIVE_SIZE, 1] : 1);
    m.setLayoutProperty("pins", "symbol-sort-key", hot.length ? ["case", isHot, 1, 0] : 0);
    m.setFilter("active-ring", ["all", ["!", ["has", "point_count"]], ["==", ["get", "pid"], activeId ?? ""]]);
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
      popup.current = new ml.Popup({ offset: [0, -(36 * ACTIVE_SIZE + 8)], closeButton: true, maxWidth: "300px", className: "partner-popup", focusAfterOpen: false })
        .setLngLat([p.lng, p.lat])
        .setHTML(popupHtml(p))
        .addTo(m);
    }
  }, [ready, focus, popups]);

  // MapLibre sets position:relative on its container, so it needs a sized wrapper.
  return (
    <div className="absolute inset-0 bg-[#0F1012]">
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

/** Collapse the attribution to its (i) button; it opens on click. */
function collapseAttribution(root: HTMLElement | null) {
  root?.querySelectorAll(".maplibregl-ctrl-attrib.maplibregl-compact-show").forEach((n) => {
    n.classList.remove("maplibregl-compact-show");
    n.removeAttribute("open");
  });
}

/** Site-matched dark look: #0F1012 land, muted borders/roads, no POI or region labels. */
function tuneStyle(m: MLMap) {
  const style = m.getStyle() as StyleSpecification;
  for (const layer of style.layers) {
    const id = layer.id.toLowerCase();
    const sl = ("source-layer" in layer ? layer["source-layer"] : "")?.toLowerCase() ?? "";
    const hide = () => m.setLayoutProperty(layer.id, "visibility", "none");
    try {
      if (layer.type === "background") m.setPaintProperty(layer.id, "background-color", "#0F1012");
      else if (sl === "poi" || id.includes("poi") || sl === "aerodrome_label" || id.includes("housenumber")) hide();
      else if (sl === "building" || id.includes("building")) hide();
      else if (layer.type === "fill" && (sl === "water" || id.includes("water"))) m.setPaintProperty(layer.id, "fill-color", "#08090B");
      else if (layer.type === "fill" && (sl === "landcover" || sl === "landuse" || sl === "park")) m.setPaintProperty(layer.id, "fill-color", "#0F1012");
      else if (layer.type === "line" && sl === "transportation") m.setPaintProperty(layer.id, "line-color", "#22252B");
      else if (layer.type === "line" && sl === "boundary") m.setPaintProperty(layer.id, "line-color", "#2E3238");
      else if (layer.type === "line" && sl === "waterway") m.setPaintProperty(layer.id, "line-color", "#0B0C0E");
      else if (layer.type === "symbol" && (sl === "transportation_name" || sl === "mountain_peak" || sl === "water_name")) hide();
      // Region labels: continents, countries, states/provinces, and small places.
      else if (layer.type === "symbol" && sl === "place" && /continent|country|state|province|village|hamlet|suburb|neighbourhood|quarter|island|other/.test(id)) hide();
      else if (layer.type === "symbol") {
        if (sl === "place") m.setLayoutProperty(layer.id, "text-field", ["coalesce", ["get", "name:en"], ["get", "name_en"], ["get", "name:latin"], ["get", "name"]]);
        m.setPaintProperty(layer.id, "text-color", "#6E747E");
        m.setPaintProperty(layer.id, "text-halo-color", "#0F1012");
      }
    } catch {
      /* layer may not support this property — leave it */
    }
  }
}

/* ── Static fallback (tiles unreachable) ────────────────────── */
function StaticMap({ partners, activeId, hoverId, onSelect }: Props) {
  const located = partners.filter(hasLocation);
  const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  const xs = located.map((p) => p.lng!);
  const ys = located.map((p) => merc(p.lat!));
  const [x0, x1, y0, y1] = located.length ? [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)] : [0, 1, 0, 1];
  const norm = (v: number, a: number, b: number) => (b - a < 1e-9 ? 0.5 : (v - a) / (b - a));
  return (
    <div className="absolute inset-0 bg-[#0F1012] overflow-hidden" role="region" aria-label="Partner locations">
      {located
        .slice()
        .sort((a, b) => Number(a.id === activeId || a.id === hoverId) - Number(b.id === activeId || b.id === hoverId))
        .map((p) => {
          const hot = p.id === activeId || p.id === hoverId;
          return (
            <button
              key={p.id}
              type="button"
              title={p.name}
              aria-label={p.name}
              onClick={() => onSelect(p.id)}
              className="absolute cursor-pointer"
              style={{
                left: `${10 + norm(p.lng!, x0, x1) * 80}%`,
                top: `${18 + (1 - norm(merc(p.lat!), y0, y1)) * 70}%`,
                transform: `translate(-50%, -100%) scale(${hot ? ACTIVE_SIZE : 1})`,
                transformOrigin: "bottom center",
                zIndex: hot ? 2 : 1,
              }}
              dangerouslySetInnerHTML={{ __html: pinSvg(pinKind(p)) }}
            />
          );
        })}
    </div>
  );
}
