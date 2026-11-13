import type { Metadata } from "next";
import PartnerFinder from "@/components/partners/PartnerFinder";
import { visiblePartners } from "@/data/partners";
import { countriesFor, parseState, summary } from "@/lib/partners";

export const metadata: Metadata = {
  title: "Find a Dealer | Energica Motor Company",
  description:
    "Find an authorized Energica dealer near you. Test rides available at authorised locations worldwide.",
};

// Shareable filtered views: /dealers?type=dealer&country=Germany&q=meppen
export default async function DealersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const partners = visiblePartners();
  const initial = parseState(await searchParams, countriesFor(partners, "all"));
  const s = summary(partners);

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20 md:pt-24">
      {/* ── Compact header ──────────────────────────────────── */}
      <header className="px-5 md:px-8 lg:px-[clamp(24px,4vw,64px)] pt-10 pb-8 lg:pt-12 lg:pb-10">
        <p className="inline-flex items-center gap-3 mb-4">
          <span className="w-6 h-px bg-[#CE2B37]" />
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/60">
            {s.partners} official partners · {s.countries} countries · {s.regions} regions
          </span>
        </p>
        <div className="flex flex-col lg:flex-row lg:items-end gap-3 lg:gap-12">
          <h1 className="font-display uppercase text-white leading-[0.9] shrink-0" style={{ fontSize: "clamp(40px, 5vw, 72px)" }}>
            Find <span className="text-[#78BE20]">Energica</span>
          </h1>
          <p className="text-[length:var(--text-body)] text-white/70 max-w-[640px] leading-relaxed lg:pb-1.5">
            Visit an authorised Energica dealer to see, touch, and ride our motorcycles. Our specialists are ready to help you configure your perfect match.
          </p>
        </div>
      </header>

      <PartnerFinder partners={partners} initial={initial} />
    </main>
  );
}
