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
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Ego | Energica Motor Company",
  description:
    "Track tested. Street legal. MotoE-derived 147 HP in a road-legal superbike.",
};

export default function EgoPage() {
  const model = getModelById("ego");
  if (!model) notFound();

  const idx = models.findIndex((m) => m.id === "ego");
  const nextModel = models[(idx + 1) % models.length];

  return (
    <main className="bg-[#0a0a0a]">
      <ModelSchema
        name="Ego+"
        description="MotoE-derived electric superbike. Track tested, street legal. 147 HP, 0–100 km/h in under 3 seconds. Made in Modena, Italy."
        image="/images/Pagina%20EGO/EGO.webp"
        url="/models/ego"
        specs={{ power: "Peak 107 kW / 145 HP", torque: "215 Nm at wheel", topSpeed: "200 km/h", range: "180 km city / 120 km combined" }}
      />
      <ModelHero model={model} />
      <SpecsBar specs={model.keySpecs} />
      <StorySection model={model} />
      <section className="bg-[#0a0a0a] border-t border-white/[0.04]">
        <ColorSelector colors={model.colors} />
      </section>
      <section className="bg-[#080808] border-t border-white/[0.04]">
        <div className="max-w-[1600px] mx-auto px-[clamp(24px,4vw,64px)] py-[120px]">
          <div className="mb-10">
            <p className="inline-flex items-center gap-3 mb-3">
              <span className="w-6 h-px bg-[#78BE20]" />
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
        <div className="max-w-4xl mx-auto px-[clamp(24px,4vw,64px)] py-[120px]">
          <div className="mb-12">
            <p className="inline-flex items-center gap-3 mb-3">
              <span className="w-6 h-px bg-[#78BE20]" />
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
    </main>
  );
}
