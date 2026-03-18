import { getModelById, models } from "@/data/models";
import ModelHero from "@/components/models/ModelHero";
import SpecsBar from "@/components/models/SpecsBar";
import StorySection from "@/components/models/StorySection";
import ColorSelector from "@/components/models/ColorSelector";
import GalleryGrid from "@/components/models/GalleryGrid";
import SpecsAccordion from "@/components/models/SpecsAccordion";
import NextModelCTA from "@/components/models/NextModelCTA";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Experia | Energica Motor Company",
  description:
    "Europe's first electric green tourer. 420 km city range, 102 HP, CCS DC fast charging. Made in Italy.",
};

export default function ExperiaPage() {
  const model = getModelById("experia");
  if (!model) notFound();

  const nextModel = models[1]; // EsseEsse9

  return (
    <main className="bg-[#0a0a0a]">
      {/* § 1 — Hero */}
      <ModelHero model={model} />

      {/* § 2 — Key specs bar */}
      <SpecsBar specs={model.keySpecs} />

      {/* § 3 — Story: sticky lifestyle image + scrolling paragraphs */}
      <StorySection model={model} />

      {/* § 4 — Colour selector */}
      <section className="bg-[#0a0a0a] border-t border-white/[0.04]">
        <div className="max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)] py-[120px]">
          <ColorSelector colors={model.colors} />
        </div>
      </section>

      {/* § 5 — Gallery */}
      <section className="bg-[#080808] border-t border-white/[0.04]">
        <div className="max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)] py-[120px]">
          <div className="mb-10">
            <p className="inline-flex items-center gap-3 mb-3">
              <span className="w-6 h-px bg-[#78BE20]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/35">
                Gallery
              </span>
            </p>
            <h2
              className="font-display text-white leading-none"
              style={{ fontSize: "clamp(36px, 5vw, 72px)" }}
            >
              {model.name} in the Wild
            </h2>
          </div>
          <GalleryGrid images={model.lifestyleImages} altPrefix={model.name} />
        </div>
      </section>

      {/* § 6 — Full specs accordion */}
      <section className="bg-[#0a0a0a] border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto px-[clamp(24px,4vw,64px)] py-[120px]">
          <div className="mb-12">
            <p className="inline-flex items-center gap-3 mb-3">
              <span className="w-6 h-px bg-[#78BE20]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/35">
                Full Specifications
              </span>
            </p>
            <h2
              className="font-display text-white leading-none"
              style={{ fontSize: "clamp(36px, 4vw, 60px)" }}
            >
              Technical Data
            </h2>
          </div>
          <SpecsAccordion specs={model.specs} />
        </div>
      </section>

      {/* § 7 — Next model CTA */}
      {nextModel && <NextModelCTA nextModel={nextModel} />}
    </main>
  );
}
