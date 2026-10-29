"use client";

import { useRef } from "react";
import { Photo } from "@/components/ui/Photo";
import { gsap, useGSAP } from "@/lib/gsap";
import { reveal } from "@/lib/motion";
import { type BikeModel } from "@/data/models";
import { Container } from "@/components/ui/Container";

interface StorySectionProps {
  model: BikeModel;
}

export default function StorySection({ model }: StorySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".story-para").forEach((el) => reveal(el, { y: 20 }));
      reveal(".story-img", { scale: 1.02 });
      reveal(".story-callout", { y: 20, delay: 0.15, trigger: ".story-img" });
    },
    { scope: sectionRef }
  );

  const paragraphs = model.storyParagraphs ?? [model.description];
  const storyImage =
    model.lifestyleImages[2] ?? model.lifestyleImages[0] ?? model.heroImage;

  return (
    <section ref={sectionRef} className="relative bg-[#080808] border-t border-white/[0.04]">
      <Container className="ds-section">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-center">

          {/* ── LEFT: Image with overlaid callout ─────────────── */}
          <div className="lg:sticky lg:top-24 self-start">
            <div
              className="story-img relative overflow-hidden bg-[#111]"
              style={{ aspectRatio: "4/3" }}
            >
              <Photo
                src={storyImage}
                alt={`${model.name} lifestyle`}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, (max-width: 1343px) 50vw, 640px"
              />

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#78BE20] z-10" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#78BE20] z-10" />

              {/* Callout overlaid at bottom of image */}
              {model.callout && (
                <div className="story-callout absolute bottom-0 left-0 right-0 px-6 pt-14 pb-5 z-10"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)" }}
                >
                  <p
                    className="font-display text-white leading-none mb-1.5"
                    style={{ fontSize: "clamp(26px, 3vw, 44px)" }}
                  >
                    {model.callout.stat}
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.32em] text-white/65">
                    {model.callout.label}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Text ────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Eyebrow */}
            <div className="story-para">
              <p className="inline-flex items-center gap-3">
                <span className="w-6 h-px bg-[#CE2B37]" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-white/60">
                  The Story
                </span>
              </p>
            </div>

            {/* Headline */}
            <div className="story-para">
              <h2
                className="font-display text-white leading-[1.0]"
                style={{ fontSize: "clamp(34px, 4.5vw, 68px)" }}
              >
                {model.headline}
              </h2>
              <div className="w-10 h-[2px] bg-[#CE2B37] mt-5" />
            </div>

            {/* Story paragraphs */}
            <div className="flex flex-col gap-4">
              {paragraphs.map((para, i) => (
                <p
                  key={i}
                  className="story-para text-[15px] text-white/65 leading-[1.75]"
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Inline key specs */}
            <div className="story-para flex flex-wrap gap-x-8 gap-y-3 pt-5 mt-1 border-t border-white/[0.07]">
              {model.keySpecs.slice(0, 2).map((spec) => (
                <div key={spec.label}>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-2xl text-white">{spec.value}</span>
                    <span className="font-display text-sm text-[#78BE20]">{spec.unit}</span>
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-white/55 mt-0.5">
                    {spec.label}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </Container>
    </section>
  );
}
