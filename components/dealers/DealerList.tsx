"use client";

import { useState } from "react";
import Link from "next/link";
import { dealerCountries, dealerMapUrl, dealerRegions } from "@/data/dealers";
import { cn } from "@/lib/utils";

/** Dealer list with a country filter (All by default, so it works without JS). */
export default function DealerList() {
  const [country, setCountry] = useState<string | null>(null);
  const regions = dealerRegions
    .map((r) => ({ ...r, dealers: r.dealers.filter((d) => !country || d.country === country) }))
    .filter((r) => r.dealers.length);

  const chip = (active: boolean) =>
    cn(
      "px-4 py-2 border text-[10px] uppercase tracking-widest transition-colors duration-200",
      active ? "border-[#78BE20] text-white bg-[#78BE20]/10" : "border-white/10 text-white/65 hover:border-white/30 hover:text-white"
    );

  return (
    <div className="py-12">
      <div role="group" aria-label="Filter by country" className="flex flex-wrap gap-2 mb-12">
        <button type="button" aria-pressed={!country} onClick={() => setCountry(null)} className={chip(!country)}>All</button>
        {dealerCountries.map((c) => (
          <button key={c} type="button" aria-pressed={country === c} onClick={() => setCountry(c)} className={chip(country === c)}>
            {c}
          </button>
        ))}
      </div>

      {regions.map((region) => (
        <div key={region.region} className="mb-14">
          {/* Region header */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/[0.05]">
            <span className="w-2 h-2 rounded-full bg-[#78BE20]" />
            <h2 className="font-display text-2xl text-white">{region.region}</h2>
            <span className="ml-auto text-[10px] uppercase tracking-widest text-white/65">
              {region.dealers.length} {region.dealers.length === 1 ? "location" : "locations"}
            </span>
          </div>

          {/* Dealer cards */}
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {region.dealers.map((dealer) => {
              const mapUrl = dealerMapUrl(dealer);
              return (
                <li
                  key={dealer.name}
                  className="group flex flex-col p-5 border border-white/[0.06] bg-[#0d0d0d] hover:border-[#78BE20]/25 transition-all duration-200"
                >
                  {/* Type + country badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-[9px] uppercase tracking-widest text-white/60">{dealer.country}</p>
                    <span className="text-white/20">·</span>
                    <p className="text-[9px] uppercase tracking-widest text-[#78BE20]/60">{dealer.type}</p>
                  </div>

                  {/* Name */}
                  <h3 className="font-display text-white text-lg leading-tight mb-2 group-hover:text-[#78BE20] transition-colors duration-200">
                    {dealer.name}
                  </h3>

                  {/* Address */}
                  <p className="text-xs text-white/50 leading-relaxed mb-4">{dealer.address ?? "Address on request"}</p>

                  {/* Actions */}
                  <div className="flex gap-3 mt-auto pt-3 border-t border-white/[0.04]">
                    {mapUrl && (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] uppercase tracking-widest text-[#78BE20]/70 hover:text-[#78BE20] transition-colors"
                      >
                        View on Map →
                      </a>
                    )}
                    <Link
                      href="/test-ride"
                      className="text-[9px] uppercase tracking-widest text-white/65 hover:text-white transition-colors ml-auto"
                    >
                      Book Ride
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
