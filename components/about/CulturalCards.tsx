"use client";

import { Photo } from "@/components/ui/Photo";
import { useState } from "react";

export interface CulturalItem {
  label: string;
  title: string;
  sub: string;
  url: string;
  ytId: string;
}

export function CulturalCards({ items }: { items: CulturalItem[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item) => (
        <a
          key={item.title}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative p-6 border border-white/[0.08] bg-[#0d0d0d] hover:border-[#78BE20]/40 transition-all duration-300 group flex flex-col justify-center"
          onMouseEnter={() => setHovered(item.title)}
          onMouseLeave={() => setHovered(null)}
        >
          {/* YouTube thumbnail preview — floats above the card */}
          <div
            className={`absolute bottom-full left-0 w-full z-50 pb-2 pointer-events-none transition-all duration-200 ${
              hovered === item.title
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            <div className="relative aspect-video w-full overflow-hidden rounded border border-white/10 shadow-2xl">
              <Photo
                src={`https://img.youtube.com/vi/${item.ytId}/maxresdefault.jpg`}
                alt={item.title}
                className="object-cover"
                unoptimized
              />
              {/* Dark scrim */}
              <div className="absolute inset-0 bg-black/25" />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#78BE20] flex items-center justify-center shadow-lg">
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                    <path d="M1 1L13 8L1 15V1Z" fill="black" />
                  </svg>
                </div>
              </div>
              <span className="absolute bottom-2 right-3 text-[10px] uppercase tracking-widest text-white/70 font-mono">
                Watch →
              </span>
            </div>
          </div>

          {/* Card body */}
          <span className="text-[9px] uppercase tracking-[0.35em] text-[#78BE20]/70 font-mono block mb-3">
            {item.label}
          </span>
          <p className="font-display text-white text-xl leading-tight mb-2 group-hover:text-[#78BE20] transition-colors duration-300">
            {item.title}
          </p>
          <p className="text-[11px] text-white/45 tracking-wide">{item.sub}</p>

          {/* Animated play hint */}
          <div
            // Pinned top-right so the hidden hint doesn't leave an empty row at the bottom
            className={`absolute top-6 right-6 flex items-center gap-2 text-[10px] text-[#78BE20] font-mono uppercase tracking-widest transition-opacity duration-200 ${
              hovered === item.title ? "opacity-100" : "opacity-0"
            }`}
          >
            <svg width="9" height="11" viewBox="0 0 9 11" fill="none">
              <path d="M0.5 0.5L8.5 5.5L0.5 10.5V0.5Z" fill="#78BE20" />
            </svg>
            Watch on YouTube
          </div>
        </a>
      ))}
    </div>
  );
}
