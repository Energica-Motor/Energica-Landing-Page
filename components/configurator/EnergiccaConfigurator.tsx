"use client";

/**
 * EnergiccaConfigurator
 *
 * Main React component for the Energica Motorcycle Configurator: model bar,
 * stage (live render and headline figures), stepped options panel and the
 * bottom action bar. Selection rules live in ./rules, copy and step maps in
 * ./config, design tokens in ./theme.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  ConfigSchema,
  clearConfigCache,
  decodeConfig,
  encodeConfig,
  getModelConfig,
  renderConfiguration,
} from "@/lib/configurator-api";
import { buildSheetContent } from "@/lib/build-sheet/catalog";
import { performanceFor } from "@/lib/build-sheet/specs";
import { MODEL_INFO, cleanLayerName, type Model } from "./config";
import * as rules from "./rules";
import { ActionBar, ModelTabs, OptionSection, SpecStrip, StageHeading, StepTabs } from "./ui";
import { BORDER, COLOR, FONT, SIZE, monoLabel } from "./theme";

interface Props {
  model: Model;
  apiUrl?: string;
  initialLayers?: string[]; // build restored from a short link (?build=<code>)
  onModelChange: (model: Model) => void;
}

// Model names as sent to sales (email subject and body)
const MODEL_DISPLAY_NAMES: Record<Model, string> = {
  eva_ribelle: "EVA RIBELLE",
  essesse9: "ESSESSE9",
  ego: "EGO",
  experia: "EXPERIA",
};

// ---------------------------------------------------------------------------
// Inline styles for the stage and the enquiry form
// ---------------------------------------------------------------------------

const S = {
  spinner: {
    width: "32px",
    height: "32px",
    border: `2px solid ${COLOR.rule}`,
    borderTop: `2px solid ${COLOR.green}`,
    borderRadius: "50%",
    animation: "energica-spin 0.7s linear infinite",
  } as React.CSSProperties,
  errorBanner: {
    border: `1px solid ${COLOR.error}`,
    padding: "12px 16px",
    color: COLOR.error,
    fontSize: "14px",
    fontFamily: FONT.body,
    background: COLOR.white,
  } as React.CSSProperties,
  sectionTitle: {
    ...monoLabel(11, 0.14, COLOR.text),
    margin: "0 0 4px 0",
  } as React.CSSProperties,
  btnPrimary: {
    ...monoLabel(11, 0.14, COLOR.dark),
    fontWeight: 500,
    backgroundColor: COLOR.green,
    border: `1px solid ${COLOR.green}`,
    borderRadius: 0,
    minHeight: SIZE.touch,
    padding: "0 24px",
    width: "100%",
  } as React.CSSProperties,
  btnSecondary: {
    ...monoLabel(11, 0.14, COLOR.text),
    backgroundColor: "transparent",
    border: `1px solid ${COLOR.text}`,
    borderRadius: 0,
    minHeight: SIZE.touch,
    padding: "0 24px",
    width: "100%",
  } as React.CSSProperties,
  shareInput: {
    flex: 1,
    fontFamily: FONT.body,
    fontSize: "12px",
    padding: "10px 12px",
    backgroundColor: COLOR.paper,
    border: BORDER.idle,
    borderRadius: 0,
    color: COLOR.text,
    minHeight: SIZE.touch,
    boxSizing: "border-box",
  } as React.CSSProperties,
  copyBtn: {
    ...monoLabel(11, 0.12, COLOR.text),
    padding: "0 14px",
    minHeight: SIZE.touch,
    backgroundColor: "transparent",
    border: `1px solid ${COLOR.text}`,
    borderRadius: 0,
    whiteSpace: "nowrap",
  } as React.CSSProperties,
  fieldLabel: {
    display: "block",
    ...monoLabel(10, 0.12, COLOR.text),
    marginBottom: "6px",
  } as React.CSSProperties,
  field: {
    width: "100%",
    fontFamily: FONT.body,
    fontSize: "14px",
    padding: "10px 12px",
    border: BORDER.idle,
    borderRadius: 0,
    color: COLOR.text,
    backgroundColor: COLOR.white,
    boxSizing: "border-box",
    minHeight: SIZE.touch,
    cursor: "text",
  } as React.CSSProperties,
};

// ---------------------------------------------------------------------------
// Custom hook — configuration state management
// ---------------------------------------------------------------------------

function useConfigurator(model: Model, apiUrl: string, restoredLayers?: string[]) {
  const [config, setConfig] = useState<ConfigSchema | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // The selection the shown image (or error) belongs to; while it differs
  // from the current one the stage shows "updating" from the first click.
  const [renderedKey, setRenderedKey] = useState<string | null>(null);
  const latestKey = useRef("");
  const [error, setError] = useState<string | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevObjectUrlRef = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  // Load config and initialise layers from a saved build, a legacy ?layers=
  // link, or the defaults
  useEffect(() => {
    // Clear module-level cache so model switches always fetch fresh config
    // (prevents stale mutually_exclusive / always_visible data from prior loads)
    // The component remounts per model (keyed in ConfiguratorShell), so state
    // starts fresh here.
    clearConfigCache();
    isFirstRender.current = true;

    getModelConfig(model, apiUrl)
      .then((cfg) => {
        setConfig(cfg);
        const encoded = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("layers") : null;
        const restored = restoredLayers?.length ? restoredLayers : encoded ? decodeConfig(encoded) : null;
        setVisibleLayers(rules.initialLayers(cfg, restored));
      })
      .catch((err: Error) => {
        setError(`Could not load configuration: ${err.message}`);
      })
      .finally(() => setConfigLoading(false));
  }, [model, apiUrl]); // eslint-disable-line react-hooks/exhaustive-deps -- restoredLayers only seeds the first load

  const layersKey = useMemo(() => [...visibleLayers].sort().join(","), [visibleLayers]);

  // Trigger debounced render whenever layer selection changes.
  // First render (no previewUrl yet) fires immediately; subsequent changes
  // are debounced so rapid clicks don't flood the API. Only the latest
  // request's answer is shown, so a slow earlier render never overwrites it.
  useEffect(() => {
    if (!config || visibleLayers.size === 0) return;

    if (renderTimerRef.current) clearTimeout(renderTimerRef.current);

    const delay = isFirstRender.current ? 0 : 150;
    isFirstRender.current = false;

    renderTimerRef.current = setTimeout(() => {
      const key = layersKey;
      latestKey.current = key;
      setError(null);

      renderConfiguration(model, [...visibleLayers], apiUrl)
        .then((blob) => {
          if (latestKey.current !== key) return;
          // Revoke previous object URL to avoid memory leaks
          if (prevObjectUrlRef.current) {
            URL.revokeObjectURL(prevObjectUrlRef.current);
          }
          const url = URL.createObjectURL(blob);
          prevObjectUrlRef.current = url;
          setPreviewUrl(url);
        })
        .catch((err: Error) => {
          if (latestKey.current === key) setError(`Preview unavailable: ${err.message}`);
        })
        .finally(() => {
          if (latestKey.current === key) setRenderedKey(key);
        });
    }, delay);

    return () => {
      if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
    };
  }, [visibleLayers, layersKey, config, model, apiUrl]);

  const updating = !!config && visibleLayers.size > 0 && renderedKey !== layersKey;

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (prevObjectUrlRef.current) URL.revokeObjectURL(prevObjectUrlRef.current);
    };
  }, []);

  const toggleLayer = useCallback(
    (layerId: string, exclusive: boolean, groupPeers?: string[]) => {
      if (!config) return;
      setVisibleLayers((prev) => rules.toggleLayer(config, prev, layerId, exclusive, groupPeers));
    },
    [config],
  );

  const reset = useCallback(() => {
    if (config) setVisibleLayers(rules.defaultLayers(config));
  }, [config]);

  return {
    config,
    configLoading,
    visibleLayers,
    previewUrl,
    updating,
    error,
    toggleLayer,
    reset,
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

// Public Blob root holding each part's layer PNG (its size positions the detail crops)
const LAYER_IMAGE_BASE = (
  process.env.NEXT_PUBLIC_BLOB_BASE_URL || "https://cumxnjuhzezfht2i.public.blob.vercel-storage.com"
).replace(/\/$/, "");

// Shared build links always point at the live site, wherever they're created
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://energicamotor.com").replace(/\/$/, "");

const MODAL_COPY = {
  contact: {
    title: "Contact Dealer",
    intro: "Send us your build and we'll connect you with your nearest Energica dealer for a quotation.",
    submit: "Send Enquiry",
  },
  link: {
    title: "Get your build link",
    intro: "Tell us where you are and we'll create your link — and have your nearest Energica dealer get in touch.",
    submit: "Send & get link",
  },
  pdf: {
    title: "Download your build",
    intro: "Tell us where you are and we'll prepare your PDF — and have your nearest Energica dealer get in touch.",
    submit: "Send & download PDF",
  },
  whatsapp: {
    title: "Share your build",
    intro: "Tell us where you are and we'll create your link — and have your nearest Energica dealer get in touch.",
    submit: "Send & share",
  },
};

function BuildLinkBox({ url, copied, onCopy, whatsappUrl }: { url: string; copied: boolean; onCopy: () => void; whatsappUrl: string }) {
  return (
    <div>
      <p style={S.sectionTitle}>Your build link</p>
      <div style={{ display: "flex", gap: "6px" }}>
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          style={{ ...S.shareInput, minWidth: 0, cursor: "text" }}
          aria-label="Your build link"
        />
        <button type="button" onClick={onCopy} style={S.copyBtn}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...S.copyBtn, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
          aria-label="Share on WhatsApp"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}

// Responsive layout, focus ring and button cursors (inline styles can't do these)
const LAYOUT_CSS = `
  @keyframes energica-spin { to { transform: rotate(360deg); } }
  .cfg-root button { cursor: pointer; font: inherit; }
  .cfg-root button:disabled { cursor: not-allowed; }
  .cfg-root button:focus-visible, .cfg-root a:focus-visible, .cfg-root input:focus-visible, .cfg-root textarea:focus-visible,
  .cfg-modal button:focus-visible, .cfg-modal a:focus-visible, .cfg-modal input:focus-visible, .cfg-modal textarea:focus-visible {
    outline: 2px solid ${COLOR.greenText}; outline-offset: 2px;
  }
  .cfg-bar-status { display: none; }
  /* "More" is 32px tall; its hit area extends to 44px */
  .cfg-more > button { position: relative; }
  .cfg-more > button::after { content: ""; position: absolute; inset: -6px 0; }
  .cfg-progress { position: relative; width: 48px; height: 2px; background: ${COLOR.rule}; overflow: hidden; }
  .cfg-progress > span { position: absolute; top: 0; bottom: 0; width: 40%; background: ${COLOR.green}; animation: cfg-progress 900ms ease-in-out infinite; }
  @keyframes cfg-progress { from { left: -40%; } to { left: 100%; } }
  @media (prefers-reduced-motion: reduce) { .cfg-progress > span { animation: none; left: 0; width: 100%; } }
  .cfg-scroll { overflow-x: auto; scrollbar-width: none; }
  .cfg-scroll::-webkit-scrollbar { display: none; }
  .cfg-main { display: flex; flex-wrap: wrap; align-items: stretch; flex-grow: 1; }
  .cfg-stage { flex: 999 1 560px; min-width: 0; padding: 36px 48px 28px; display: flex; flex-direction: column; box-sizing: border-box; }
  /* The render fits the space left between the heading and the spec strip on first view */
  .cfg-render { min-height: 280px; }
  .cfg-render-img { width: 100%; max-width: 840px; height: auto; max-height: max(260px, calc(100vh - 560px)); }
  .cfg-panel { flex: 1 1 400px; max-width: ${SIZE.panelW}px; background: ${COLOR.white}; border-left: ${BORDER.idle}; display: flex; flex-direction: column; box-sizing: border-box; min-width: 0; }
  @media (max-width: ${SIZE.stackBelow}px) {
    .cfg-main { flex-direction: column; }
    .cfg-stage { flex: none; padding: 28px 24px 20px; }
    .cfg-panel { flex: none; max-width: none; width: 100%; border-left: none; border-top: ${BORDER.idle}; }
    .cfg-modelbar { padding: 0 8px !important; }
  }
  @media (max-width: 640px) {
    .cfg-title { font-size: 52px !important; }
    .cfg-stage { padding: 20px 16px 16px; }
    .cfg-panel-body { padding: 20px 16px 8px !important; }
    .cfg-panel-nav { padding: 12px 16px 20px !important; }
    .cfg-stepcount { display: none !important; }
    /* Bottom bar, about 104px: count + More menu, then PDF and Contact Dealer */
    .cfg-actionbar { padding: 10px 16px calc(10px + env(safe-area-inset-bottom)) !important; gap: 8px !important; }
    .cfg-bar-info { flex: 1 1 100% !important; flex-direction: row !important; align-items: center; justify-content: space-between; }
    .cfg-bar-prefix, .cfg-bar-summary, .cfg-wide-only { display: none !important; }
    .cfg-bar-status { display: inline !important; }
    .cfg-more { display: block !important; }
    .cfg-actions { width: 100%; flex-wrap: nowrap !important; gap: 8px !important; }
    .cfg-actions > .cfg-pdf, .cfg-actions > .cfg-contact { flex: 1 1 0; padding: 0 8px !important; letter-spacing: 0.1em !important; }
    .cfg-options { grid-template-columns: minmax(0, 1fr) !important; }
  }
`;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EnergiccaConfigurator({
  model,
  apiUrl = "http://localhost:8000",
  initialLayers,
  onModelChange,
}: Props) {
  const {
    config,
    configLoading,
    visibleLayers,
    previewUrl,
    updating,
    error,
    toggleLayer,
    reset,
  } = useConfigurator(model, apiUrl, initialLayers);

  // ── Sharing, PDF and enquiries ────────────────────────────────────────────
  // Copying the build link, downloading the PDF and "Contact Dealer" all go
  // through one short form first; the build (PDF attached) is emailed to
  // Energica sales, who forward it to the right dealer. Once the form is sent,
  // the link and PDF are unlocked for the session, and any later change to the
  // build is sent to sales again as an update.
  const longShareUrl = useMemo(() => {
    if (typeof window === "undefined" || visibleLayers.size === 0) return "";
    const encoded = encodeConfig([...visibleLayers]);
    return `${SITE_URL}/configurator?model=${model}&layers=${encoded}`;
  }, [visibleLayers, model]);

  // Short link for the current build (/b/<code>), created on demand
  const shortLinks = useRef(new Map<string, { code: string; url: string }>());
  const [shortLink, setShortLink] = useState<{ code: string; url: string } | null>(null);
  useEffect(() => {
    setShortLink(shortLinks.current.get(encodeConfig([...visibleLayers])) ?? null);
  }, [visibleLayers]);

  const ensureShortLink = useCallback(async () => {
    const key = encodeConfig([...visibleLayers]);
    const cached = shortLinks.current.get(key);
    if (cached) return cached;
    try {
      const res = await fetch("/api/builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, layers: [...visibleLayers] }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { code } = await res.json();
      const link = { code, url: `${SITE_URL}/b/${code}` };
      shortLinks.current.set(key, link);
      setShortLink(link);
      return link;
    } catch (err) {
      console.error("[configurator] short link failed", err);
      return { code: "", url: longShareUrl };
    }
  }, [visibleLayers, model, longShareUrl]);

  // Address bar: once the build settles, show its permanent short code
  // (/configurator?build=<code>) instead of the full layer list.
  useEffect(() => {
    if (!config || visibleLayers.size === 0) return;
    const t = setTimeout(async () => {
      const { code } = await ensureShortLink();
      if (code && window.location.pathname === "/configurator") {
        window.history.replaceState(null, "", `/configurator?build=${code}`);
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [config, visibleLayers, ensureShortLink]);

  // Selected options for the summary, the build sheet and the sales email
  const chosen = useMemo(() => (config ? rules.selectedOptions(config, visibleLayers) : []), [config, visibleLayers]);
  const selectedOptions = useCallback(() => chosen, [chosen]);

  const hasRsOption = useMemo(() => !!config?.layers.some((l) => /rs version/i.test(l.name)), [config]);
  const emailOptions = useCallback(() => {
    const sheet = buildSheetContent(model, selectedOptions(), hasRsOption);
    return [...sheet.base, ...sheet.upgrades].map((r) => ({ group: r.label, name: r.title }));
  }, [model, selectedOptions, hasRsOption]);

  const makePdf = useCallback(async (link: { code: string; url: string }, customerName?: string) => {
    const { createConfiguratorPdf } = await import("@/lib/build-sheet");
    return createConfiguratorPdf({
      model,
      hasRsOption,
      imageUrl: previewUrl,
      canvas: config?.canvas ?? { width: 1, height: 1 },
      layerBaseUrl: LAYER_IMAGE_BASE,
      options: selectedOptions(),
      buildUrl: link.url,
      buildCode: link.code,
      customerName,
    });
  }, [model, hasRsOption, previewUrl, config, selectedOptions]);

  type Intent = "contact" | "link" | "pdf" | "whatsapp";
  type Lead = { name: string; email: string; phone: string; country: string; dealer: string; message: string };
  const EMPTY_LEAD: Lead = { name: "", email: "", phone: "", country: "", dealer: "", message: "" };

  // The visitor's details, remembered for this browser session
  const [lead, setLead] = useState<Lead | null>(null);
  const sentCodes = useRef(new Set<string>());
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("energica-cfg-lead") ?? "null");
      if (saved?.lead?.email) setLead(saved.lead);
      (saved?.sent ?? []).forEach((c: string) => sentCodes.current.add(c));
    } catch { /* storage unavailable */ }
  }, []);
  const rememberLead = (l: Lead) => {
    setLead(l);
    try {
      sessionStorage.setItem("energica-cfg-lead", JSON.stringify({ lead: l, sent: [...sentCodes.current] }));
    } catch { /* storage unavailable */ }
  };

  const sendToSales = useCallback(async (
    l: Lead,
    intent: Intent | "update",
    link: { code: string; url: string },
    pdf: { base64: string; fileName: string } | null,
  ) => {
    const res = await fetch("/api/configurator-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...l,
        intent,
        model: MODEL_DISPLAY_NAMES[model] ?? model,
        options: emailOptions(),
        buildUrl: link.url,
        buildCode: link.code,
        // The attachment carries the build ref, so only send it with a saved build
        pdf: link.code ? pdf?.base64 : undefined,
        pdfName: link.code ? pdf?.fileName : undefined,
      }),
    });
    if (!res.ok) throw new Error("Submit failed");
    if (link.code) sentCodes.current.add(link.code);
  }, [model, emailOptions]);

  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<Intent | null>(null);
  const copyLink = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      return true;
    } catch {
      return false; // the link stays visible in the build-link box to copy by hand
    }
  }, []);
  const whatsappUrl = (url: string) =>
    `https://wa.me/?text=${encodeURIComponent(`My Energica ${MODEL_DISPLAY_NAMES[model] ?? model} build: ${url}`)}`;

  // Form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIntent, setModalIntent] = useState<Intent>("contact");
  const [dealerForm, setDealerForm] = useState<Lead>(EMPTY_LEAD);
  const [dealerSubmitting, setDealerSubmitting] = useState(false);
  const [dealerSuccess, setDealerSuccess] = useState(false);
  const [dealerError, setDealerError] = useState<string | null>(null);
  const lastPdf = useRef<{ save: () => void } | null>(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  const openForm = (intent: Intent) => {
    setModalIntent(intent);
    setDealerForm(lead ?? EMPTY_LEAD);
    setDealerSuccess(false);
    setDealerError(null);
    setModalOpen(true);
  };

  // Copy link / Download PDF: form first; afterwards they act directly and
  // a changed build is sent to sales as an update.
  const handleAction = useCallback(async (intent: "link" | "pdf") => {
    if (!config || busy) return;
    if (!lead) { openForm(intent); return; }
    setBusy(intent);
    try {
      const link = await ensureShortLink();
      const isNew = !!link.code && !sentCodes.current.has(link.code);
      if (intent === "link") await copyLink(link.url);
      const pdf = intent === "pdf" || isNew ? await makePdf(link, lead.name) : null;
      if (intent === "pdf") pdf?.save();
      if (isNew) {
        sendToSales(lead, "update", link, pdf)
          .then(() => rememberLead(lead))
          .catch((err) => console.error("[configurator] update not sent", err));
      }
    } catch (err) {
      console.error("[configurator] action failed", err);
    } finally {
      setBusy(null);
    }
  }, [config, busy, lead, ensureShortLink, copyLink, makePdf, sendToSales]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDealerSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const f = {
      ...dealerForm,
      name: dealerForm.name.trim(),
      email: dealerForm.email.trim(),
      phone: dealerForm.phone.trim(),
      country: dealerForm.country.trim(),
    };
    if (!f.name || !f.email || !f.phone || !f.country) {
      setDealerError("Please fill in your name, email, phone and country.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
      setDealerError("Please enter a valid email address.");
      return;
    }
    setDealerSubmitting(true);
    setDealerError(null);
    try {
      const link = await ensureShortLink();
      const pdf = await makePdf(link, f.name);
      await sendToSales(f, modalIntent, link, pdf);
      rememberLead(f);
      lastPdf.current = pdf;
      setDealerSuccess(true);
      if (modalIntent === "pdf") pdf.save();
      if (modalIntent === "link") copyLink(link.url);
    } catch {
      setDealerError("Something went wrong. Please try again.");
    } finally {
      setDealerSubmitting(false);
    }
  }, [dealerForm, modalIntent, ensureShortLink, makePdf, sendToSales, copyLink]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Panel, stage and summary ──────────────────────────────────────────────
  const sections = useMemo(() => (config ? rules.sectionsFor(config, visibleLayers) : []), [config, visibleLayers]);
  const steps = useMemo(
    () => (config ? rules.buildSteps(model, Object.keys(config.groups).concat(sections.some((s) => s.key === "other") ? ["other"] : [])) : []),
    [config, model, sections],
  );
  const [step, setStep] = useState(0);
  const current = steps[Math.min(step, Math.max(0, steps.length - 1))];
  const stepSections = current ? sections.filter((s) => current.groups.includes(s.key)) : [];
  const counts = rules.stepCounts(chosen, steps);
  const summary = rules.summarise(chosen, steps);

  const colourOption = chosen.find((o) => o.groupKey === "base_color");
  const colourName = colourOption ? cleanLayerName(colourOption, "base_color").title : "";
  const isRs = !!config?.layers.some((l) => /rs version/i.test(l.name) && visibleLayers.has(l.id));
  const version = hasRsOption ? (isRs ? "RS" : "Standard") : null;
  const stats = performanceFor(model, MODEL_INFO[model].name).grid;

  const isLast = step >= steps.length - 1;
  const copyLabel = copied ? "LINK COPIED" : busy === "link" ? "CREATING LINK…" : "COPY LINK";
  const pdfLabel = busy === "pdf" ? "PREPARING PDF…" : "DOWNLOAD PDF";

  return (
    <>
      <style>{LAYOUT_CSS}</style>

      <div className="cfg-root" style={{ fontFamily: FONT.body, color: COLOR.text, background: COLOR.paper, minHeight: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
        <ModelTabs active={model} onPick={onModelChange} step={Math.min(step, Math.max(0, steps.length - 1))} steps={steps.length} />

        <main className="cfg-main">
          {/* Stage: model, live render and headline figures */}
          <section aria-label="Preview" className="cfg-stage">
            <StageHeading model={model} colour={colourName} version={version} />

            <div className="cfg-render" style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "20px 0" }}>
              <div aria-hidden style={{ position: "absolute", left: "12%", right: "12%", bottom: 24, height: 40, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(15,16,18,0.18), rgba(15,16,18,0))" }} />
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- object URL from the compositor
                <img
                  src={previewUrl}
                  alt={`${MODEL_INFO[model].name} configured preview`}
                  className="cfg-render-img"
                  style={{ display: "block", objectFit: "contain", mixBlendMode: "multiply", position: "relative", opacity: updating ? 0.72 : 1, transition: "opacity 120ms ease" }}
                />
              ) : (
                <div style={{ ...monoLabel(11), display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  {configLoading || updating ? <div style={S.spinner} aria-label="Loading preview" /> : <span>Select options to preview</span>}
                </div>
              )}
              {/* Redrawing after a change: the old image stays (dimmed) with a
                  thin progress line; the panel stays usable throughout. */}
              {previewUrl && (
                <div role="status" aria-live="polite" style={{ position: "absolute", top: 4, right: 0, display: "flex", alignItems: "center", gap: 10, pointerEvents: "none", opacity: updating ? 1 : 0, transition: "opacity 120ms ease" }}>
                  <span className="cfg-progress" aria-hidden><span /></span>
                  <span style={monoLabel(10)}>{updating ? "Updating preview" : ""}</span>
                </div>
              )}
            </div>

            {error && <div style={{ ...S.errorBanner, marginBottom: 16 }} role="alert">{error}</div>}

            <SpecStrip stats={stats} />
          </section>

          {/* Options panel */}
          <aside aria-label="Build options" className="cfg-panel">
            {configLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                <div style={S.spinner} aria-label="Loading configuration" />
              </div>
            ) : (
              <>
                <StepTabs steps={steps} counts={counts} active={Math.min(step, Math.max(0, steps.length - 1))} onPick={setStep} />
                <div className="cfg-panel-body" style={{ padding: "24px 28px 8px", flexGrow: 1, display: "flex", flexDirection: "column", gap: 26 }}>
                  {stepSections.map((section) => (
                    <OptionSection
                      key={section.key}
                      section={section}
                      onToggle={(o) => toggleLayer(o.layer.id, section.exclusive, section.peers)}
                    />
                  ))}
                </div>
                <div className="cfg-panel-nav" style={{ padding: "16px 28px 24px", display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    style={{ ...S.btnSecondary, width: "auto", padding: "0 18px", background: COLOR.white, opacity: step === 0 ? 0.35 : 1 }}
                  >
                    BACK
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                    disabled={isLast}
                    style={{ ...S.btnSecondary, flexGrow: 1, background: COLOR.dark, borderColor: COLOR.dark, color: COLOR.white, opacity: isLast ? 0.35 : 1 }}
                  >
                    {isLast ? "BUILD COMPLETE" : `NEXT: ${steps[step + 1]?.label.toUpperCase()}`}
                  </button>
                </div>
              </>
            )}
          </aside>
        </main>

        <footer style={{ borderTop: BORDER.idle, padding: "20px 48px", textAlign: "center", background: COLOR.paper }}>
          <p style={{ ...monoLabel(11, 0.25), margin: 0 }}>Progress, Ridden.</p>
        </footer>

        <ActionBar
          countLabel={summary.countLabel}
          summary={summary.text}
          copyLabel={copyLabel}
          copyIdle={!copied && busy !== "link"}
          pdfLabel={pdfLabel}
          linkDisabled={busy === "link" || !config}
          pdfDisabled={busy === "pdf" || !previewUrl}
          onReset={reset}
          onCopy={() => handleAction("link")}
          onPdf={() => handleAction("pdf")}
          onContact={() => openForm("contact")}
        />
      </div>

      {/* Build enquiry modal — portal so no parent clips it; cursor reset overrides body { cursor:none } */}
      {modalOpen && createPortal(
        <div
          className="cfg-modal"
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(15,16,18,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", cursor: "auto" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cfg-modal-title"
            style={{ backgroundColor: COLOR.white, color: COLOR.text, width: "480px", maxWidth: "100%", maxHeight: "92vh", overflowY: "auto", borderRadius: 0, cursor: "auto" }}
          >
            {/* Modal header */}
            <div style={{ backgroundColor: COLOR.dark, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `3px solid ${COLOR.green}` }}>
              <div>
                <p id="cfg-modal-title" style={{ margin: 0, fontFamily: FONT.display, fontWeight: 600, fontSize: "22px", letterSpacing: "0.04em", textTransform: "uppercase", color: COLOR.white }}>{MODAL_COPY[modalIntent].title}</p>
                <p style={{ margin: "2px 0 0", ...monoLabel(10, 0.14, COLOR.green) }}>{MODEL_INFO[model].name}</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", color: COLOR.onDark, fontSize: "22px", lineHeight: 1, minWidth: SIZE.touch, minHeight: SIZE.touch, cursor: "pointer" }} aria-label="Close">✕</button>
            </div>

            <div style={{ padding: "24px" }}>
              {dealerSuccess ? (
                <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                  <div aria-hidden style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: COLOR.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "26px", color: COLOR.dark }}>✓</div>
                  <p style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: "26px", textTransform: "uppercase", margin: "0 0 8px", color: COLOR.text }}>Thank You!</p>
                  <p style={{ fontFamily: FONT.body, fontSize: "14px", color: COLOR.secondary, margin: "0 0 20px", lineHeight: 1.5 }}>
                    Your build has been sent to Energica. We&apos;ll connect you with your nearest dealer within 24 hours — a copy is on its way to your inbox.
                  </p>
                  {shortLink && (
                    <div style={{ textAlign: "left", marginBottom: "12px" }}>
                      <BuildLinkBox
                        url={shortLink.url}
                        copied={copied}
                        onCopy={() => copyLink(shortLink.url)}
                        whatsappUrl={whatsappUrl(shortLink.url)}
                      />
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="button" onClick={() => lastPdf.current?.save()} style={{ ...S.btnSecondary, flex: 1, cursor: "pointer" }}>
                      Download PDF
                    </button>
                    <button type="button" onClick={() => setModalOpen(false)} style={{ ...S.btnPrimary, flex: 1, cursor: "pointer" }}>
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDealerSubmit} noValidate>
                  <p style={{ fontFamily: FONT.body, fontSize: "13px", color: COLOR.secondary, margin: "0 0 18px", lineHeight: 1.5 }}>
                    {MODAL_COPY[modalIntent].intro}
                  </p>
                  {([
                    { id: "dc-name", label: "Full Name", key: "name", type: "text", placeholder: "Jane Smith", required: true },
                    { id: "dc-email", label: "Email", key: "email", type: "email", placeholder: "jane@example.com", required: true },
                    { id: "dc-phone", label: "Phone", key: "phone", type: "tel", placeholder: "+27 82 000 0000", required: true },
                    { id: "dc-country", label: "Country / City", key: "country", type: "text", placeholder: "Cape Town, South Africa", required: true },
                    { id: "dc-dealer", label: "Preferred dealer (optional)", key: "dealer", type: "text", placeholder: "If you already have one in mind", required: false },
                  ] as const).map(({ id, label, key, type, placeholder, required }) => (
                    <div key={key} style={{ marginBottom: "14px" }}>
                      <label htmlFor={id} style={S.fieldLabel}>{label}{required ? " *" : ""}</label>
                      <input
                        id={id}
                        type={type}
                        required={required}
                        placeholder={placeholder}
                        value={dealerForm[key]}
                        onChange={(e) => setDealerForm((f) => ({ ...f, [key]: e.target.value }))}
                        style={S.field}
                      />
                    </div>
                  ))}

                  <div style={{ marginBottom: "14px" }}>
                    <label htmlFor="dc-message" style={S.fieldLabel}>Message</label>
                    <textarea
                      id="dc-message"
                      rows={3}
                      placeholder="Any questions or specific requirements…"
                      value={dealerForm.message}
                      onChange={(e) => setDealerForm((f) => ({ ...f, message: e.target.value }))}
                      style={{ ...S.field, resize: "vertical", lineHeight: 1.5 }}
                    />
                  </div>

                  <p style={{ fontFamily: FONT.body, fontSize: "12px", color: COLOR.label, margin: "0 0 16px", lineHeight: 1.5 }}>
                    Your details and build are sent to Energica and shared with your nearest dealer so they can contact you. See our{" "}
                    <a href="/privacy" target="_blank" rel="noopener" style={{ color: COLOR.greenText }}>Privacy Policy</a>.
                  </p>

                  {dealerError && (
                    <p role="alert" style={{ fontFamily: FONT.body, fontSize: "13px", color: COLOR.error, margin: "0 0 16px" }}>{dealerError}</p>
                  )}

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="button" onClick={() => setModalOpen(false)} style={{ ...S.btnSecondary, flex: 1, cursor: "pointer" }}>Cancel</button>
                    <button type="submit" disabled={dealerSubmitting} style={{ ...S.btnPrimary, flex: 2, opacity: dealerSubmitting ? 0.7 : 1, cursor: "pointer" }}>
                      {dealerSubmitting ? "Sending…" : MODAL_COPY[modalIntent].submit}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
