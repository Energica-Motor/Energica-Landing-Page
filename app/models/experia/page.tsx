import { getModelById, models } from "@/data/models";
import ModelSchema from "@/components/seo/ModelSchema";
import ModelHero from "@/components/models/ModelHero";
import SpecsBar from "@/components/models/SpecsBar";
import StorySection from "@/components/models/StorySection";
import ColorSelector from "@/components/models/ColorSelector";
import GalleryGrid from "@/components/models/GalleryGrid";
import SpecsAccordion from "@/components/models/SpecsAccordion";
import NextModelCTA from "@/components/models/NextModelCTA";
import type { Metadata } from "next";
import { modelMetadata, modelSchema } from "@/lib/model-meta";
import { notFound } from "next/navigation";

export const metadata: Metadata = modelMetadata("experia");

export default function ExperiaPage() {
  const model = getModelById("experia");
  if (!model) notFound();

  const nextModel = models[1]; // EsseEsse9

  return (
    <main className="bg-[#0a0a0a]">
      <ModelSchema
        name="Experia"
        description={modelSchema("experia").description}
        image="/images/Pagina%20Experia/EXPERIA_Bormio%20Ice.webp"
        url="/models/experia"
        specs={modelSchema("experia").specs}
      />
      {/* § 1 — Hero */}
      <ModelHero model={model} />

      {/* § 2 — Key specs bar */}
      <SpecsBar specs={model.keySpecs} />

      {/* § 3 — Story: sticky lifestyle image + scrolling paragraphs */}
      <StorySection model={model} />

      {/* § 4 — Colour selector */}
      <section className="bg-[#0a0a0a] border-t border-white/[0.04]">
        <ColorSelector colors={model.colors} />
      </section>

      {/* § 5 — Gallery */}
      <section className="bg-[#080808] border-t border-white/[0.04]">
        <div className="ds-container ds-section">
          <div className="mb-10">
            <p className="inline-flex items-center gap-3 mb-3">
              <span className="w-6 h-px bg-[#CE2B37]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/65">
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
        <div className="ds-container ds-section *:max-w-4xl">
          <div className="mb-12">
            <p className="inline-flex items-center gap-3 mb-3">
              <span className="w-6 h-px bg-[#CE2B37]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/65">
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
