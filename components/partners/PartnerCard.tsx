"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { TYPE_LABELS, type PartnerType } from "@/data/partners";
import { directionsUrl, formatKm, telHref, type RankedPartner } from "@/lib/partners";

const mono = { fontFamily: "var(--font-ibm-mono)" } as const;
const sans = { fontFamily: "var(--font-ibm-sans)" } as const;

const BADGE: Record<PartnerType, string> = {
  country: "border-[#141517] text-[#141517]",
  dealer: "border-[#3F6B10] text-[#3F6B10]",
  service: "border-[#5E6266] text-[#5E6266]",
};

const btn =
  "inline-flex items-center justify-center gap-2 min-h-[44px] px-4 font-display uppercase text-[13px] tracking-[0.14em] transition-all duration-200 cursor-none active:scale-[0.97]";
const secondary = "border border-[#141517] text-[#141517] bg-white hover:bg-[#141517] hover:text-white";
const primary = "border border-[#78BE20] bg-[#78BE20] text-[#0F1012] hover:bg-[#6AA81C]";

interface Props {
  partner: RankedPartner;
  active: boolean;
  onSelect?: () => void;
  onHover?: (on: boolean) => void;
}

const PartnerCard = forwardRef<HTMLElement, Props>(function PartnerCard({ partner: p, active, onSelect, onHover }, ref) {
  const dir = directionsUrl(p);
  const host = (u: string) => u.replace(/^https?:\/\//, "").replace(/\/$/, "");
  // Main value first; any others listed underneath.
  const rows = [
    p.phones?.length && { label: "Phone", items: p.phones.map((v) => ({ value: v, href: telHref(v) })) },
    p.emails?.length && { label: "Email", items: p.emails.map((v) => ({ value: v, href: `mailto:${v}` })) },
    p.websites?.length && { label: "Web", items: p.websites.map((v) => ({ value: host(v), href: v, external: true })) },
  ].filter(Boolean) as { label: string; items: { value: string; href: string; external?: boolean }[] }[];
  // Directions is the only button (contact details are links in the rows above).
  // First action is the primary one: solid green only on the selected card.
  const actions = [
    dir && { label: "Directions", href: dir, external: true },
  ].filter(Boolean) as { label: string; href: string; external?: boolean }[];

  return (
    <article
      ref={ref}
      onClick={onSelect}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      aria-current={active || undefined}
      className={cn(
        "relative bg-white border-l-[3px] p-5 md:p-6 transition-colors duration-200 cursor-none scroll-mt-4",
        // Selected: 1.5px dark border + green left accent.
        active ? "border-[1.5px] border-[#141517] border-l-[3px] border-l-[#78BE20]" : "border border-[#D3D5D7] border-l-[3px] border-l-white hover:border-[#5E6266] hover:border-l-white",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {p.types.map((t) => (
          <span key={t} className={cn("px-2 py-[3px] border text-[10px] tracking-[0.2em] uppercase", BADGE[t])} style={mono}>
            {TYPE_LABELS[t].badge}
          </span>
        ))}
        {p.distanceKm !== undefined && (
          <span className="ml-auto text-[11px] tracking-[0.1em] text-[#3F6B10] font-semibold" style={mono}>
            {formatKm(p.distanceKm)}
          </span>
        )}
      </div>

      {/* Country on its own line under the badges */}
      <p className="-mt-1 mb-2 text-[10px] tracking-[0.2em] uppercase text-[#5E6266]" style={mono}>
        {p.country}
      </p>
      <h3 className="font-display uppercase text-[#141517] mb-1.5" style={{ fontSize: 22, lineHeight: 1.15 }}>
        {p.name}
      </h3>
      <p className="text-[13px] text-[#4A4E52] leading-relaxed" style={sans}>
        {p.address || "Contact for location"}
      </p>

      {rows.length > 0 && (
        <dl className="mt-4 grid grid-cols-[56px_1fr] gap-x-3 gap-y-1.5 text-[13px]" style={sans}>
          {rows.map((r) => (
            <div key={r.label} className="contents">
              <dt className="text-[10px] uppercase tracking-[0.2em] text-[#5E6266] pt-[2px]" style={mono}>
                {r.label}
              </dt>
              <dd className="min-w-0">
                {r.items.map((it, i) => (
                  <a
                    key={it.value}
                    href={it.href}
                    onClick={(e) => e.stopPropagation()}
                    className={cn("block truncate hover:text-[#3F6B10] hover:underline transition-colors cursor-none", i === 0 ? "text-[#141517]" : "text-[#4A4E52] text-[12px]")}
                    {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {it.value}
                  </a>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5" onClick={(e) => e.stopPropagation()}>
          {actions.map((x, i) => (
            <a
              key={x.label}
              href={x.href}
              {...(x.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={cn(btn, active && i === 0 ? primary : secondary)}
            >
              {x.label}
              {x.external && <span aria-hidden>↗</span>}
            </a>
          ))}
        </div>
      )}
    </article>
  );
});

export default PartnerCard;
