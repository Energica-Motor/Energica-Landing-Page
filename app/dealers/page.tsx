import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PrimaryButton } from "@/components/ui/Button";
import DealerList from "@/components/dealers/DealerList";
import { dealerCounts } from "@/data/dealers";

export const metadata: Metadata = {
  title: "Find a Dealer | Energica Motor Company",
  description:
    "Find an authorized Energica dealer near you. Test rides available at authorised locations worldwide.",
};

export default function DealersPage() {

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20">

      {/* ── Page header ─────────────────────────────────────── */}
      <Container className="ds-section border-b border-white/[0.04]">
        <p className="inline-flex items-center gap-3 mb-6">
          <span className="w-6 h-px bg-[#CE2B37]" />
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/60">
            {dealerCounts.locations} Authorised Locations
          </span>
        </p>
        <h1 className="font-display text-white leading-none mb-6" style={{ fontSize: "clamp(56px, 10vw, 140px)" }}>
          Find a<br />
          <span className="text-[#78BE20]">Dealer</span>
        </h1>
        <p className="text-[length:var(--text-body)] text-white/70 max-w-[750px] leading-relaxed mb-[32px]">
          Visit an authorised Energica dealer to see, touch, and ride our motorcycles. Our specialists are ready to help you configure your perfect match.
        </p>
        <PrimaryButton href="/test-ride">Reserve a Test Ride →</PrimaryButton>

        {/* Counts, worked out from the dealer list */}
        <dl className="flex gap-10 mt-12">
          {([["Regions", dealerCounts.regions], ["Locations", dealerCounts.locations], ["Countries", dealerCounts.countries]] as const).map(([label, value]) => (
            <div key={label} className="flex flex-col-reverse">
              <dt className="text-[9px] uppercase tracking-widest text-white/65 mt-1">{label}</dt>
              <dd className="font-display text-3xl text-white">{value}</dd>
            </div>
          ))}
        </dl>
      </Container>

      {/* ── Dealer list (full width) ──────────────────────────── */}
      <div className="ds-container">
        <DealerList />
      </div>
    </main>
  );
}
