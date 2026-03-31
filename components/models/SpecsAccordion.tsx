"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { type ModelSpecs } from "@/data/models";
import { cn } from "@/lib/utils";

interface SpecsAccordionProps {
  specs: ModelSpecs;
}

type AccordionKey = "motor" | "performance" | "battery" | "electronics" | "dimensions" | "cycleParts";

const SECTION_LABELS: Record<AccordionKey, string> = {
  motor: "Motor",
  performance: "Performance",
  battery: "Battery & Charging",
  electronics: "Electronics",
  dimensions: "Dimensions & Weight",
  cycleParts: "Cycle Parts",
};

const BASE_ORDER: AccordionKey[] = [
  "motor",
  "battery",
  "electronics",
  "dimensions",
  "cycleParts",
];

const HUMAN_LABEL_OVERRIDES: Record<string, string> = {
  dashboard: "Dashboard",
  vehicleControlUnit: "Vehicle Control Unit",
  ridingProfiles: "Riding Profiles",
  cruiseControl: "Cruise Control",
  regenMaps: "Regenerative Modes",
  parkAssistant: "Park Assistant",
  lprFunction: "LPR Function",
  chargeInterruption: "Charge Interruption",
  batteryCharger: "Battery Charger",
  charging: "Recharge",
  maxSpeed: "Max Speed",
};

function humanLabel(key: string): string {
  if (HUMAN_LABEL_OVERRIDES[key]) return HUMAN_LABEL_OVERRIDES[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-white/[0.05] group gap-1 sm:gap-4">
      <span className="text-xs sm:text-sm text-white/60 group-hover:text-white/80 transition-colors sm:shrink-0 sm:pr-4">
        {label}
      </span>
      <span className="text-sm text-white sm:text-right leading-snug">{value}</span>
    </div>
  );
}

export default function SpecsAccordion({ specs }: SpecsAccordionProps) {
  const [open, setOpen] = useState<AccordionKey>("motor");
  const wrapRef = useRef<HTMLDivElement>(null);

  // Build the section order — insert performance between motor and battery when present
  const sectionOrder: AccordionKey[] = specs.performance
    ? ["motor", "performance", "battery", "electronics", "dimensions", "cycleParts"]
    : BASE_ORDER;

  useGSAP(
    () => {
      gsap.from(".sa-row", {
        y: 30,
        opacity: 0,
        stagger: 0.06,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top 80%",
        },
      });
    },
    { scope: wrapRef }
  );

  const sectionsData: Partial<Record<AccordionKey, Record<string, string | undefined>>> = {
    motor: specs.motor as Record<string, string | undefined>,
    battery: specs.battery as Record<string, string | undefined>,
    electronics: specs.electronics as Record<string, string | undefined>,
    dimensions: specs.dimensions as Record<string, string | undefined>,
    cycleParts: specs.cycleParts as Record<string, string | undefined>,
  };

  if (specs.performance) {
    sectionsData.performance = specs.performance as Record<string, string | undefined>;
  }

  return (
    <div ref={wrapRef} className="divide-y divide-white/[0.05]">
      {sectionOrder.map((key, index) => {
        const isOpen = open === key;
        const data = sectionsData[key] ?? {};
        const entries = Object.entries(data).filter(([, v]) => !!v) as [string, string][];

        return (
          <div key={key} className="sa-row">
            <button
              onClick={() => setOpen(isOpen ? "motor" : key)}
              className="w-full flex items-center justify-between py-5 text-left group"
            >
              {/* Left: number tag + label */}
              <span className="flex items-center gap-4">
                <span className="font-display text-sm text-white/60 group-hover:text-[#78BE20]/60 transition-colors duration-200 w-5 text-right">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "font-display text-xl transition-colors duration-200",
                    isOpen
                      ? "text-[#78BE20]"
                      : "text-white group-hover:text-white/80"
                  )}
                >
                  {SECTION_LABELS[key]}
                </span>
              </span>

              {/* Right: plus / close icon */}
              <span
                className={cn(
                  "text-[#78BE20] text-xl transition-transform duration-300 flex-shrink-0 ml-4",
                  isOpen ? "rotate-45" : "rotate-0"
                )}
              >
                +
              </span>
            </button>

            {/* Panel */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-500",
                isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
              )}
              style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
            >
              <div className="pb-8 pl-4 sm:pl-9">
                {entries.length > 0 ? (
                  entries.map(([label, value]) => (
                    <SpecRow key={label} label={humanLabel(label)} value={value} />
                  ))
                ) : (
                  <p className="text-white/60 text-sm py-3">
                    Specifications coming soon
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
