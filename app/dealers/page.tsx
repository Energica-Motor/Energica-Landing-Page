import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import PartnerFinder from "@/components/partners/PartnerFinder";
import { partners, PARTNER_TYPES } from "@/data/partners";

export const metadata: Metadata = {
  title: "Dealers, Importers & Service | Energica Motor Company",
  description:
    "Find an official Energica dealer, importer or authorised service partner near you. Test rides available at authorised locations.",
};

// Deep links: /dealers?type=dealer|importer|service
export default async function DealersPage({ searchParams }: { searchParams: Promise<{ type?: string | string[] }> }) {
  const requested = (await searchParams).type;
  const initialType = PARTNER_TYPES.find((t) => t.type.toLowerCase() === String(requested ?? "").toLowerCase())?.type ?? "All";
  const countries = new Set(partners.map((p) => p.country)).size;
  const regions = new Set(partners.map((p) => p.region)).size;

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20">
      {/* ── Page header ─────────────────────────────────────── */}
      <Container className="pt-[120px] pb-16">
        <p className="inline-flex items-center gap-3 mb-6">
          <span className="w-6 h-px bg-[#CE2B37]" />
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/60">
            {partners.length} official partners · {countries} countries · {regions} regions
          </span>
        </p>
        <h1 className="font-display text-white leading-none mb-6 uppercase" style={{ fontSize: "clamp(56px, 10vw, 140px)" }}>
          Find<br />
          <span className="text-[#78BE20]">Energica.</span>
        </h1>
        <p className="text-[length:var(--text-body)] text-white/70 max-w-[750px] leading-relaxed mb-[32px]">
          Dealers, importers and authorised service — every official Energica partner in one place. Visit a dealer to see, touch and ride our motorcycles.
        </p>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton href="/test-ride">Reserve a Test Ride →</PrimaryButton>
          <SecondaryButton href="/contact">Contact Energica</SecondaryButton>
        </div>
      </Container>

      <PartnerFinder initialType={initialType} />
    </main>
  );
}
