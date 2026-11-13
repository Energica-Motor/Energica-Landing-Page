"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { partners, PARTNER_TYPES, SERVICE_EMAIL, type Partner, type PartnerType } from "@/data/partners";

export type Filter = PartnerType | "All";
const mono = { fontFamily: "var(--font-ibm-mono)" } as const;
const sans = { fontFamily: "var(--font-ibm-sans)" } as const;
const mapsLink = (p: Partner) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.mapsQuery)}`;
const typeInfo = (t: PartnerType) => PARTNER_TYPES.find((x) => x.type === t)!;

export default function PartnerFinder({ initialType = "All" }: { initialType?: Filter }) {
  const [type, setType] = useState<Filter>(initialType);
  const [country, setCountry] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Partner | null>(null);
  const [mapAllowed, setMapAllowed] = useState(false);

  function chooseType(t: Filter) {
    setType(t);
    setCountry("All");
    const url = new URL(window.location.href);
    if (t === "All") url.searchParams.delete("type");
    else url.searchParams.set("type", t.toLowerCase());
    window.history.replaceState(null, "", url);
  }

  const ofType = useMemo(() => partners.filter((p) => type === "All" || p.type === type), [type]);
  const countries = useMemo(
    () => [...new Set(ofType.map((p) => p.country))].sort().map((c) => [c, ofType.filter((p) => p.country === c).length] as const),
    [ofType],
  );
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ofType.filter(
      (p) =>
        (country === "All" || p.country === country) &&
        (!q || [p.name, p.country, p.city, p.address].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [ofType, country, query]);
  const regions = useMemo(() => [...new Set(results.map((p) => p.region))], [results]);
  const active = selected && results.includes(selected) ? selected : results[0] ?? null;

  return (
    <>
      {/* ── Partner types ─────────────────────────────────────── */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] py-12">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[11px] tracking-[0.3em] text-white/45 uppercase" style={mono}>Choose a partner type</span>
            <button
              type="button"
              onClick={() => chooseType("All")}
              aria-pressed={type === "All"}
              className={cn(
                "text-[11px] tracking-[0.25em] uppercase transition-colors cursor-none",
                type === "All" ? "text-[#78BE20]" : "text-white/55 hover:text-white",
              )}
              style={mono}
            >
              {type === "All" ? "● " : ""}All partners ({partners.length})
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {PARTNER_TYPES.map((t, i) => {
              const count = partners.filter((p) => p.type === t.type).length;
              const on = type === t.type;
              return (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => chooseType(on ? "All" : t.type)}
                  aria-pressed={on}
                  className={cn(
                    "group relative text-left p-6 md:p-7 border bg-[#0d0d0d] transition-all duration-200 cursor-none",
                    on ? "border-[#78BE20]/60 bg-[#101a08]" : "border-white/[0.07] hover:border-white/25",
                  )}
                >
                  <span className={cn("absolute left-0 top-0 h-[3px] transition-all duration-300", on ? "w-full bg-[#78BE20]" : "w-0 bg-[#78BE20] group-hover:w-12")} />
                  <div className="flex items-start justify-between mb-8">
                    <span className="text-[11px] tracking-[0.3em] text-white/40" style={mono}>0{i + 1}</span>
                    <span className={cn("font-display leading-none", on ? "text-[#78BE20]" : "text-white")} style={{ fontSize: "clamp(40px,4vw,56px)" }}>
                      {count || "—"}
                    </span>
                  </div>
                  <h2 className="font-display uppercase text-white text-3xl leading-none mb-3">{t.label}</h2>
                  <p className="text-sm text-white/55 leading-relaxed max-w-[340px]" style={sans}>
                    {count ? t.description : "Locations coming soon."}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {type === "Service" && results.length === 0 ? (
        <ServiceComingSoon />
      ) : (
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_540px]">
            {/* ── List ─────────────────────────────────────────── */}
            <div className="px-[clamp(24px,4vw,64px)] py-12 lg:border-r border-white/[0.06] min-w-0">
              {/* Filters */}
              <div className="flex flex-col gap-5 mb-12">
                <label className="relative block max-w-[520px]">
                  <span className="sr-only">Search by city, country or partner</span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search city, country or partner"
                    className="w-full bg-transparent border-b border-white/20 focus:border-[#78BE20] outline-none py-3 pr-10 text-white placeholder:text-white/35 text-base transition-colors"
                    style={sans}
                  />
                  <span aria-hidden className="absolute right-1 top-1/2 -translate-y-1/2 text-white/35 text-lg">⌕</span>
                </label>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by country">
                  {[["All", ofType.length] as const, ...countries].map(([c, n]) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCountry(c)}
                      aria-pressed={country === c}
                      className={cn(
                        "px-3 py-2 border text-[11px] tracking-[0.18em] uppercase transition-colors cursor-none",
                        country === c ? "border-[#78BE20] text-[#78BE20] bg-[#78BE20]/[0.06]" : "border-white/10 text-white/60 hover:border-white/30 hover:text-white",
                      )}
                      style={mono}
                    >
                      {c === "All" ? "All countries" : c} <span className="text-white/35 ml-1">{n}</span>
                    </button>
                  ))}
                </div>
              </div>

              {results.length === 0 ? (
                <div className="py-16 border border-dashed border-white/10 text-center px-6">
                  <p className="font-display text-2xl text-white mb-2">No partners match.</p>
                  <p className="text-sm text-white/55" style={sans}>
                    Try another city or country, or{" "}
                    <button type="button" className="text-[#78BE20] cursor-none" onClick={() => { setQuery(""); setCountry("All"); }}>clear the filters</button>.
                  </p>
                </div>
              ) : (
                regions.map((region) => {
                  const list = results.filter((p) => p.region === region);
                  return (
                    <section key={region} className="mb-14 last:mb-0">
                      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/[0.06]">
                        <span className="w-2 h-2 bg-[#78BE20]" />
                        <h2 className="font-display text-2xl uppercase text-white">{region}</h2>
                        <span className="ml-auto text-[10px] uppercase tracking-[0.25em] text-white/50" style={mono}>
                          {list.length} {list.length === 1 ? "partner" : "partners"}
                        </span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {list.map((p) => (
                          <PartnerCard key={p.name} partner={p} active={active === p} onSelect={() => setSelected(p)} />
                        ))}
                      </div>
                    </section>
                  );
                })
              )}
            </div>

            {/* ── Map panel ────────────────────────────────────── */}
            <aside className="hidden lg:block">
              <div className="sticky top-20 h-[calc(100vh-80px)] flex flex-col bg-[#080808]">
                {active && (
                  <div className="p-8 border-b border-white/[0.06]">
                    <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={mono}>
                      <span className="text-white/55">{active.country}</span>
                      <span className="text-white/20 mx-2">·</span>
                      <span className="text-[#78BE20]">{typeInfo(active.type).short}</span>
                    </p>
                    <h3 className="font-display uppercase text-white text-3xl leading-none mb-3">{active.name}</h3>
                    <p className="text-sm text-white/55 leading-relaxed mb-5" style={sans}>{active.address ?? active.country}</p>
                    <a
                      href={mapsLink(active)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] uppercase tracking-[0.25em] text-[#78BE20] hover:text-white transition-colors cursor-none"
                      style={mono}
                    >
                      Get directions ↗
                    </a>
                  </div>
                )}
                <div className="relative flex-1 overflow-hidden">
                  {mapAllowed && active ? (
                    <iframe
                      key={active.mapsQuery}
                      title={`Map: ${active.name}`}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(active.mapsQuery)}&output=embed`}
                      className="absolute inset-0 w-full h-full border-0 grayscale-[0.85] invert-[0.92] hue-rotate-180 contrast-[0.9]"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <MapPlaceholder onLoad={() => setMapAllowed(true)} disabled={!active} />
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}

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

function PartnerCard({ partner: p, active, onSelect }: { partner: Partner; active: boolean; onSelect: () => void }) {
  return (
    <article
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col p-6 border bg-[#0d0d0d] transition-all duration-200 cursor-none",
        active ? "border-white/[0.07] lg:border-[#78BE20]/50" : "border-white/[0.07] hover:border-white/20",
      )}
    >
      <span className={cn("absolute left-0 top-0 bottom-0 w-[3px] transition-colors hidden lg:block", active ? "bg-[#78BE20]" : "bg-transparent")} />
      <p className="text-[10px] tracking-[0.25em] uppercase mb-3" style={mono}>
        <span className="text-white/55">{p.country}</span>
        <span className="text-white/20 mx-2">·</span>
        <span className="text-[#78BE20]">{typeInfo(p.type).short}</span>
      </p>
      <h3 className="font-display uppercase text-white text-xl leading-tight mb-2 group-hover:text-[#78BE20] transition-colors">{p.name}</h3>
      <p className="text-[13px] text-white/50 leading-relaxed mb-6" style={sans}>
        {p.address ?? `${p.country} — contact for location`}
      </p>
      <div className="mt-auto flex items-center gap-4 pt-4 border-t border-white/[0.06]">
        <a
          href={mapsLink(p)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] uppercase tracking-[0.22em] text-[#78BE20]/80 hover:text-[#78BE20] transition-colors cursor-none"
          style={mono}
        >
          Directions ↗
        </a>
        {p.type !== "Service" && (
          <Link
            href="/test-ride"
            onClick={(e) => e.stopPropagation()}
            className="ml-auto text-[10px] uppercase tracking-[0.22em] text-white/60 hover:text-white transition-colors cursor-none"
            style={mono}
          >
            Book a test ride →
          </Link>
        )}
      </div>
    </article>
  );
}

function MapPlaceholder({ onLoad, disabled }: { onLoad: () => void; disabled: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mb-6">
        <div className="w-12 h-12 rounded-full border-2 border-[#78BE20]/40 flex items-center justify-center bg-[#78BE20]/10">
          <div className="w-3 h-3 rounded-full bg-[#78BE20]" />
        </div>
      </div>
      <p className="relative font-display uppercase text-white text-xl mb-2">Map preview</p>
      <p className="relative text-xs text-white/50 leading-relaxed max-w-[260px] mb-6" style={sans}>
        Loads Google Maps for the selected partner. Google may set cookies.
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={onLoad}
        className="relative inline-flex items-center justify-center font-display uppercase px-6 py-3 text-sm tracking-[0.15em] border border-white/20 text-white hover:border-[#78BE20] hover:text-[#78BE20] transition-all duration-200 cursor-none disabled:opacity-40"
      >
        Show map
      </button>
    </div>
  );
}

function ServiceComingSoon() {
  return (
    <div className="max-w-[1400px] mx-auto px-[clamp(24px,4vw,64px)] py-20">
      <div className="border border-white/[0.07] bg-[#0d0d0d] p-10 md:p-14 grid md:grid-cols-[1fr_auto] gap-10 items-center">
        <div>
          <span className="text-[11px] tracking-[0.3em] text-[#78BE20] uppercase block mb-4" style={mono}>Authorised service</span>
          <h2 className="font-display uppercase text-white leading-[0.9] mb-4" style={{ fontSize: "clamp(32px,4vw,52px)" }}>
            Service network coming soon.
          </h2>
          <p className="text-white/55 max-w-[560px] leading-relaxed" style={sans}>
            Authorised service centre locations are being added. Until then, email our service team or use the owner support form.
          </p>
        </div>
        <div className="flex flex-col gap-3 min-w-[240px]">
          <a
            href={`mailto:${SERVICE_EMAIL}`}
            className="inline-flex items-center justify-center font-display uppercase px-6 py-3 text-sm tracking-[0.15em] bg-[#78BE20] text-black hover:bg-[#5a9018] transition-all duration-200 cursor-none btn-electric"
          >
            Email service →
          </a>
          <Link
            href="/owners"
            className="inline-flex items-center justify-center font-display uppercase px-6 py-3 text-sm tracking-[0.15em] border border-white/20 text-white hover:border-white/50 transition-all duration-200 cursor-none"
          >
            Owner support
          </Link>
          <p className="text-[11px] text-white/40 text-center" style={mono}>{SERVICE_EMAIL}</p>
        </div>
      </div>
    </div>
  );
}
