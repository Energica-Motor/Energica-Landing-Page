"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

const mono = { fontFamily: "var(--font-ibm-mono)" } as const;
const sans = { fontFamily: "var(--font-ibm-sans)" } as const;
const TYPE_ORDER: TypeFilter[] = ["all", "dealer", "importer", "service"];
const typeLabel = (t: TypeFilter) => (t === "all" ? "All" : TYPE_LABELS[t].plural);

export default function PartnerFinder({ partners, initial }: { partners: Partner[]; initial: LocatorState }) {
  const [state, setState] = useState<LocatorState>(initial);
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const [sheetId, setSheetId] = useState<string | null>(null);
  // false until measured: CSS decides the first paint, so phones never flash the desktop map.
  const [isDesktop, setIsDesktop] = useState(false);
  const [headerH, setHeaderH] = useState(80);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const focusSeq = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);
  const [barH, setBarH] = useState(0);

  // Desktop (≥1024px) vs mobile layout.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const md = window.matchMedia("(min-width: 768px)"); // site header: 80px, 96px from md
    const sync = () => {
      setIsDesktop(mq.matches);
      setHeaderH(md.matches ? 96 : 80);
    };
    sync();
    mq.addEventListener("change", sync);
    md.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      md.removeEventListener("change", sync);
    };
  }, []);

  // Mobile: the map fills the screen under the sticky filter bar.
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

  const update = (patch: Partial<LocatorState>) =>
    setState((s) => {
      const next = { ...s, ...patch };
      // Drop a country the new type filter doesn't have.
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

  // Card → map: highlight and fly.
  const selectFromCard = (id: string) => {
    setActiveId(id);
    setFocus({ id, nonce: ++focusSeq.current, fly: true });
  };

  // Map → card: highlight, scroll to it (desktop) or open the bottom sheet (mobile).
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

  const filterBar = (
    <div ref={barRef} className="bg-[#0a0a0a] border-b border-white/[0.06] px-5 md:px-8 py-4 flex flex-col gap-3">
      <div className="flex gap-2">
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Search city, country or partner</span>
          <input
            type="search"
            value={state.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search city, country or partner"
            className="w-full min-h-[44px] bg-[#0f0f0f] border border-white/[0.08] hover:border-white/20 focus:border-[#78BE20]/60 focus:outline-none text-white placeholder:text-white/35 px-4 text-sm transition-colors"
            style={sans}
          />
        </label>
        <button
          type="button"
          onClick={toggleLocation}
          aria-pressed={!!origin}
          disabled={locating}
          className={cn(
            "shrink-0 inline-flex items-center gap-2 min-h-[44px] min-w-[44px] justify-center px-3 md:px-4 border font-display uppercase text-[12px] tracking-[0.12em] transition-colors cursor-none disabled:opacity-60",
            origin ? "border-[#78BE20] text-[#78BE20] bg-[#78BE20]/[0.08]" : "border-white/20 text-white hover:border-white/50",
          )}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            <circle cx="12" cy="12" r="7.5" />
          </svg>
          <span className="hidden sm:inline">Use my location</span>
          <span className="sr-only sm:hidden">Use my location</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-stretch">
        <div role="group" aria-label="Partner type" className="flex flex-1 min-w-[260px] border border-white/[0.08]">
          {TYPE_ORDER.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={state.type === t}
              onClick={() => update({ type: t })}
              className={cn(
                "flex-1 min-h-[44px] px-2 text-[11px] tracking-[0.14em] uppercase transition-colors cursor-none border-r border-white/[0.08] last:border-r-0 whitespace-nowrap",
                state.type === t ? "bg-[#78BE20] text-[#0F1012]" : "text-white/70 hover:text-white hover:bg-white/[0.04]",
              )}
              style={mono}
            >
              {typeLabel(t)} <span className={state.type === t ? "text-[#0F1012]/70" : "text-white/35"}>{counts[t]}</span>
            </button>
          ))}
        </div>
        <label className="relative min-w-[150px] flex-1 sm:flex-none">
          <span className="sr-only">Country</span>
          <select
            value={state.country}
            onChange={(e) => update({ country: e.target.value })}
            className="w-full min-h-[44px] appearance-none bg-[#0f0f0f] border border-white/[0.08] hover:border-white/20 focus:border-[#78BE20]/60 focus:outline-none text-white text-sm pl-4 pr-10 transition-colors cursor-none"
            style={sans}
          >
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/50 text-xs">▾</span>
        </label>
      </div>

      <div className="flex lg:hidden border border-white/[0.08]" role="group" aria-label="View">
        {(["list", "map"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => {
              setView(v);
              setSheetId(null);
            }}
            className={cn(
              "flex-1 min-h-[44px] text-[11px] tracking-[0.2em] uppercase transition-colors cursor-none",
              view === v ? "bg-white text-[#0F1012]" : "text-white/70",
            )}
            style={mono}
          >
            {v === "list" ? "List" : "Map"}
          </button>
        ))}
      </div>
    </div>
  );

  const list = (
    <div className="px-5 md:px-8 py-6">
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
            {/* Same size as the eyebrow labels (not the global h2 scale). */}
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
      {/* ── Locator ──────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] lg:h-[calc(100vh-96px)] lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="lg:flex lg:flex-col lg:min-h-0 lg:border-r border-white/[0.06]">
          <div className="sticky top-20 md:top-24 z-30 lg:static">{filterBar}</div>
          <div className={cn("lg:flex-1 lg:min-h-0 lg:overflow-y-auto overscroll-contain", view === "map" && "hidden lg:block")}>{list}</div>
        </div>

        <div
          className={cn("relative lg:block lg:!h-full", view === "map" ? "block" : "hidden")}
          style={{ height: `calc(100dvh - ${headerH}px - ${barH}px)` }}
        >
          {(isDesktop || view === "map") && (
            <PartnerMap partners={results} activeId={active} hoverId={hoverId} focus={focus} onSelect={selectFromMap} popups={isDesktop} />
          )}

          {/* Mobile bottom sheet */}
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

      {/* ── Become a partner ─────────────────────────────────── */}
      <div className="border-t border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] py-20 grid md:grid-cols-[1fr_auto] gap-8 items-end">
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
