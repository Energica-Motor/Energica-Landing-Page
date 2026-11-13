"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { TYPE_LABELS, type PartnerType } from "@/data/partners";
import { directionsUrl, formatKm, telHref, type RankedPartner } from "@/lib/partners";

const mono = { fontFamily: "var(--font-ibm-mono)" } as const;
const sans = { fontFamily: "var(--font-ibm-sans)" } as const;

const BADGE: Record<PartnerType, string> = {
  dealer: "border-[#78BE20]/60 text-[#78BE20]",
  importer: "border-white/50 text-white",
  service: "border-white/25 text-white/70",
};

const btn =
  "inline-flex items-center justify-center gap-2 min-h-[44px] px-4 font-display uppercase text-[13px] tracking-[0.14em] transition-all duration-200 cursor-none active:scale-[0.97]";

interface Props {
  partner: RankedPartner;
  active: boolean;
  onSelect?: () => void;
  onHover?: (on: boolean) => void;
}

const PartnerCard = forwardRef<HTMLElement, Props>(function PartnerCard({ partner: p, active, onSelect, onHover }, ref) {
  const dir = directionsUrl(p);
  const site = p.website ? p.website.replace(/^https?:\/\//, "").replace(/\/$/, "") : null;
  const rows = [
    p.phone && { label: "Phone", value: p.phone, href: telHref(p.phone) },
    p.email && { label: "Email", value: p.email, href: `mailto:${p.email}` },
    site && { label: "Web", value: site, href: p.website! },
    p.hours && { label: "Hours", value: p.hours },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  return (
    <article
      ref={ref}
      onClick={onSelect}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      aria-current={active || undefined}
      className={cn(
        "relative bg-[#0d0d0d] border border-white/[0.07] border-l-[3px] p-5 md:p-6 transition-colors duration-200 cursor-none scroll-mt-4",
        active ? "border-l-[#78BE20] bg-[#111410]" : "border-l-transparent hover:border-white/20 hover:border-l-white/20",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {p.types.map((t) => (
          <span key={t} className={cn("px-2 py-[3px] border text-[10px] tracking-[0.2em] uppercase", BADGE[t])} style={mono}>
            {TYPE_LABELS[t].badge}
          </span>
        ))}
        <span className="text-[10px] tracking-[0.2em] uppercase text-white/55" style={mono}>
          {p.country}
        </span>
        {p.distanceKm !== undefined && (
          <span className="ml-auto text-[11px] tracking-[0.1em] text-[#78BE20]" style={mono}>
            {formatKm(p.distanceKm)}
          </span>
        )}
      </div>

      <h3 className="font-display uppercase text-white mb-1.5" style={{ fontSize: 22, lineHeight: 1.15 }}>
        {p.name}
      </h3>
      <p className="text-[13px] text-white/55 leading-relaxed" style={sans}>
        {p.address ?? "Contact for location"}
      </p>

      {(p.services?.length || p.servicesOffered?.length) && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {p.services?.map((s) => (
            <span key={s} className="px-2 py-[3px] bg-white/[0.06] text-[10px] tracking-[0.15em] uppercase text-white/75" style={mono}>
              {s}
            </span>
          ))}
          {p.servicesOffered?.map((s) => (
            <span key={s} className="px-2 py-[3px] text-[10px] tracking-[0.1em] text-white/45" style={mono}>
              {s}
            </span>
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <dl className="mt-4 grid grid-cols-[56px_1fr] gap-x-3 gap-y-1.5 text-[13px]" style={sans}>
          {rows.map((r) => (
            <div key={r.label} className="contents">
              <dt className="text-[10px] uppercase tracking-[0.2em] text-white/40 pt-[2px]" style={mono}>
                {r.label}
              </dt>
              <dd className="text-white/75 min-w-0 truncate">
                {r.href ? (
                  <a href={r.href} onClick={(e) => e.stopPropagation()} className="hover:text-[#78BE20] transition-colors cursor-none" {...(r.label === "Web" ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    {r.value}
                  </a>
                ) : (
                  r.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {(dir || p.phone || p.email || p.website) && (
        <div className="flex flex-wrap gap-2 mt-5" onClick={(e) => e.stopPropagation()}>
          {dir && (
            <a href={dir} target="_blank" rel="noopener noreferrer" className={cn(btn, "btn-primary")}>
              Directions <span aria-hidden>↗</span>
            </a>
          )}
          {p.phone && (
            <a href={telHref(p.phone)} className={cn(btn, "border border-white/20 text-white hover:border-white/50")}>
              Call
            </a>
          )}
          {p.email && (
            <a href={`mailto:${p.email}`} className={cn(btn, "border border-white/20 text-white hover:border-white/50")}>
              Email
            </a>
          )}
          {p.website && (
            <a href={p.website} target="_blank" rel="noopener noreferrer" className={cn(btn, "border border-white/20 text-white hover:border-white/50")}>
              Website
            </a>
          )}
        </div>
      )}
    </article>
  );
});

export default PartnerCard;
