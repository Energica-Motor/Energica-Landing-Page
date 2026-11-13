"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as MLMap, Marker as MLMarker, Popup as MLPopup, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Partner } from "@/data/partners";
import { TYPE_LABELS } from "@/data/partners";
import { boundsOf, directionsUrl, formatKm, hasLocation, type LatLng } from "@/lib/partners";
import { hasServiceDot, pinKind, pinSvg } from "./pins";

// Tiles: OpenFreeMap by default (no key, no cookies, loads immediately).
// MapTiler when NEXT_PUBLIC_MAP_KEY is set; NEXT_PUBLIC_MAP_STYLE_URL overrides both.
const KEY = process.env.NEXT_PUBLIC_MAP_KEY;
const STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
  (KEY ? `https://api.maptiler.com/maps/dataviz/style.json?key=${KEY}` : "https://tiles.openfreemap.org/styles/positron");

// Must match the installed maplibre-gl version (checked in tests/dealers/partners.test.ts).
export const MAPLIBRE_VERSION = "5.6.2";
const WORKER_URL = `/vendor/maplibre-gl-${MAPLIBRE_VERSION}-csp-worker.js`;

// Selected pin: larger, with a soft green ring around its head.
const ACTIVE_SIZE = 1.35;
// Pins and cluster bubbles are HTML markers (no sprite, glyph or custom GL layer).
// If the map hasn't gone idle within IDLE_TIMEOUT, or errors first, the static map takes over.
const IDLE_TIMEOUT = 8000;
const CLUSTER_PX = 44;
const SELECT_ZOOM = 9;
const FIT_PADDING = { top: 90, bottom: 50, left: 60, right: 60 };
const log = (...a: unknown[]) => console.warn("[map]", ...a);

/** Fit the map to these bounds (region jump links). */
export interface MapFit {
  bounds: [[number, number], [number, number]];
  nonce: number;
}

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
  fit?: MapFit | null;
  onSelect: (id: string) => void;
  /** Hide the popup (mobile uses a bottom sheet instead). */
  popups?: boolean;
  /** "Use my location": user position and the 3 nearest partners for the active filter. */
  origin?: LatLng | null;
  nearby?: (Partner & LatLng & { distanceKm: number })[];
  /** No partner within 500 km: no lines, just fit the user and this partner. */
  nearestOnly?: (Partner & LatLng & { distanceKm: number }) | null;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Same anatomy as the partner card: badges, name, address, primary action. */
function popupHtml(p: Partner) {
  const dir = directionsUrl(p);
  const badges = p.types.map((t) => `<span class="pp-badge pp-t-${t}">${esc(TYPE_LABELS[t].badge)}</span>`).join("");
  return `<div class="pp">
    <div class="pp-top">${badges}<span class="pp-country">${esc(p.country)}</span></div>
    <p class="pp-name">${esc(p.name)}</p>
    ${p.address ? `<p class="pp-addr">${esc(p.address)}</p>` : ""}
    ${dir ? `<a class="pp-btn" href="${esc(dir)}" target="_blank" rel="noopener noreferrer">Directions <span aria-hidden="true">↗</span></a>` : ""}
  </div>`;
}

/** Starts the library download early (call when the panel mounts). */
export const preloadMapLibrary = () => import("maplibre-gl/dist/maplibre-gl-csp.js");

/**
 * The live map always loads. If it isn't ready after IDLE_TIMEOUT (cold cache, slow
 * network) the static map covers it, then fades out the moment the live map goes idle.
 * Only a real MapLibre error keeps the static map.
 */
export default function PartnerMap(props: Props) {
  const [phase, setPhase] = useState<"loading" | "slow" | "live" | "failed">("loading");
  const [staticGone, setStaticGone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPhase((p) => (p === "loading" ? "slow" : p)), IDLE_TIMEOUT);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (phase === "slow") log(`not idle after ${IDLE_TIMEOUT / 1000}s: showing static map until the live map is ready`);
    if (phase !== "live") return;
    const t = setTimeout(() => setStaticGone(true), 220);
    return () => clearTimeout(t);
  }, [phase]);
  if (phase === "failed") return <StaticMap {...props} />;
  const showStatic = (phase === "slow" || phase === "live") && !staticGone;
  return (
    <>
      <LiveMap
        {...props}
        onIdle={() => setPhase((p) => (p === "slow" ? "live" : p === "loading" ? "live" : p))}
        onFail={() => setPhase("failed")}
      />
      {showStatic && (
        <div className="absolute inset-0 z-[2] transition-opacity duration-200" style={{ opacity: phase === "live" ? 0 : 1, pointerEvents: phase === "live" ? "none" : undefined }}>
          <StaticMap {...props} />
        </div>
      )}
    </>
  );
}

/* ── Interactive map (MapLibre) ─────────────────────────────── */
function LiveMap({ partners, activeId, hoverId, focus, fit = null, onSelect, popups = true, origin = null, nearby = [], nearestOnly = null, onFail, onIdle }: Props & { onFail: () => void; onIdle: () => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  const popup = useRef<MLPopup | null>(null);
  const lib = useRef<typeof import("maplibre-gl") | null>(null);
  const markers = useRef<MLMarker[]>([]);
  const [ready, setReady] = useState(false);
  const [zoomTick, setZoomTick] = useState(0);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onFailRef = useRef(onFail);
  onFailRef.current = onFail;
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;
  const byId = useMemo(() => new Map(partners.map((p) => [p.id, p])), [partners]);
  const byIdRef = useRef(byId);
  byIdRef.current = byId;
  const initialBounds = useRef(boundsOf(partners.filter(hasLocation)));

  // Create once.
  useEffect(() => {
    let cancelled = false;
    let idle = false;
    let m: MLMap | null = null;
    let ro: ResizeObserver | undefined;
    const fail = (why: string) => {
      if (cancelled || idle) return;
      cancelled = true;
      log("showing static map:", why);
      onFailRef.current();
    };
    (async () => {
      let ml: typeof import("maplibre-gl");
      try {
        // CSP build + prebuilt worker file: the default bundle's inline worker breaks
        // under production minification ("b is not defined") and the map never loads.
        const mod = (await preloadMapLibrary()) as unknown as typeof import("maplibre-gl") & { default?: typeof import("maplibre-gl") };
        ml = mod.default ?? mod;
        ml.setWorkerUrl(WORKER_URL);
      } catch (err) {
        return fail(`library failed to load (${(err as Error).message})`);
      }
      if (cancelled || !el.current) return;
      lib.current = ml;
      try {
        m = new ml.Map({
          container: el.current,
          style: STYLE_URL,
          // Start on the partners (no second set of tiles for a default view).
          ...(initialBounds.current
            ? { bounds: initialBounds.current, fitBoundsOptions: { padding: FIT_PADDING, maxZoom: 11 } }
            : { center: [10, 47] as [number, number], zoom: 3.4 }),
          // Attribution is required by OpenStreetMap; kept collapsed behind the (i).
          attributionControl: { compact: true },
          maplibreLogo: false,
          fadeDuration: 0,
          dragRotate: false,
          pitchWithRotate: false,
        });
      } catch (err) {
        return fail(`WebGL unavailable (${(err as Error).message})`);
      }
      const mm = m;
      mm.touchZoomRotate.disableRotation();
      mm.addControl(new ml.NavigationControl({ showCompass: false }), "bottom-right");
      map.current = mm;
      if (process.env.NODE_ENV !== "production") (window as unknown as { __partnerMap?: MLMap }).__partnerMap = mm;

      mm.on("error", (e) => {
        const ev = e as unknown as { sourceId?: string; tile?: unknown; error?: Error };
        log("error", ev.sourceId ?? "", ev.error?.message ?? "");
        // A single tile may fail; anything else before the first idle means no usable map.
        if (!ev.tile) fail(`error before idle: ${ev.error?.message ?? "unknown"}`);
      });
      mm.on("webglcontextlost", () => fail("WebGL context lost"));
      mm.once("idle", () => {
        idle = true;
        if (!cancelled) onIdleRef.current();
      });
      // The canvas may be sized before layout settles; keep it in step with its box.
      ro = new ResizeObserver(() => mm.resize());
      ro.observe(el.current);
      mm.on("zoomend", () => setZoomTick((t) => t + 1));

      mm.on("load", () => {
        try {
          mm.resize();
          tuneStyle(mm);
          collapseAttribution(el.current);
        } catch (err) {
          log("style tuning skipped", err);
        }
        if (!cancelled) setReady(true);
      });
    })();
    return () => {
      cancelled = true;
      ro?.disconnect();
      popup.current?.remove();
      markers.current.forEach((mk) => mk.remove());
      markers.current = [];
      youMarkers.current.forEach((mk) => mk.remove());
      youMarkers.current = [];
      m?.remove();
      map.current = null;
    };
  }, []);

  // Refit when the visible partners change (the location view fits itself).
  const located = useMemo(() => partners.filter(hasLocation), [partners]);
  const fitKey = located.map((p) => p.id).join("|");
  const firstFit = useRef(true);
  useEffect(() => {
    const m = map.current;
    if (!ready || !m || origin) return;
    popup.current?.remove(); // its partner may no longer be in the results
    const b = boundsOf(located);
    if (!b) return;
    // First fit jumps (no animation frames on load); later filter changes animate.
    const duration = firstFit.current ? 0 : 700;
    firstFit.current = false;
    if (located.length === 1) m.flyTo({ center: [located[0].lng!, located[0].lat!], zoom: 11, duration });
    else m.fitBounds(b, { padding: FIT_PADDING, maxZoom: 11, duration });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fitKey, !!origin]);

  // Region jump links.
  useEffect(() => {
    const m = map.current;
    if (!ready || !m || !fit) return;
    popup.current?.remove();
    m.fitBounds(fit.bounds, { padding: FIT_PADDING, maxZoom: 11, duration: 700 });
  }, [ready, fit]);

  // "Use my location": red marker, dashed lines to the 3 nearest with km at the midpoint.
  const youMarkers = useRef<MLMarker[]>([]);
  const nearbyKey = origin ? `${origin.lat},${origin.lng}|${nearby.map((p) => p.id).join("|")}|${nearestOnly?.id ?? ""}` : "";
  useEffect(() => {
    const m = map.current;
    const ml = lib.current;
    if (!ready || !m || !ml) return;
    youMarkers.current.forEach((mk) => mk.remove());
    youMarkers.current = [];
    const lines: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: origin
        ? nearby.map((p) => ({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[origin.lng, origin.lat], [p.lng, p.lat]] } }))
        : [],
    };
    const src = m.getSource("nearby-lines") as import("maplibre-gl").GeoJSONSource | undefined;
    if (src) src.setData(lines);
    else {
      m.addSource("nearby-lines", { type: "geojson", data: lines });
      m.addLayer({
        id: "nearby-lines",
        type: "line",
        source: "nearby-lines",
        layout: { "line-cap": "round" },
        paint: { "line-color": "#CE2B37", "line-opacity": 0.6, "line-width": 1.5, "line-dasharray": [3, 3] },
      });
    }
    if (!origin) return;
    const you = document.createElement("div");
    you.className = "pm-you";
    you.setAttribute("role", "img");
    you.setAttribute("aria-label", "You are here");
    you.title = "You are here";
    you.innerHTML = '<span class="pm-you-ring"></span><span class="pm-you-dot"></span>';
    youMarkers.current.push(new ml.Marker({ element: you, anchor: "center" }).setLngLat([origin.lng, origin.lat]).addTo(m));
    for (const p of nearby) {
      // Midpoint of the straight (Mercator) line, so the label sits on it.
      const a = ml.MercatorCoordinate.fromLngLat([origin.lng, origin.lat]);
      const b = ml.MercatorCoordinate.fromLngLat([p.lng, p.lat]);
      const mid = new ml.MercatorCoordinate((a.x + b.x) / 2, (a.y + b.y) / 2).toLngLat();
      const tag = document.createElement("div");
      tag.className = "pm-km";
      tag.textContent = formatKm(p.distanceKm);
      const mk = new ml.Marker({ element: tag, anchor: "center" }).setLngLat(mid).addTo(m);
      mk.getElement().style.zIndex = "1";
      youMarkers.current.push(mk);
    }
    const targets = nearby.length ? nearby : nearestOnly ? [nearestOnly] : [];
    const b = boundsOf([{ ...origin } as Partner, ...targets]);
    if (b) m.fitBounds(b, { padding: { top: 110, bottom: 70, left: 80, right: 80 }, maxZoom: 11, duration: 800 });
    // Distance labels must not overlap: hide any that collide (the card shows the distance).
    const declutter = () => {
      const tags = youMarkers.current.slice(1).map((mk) => mk.getElement());
      const kept: DOMRect[] = [];
      for (const t of tags) {
        t.style.visibility = "visible";
        const r = t.getBoundingClientRect();
        const hit = kept.some((k) => !(r.right + 4 < k.left || r.left - 4 > k.right || r.bottom + 2 < k.top || r.top - 2 > k.bottom));
        if (hit) t.style.visibility = "hidden";
        else kept.push(r);
      }
    };
    m.on("moveend", declutter);
    declutter();
    return () => {
      m.off("moveend", declutter);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, nearbyKey]);

  // Markers: pins plus cluster bubbles, regrouped on every zoom change.
  useEffect(() => {
    const m = map.current;
    const ml = lib.current;
    if (!ready || !m || !ml) return;
    markers.current.forEach((mk) => mk.remove());
    markers.current = [];
    const hot = new Set([activeId, hoverId].filter(Boolean) as string[]);
    for (const group of clusterByScreen(m, located, hot)) {
      const btn = document.createElement("button");
      btn.type = "button";
      if (group.length === 1) {
        const p = group[0];
        const isActive = p.id === activeId;
        btn.className = `pm-pin${hot.has(p.id) ? " is-hot" : ""}${isActive ? " is-active" : ""}`;
        btn.setAttribute("aria-label", p.name);
        btn.title = p.name;
        btn.innerHTML = `<span class="pm-ring" aria-hidden="true"></span>${pinSvg(pinKind(p), 1, hasServiceDot(p))}`;
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelectRef.current(p.id);
        });
        const mk = new ml.Marker({ element: btn, anchor: "bottom" }).setLngLat([p.lng!, p.lat!]).addTo(m);
        // Pins above clusters; the selected pin above all.
        mk.getElement().style.zIndex = isActive ? "4" : hot.has(p.id) ? "3" : "2";
        markers.current.push(mk);
      } else {
        const lng = group.reduce((s, p) => s + p.lng!, 0) / group.length;
        const lat = group.reduce((s, p) => s + p.lat!, 0) / group.length;
        const size = group.length >= 10 ? 48 : group.length >= 5 ? 40 : 32;
        btn.className = "pm-cluster";
        btn.textContent = String(group.length);
        btn.setAttribute("aria-label", `${group.length} partners, zoom in`);
        btn.style.width = btn.style.height = `${size}px`;
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const b = boundsOf(group);
          if (b) m.fitBounds(b, { padding: FIT_PADDING, maxZoom: 13, duration: 600 });
        });
        const mk = new ml.Marker({ element: btn, anchor: "center" }).setLngLat([lng, lat]).addTo(m);
        mk.getElement().style.zIndex = "1";
        markers.current.push(mk);
      }
    }
  }, [ready, located, activeId, hoverId, zoomTick]);

  // Fly to + popup on focus requests.
  useEffect(() => {
    const m = map.current;
    const ml = lib.current;
    if (!ready || !m || !ml || !focus) return;
    const p = byIdRef.current.get(focus.id);
    popup.current?.remove();
    if (!p || !hasLocation(p)) return;
    // Hide the place label under the selected pin (it covers the town name).
    hidePlaceLabel(m, p.city ?? "");
    const open = () => {
      if (!popups) return;
      popup.current?.remove();
      popup.current = new ml.Popup({
        anchor: "bottom", // always centred above the pin; the tip points at it
        offset: [0, -Math.round(36 * ACTIVE_SIZE)],
        closeButton: true,
        maxWidth: "300px",
        className: "partner-popup",
        focusAfterOpen: false,
      })
        .setLngLat([p.lng, p.lat])
        .setHTML(popupHtml(p))
        .addTo(m);
    };
    if (focus.fly) {
      // One level wider than before so surrounding towns stay visible; popup opens when the fly ends.
      let done = false;
      const openOnce = () => {
        if (done) return;
        done = true;
        open();
      };
      const t = setTimeout(openOnce, 1000); // in case no move happens
      m.once("moveend", openOnce);
      m.flyTo({ center: [p.lng, p.lat], zoom: Math.max(m.getZoom(), SELECT_ZOOM), duration: 800, offset: popups ? [0, 110] : [0, 0] }); // pin sits lower: room for the popup
      return () => {
        clearTimeout(t);
        m.off("moveend", openOnce);
      };
    }
    open();
  }, [ready, focus, popups]);

  // MapLibre sets position:relative on its container, so it needs a sized wrapper.
  return (
    <div className="absolute inset-0 bg-[#E9E9E6]">
      <div ref={el} className="w-full h-full" aria-label="Map of Energica partners" role="region" />
    </div>
  );
}

/** Greedy screen-space grouping; hot partners always stay as single pins. */
function clusterByScreen(m: MLMap, list: Partner[], hot: Set<string>): Partner[][] {
  const pts = list.map((p) => ({ p, xy: m.project([p.lng!, p.lat!]) }));
  const used = new Set<number>();
  const groups: Partner[][] = [];
  const zoomedIn = m.getZoom() >= 10;
  pts.forEach((a, i) => {
    if (used.has(i)) return;
    used.add(i);
    const g = [a.p];
    if (!zoomedIn && !hot.has(a.p.id)) {
      pts.forEach((b, j) => {
        if (used.has(j) || hot.has(b.p.id)) return;
        if (Math.hypot(a.xy.x - b.xy.x, a.xy.y - b.xy.y) < CLUSTER_PX) {
          used.add(j);
          g.push(b.p);
        }
      });
    }
    groups.push(g);
  });
  return groups;
}

/** Fade out the place label matching the selected partner's town ("" shows all). */
function hidePlaceLabel(m: MLMap, name: string) {
  for (const layer of m.getStyle().layers ?? []) {
    if (layer.type !== "symbol" || !("source-layer" in layer) || layer["source-layer"] !== "place") continue;
    try {
      m.setPaintProperty(layer.id, "text-opacity", name
        ? ["case", ["any", ["==", ["get", "name"], name], ["==", ["get", "name:en"], name], ["==", ["get", "name:latin"], name]], 0, 1]
        : 1);
    } catch {
      /* ignore */
    }
  }
}

/** Collapse the attribution to its (i) button; it opens on click. */
function collapseAttribution(root: HTMLElement | null) {
  root?.querySelectorAll(".maplibregl-ctrl-attrib.maplibregl-compact-show").forEach((n) => {
    n.classList.remove("maplibregl-compact-show");
    n.removeAttribute("open");
  });
}

/** Light, muted look: light grey land, white roads, no POI or region labels. */
function tuneStyle(m: MLMap) {
  const style = m.getStyle() as StyleSpecification;
  for (const layer of style.layers) {
    const id = layer.id.toLowerCase();
    const sl = ("source-layer" in layer ? layer["source-layer"] : "")?.toLowerCase() ?? "";
    const hide = () => m.setLayoutProperty(layer.id, "visibility", "none");
    try {
      if (layer.type === "background") m.setPaintProperty(layer.id, "background-color", "#E9E9E6");
      else if (sl === "poi" || id.includes("poi") || sl === "aerodrome_label" || id.includes("housenumber")) hide();
      else if (sl === "building" || id.includes("building")) hide();
      else if (layer.type === "fill" && (sl === "water" || id.includes("water"))) m.setPaintProperty(layer.id, "fill-color", "#D3D9DD");
      else if (layer.type === "fill" && (sl === "landcover" || sl === "landuse" || sl === "park")) {
        m.setPaintProperty(layer.id, "fill-color", "#E9E9E6");
        m.setPaintProperty(layer.id, "fill-pattern", undefined);
      } else if (layer.type === "line" && sl === "transportation") m.setPaintProperty(layer.id, "line-color", "#FFFFFF");
      else if (layer.type === "line" && sl === "boundary") m.setPaintProperty(layer.id, "line-color", "#BFC3C7");
      else if (layer.type === "line" && sl === "waterway") m.setPaintProperty(layer.id, "line-color", "#D3D9DD");
      else if (layer.type === "symbol" && (sl === "transportation_name" || sl === "mountain_peak" || sl === "water_name")) hide();
      // Region labels: continents, countries, states/provinces, and small places.
      else if (layer.type === "symbol" && sl === "place" && /continent|country|state|province|village|hamlet|suburb|neighbourhood|quarter|island|other/.test(id)) hide();
      else if (layer.type === "symbol") {
        if (sl === "place") {
          m.setLayoutProperty(layer.id, "text-field", ["coalesce", ["get", "name:en"], ["get", "name_en"], ["get", "name:latin"], ["get", "name"]]);
          m.setLayoutProperty(layer.id, "icon-image", undefined);
        }
        m.setPaintProperty(layer.id, "text-color", "#5E6266");
        m.setPaintProperty(layer.id, "text-halo-color", "#FFFFFF");
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
    <div className="absolute inset-0 bg-[#E9E9E6] overflow-hidden" role="region" aria-label="Partner locations">
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
              dangerouslySetInnerHTML={{ __html: pinSvg(pinKind(p), 1, hasServiceDot(p)) }}
            />
          );
        })}
    </div>
  );
}
