import Image from "next/image";
import Link from "next/link";
import { models } from "@/data/models";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { Container } from "@/components/ui/Container";
import type { Metadata } from "next";

// Same images used in the home BikeShowcase section
const showcaseImages: Record<string, string> = {
  experia:    "/images/Pagina Experia/Energica_Experia.png",
  esseesse9:  "/images/Pagina SS9/ss9_mosaico_ANN4384.jpg",
  "eva-ribelle": "/images/Pagina Eva/evaribelle-tricolore_670x377.png",
  ego:        "/images/Pagina SS9/egoplus-black-red-frame-resize-5.png",
};

export const metadata: Metadata = {
  title: "Models",
  description:
    "Explore the complete Energica electric motorcycle lineup — Experia, EsseEsse9+, Eva Ribelle, and Ego+.",
};

export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      {/* Header */}
      <Container className="py-[120px]">
        <SectionReveal>
          <span className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-[#78BE20]" />
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">
              Our Lineup
            </span>
          </span>
          <h1
            className="font-display text-white leading-none mb-6"
            style={{ fontSize: "clamp(64px, 12vw, 140px)" }}
          >
            The Models
          </h1>
          <p className="text-white/50 max-w-[750px] leading-relaxed text-[length:var(--text-body-lg)]">
            Four motorcycles. One obsession: electric performance without
            compromise. Each born in Modena, each pushing the limits of what
            electric can be.
          </p>
        </SectionReveal>
      </Container>

      {/* Models grid */}
      <Container className="pb-[120px]">
        <div className="grid md:grid-cols-2 gap-6">
          {models.map((model, i) => (
            <SectionReveal key={model.id} delay={i * 80}>
              <Link
                href={`/models/${model.id}`}
                className="group flex flex-col h-full bg-[#111] border border-white/5 hover:border-[#78BE20]/30 transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0d0d0d]">
                  <Image
                    src={showcaseImages[model.id] ?? model.heroImage}
                    alt={model.name}
                    fill
                    className="object-contain p-6 group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(ellipse at center, ${model.colors[0]?.hex ?? "#78BE20"}15 0%, transparent 70%)`,
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="font-display text-4xl text-white group-hover:text-[#78BE20] transition-colors">
                        {model.name}
                      </h2>
                      <p className="text-white/40 text-sm mt-1">{model.tagline}</p>
                    </div>
                    <span className="text-[#78BE20] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300 mt-2">
                      →
                    </span>
                  </div>

                  <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-[750px]">
                    {model.description.substring(0, 120)}...
                  </p>

                  {/* Key specs */}
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/5 mt-auto">
                    {model.keySpecs.map((spec) => (
                      <div key={spec.label}>
                        <p className="font-display text-xl text-white">
                          {spec.value}
                          <span className="text-xs text-[#78BE20] ml-1">
                            {spec.unit}
                          </span>
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-white/30 mt-0.5">
                          {spec.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </SectionReveal>
          ))}
        </div>
      </Container>
    </div>
  );
}
