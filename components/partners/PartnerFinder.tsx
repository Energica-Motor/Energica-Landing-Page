"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { TYPE_LABELS, type Partner } from "@/data/partners";
import {
  countByType,
  countriesFor,
  filterPartners,
  groupByRegion,
  sortByDistance,
  stateToQuery,
  type LatLng,
  type LocatorState,
  type TypeFilter,
} from "@/lib/partners";
import PartnerCard from "./PartnerCard";
import type { MapFocus } from "./PartnerMap";

// MapLibre is large and browser-only: load it after the list renders.
const PartnerMap = dynamic(() => import("./PartnerMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0F1012]" />,
});

// Start downloading the map code as soon as the page hydrates (desktop shows the
// map immediately), instead of waiting for the panel to render.
const preloadMap = () => import("./PartnerMap").then((m) => m.preloadMapLibrary()).catch(() => {});

const mono = { fontFamily: "var(--font-ibm-mono)" } as const;
const sans = { fontFamily: "var(--font-ibm-sans)" } as const;
const TYPE_ORDER: TypeFilter[] = ["all", "dealer", "importer", "service"];
const typeLabel = (t: TypeFilter) => (t === "all" ? "All" : TYPE_LABELS[t].plural);
const field =
  "w-full min-h-[44px] bg-[#0f0f0f] border border-white/[0.08] hover:border-white/20 focus:border-[#78BE20]/60 focus:outline-none text-white text-sm transition-colors";
const iconBtn =
  "shrink-0 inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] border transition-colors cursor-none";

export default function PartnerFinder({ partners, initial }: { partners: Partner[]; initial: LocatorState }) {
  const [state, setState] = useState<LocatorState>(initial);
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // false until measured: CSS decides the first paint, so phones never flash the desktop map.
  const [isDesktop, setIsDesktop] = useState(false);
  const [headerH, setHeaderH] = useState(80);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const focusSeq = useRef(0);
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
  const countries = useMemo(() => countriesFor(partners, state.type), [partners, state.type]);
  const results = useMemo(() => sortByDistance(filterPartners(partners, state), origin), [partners, state, origin]);
  const groups = useMemo(() => groupByRegion(results), [results]);
  const active = activeId && results.some((p) => p.id === activeId) ? activeId : null;
  const activeFilters = Number(state.type !== "all") + Number(!!state.country);

  const update = (patch: Partial<LocatorState>) =>
    setState((s) => {
      const next = { ...s, ...patch };
      if (patch.type && next.country && !countriesFor(partners, next.type).includes(next.country)) next.country = "";
      return next;
    });

  function toggleLocation() {
    if (origin) {
      setOrigin(null);
      return;
    }
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false), // denied or unavailable: do nothing, show no error
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

  const selectFromCard = (id: string) => {
    setActiveId(id);
    setFocus({ id, nonce: ++focusSeq.current, fly: true });
  };

  const selectFromMap = useCallback(
    (id: string) => {
      setActiveId(id);
      setFocus({ id, nonce: ++focusSeq.current, fly: false });
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
      className={cn("flex border border-white/[0.08]", wrap ? "grid grid-cols-2" : "overflow-x-auto no-scrollbar flex-[2_1_320px] min-w-0")}
    >
      {TYPE_ORDER.map((t) => (
        <button
          key={t}
          type="button"
          aria-pressed={state.type === t}
          onClick={() => update({ type: t })}
          className={cn(
            "min-h-[44px] px-2 text-[11px] tracking-[0.06em] uppercase whitespace-nowrap transition-colors cursor-none",
            wrap ? "border-white/[0.08] [&:nth-child(odd)]:border-r [&:nth-child(-n+2)]:border-b" : "flex-1 shrink-0 border-r border-white/[0.08] last:border-r-0",
            state.type === t ? "bg-[#78BE20] text-[#0F1012]" : "text-white/70 hover:text-white hover:bg-white/[0.04]",
          )}
          style={mono}
        >
          {typeLabel(t)} <span className={state.type === t ? "text-[#0F1012]/70" : "text-white/35"}>{counts[t]}</span>
        </button>
      ))}
    </div>
  );

  const countrySelect = (
    <label className="relative block min-w-[150px]">
      <span className="sr-only">Country</span>
      <select value={state.country} onChange={(e) => update({ country: e.target.value })} className={cn(field, "appearance-none pl-4 pr-10 cursor-none")} style={sans}>
        <option value="">All countries</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/50 text-xs">▾</span>
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
    <div ref={barRef} className="bg-[#0a0a0a] border-b border-white/[0.06] py-3 lg:py-4 flex flex-col gap-3">
      <div className="flex gap-2">
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Search city, country or partner</span>
          <input
            type="search"
            value={state.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search city, country or partner"
            className={cn(field, "px-3 lg:px-4 placeholder:text-white/35")}
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
            origin ? "border-[#78BE20] text-[#78BE20] bg-[#78BE20]/[0.08]" : "border-white/20 text-white hover:border-white/50",
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
          className={cn(iconBtn, "lg:hidden relative px-3", activeFilters ? "border-[#78BE20] text-[#78BE20]" : "border-white/20 text-white")}
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
        <div className="lg:hidden flex shrink-0 border border-white/20" role="group" aria-label="View">
          {(["list", "map"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => switchView(v)}
              className={cn("min-h-[42px] w-11 text-[10px] tracking-[0.12em] uppercase transition-colors cursor-none", view === v ? "bg-white text-[#0F1012]" : "text-white/70")}
              style={mono}
            >
              {v === "list" ? "List" : "Map"}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: type tabs + country */}
      <div className="hidden lg:flex flex-wrap gap-2 items-stretch">
        {typeTabs(false)}
        <div className="flex-[1_1_150px]">{countrySelect}</div>
      </div>
    </div>
  );

  const list = (
    <div className="py-6">
      {showServiceEmpty ? (
        <div className="py-14 px-6 border border-dashed border-white/10 text-center">
          <p className="text-white/70 mb-6 max-w-[360px] mx-auto leading-relaxed" style={sans}>
            Service locations coming soon. Contact Energica for authorised service.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center font-display uppercase px-8 py-4 text-sm tracking-[0.2em] border border-[#78BE20] text-[#78BE20] hover:bg-[#78BE20] hover:text-black transition-all duration-200 cursor-none"
          >
            Contact us →
          </Link>
        </div>
      ) : results.length === 0 ? (
        <div className="py-14 px-6 border border-dashed border-white/10 text-center">
          <p className="font-display text-2xl text-white mb-2">No partners match.</p>
          <button type="button" className="min-h-[44px] text-sm text-[#78BE20] cursor-none" onClick={() => update({ q: "", country: "" })} style={sans}>
            Clear filters
          </button>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.region} className="mb-8 last:mb-0">
            <div role="heading" aria-level={2} className="flex items-center gap-3 uppercase text-white/60 mb-3" style={{ ...mono, fontSize: 10, letterSpacing: "0.35em" }}>
              <span className="w-6 h-px bg-[#CE2B37]" />
              {g.region}
              <span className="text-white/30">{g.partners.length}</span>
            </div>
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
      {/* ── Locator: fills the viewport below the site header on desktop ── */}
      <div ref={locatorRef} className="locator-grid border-t border-white/[0.06] lg:h-[calc(100dvh-96px)]">
        <div aria-hidden className="hidden lg:block" />
        <div className="px-[var(--container-px)] lg:pl-0 lg:pr-8 lg:flex lg:flex-col lg:min-h-0 lg:border-r border-white/[0.06]">
          <div className="sticky top-20 md:top-24 z-30 -mx-[var(--container-px)] px-[var(--container-px)] lg:mx-0 lg:px-0 bg-[#0a0a0a]">{filterBar}</div>
          <div className={cn("lg:flex-1 lg:min-h-0 lg:overflow-y-auto overscroll-contain lg:-mr-8 lg:pr-8", view === "map" && "hidden lg:block")}>{list}</div>
        </div>

        <div className={cn("relative lg:block lg:!h-full", view === "map" ? "block" : "hidden")} style={{ height: `calc(100dvh - ${headerH}px - ${barH}px)` }}>
          {(isDesktop || view === "map") && (
            <PartnerMap partners={results} activeId={active} hoverId={hoverId} focus={focus} onSelect={selectFromMap} popups={isDesktop} />
          )}

          {/* Mobile: bottom sheet for a tapped pin */}
          {!isDesktop && sheetPartner && (
            <div className="absolute inset-x-0 bottom-0 z-20 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
              <div className="relative max-h-[60vh] overflow-y-auto shadow-[0_-12px_40px_rgba(0,0,0,0.6)]">
                <button
                  type="button"
                  onClick={() => setSheetId(null)}
                  aria-label="Close"
                  className="absolute right-1 top-1 z-10 w-11 h-11 inline-flex items-center justify-center text-white/70 hover:text-white cursor-none"
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
        <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60 cursor-none" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 bg-[#0d0d0d] border-t border-white/10 px-[var(--container-px)] pt-5 pb-[max(20px,env(safe-area-inset-bottom))] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="uppercase text-white/60" style={{ ...mono, fontSize: 10, letterSpacing: "0.35em" }}>
                Filters
              </span>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close" className="w-11 h-11 -mr-3 inline-flex items-center justify-center text-white/70 cursor-none">
                ✕
              </button>
            </div>
            {typeTabs(true)}
            {countrySelect}
            <button type="button" onClick={() => setFiltersOpen(false)} className="btn-primary min-h-[48px] font-display uppercase text-sm tracking-[0.15em] cursor-none">
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
