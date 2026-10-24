import { getModelById, models } from "@/data/models";
import { Container } from "@/components/ui/Container";
import ModelHero from "@/components/models/ModelHero";
import SpecsBar from "@/components/models/SpecsBar";
import StorySection from "@/components/models/StorySection";
import ColorSelector from "@/components/models/ColorSelector";
import GalleryGrid from "@/components/models/GalleryGrid";
import SpecsAccordion from "@/components/models/SpecsAccordion";
import NextModelCTA from "@/components/models/NextModelCTA";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return models.map((m) => ({ slug: m.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = getModelById(slug);
  if (!model) return { title: "Model Not Found" };

  return {
    title: `${model.name} | Energica Motor Company`,
    description: model.description,
  };
}

export default async function ModelPage({ params }: PageProps) {
  const { slug } = await params;
  const model = getModelById(slug);
  if (!model) notFound();

  const idx = models.findIndex((m) => m.id === slug);
  const nextModel = models[(idx + 1) % models.length];

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
        <Container className="py-[120px]">
          <ColorSelector colors={model.colors} />
        </Container>
      </section>

      {/* § 5 — Gallery */}
      <section className="bg-[#080808] border-t border-white/[0.04]">
        <Container className="py-[120px]">
          <div className="mb-[48px]">
            <p className="inline-flex items-center gap-3 mb-6">
              <span className="w-6 h-px bg-[#CE2B37]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/65">
                Gallery
              </span>
            </p>
            <h2
              className="font-display text-white leading-none"
              style={{ fontSize: "var(--text-h1)" }}
            >
              {model.name} in the Wild
            </h2>
          </div>
          <GalleryGrid images={model.lifestyleImages} altPrefix={model.name} />
        </Container>
      </section>

      {/* § 6 — Full specs accordion */}
      <section className="bg-[#0a0a0a] border-t border-white/[0.04]">
        <Container className="py-[120px]">
          <div className="mb-[48px]">
            <p className="inline-flex items-center gap-3 mb-6">
              <span className="w-6 h-px bg-[#CE2B37]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/65">
                Full Specifications
              </span>
            </p>
            <h2
              className="font-display text-white leading-none"
              style={{ fontSize: "var(--text-h1)" }}
            >
              Technical Data
            </h2>
          </div>
          <SpecsAccordion specs={model.specs} />
        </Container>
      </section>

      {/* § 7 — Next model CTA */}
      {nextModel && <NextModelCTA nextModel={nextModel} />}
    </main>
  );
}
