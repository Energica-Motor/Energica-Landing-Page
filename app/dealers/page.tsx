import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PrimaryButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Find a Dealer | Energica Motor Company",
  description:
    "Find an authorized Energica dealer near you. Test rides available at authorised locations worldwide.",
};

interface Dealer {
  name: string;
  type: "Importer" | "Dealer";
  country: string;
  address?: string;
  mapsQuery: string;
}

const regions: { region: string; dealers: Dealer[] }[] = [
  {
    region: "Europe",
    dealers: [
      {
        name: "Future Mobility",
        type: "Importer",
        country: "Belgium",
        mapsQuery: "Future+Mobility+Belgium",
      },
      {
        name: "Infidel j.d.o.o.",
        type: "Importer",
        country: "Croatia",
        address: "ul. Vukovarska 99, 21000 Split",
        mapsQuery: "ul.+Vukovarska+99+21000+Split+Croatia",
      },
      {
        name: "Alwin Otten",
        type: "Dealer",
        country: "Germany",
        address: "Industriestr. 22, 49716 Meppen",
        mapsQuery: "Industriestr.+22+49716+Meppen+Germany",
      },
      {
        name: "Autohaus Richter & Zech GmbH",
        type: "Dealer",
        country: "Germany",
        address: "Richtweg 55, 90530 Wendelstein",
        mapsQuery: "Richtweg+55+90530+Wendelstein+Germany",
      },
      {
        name: "Ramsperger Automobile GmbH & Co. KG",
        type: "Dealer",
        country: "Germany",
        address: "Robert-Bosch-Str. 9-11, 72622 Nuertingen",
        mapsQuery: "Robert-Bosch-Str.+9+72622+Nuertingen+Germany",
      },
      {
        name: "Mob'Elec 83",
        type: "Dealer",
        country: "France",
        address: "470 avenue Colonel Picot, 83100 Toulon",
        mapsQuery: "470+avenue+Colonel+Picot+83100+Toulon+France",
      },
    ],
  },
  {
    region: "Asia Pacific",
    dealers: [
      {
        name: "Rydu",
        type: "Importer",
        country: "Hong Kong",
        address: "B3 G/F, Superluck Industrial Centre Phase 2, 30-38 Tai Chung Rd, Tsuen Wan",
        mapsQuery: "30+Tai+Chung+Rd+Tsuen+Wan+Hong+Kong",
      },
    ],
  },
];

export default function DealersPage() {
  const totalDealers = regions.reduce((n, r) => n + r.dealers.length, 0);

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20">

      {/* ── Page header ─────────────────────────────────────── */}
      <Container className="py-[120px] border-b border-white/[0.04]">
        <p className="inline-flex items-center gap-3 mb-6">
          <span className="w-6 h-px bg-[#78BE20]" />
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/60">
            {totalDealers} Authorised Locations
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
      </Container>

      {/* ── Two-column layout ────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_560px] min-h-[80vh]">

          {/* LEFT: Dealer list */}
          <div className="px-8 md:px-16 py-12 border-r border-white/[0.04] overflow-y-auto">
            {regions.map((region) => (
              <div key={region.region} className="mb-14">
                {/* Region header */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/[0.05]">
                  <span className="w-2 h-2 rounded-full bg-[#78BE20]" />
                  <h2 className="font-display text-2xl text-white">{region.region}</h2>
                  <span className="ml-auto text-[10px] uppercase tracking-widest text-white/65">
                    {region.dealers.length} {region.dealers.length === 1 ? "location" : "locations"}
                  </span>
                </div>

                {/* Dealer cards */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {region.dealers.map((dealer) => (
                    <div
                      key={dealer.name}
                      className="group p-5 border border-white/[0.06] bg-[#0d0d0d] hover:border-[#78BE20]/25 transition-all duration-200"
                    >
                      {/* Type + country badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-[9px] uppercase tracking-widest text-white/60">{dealer.country}</p>
                        <span className="text-white/20">·</span>
                        <p className="text-[9px] uppercase tracking-widest text-[#78BE20]/60">{dealer.type}</p>
                      </div>

                      {/* Name */}
                      <h3 className="font-display text-white text-lg leading-tight mb-2 group-hover:text-[#78BE20] transition-colors duration-200">
                        {dealer.name}
                      </h3>

                      {/* Address */}
                      {dealer.address && (
                        <p className="text-xs text-white/50 leading-relaxed mb-4">{dealer.address}</p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 mt-auto pt-3 border-t border-white/[0.04]">
                        <a
                          href={`https://maps.google.com/?q=${dealer.mapsQuery}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] uppercase tracking-widest text-[#78BE20]/70 hover:text-[#78BE20] transition-colors"
                        >
                          View on Map →
                        </a>
                        <Link
                          href="/test-ride"
                          className="text-[9px] uppercase tracking-widest text-white/65 hover:text-white transition-colors ml-auto"
                        >
                          Book Ride
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Map placeholder (sticky) */}
          <div className="hidden lg:block">
            <div className="sticky top-20 h-[calc(100vh-80px)] bg-[#080808] border-l border-white/[0.04] flex flex-col overflow-hidden">

              {/* Map grid background — suggests cartography */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.025]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                  backgroundSize: "48px 48px",
                }}
              />
              {/* Diagonal lines suggesting roads */}
              <div aria-hidden className="absolute inset-0 opacity-[0.015]"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(-45deg, rgba(255,255,255,1) 1px, transparent 1px)",
                  backgroundSize: "96px 96px",
                }}>
              </div>

              {/* Center marker */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                {/* Pin icon */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-[#78BE20]/40 flex items-center justify-center bg-[#78BE20]/10">
                    <div className="w-3 h-3 rounded-full bg-[#78BE20]" />
                  </div>
                  {/* Pulse rings */}
                  <div className="absolute inset-[-8px] rounded-full border border-[#78BE20]/20 animate-ping" style={{ animationDuration: "2s" }} />
                  <div className="absolute inset-[-16px] rounded-full border border-[#78BE20]/10 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
                </div>

                <div className="text-center px-8">
                  <p className="font-display text-white text-xl mb-2">Interactive Map</p>
                  <p className="text-xs text-white/60 leading-relaxed max-w-[220px]">
                    Contact your nearest dealer for directions and test ride availability.
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mt-4">
                  {[["2", "Regions"], [totalDealers.toString(), "Locations"], ["3", "Countries"]].map(([val, lbl]) => (
                    <div key={lbl} className="text-center">
                      <p className="font-display text-2xl text-white">{val}</p>
                      <p className="text-[9px] uppercase tracking-widest text-white/65">{lbl}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom bar */}
              <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-white/[0.05] bg-[#080808]/80 backdrop-blur-sm">
                <p className="text-[9px] uppercase tracking-widest text-white/60 text-center">
                  Authorised dealers — Europe &amp; Asia Pacific
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
