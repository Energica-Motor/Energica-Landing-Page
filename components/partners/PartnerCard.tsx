"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { TYPE_LABELS, type PartnerType } from "@/data/partners";
import { directionsUrl, formatKm, telHref, type RankedPartner } from "@/lib/partners";

const mono = { fontFamily: "var(--font-ibm-mono)" } as const;
const sans = { fontFamily: "var(--font-ibm-sans)" } as const;

// Country partner: solid white. Dealer and service: light grey outline.
// Same size for all (country keeps a transparent 1px border).
const BADGE: Record<PartnerType, string> = {
  country: "bg-[#FFFFFF] text-[#0F1012] border-transparent",
  dealer: "bg-transparent text-[#C4C7CA] border-[#5E6266]",
  service: "bg-transparent text-[#C4C7CA] border-[#5E6266]",
};

const btn =
  "inline-flex items-center justify-center gap-2 min-h-[44px] px-4 font-display uppercase text-[13px] tracking-[0.14em] transition-all duration-200 cursor-none active:scale-[0.97]";
const secondary = "border border-white/25 text-[#F2F2F0] hover:border-[#78BE20]";
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
  // Directions, then Call and Email that dial / open mail directly (main number and address).
  // First action is the primary one: solid green only on the selected card.
  const phone = p.phones?.[0];
  const email = p.emails?.[0];
  // Email: Gmail or Outlook partners (from the domain's mail records) open a new message
  // there in a new tab; on phones the mail app opens instead.
  // Other mail hosts: a plain mailto link (the visitor's default email app).
  const compose = !email
    ? null
    : p.mailProvider === "outlook"
      ? `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(email)}`
      : p.mailProvider === "gmail"
        ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`
        : `mailto:${email}`;
  const onMail = (e: React.MouseEvent) => {
    if (email && window.matchMedia("(pointer: coarse)").matches) {
      e.preventDefault();
      window.location.href = `mailto:${email}`;
    }
  };
  const actions = [
    dir && { label: "Directions", href: dir, external: true },
    phone && { label: "Call", href: telHref(phone) },
    compose && { label: "Email", href: compose, external: !compose.startsWith("mailto:") },
  ].filter(Boolean) as { label: string; href: string; external?: boolean }[];

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
        {p.distanceKm !== undefined && (
          <span className="ml-auto text-[11px] tracking-[0.1em] text-[#78BE20] font-semibold" style={mono}>
            {formatKm(p.distanceKm)}
          </span>
        )}
      </div>

      {/* Country on its own line under the badges */}
      <p className="-mt-1 mb-2 text-[10px] tracking-[0.2em] uppercase text-[#A3A7AC]" style={mono}>
        {p.country}
      </p>
      <h3 className="font-display uppercase text-[#F2F2F0] mb-1.5" style={{ fontSize: 22, lineHeight: 1.15 }}>
        {p.name}
      </h3>
      <p className="text-[13px] text-[#A3A7AC] leading-relaxed" style={sans}>
        {p.address || "Contact for location"}
      </p>

      {rows.length > 0 && (
        <dl className="mt-4 grid grid-cols-[56px_1fr] gap-x-3 gap-y-1.5 text-[13px]" style={sans}>
          {rows.map((r) => (
            <div key={r.label} className="contents">
              <dt className="text-[10px] uppercase tracking-[0.2em] text-[#A3A7AC] pt-[2px]" style={mono}>
                {r.label}
              </dt>
              <dd className="min-w-0">
                {r.items.map((it, i) => (
                  <a
                    key={it.value}
                    href={it.href}
                    onClick={(e) => e.stopPropagation()}
                    className={cn("block truncate hover:text-[#78BE20] hover:underline transition-colors cursor-none", i === 0 ? "text-[#F2F2F0]" : "text-[#A3A7AC] text-[12px]")}
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
              onClick={x.label === "Email" ? onMail : undefined}
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
