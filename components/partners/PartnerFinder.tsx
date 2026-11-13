"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { TYPE_LABELS, type Partner, type Region } from "@/data/partners";
import {
  NEARBY_KM,
  boundsOf,
  countByType,
  countriesFor,
  countryCounts,
  filterPartners,
  findNearby,
  formatKm,
  groupByRegion,
  nearest,
  sortByDistance,
  sortPartners,
  stateToQuery,
  type LatLng,
  type LocatorState,
  type TypeFilter,
} from "@/lib/partners";
import PartnerCard from "./PartnerCard";
import type { MapFocus, MapFit } from "./PartnerMap";

// MapLibre is large and browser-only: load it after the list renders.
const PartnerMap = dynamic(() => import("./PartnerMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#E9E9E6]" />,
});

// Start downloading the map code as soon as the page hydrates (desktop shows the
// map immediately), instead of waiting for the panel to render.
const preloadMap = () => import("./PartnerMap").then((m) => m.preloadMapLibrary()).catch(() => {});

const mono = { fontFamily: "var(--font-ibm-mono)" } as const;
const sans = { fontFamily: "var(--font-ibm-sans)" } as const;
const TYPE_ORDER: TypeFilter[] = ["all", "country", "dealer", "service"];
const typeLabel = (t: TypeFilter) => (t === "all" ? "All" : TYPE_LABELS[t].plural);

// Light locator theme (site header, title block and footer stay dark).
const field =
  "w-full min-h-[44px] bg-white border border-[#D3D5D7] hover:border-[#5E6266] focus:border-[#141517] focus:outline-none text-[#141517] text-sm transition-colors";
const iconBtn =
  "shrink-0 inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] border transition-colors cursor-none";
const label = "uppercase text-[#5E6266]";

export default function PartnerFinder({ partners, initial }: { partners: Partner[]; initial: LocatorState }) {
  const [state, setState] = useState<LocatorState>(initial);
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationFailed, setLocationFailed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [fit, setFit] = useState<MapFit | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // false until measured: CSS decides the first paint, so phones never flash the desktop map.
  const [isDesktop, setIsDesktop] = useState(false);
  const [headerH, setHeaderH] = useState(80);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const sectionRefs = useRef(new Map<Region, HTMLElement>());
  const listRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);
  const beforeLocation = useRef<LocatorState | null>(null);
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) preloadMap();
  }, []);
  const locatorRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [barH, setBarH] = useState(0);

  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const md = window.matchMedia("(min-width: 768px)"); // site header: 80px, 96px from md
    const sync = () => {
      setIsDesktop(lg.matches);
      setHeaderH(md.matches ? 96 : 80);
    };
    sync();
    lg.addEventListener("change", sync);
    md.addEventListener("change", sync);
    return () => {
      lg.removeEventListener("change", sync);
      md.removeEventListener("change", sync);
    };
  }, []);

  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBarH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep the URL shareable.
  useEffect(() => {
    window.history.replaceState(null, "", `${window.location.pathname}${stateToQuery(state)}`);
  }, [state]);

  const counts = useMemo(() => countByType(partners), [partners]);
  const countryList = useMemo(() => countryCounts(partners, state.type), [partners, state.type]);
  const results = useMemo(() => sortByDistance(sortPartners(filterPartners(partners, state)), origin), [partners, state, origin]);
  const regionGroups = useMemo(() => groupByRegion(sortPartners(filterPartners(partners, state))), [partners, state]);
  // With a location the list is one distance-sorted list; otherwise grouped by region.
  const groups = useMemo(() => (origin ? [{ region: null, partners: results }] : regionGroups), [results, origin, regionGroups]);
  // Lines only to partners within NEARBY_KM (up to 3); otherwise just the single nearest.
  const near = useMemo(() => {
    if (!origin) return null;
    const close = nearest(results, origin, 3).filter((p) => p.distanceKm <= NEARBY_KM);
    return close.length ? { lines: close, nearestOnly: null } : { lines: [], nearestOnly: nearest(results, origin, 1)[0] ?? null };
  }, [results, origin]);
  const active = activeId && results.some((p) => p.id === activeId) ? activeId : null;
  const activeFilters = Number(state.type !== "all") + Number(!!state.country);

  const update = (patch: Partial<LocatorState>) =>
    setState((s) => {
      const next = { ...s, ...patch };
      if (patch.type && next.country && !countriesFor(partners, next.type).includes(next.country)) next.country = "";
      return next;
    });

  function clearLocation() {
    setOrigin(null);
    setActiveId(null);
    // Restore the filters from before "Use my location"; the map refits to them.
    if (beforeLocation.current) setState(beforeLocation.current);
    beforeLocation.current = null;
  }

  function toggleLocation() {
    if (origin) return clearLocation();
    setLocationFailed(false);
    if (!navigator.geolocation) return setLocationFailed(true);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocating(false);
        beforeLocation.current = state;
        // All countries; the active tab, or every type if the tab has nothing nearby.
        const r = findNearby(partners, here, state.type);
        setState({ type: r.type, country: "", q: "" });
        setOrigin(here);
        if (r.partners[0]) setActiveId(r.partners[0].id);
      },
      () => {
        setLocating(false);
        setLocationFailed(true); // short note under the search box; no marker, no banner
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  }

  function switchView(v: "list" | "map") {
    setView(v);
    setSheetId(null);
    // Map view fills the screen below the sticky bar: scroll the header block away.
    if (v === "map" && locatorRef.current) {
      const top = locatorRef.current.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
    }
  }

  function jumpTo(region: Region) {
    const section = sectionRefs.current.get(region);
    const g = regionGroups.find((x) => x.region === region);
    if (g) {
      const b = boundsOf(g.partners);
      if (b) setFit({ bounds: b, nonce: ++seq.current });
    }
    if (!section) return;
    const box = listRef.current;
    if (isDesktop && box) box.scrollTo({ top: section.offsetTop - box.offsetTop - 8, behavior: "smooth" });
    else window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - headerH - barH - 8, behavior: "smooth" });
  }

  const selectFromCard = (id: string) => {
    setActiveId(id);
    setFocus({ id, nonce: ++seq.current, fly: true });
  };

  const selectFromMap = useCallback(
    (id: string) => {
      setActiveId(id);
      setFocus({ id, nonce: ++seq.current, fly: false });
      if (!isDesktop) setSheetId(id);
      else cardRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
    [isDesktop],
  );

  const sheetPartner = sheetId ? results.find((p) => p.id === sheetId) ?? null : null;
  const showServiceEmpty = state.type === "service" && counts.service === 0;

  const typeTabs = (wrap: boolean) => (
    <div
      role="group"
      aria-label="Partner type"
      className={cn("flex border border-[#D3D5D7] bg-white", wrap ? "grid grid-cols-2" : "overflow-x-auto no-scrollbar basis-full min-w-0")}
    >
      {TYPE_ORDER.map((t) => (
        <button
          key={t}
          type="button"
          aria-pressed={state.type === t}
          onClick={() => update({ type: t })}
          className={cn(
            "min-h-[44px] px-2 text-[11px] tracking-[0.06em] uppercase whitespace-nowrap transition-colors cursor-none",
            wrap ? "border-[#D3D5D7] [&:nth-child(odd)]:border-r [&:nth-child(-n+2)]:border-b" : "flex-auto shrink-0 px-3 border-r border-[#D3D5D7] last:border-r-0",
            state.type === t ? "bg-[#78BE20] text-[#0F1012]" : "text-[#4A4E52] hover:text-[#141517] hover:bg-[#F2F2F0]",
          )}
          style={mono}
        >
          {typeLabel(t)}
          {/* Only "All" shows a number: a partner with several roles is in several tabs. */}
          {t === "all" && <span className={state.type === t ? "text-[#0F1012]/75" : "text-[#5E6266]"}> {counts.all}</span>}
        </button>
      ))}
    </div>
  );

  // All 18 countries always; count for the active tab; 0 = greyed out (still visible).
  const countrySelect = (
    <label className="relative block min-w-[150px]">
      <span className="sr-only">Country</span>
      <select value={state.country} onChange={(e) => update({ country: e.target.value })} className={cn(field, "appearance-none pl-4 pr-10 cursor-none locator-select")} style={sans}>
        <option value="">All countries</option>
        {countryList.map(({ country, count }) => (
          <option key={country} value={country} disabled={count === 0} className={count === 0 ? "text-[#8A8E92]" : undefined}>
            {country} ({count})
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#5E6266] text-xs">▾</span>
    </label>
  );

  const locationIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      <circle cx="12" cy="12" r="7.5" />
    </svg>
  );

  const filterBar = (
    <div ref={barRef} className="bg-[#F2F2F0] border-b border-[#D3D5D7] py-3 lg:py-4 flex flex-col gap-3">
      <div className="flex gap-2">
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Search city, country or partner</span>
          <input
            type="search"
            value={state.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search city, country or partner"
            className={cn(field, "px-3 lg:px-4 placeholder:text-[#5E6266]")}
            style={sans}
          />
        </label>
        <button
          type="button"
          onClick={toggleLocation}
          aria-pressed={!!origin}
          disabled={locating}
          className={cn(
            iconBtn,
            "px-3 lg:px-4 font-display uppercase text-[12px] tracking-[0.12em] disabled:opacity-60",
            origin ? "border-[#141517] bg-[#141517] text-white" : "border-[#141517] text-[#141517] bg-white hover:bg-[#141517] hover:text-white",
          )}
        >
          {locationIcon}
          <span className="hidden lg:inline">Use my location</span>
          <span className="sr-only lg:hidden">Use my location</span>
        </button>

        {/* Mobile: Filters button + compact List/Map toggle */}
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          aria-haspopup="dialog"
          className={cn(iconBtn, "lg:hidden relative px-3 bg-white border-[#141517] text-[#141517]")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          <span className="sr-only">Filters</span>
          {activeFilters > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#78BE20] text-[#0F1012] text-[10px] leading-[18px] text-center" style={mono}>
              {activeFilters}
            </span>
          )}
        </button>
        <div className="lg:hidden flex shrink-0 border border-[#141517] bg-white" role="group" aria-label="View">
          {(["list", "map"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => switchView(v)}
              className={cn("min-h-[42px] w-11 text-[10px] tracking-[0.12em] uppercase transition-colors cursor-none", view === v ? "bg-[#141517] text-white" : "text-[#4A4E52]")}
              style={mono}
            >
              {v === "list" ? "List" : "Map"}
            </button>
          ))}
        </div>
      </div>

      {(origin || locationFailed) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 -mt-1 text-[12px]" style={sans}>
          {origin ? (
            <>
              <span className="inline-flex items-center gap-2 text-[#4A4E52]">
                <span className="w-2 h-2 rounded-full bg-[#CE2B37]" aria-hidden />
                {near?.nearestOnly
                  ? `Nearest partner: ${near.nearestOnly.name}, ${near.nearestOnly.city} · ${formatKm(near.nearestOnly.distanceKm)}`
                  : "Sorted by distance"}
              </span>
              <button type="button" onClick={clearLocation} className="min-h-[32px] text-[#141517] underline underline-offset-2 hover:text-[#3F6B10] cursor-none">
                Clear location
              </button>
            </>
          ) : (
            <span className="text-[#4A4E52]">Location unavailable. Search by city or country instead.</span>
          )}
        </div>
      )}

      {/* Desktop: type tabs + country */}
      <div className="hidden lg:flex flex-wrap gap-2 items-stretch">
        {typeTabs(false)}
        <div className="basis-full">{countrySelect}</div>
      </div>

      {/* Region jump links (counts follow the active filters) */}
      {!origin && regionGroups.length > 1 && (
        <nav aria-label="Regions" className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] tracking-[0.12em] uppercase" style={mono}>
          {regionGroups.map((g) => (
            <button key={g.region} type="button" onClick={() => jumpTo(g.region)} className="min-h-[28px] text-[#4A4E52] hover:text-[#141517] cursor-none">
              {g.region} <span className="text-[#5E6266]">{g.partners.length}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );

  const list = (
    <div className="py-6">
      {showServiceEmpty ? (
        <div className="py-14 px-6 border border-dashed border-[#D3D5D7] bg-white text-center">
          <p className="text-[#4A4E52] mb-6 max-w-[360px] mx-auto leading-relaxed" style={sans}>
            Service locations coming soon. Contact Energica for authorised service.
          </p>
          <Link href="/contact" className="inline-flex items-center justify-center font-display uppercase px-8 py-4 text-sm tracking-[0.2em] bg-[#78BE20] text-[#0F1012] cursor-none">
            Contact us →
          </Link>
        </div>
      ) : results.length === 0 ? (
        <div className="py-14 px-6 border border-dashed border-[#D3D5D7] bg-white text-center">
          <p className="font-display text-2xl text-[#141517] mb-2">No partners match.</p>
          <button type="button" className="min-h-[44px] text-sm text-[#141517] underline cursor-none" onClick={() => update({ q: "", country: "" })} style={sans}>
            Clear filters
          </button>
        </div>
      ) : (
        groups.map((g) => (
          <section
            key={g.region ?? "nearest"}
            ref={(el) => {
              if (!g.region) return;
              if (el) sectionRefs.current.set(g.region, el);
              else sectionRefs.current.delete(g.region);
            }}
            className="mb-8 last:mb-0"
          >
            {g.region && (
              <div role="heading" aria-level={2} className={cn("flex items-center gap-3 mb-3", label)} style={{ ...mono, fontSize: 10, letterSpacing: "0.35em" }}>
                <span className="w-6 h-px bg-[#CE2B37]" />
                {g.region}
                <span>{g.partners.length}</span>
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              {g.partners.map((p) => (
                <PartnerCard
                  key={p.id}
                  ref={(el) => {
                    if (el) cardRefs.current.set(p.id, el);
                    else cardRefs.current.delete(p.id);
                  }}
                  partner={p}
                  active={active === p.id}
                  onSelect={() => selectFromCard(p.id)}
                  onHover={(on) => setHoverId(on ? p.id : null)}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );

  return (
    <>
      {/* ── Locator (light): fills the viewport below the site header on desktop ── */}
      <div ref={locatorRef} className="locator-grid bg-[#F2F2F0] lg:h-[calc(100dvh-96px)]">
        <div aria-hidden className="hidden lg:block" />
        <div className="px-[var(--container-px)] lg:pl-0 lg:pr-8 lg:flex lg:flex-col lg:min-h-0 lg:border-r border-[#D3D5D7]">
          <div className="sticky top-20 md:top-24 z-30 -mx-[var(--container-px)] px-[var(--container-px)] lg:mx-0 lg:px-0 bg-[#F2F2F0]">{filterBar}</div>
          <div
            ref={listRef}
            data-lenis-prevent
            className={cn("lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:-mr-8 lg:pr-8 relative", view === "map" && "hidden lg:block")}
          >
            {list}
          </div>
        </div>

        <div className={cn("relative lg:block lg:!h-full", view === "map" ? "block" : "hidden")} style={{ height: `calc(100dvh - ${headerH}px - ${barH}px)` }}>
          {(isDesktop || view === "map") && (
            <PartnerMap
              partners={results}
              activeId={active}
              hoverId={hoverId}
              focus={focus}
              fit={fit}
              onSelect={selectFromMap}
              popups={isDesktop}
              origin={origin}
              nearby={near?.lines ?? []}
              nearestOnly={near?.nearestOnly ?? null}
            />
          )}

          {/* Mobile: bottom sheet for a tapped pin */}
          {!isDesktop && sheetPartner && (
            <div className="absolute inset-x-0 bottom-0 z-20 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
              <div data-lenis-prevent className="relative max-h-[60vh] overflow-y-auto overscroll-contain shadow-[0_-12px_40px_rgba(20,21,23,0.25)]">
                <button
                  type="button"
                  onClick={() => setSheetId(null)}
                  aria-label="Close"
                  className="absolute right-1 top-1 z-10 w-11 h-11 inline-flex items-center justify-center text-[#4A4E52] hover:text-[#141517] cursor-none"
                >
                  ✕
                </button>
                <PartnerCard partner={sheetPartner} active />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: filters bottom sheet. Portalled to <body>: the page-transition
          wrapper is transformed, which would pin position:fixed to the page. */}
      {filtersOpen && createPortal(
        <div data-lenis-prevent className="lg:hidden fixed inset-0 z-[60] overscroll-contain" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50 cursor-none" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto overscroll-contain bg-[#F2F2F0] border-t border-[#D3D5D7] px-[var(--container-px)] pt-5 pb-[max(20px,env(safe-area-inset-bottom))] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className={label} style={{ ...mono, fontSize: 10, letterSpacing: "0.35em" }}>
                Filters
              </span>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close" className="w-11 h-11 -mr-3 inline-flex items-center justify-center text-[#4A4E52] cursor-none">
                ✕
              </button>
            </div>
            {typeTabs(true)}
            {countrySelect}
            <button type="button" onClick={() => setFiltersOpen(false)} className="min-h-[48px] bg-[#78BE20] text-[#0F1012] font-display uppercase text-sm tracking-[0.15em] cursor-none">
              Done
            </button>
          </div>
        </div>
      , document.body)}

      {/* ── Become a partner ─────────────────────────────────── */}
      <div className="border-t border-white/[0.06]">
        <div className="ds-container py-20 grid md:grid-cols-[1fr_auto] gap-8 items-end">
          <div>
            <span className="text-[11px] tracking-[0.3em] text-white/45 uppercase block mb-4" style={mono}>Partner network</span>
            <h2 className="font-display uppercase text-white leading-[0.9]" style={{ fontSize: "clamp(36px,5vw,64px)" }}>
              Become an <span className="text-[#78BE20]">Energica</span> partner.
            </h2>
            <p className="text-white/55 mt-4 max-w-[560px]" style={sans}>
              Interested in representing Energica as a dealer, importer or service partner in your market? Tell us about your business.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center font-display uppercase px-8 py-4 text-sm tracking-[0.2em] border border-[#78BE20] text-[#78BE20] hover:bg-[#78BE20] hover:text-black transition-all duration-200 cursor-none"
          >
            Contact us →
          </Link>
        </div>
      </div>
    </>
  );
}
