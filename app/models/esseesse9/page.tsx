import { getModelById, models } from "@/data/models";
import ModelSchema from "@/components/seo/ModelSchema";
import ModelHero from "@/components/models/ModelHero";
import SpecsBar from "@/components/models/SpecsBar";
import StorySection from "@/components/models/StorySection";
import ColorSelector from "@/components/models/ColorSelector";
import GalleryGrid from "@/components/models/GalleryGrid";
import SpecsAccordion from "@/components/models/SpecsAccordion";
import NextModelCTA from "@/components/models/NextModelCTA";
import ModelClosingActions from "@/components/models/ModelClosingActions";
import type { Metadata } from "next";
import { metaDescription } from "@/lib/model-links";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "EsseEsse9 | Energica Motor Company",
  // Built from the page's own headline stats (specs.ts)
  description: metaDescription("esseesse9", "The naked electric champion."),
};

export default function EsseEsse9Page() {
  const model = getModelById("esseesse9");
  if (!model) notFound();

  const idx = models.findIndex((m) => m.id === "esseesse9");
  const nextModel = models[(idx + 1) % models.length];

  return (
    <main className="bg-[#0a0a0a]">
      <ModelSchema
        name="EsseEsse9"
        description="Naked electric streetfighter. 107 HP, 207 Nm at wheel from 0 rpm, 0–100 km/h in 3.2 seconds. EMCE motor architecture from MotoE. Made in Modena, Italy."
        image="/images/Pagina%20SS9/EsseEsse9%20RS_Bormio%20Ice.webp"
        url="/models/esseesse9"
        specs={{ power: "Peak 80 kW / 107 HP", torque: "207 Nm at wheel", topSpeed: "200 km/h", range: "180 km city / 120 km combined" }}
      />
      <ModelHero model={model} />
      <SpecsBar specs={model.keySpecs} />
      <StorySection model={model} />
      <section className="bg-[#0a0a0a] border-t border-white/[0.04]">
        <ColorSelector colors={model.colors} />
      </section>
      <section className="bg-[#080808] border-t border-white/[0.04]">
        <div className="ds-container ds-section">
          <div className="mb-10">
            <p className="inline-flex items-center gap-3 mb-3">
              <span className="w-6 h-px bg-[#CE2B37]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/65">Gallery</span>
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
      {nextModel && <NextModelCTA nextModel={nextModel} />}
      <ModelClosingActions modelId={model.id} modelName={model.name} />
    </main>
  );
}
