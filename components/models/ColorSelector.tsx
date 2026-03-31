"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { type ColorOption } from "@/data/models";
import { cn } from "@/lib/utils";

interface ColorSelectorProps {
  colors: ColorOption[];
}

export default function ColorSelector({ colors }: ColorSelectorProps) {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".cs-left", {
        x: -30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      });
      gsap.from(".cs-right", {
        x: 30,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      });
    },
    { scope: sectionRef }
  );

  return (
    <div
      ref={sectionRef}
      className="flex flex-col lg:flex-row w-full min-h-[560px] lg:min-h-[calc(100vh-80px)]"
    >
      {/* ── Left — controls ──────────────────────────────────── */}
      <div className="cs-left flex flex-col justify-center px-[clamp(24px,4vw,64px)] py-16 lg:py-0 lg:w-[340px] xl:w-[400px] shrink-0 border-r border-white/[0.04]">

        <p className="inline-flex items-center gap-3 mb-5">
          <span className="w-6 h-px bg-[#78BE20]" />
          <span className="text-[10px] uppercase tracking-[0.35em] text-white/60">
            Choose Your Colour
          </span>
        </p>

        <h2
          className="font-display text-white leading-none mb-10"
          style={{ fontSize: "clamp(32px, 4vw, 56px)" }}
        >
          {colors[active]?.name}
        </h2>

        {/* Swatches */}
        <div className="flex gap-5 mb-10">
          {colors.map((color, i) => (
            <button
              key={color.name}
              onClick={() => setActive(i)}
              title={color.name}
              className="relative group focus:outline-none"
            >
              <span
                className={cn(
                  "absolute inset-[-5px] rounded-full border transition-all duration-200",
                  i === active
                    ? "border-[#78BE20]"
                    : "border-transparent group-hover:border-white/25"
                )}
              />
              <span
                className={cn(
                  "block w-10 h-10 rounded-full transition-transform duration-200",
                  i === active ? "scale-110" : "group-hover:scale-105"
                )}
                style={{
                  backgroundColor: color.hex,
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
            </button>
          ))}
        </div>

        {/* Counter */}
        <div className="flex items-center gap-3">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: colors[active]?.hex }}
          />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">
            {String(active + 1).padStart(2, "0")} / {String(colors.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ── Right — bike image ───────────────────────────────── */}
      <div className="cs-right relative flex-1 bg-[#0f0f0f] overflow-hidden min-h-[260px] sm:min-h-[380px] lg:min-h-[420px]">

        {/* Subtle colour tint */}
        <div
          className="absolute inset-0 pointer-events-none transition-colors duration-500 z-10"
          style={{ backgroundColor: `${colors[active]?.hex}0A` }}
        />

        {/* Corner accents */}
        <div className="absolute top-5 left-5 w-8 h-8 border-t border-l border-[#78BE20]/30 pointer-events-none z-20" />
        <div className="absolute bottom-5 right-5 w-8 h-8 border-b border-r border-[#78BE20]/30 pointer-events-none z-20" />

        {/* Images — crossfade */}
        {colors.map((color, i) => (
          <div
            key={color.name}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: i === active ? 1 : 0 }}
          >
            <Image
              src={color.image}
              alt={color.name}
              fill
              className="object-contain p-4 sm:p-6 lg:p-14"
              sizes="(max-width: 1024px) 100vw, 70vw"
            />
          </div>
        ))}

        {/* Colour label — bottom left */}
        <div className="absolute bottom-5 left-5 z-20 flex items-center gap-3">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: colors[active]?.hex }}
          />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/55">
            {colors[active]?.name}
          </span>
        </div>
      </div>
    </div>
  );
}
