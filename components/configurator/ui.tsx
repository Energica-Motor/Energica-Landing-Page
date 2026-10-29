"use client";
// Presentational pieces of the configurator: model and step tabs, option
// sections, the stage spec strip and the bottom action bar. No build state
// here; only the action bar's own "More" menu.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Stat } from "@/lib/build-sheet/specs";
import { MODEL_INFO, MODEL_ORDER, SWATCHES, type Model } from "./config";
import type { OptionView, SectionView } from "./rules";
import { BORDER, COLOR, FONT, SIZE, monoLabel } from "./theme";

const tabBase: CSSProperties = {
  background: "none",
  border: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  textAlign: "left",
  minHeight: SIZE.modelBarH,
  flexShrink: 0,
};

// ── Model bar ───────────────────────────────────────────────────────────────

export function ModelTabs({ active, onPick, step, steps }: { active: Model; onPick: (m: Model) => void; step: number; steps: number }) {
  return (
    <div className="cfg-modelbar" style={{ background: COLOR.white, borderBottom: BORDER.idle, padding: "0 32px", display: "flex", alignItems: "stretch", justifyContent: "space-between", gap: 8 }}>
      <div role="tablist" aria-label="Model" className="cfg-scroll" style={{ display: "flex" }}>
        {MODEL_ORDER.map((m) => {
          const on = m === active;
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onPick(m)}
              style={{ ...tabBase, padding: "16px 20px 13px", gap: 2, borderBottom: `3px solid ${on ? COLOR.green : "transparent"}` }}
            >
              <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 20, letterSpacing: "0.04em", textTransform: "uppercase", color: on ? COLOR.text : COLOR.label, whiteSpace: "nowrap" }}>
                {MODEL_INFO[m].name}
              </span>
              <span style={{ ...monoLabel(10, 0.12), whiteSpace: "nowrap" }}>{MODEL_INFO[m].category}</span>
            </button>
          );
        })}
      </div>
      {steps > 0 && (
        <div className="cfg-stepcount" style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap", ...monoLabel(10) }}>
          STEP {step + 1} OF {steps}
        </div>
      )}
    </div>
  );
}

// ── Step tabs ───────────────────────────────────────────────────────────────

// Tabs keep their full label and the row scrolls sideways when they don't fit
// (Ego's six steps); the active tab is kept in view, and a fade marks each
// side with tabs hidden past it.
const fadeBase: CSSProperties = { position: "absolute", top: 0, bottom: 1, width: 32, pointerEvents: "none", transition: "opacity 120ms ease" };

export function StepTabs({ steps, counts, active, onPick }: { steps: { label: string }[]; counts: number[]; active: number; onPick: (i: number) => void }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState({ left: false, right: false });
  const updateHidden = () => {
    const row = rowRef.current;
    if (!row) return;
    const left = row.scrollLeft > 1, right = row.scrollLeft + row.clientWidth < row.scrollWidth - 1;
    setHidden((h) => (h.left === left && h.right === right ? h : { left, right }));
  };
  useEffect(() => {
    const row = rowRef.current;
    if (!row || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(updateHidden);
    ro.observe(row);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const row = rowRef.current;
    const tab = row?.children[active] as HTMLElement | undefined;
    if (!row || !tab) return;
    // Scrolls the row only, never the page
    if (tab.offsetLeft < row.scrollLeft) row.scrollLeft = tab.offsetLeft;
    else if (tab.offsetLeft + tab.offsetWidth > row.scrollLeft + row.clientWidth) row.scrollLeft = tab.offsetLeft + tab.offsetWidth - row.clientWidth;
    updateHidden();
  }, [active, counts.join()]); // eslint-disable-line react-hooks/exhaustive-deps -- counts change the tab widths
  return (
    <div style={{ position: "relative", flex: "none" }}>
      <div ref={rowRef} role="tablist" aria-label="Steps" className="cfg-scroll" onScroll={updateHidden} style={{ display: "flex", borderBottom: BORDER.idle, position: "relative" }}>
        {steps.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={s.label}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onPick(i)}
              className="cfg-tab"
              style={{ ...tabBase, padding: "12px 10px 9px", gap: 3, minWidth: 72, borderBottom: `3px solid ${on ? COLOR.green : "transparent"}` }}
            >
              <span style={monoLabel(10, 0.1)}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 15, lineHeight: 1.15, letterSpacing: "0.02em", textTransform: "uppercase", color: on ? COLOR.text : COLOR.label, maxWidth: 120, overflowWrap: "normal" }}>
                {s.label}
              </span>
              <span style={{ ...monoLabel(9, 0.08, COLOR.greenText), whiteSpace: "nowrap" }}>
                {counts[i] ? `${counts[i]} SELECTED` : "OPTIONAL"}
              </span>
            </button>
          );
        })}
      </div>
      <div aria-hidden data-testid="tabs-fade-left" style={{ ...fadeBase, left: 0, opacity: hidden.left ? 1 : 0, background: `linear-gradient(to right, ${COLOR.white}, transparent)` }} />
      <div aria-hidden data-testid="tabs-fade-right" style={{ ...fadeBase, right: 0, opacity: hidden.right ? 1 : 0, background: `linear-gradient(to left, ${COLOR.white}, transparent)` }} />
    </div>
  );
}

// ── Option sections ─────────────────────────────────────────────────────────

export function OptionSection({ section, onToggle }: { section: SectionView; onToggle: (o: OptionView) => void }) {
  const isSwatch = section.key === "base_color";
  const cols = isSwatch ? 3 : section.options.length >= 4 ? 2 : 1;
  return (
    <section aria-label={section.title} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <h2 style={{ margin: 0, fontFamily: FONT.display, fontWeight: 600, fontSize: 26, lineHeight: 1.1, textTransform: "uppercase", color: COLOR.text }}>{section.title}</h2>
          {section.description && <p style={{ margin: 0, fontFamily: FONT.body, fontSize: 13, color: COLOR.secondary }}>{section.description}</p>}
        </div>
        <span style={{ ...monoLabel(10, 0.12), whiteSpace: "nowrap" }}>{section.hint}</span>
      </div>
      <div className={isSwatch ? "cfg-swatches" : "cfg-options"} style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: isSwatch ? 10 : 8 }}>
        {section.options.map((o) =>
          isSwatch
            ? <SwatchCard key={o.layer.id} option={o} onClick={() => onToggle(o)} />
            : <OptionCard key={o.layer.id} option={o} round={section.exclusive} onClick={() => onToggle(o)} />,
        )}
      </div>
    </section>
  );
}

const cardBase = (o: OptionView): CSSProperties => ({
  background: COLOR.white,
  border: o.selected ? BORDER.selected : BORDER.idle,
  minHeight: SIZE.touch,
  borderRadius: 0,
  color: COLOR.text,
});

export function SwatchCard({ option: o, onClick }: { option: OptionView; onClick: () => void }) {
  const colors = SWATCHES[o.layer.id] ?? [COLOR.rule];
  return (
    <button type="button" aria-pressed={o.selected} onClick={onClick}
      style={{ ...cardBase(o), padding: "16px 8px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minHeight: 112 }}>
      <span aria-hidden style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", display: "flex", border: `1px solid ${COLOR.swatchBorder}` }}>
        {colors.map((c, i) => <span key={i} style={{ flexGrow: 1, background: c }} />)}
      </span>
      <span style={{ fontFamily: FONT.body, fontSize: 13, fontWeight: 500, textAlign: "center" }}>{o.title}</span>
    </button>
  );
}

export function OptionCard({ option: o, round, onClick }: { option: OptionView; round: boolean; onClick: () => void }) {
  const radius = round ? "50%" : 0;
  return (
    <button type="button" aria-pressed={o.selected} onClick={onClick}
      style={{ ...cardBase(o), padding: "13px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, textAlign: "left", minHeight: 60 }}>
      <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <span style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: 600, color: COLOR.text }}>{o.title}</span>
        {o.description && <span style={{ fontFamily: FONT.body, fontSize: 12, color: COLOR.secondary }}>{o.description}</span>}
      </span>
      <span aria-hidden style={{ width: 18, height: 18, borderRadius: radius, border: `1px solid ${COLOR.indicator}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: COLOR.white }}>
        <span style={{ width: 10, height: 10, borderRadius: radius, background: o.selected ? COLOR.text : "transparent" }} />
      </span>
    </button>
  );
}

// ── Stage ───────────────────────────────────────────────────────────────────

export function StageHeading({ model, colour, version }: { model: Model; colour: string; version: "RS" | "Standard" | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={monoLabel(11, 0.16)}>{MODEL_INFO[model].category}</div>
      <h1 className="cfg-title" style={{ margin: "6px 0 0", fontFamily: FONT.display, fontWeight: 600, fontSize: 76, lineHeight: 0.9, textTransform: "uppercase", color: COLOR.text }}>
        {MODEL_INFO[model].name}
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, minHeight: 26 }}>
        {colour && <span style={{ fontFamily: FONT.display, fontWeight: 500, fontSize: 22, letterSpacing: "0.02em", color: COLOR.text }}>{colour}</span>}
        {colour && version && <span aria-hidden style={{ width: 4, height: 4, background: COLOR.indicator, borderRadius: "50%" }} />}
        {version && (
          <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 22, color: version === "RS" ? COLOR.greenText : COLOR.secondary }}>{version}</span>
        )}
      </div>
    </div>
  );
}

/** The model's locked headline figures (lib/build-sheet/specs.ts). */
export function SpecStrip({ stats }: { stats: Stat[] }) {
  return (
    <dl style={{ display: "flex", flexWrap: "wrap", borderTop: `1px solid ${COLOR.strongRule}`, margin: 0 }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{ flex: "1 1 130px", padding: `14px ${i === stats.length - 1 ? 0 : 16}px 0 0`, display: "flex", flexDirection: "column", gap: 2 }}>
          <dt style={monoLabel(10)}>{s.label}</dt>
          <dd style={{ margin: 0, display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 34, lineHeight: 1.1, color: COLOR.text }}>{s.value}</span>
            <span style={{ fontFamily: FONT.display, fontSize: 16, color: COLOR.secondary }}>{s.unit}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ── Bottom action bar ───────────────────────────────────────────────────────

const barButton: CSSProperties = {
  ...monoLabel(11, 0.14, COLOR.white),
  background: "none",
  border: `1px solid ${COLOR.darkBorder}`,
  padding: "0 16px",
  minHeight: SIZE.touch,
  borderRadius: 0,
  whiteSpace: "nowrap",
};

export interface ActionBarProps {
  countLabel: string;
  summary: string;
  copyLabel: string;
  copyIdle: boolean; // false while the label reports progress or "LINK COPIED"
  pdfLabel: string;
  pdfDisabled: boolean;
  linkDisabled: boolean;
  flash?: number; // each increase briefly highlights the build summary ("Review build")
  onReset: () => void;
  onCopy: () => void;
  onPdf: () => void;
  onContact: () => void;
}

/**
 * Desktop: build summary on the left, four actions on the right. Phones
 * (CSS in EnergiccaConfigurator): the count with a "More" menu holding Reset
 * and Copy link, then Download PDF and Contact Dealer side by side.
 */
export function ActionBar(p: ActionBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menuOpen]);
  const fromMenu = (action: () => void) => () => { setMenuOpen(false); action(); };

  // The bar is always on screen, so reviewing only highlights and focuses it
  const infoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const info = infoRef.current;
    if (!p.flash || !info) return;
    info.classList.remove("cfg-flash");
    void info.offsetWidth; // restart the animation
    info.classList.add("cfg-flash");
    info.focus({ preventScroll: true });
    const t = setTimeout(() => info.classList.remove("cfg-flash"), 1600);
    return () => clearTimeout(t);
  }, [p.flash]);

  return (
    <div className="cfg-actionbar" style={{ position: "sticky", bottom: 0, zIndex: 20, background: COLOR.dark, color: COLOR.white, padding: "14px 32px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "14px 24px", borderTop: `1px solid ${COLOR.darkRule}` }}>
      <div ref={infoRef} tabIndex={-1} data-testid="build-info" role="group" aria-label={`Your build: ${p.countLabel}. ${p.summary}`} className="cfg-bar-info" style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 360px", minWidth: 0, outline: "none", margin: "-4px -8px", padding: "4px 8px" }}>
        <span style={monoLabel(10, 0.14, COLOR.onDark)}>
          <span className="cfg-bar-prefix">YOUR BUILD · </span>
          <span data-testid="selection-count" style={{ color: COLOR.green }}>{p.countLabel}</span>
          {!p.copyIdle && <span className="cfg-bar-status" aria-hidden style={{ color: COLOR.white }}> · {p.copyLabel}</span>}
        </span>
        <span data-testid="build-summary" className="cfg-bar-summary" title={p.summary} style={{ fontFamily: FONT.body, fontSize: 13, color: COLOR.onDarkText, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {p.summary}
        </span>
        <div ref={menuRef} className="cfg-more" style={{ position: "relative", display: "none" }}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            style={{ ...barButton, border: "none", color: COLOR.onDark, padding: "0 4px 0 12px", minHeight: 32 }}
          >
            MORE
          </button>
          {menuOpen && (
            <div role="menu" aria-label="More actions" style={{ position: "absolute", right: 0, bottom: "calc(100% + 10px)", background: COLOR.dark, border: `1px solid ${COLOR.darkBorder}`, minWidth: 180, display: "flex", flexDirection: "column" }}>
              <button type="button" role="menuitem" onClick={fromMenu(p.onCopy)} disabled={p.linkDisabled} style={{ ...barButton, border: "none", textAlign: "left" }}>COPY LINK</button>
              <button type="button" role="menuitem" onClick={fromMenu(p.onReset)} style={{ ...barButton, border: "none", borderTop: `1px solid ${COLOR.darkRule}`, color: COLOR.onDark, textAlign: "left" }}>RESET</button>
            </div>
          )}
        </div>
      </div>
      <div className="cfg-actions" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        <button type="button" onClick={p.onReset} className="cfg-wide-only" style={{ ...barButton, border: "none", color: COLOR.onDark, padding: "0 10px" }}>RESET</button>
        <button type="button" onClick={p.onCopy} disabled={p.linkDisabled} className="cfg-wide-only" style={barButton} aria-live="polite">{p.copyLabel}</button>
        <button type="button" onClick={p.onPdf} disabled={p.pdfDisabled} className="cfg-pdf" style={{ ...barButton, opacity: p.pdfDisabled ? 0.5 : 1 }}>{p.pdfLabel}</button>
        <button type="button" onClick={p.onContact} className="cfg-contact" style={{ ...barButton, background: COLOR.green, borderColor: COLOR.green, color: COLOR.dark, fontWeight: 500, padding: "0 22px" }}>
          CONTACT DEALER
        </button>
      </div>
    </div>
  );
}
