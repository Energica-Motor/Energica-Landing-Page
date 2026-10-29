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
import { fitBike, measureBike, paddedRegion, sameBox, unionBox, type BikeBox, type Rect } from "./trim";
import { ActionBar, ModelTabs, OptionSection, SpecStrip, StageHeading, StepTabs } from "./ui";
import { BORDER, COLOR, FONT, SIZE, monoLabel } from "./theme";

interface Props {
  model: Model;
  apiUrl?: string;
  initialLayers?: string[]; // build restored from a short link (?build=<code>)
  buildNotFound?: boolean; // ?build=<code> named a build that doesn't exist
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
  // Where the bike sits in the preview: the union of every render of this
  // model, so changing colour or wheels never resizes it on screen
  const [bikeBox, setBikeBox] = useState<BikeBox | null>(null);
  const boxCache = useRef(new Map<string, BikeBox | null>());
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
        .then(async (blob) => {
          if (latestKey.current !== key) return;
          const url = URL.createObjectURL(blob);
          // Measure the bike before showing the image, so image and crop change
          // together; a selection's image is measured once (object URLs are
          // new on every fetch, so the selection is the image's identity)
          const box = boxCache.current.has(key) ? boxCache.current.get(key)! : await measureBike(blob);
          boxCache.current.set(key, box);
          if (latestKey.current !== key) { URL.revokeObjectURL(url); return; }
          // Revoke previous object URL to avoid memory leaks
          if (prevObjectUrlRef.current) {
            URL.revokeObjectURL(prevObjectUrlRef.current);
          }
          prevObjectUrlRef.current = url;
          setBikeBox((prev) => {
            const next = unionBox(prev, box);
            return sameBox(prev, next) ? prev : next;
          });
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
    bikeBox,
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

// Phones: height of the sticky preview strip, and the phone layout breakpoint
const PREVIEW_STRIP_H = 120;
const PHONE_MAX = 640;

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
  /* Bar heights are measured on mount; these are the first-paint values */
  .cfg-root { --cfg-modelbar-h: 65px; --cfg-bar-h: 73px; }
  .cfg-main { display: flex; flex-wrap: wrap; align-items: stretch; flex-grow: 1; }
  .cfg-stage { flex: 999 1 560px; min-width: 0; padding: 36px 48px 28px; display: flex; flex-direction: column; box-sizing: border-box; }
  .cfg-render { min-height: 220px; position: relative; }
  /* The bike box is the bike's own region of the preview (white margins
     trimmed), so the floor shadow sits under the wheels. Stacked layouts:
     full width at the region's ratio. */
  .cfg-bike { position: relative; width: 100%; aspect-ratio: var(--cfg-bike-ratio); }
  .cfg-panel { flex: 1 1 400px; max-width: ${SIZE.panelW}px; background: ${COLOR.white}; border-left: ${BORDER.idle}; display: flex; flex-direction: column; box-sizing: border-box; min-width: 0; }
  .cfg-tab { flex: 1 0 auto; }
  .cfg-flash { animation: cfg-flash 1.6s ease-out; }
  @keyframes cfg-flash { 0%, 35% { box-shadow: 0 0 0 2px ${COLOR.green}; background: rgba(0,0,0,0.25); } 100% { box-shadow: 0 0 0 2px transparent; } }
  @media (prefers-reduced-motion: reduce) { .cfg-flash { animation: none; outline: 2px solid ${COLOR.green}; } }
  .cfg-preview-strip { display: none; }
  .cfg-dialog { max-height: calc(100vh - 48px); max-height: calc(100dvh - 48px); }
  /* Desktop: the stage is exactly the space between the bars and never moves;
     the options scroll inside the panel. */
  @media (min-width: ${SIZE.stackBelow}px) {
    .cfg-main { flex: none; flex-wrap: nowrap; min-height: 460px;
      height: calc(100vh - var(--cfg-header, 80px) - var(--cfg-modelbar-h) - var(--cfg-bar-h));
      height: calc(100dvh - var(--cfg-header, 80px) - var(--cfg-modelbar-h) - var(--cfg-bar-h)); }
    /* The title overlays the stage's top-left, so the bike gets the full
       height between the model bar and the spec strip; the bike is sized and
       placed in JS (fitBike) to fit and keep clear of the title. */
    .cfg-stage { min-height: 0; overflow: hidden; position: relative; padding-top: 6px; }
    .cfg-stage-title { position: absolute; top: 36px; left: 48px; z-index: 2; }
    /* The image area reaches 16px from the stage edges, past its side padding */
    .cfg-render { flex: 1 1 0; min-height: 0; margin: 0 -32px; }
    .cfg-bike { position: absolute; aspect-ratio: auto; }
    .cfg-panel { height: 100%; overflow: hidden; }
    .cfg-panel-body { flex: 1 1 0 !important; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
  }
  @media (min-width: ${SIZE.stackBelow}px) and (max-height: 820px) {
    .cfg-stage { padding: 6px 40px 20px; }
    .cfg-stage-title { top: 24px; left: 40px; }
    .cfg-render { margin: 0 -24px; }
    .cfg-title { font-size: 56px !important; }
  }
  @media (max-width: ${SIZE.stackBelow - 1}px) {
    .cfg-main { flex-direction: column; }
    .cfg-stage { flex: none; padding: 28px 24px 20px; }
    .cfg-panel { flex: none; max-width: none; width: 100%; border-left: none; border-top: ${BORDER.idle}; }
    .cfg-modelbar { padding: 0 8px !important; }
  }
  @media (max-width: ${PHONE_MAX}px) {
    .cfg-title { font-size: 52px !important; }
    .cfg-stage { padding: 20px 16px 16px; }
    .cfg-panel-body { padding: 20px 16px 8px !important; }
    .cfg-panel-nav { padding: 12px 16px 20px !important; }
    .cfg-panel-extras { padding: 8px 16px 0 !important; }
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
    /* Compact preview under the site header once the stage is out of view */
    .cfg-preview-strip { display: flex; position: fixed; left: 0; right: 0; top: var(--cfg-header, 80px); z-index: 30; height: ${PREVIEW_STRIP_H}px;
      box-sizing: border-box; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 16px;
      background: ${COLOR.white}; border-bottom: ${BORDER.idle}; box-shadow: 0 6px 16px rgba(15,16,18,0.08);
      transform: translateY(-8px); opacity: 0; visibility: hidden; transition: opacity 160ms ease, transform 160ms ease, visibility 0s 160ms; }
    .cfg-preview-strip[data-shown="true"] { transform: none; opacity: 1; visibility: visible; transition: opacity 160ms ease, transform 160ms ease; }
  }
`;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EnergiccaConfigurator({
  model,
  apiUrl = "http://localhost:8000",
  initialLayers,
  buildNotFound = false,
  onModelChange,
}: Props) {
  const {
    config,
    configLoading,
    visibleLayers,
    previewUrl,
    bikeBox,
    updating,
    error,
    toggleLayer,
    reset,
  } = useConfigurator(model, apiUrl, initialLayers);
  const rootRef = useRef<HTMLDivElement>(null);

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
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Lead, string>>>({});
  const lastPdf = useRef<{ save: () => void } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

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
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setModalIntent(intent);
    setDealerForm(lead ?? EMPTY_LEAD);
    setDealerSuccess(false);
    setDealerError(null);
    setFieldErrors({});
    setModalOpen(true);
  };

  // Focus goes back to the button that opened the form; one picked from the
  // phone "More" menu is gone by then, so the menu button gets it instead.
  const closeForm = useCallback(() => {
    setModalOpen(false);
    const opener = openerRef.current;
    const target = opener?.isConnected ? opener : rootRef.current?.querySelector<HTMLElement>(".cfg-more > button");
    requestAnimationFrame(() => target?.focus({ preventScroll: true }));
  }, []);

  // While open: first field focused, Escape closes, Tab stays inside
  useEffect(() => {
    if (!modalOpen) return;
    const dialog = dialogRef.current;
    (dialog?.querySelector<HTMLElement>("input") ?? dialog)?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); closeForm(); return; }
      if (e.key !== "Tab" || !dialog) return;
      const items = [...dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled])")];
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      const inside = dialog.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !inside)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen, closeForm]);

  // The success view replaces the focused submit button; keep focus inside
  useEffect(() => {
    if (dealerSuccess) dialogRef.current?.focus({ preventScroll: true });
  }, [dealerSuccess]);

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
    // Same checks and messages as before; each failing field is also marked
    // and the first one focused.
    const flag = (errors: Partial<Record<keyof Lead, string>>, message: string) => {
      setFieldErrors(errors);
      setDealerError(message);
      const firstKey = (["name", "email", "phone", "country"] as const).find((k) => errors[k]);
      const input = firstKey && document.getElementById(`dc-${firstKey}`);
      if (!input) return;
      input.focus({ preventScroll: true });
      // Bring the whole field, label included, into the scrolling area
      const field = input.parentElement!, box = field.closest(".cfg-dialog-fields");
      if (box) box.scrollTop += field.getBoundingClientRect().top - box.getBoundingClientRect().top - 16;
    };
    const missing = (["name", "email", "phone", "country"] as const).filter((k) => !f[k]);
    if (missing.length) {
      flag(Object.fromEntries(missing.map((k) => [k, "Required"])), "Please fill in your name, email, phone and country.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
      flag({ email: "Enter a valid email address" }, "Please enter a valid email address.");
      return;
    }
    setFieldErrors({});
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

  const panelRef = useRef<HTMLElement>(null);
  const panelBodyRef = useRef<HTMLDivElement>(null);
  const renderRef = useRef<HTMLDivElement>(null);
  const headerOffset = () => parseFloat(rootRef.current ? getComputedStyle(rootRef.current).getPropertyValue("--cfg-header") : "") || 80;

  // Bar heights feed the desktop stage height (they grow when their content wraps)
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const bars = [[".cfg-modelbar", "--cfg-modelbar-h"], [".cfg-actionbar", "--cfg-bar-h"]] as const;
    const measure = () => bars.forEach(([sel, v]) => {
      const el = root.querySelector<HTMLElement>(sel);
      if (el) root.style.setProperty(v, `${el.offsetHeight}px`);
    });
    const ro = new ResizeObserver(measure);
    bars.forEach(([sel]) => { const el = root.querySelector(sel); if (el) ro.observe(el); });
    measure();
    return () => ro.disconnect();
  }, []);

  // A new step starts at the top of the options. Desktop scrolls only the
  // panel; stacked layouts bring the panel top under the sticky header (and
  // the phone preview strip).
  const stepShown = useRef(false);
  useEffect(() => {
    if (!stepShown.current) { stepShown.current = true; return; }
    if (panelBodyRef.current) panelBodyRef.current.scrollTop = 0;
    const media = (q: string) => !!window.matchMedia?.(q).matches;
    if (media(`(min-width: ${SIZE.stackBelow}px)`)) return;
    const panel = panelRef.current;
    if (!panel) return;
    const offset = headerOffset() + (media(`(max-width: ${PHONE_MAX}px)`) ? PREVIEW_STRIP_H : 0);
    window.scrollTo({
      top: panel.getBoundingClientRect().top + window.scrollY - offset,
      behavior: media("(prefers-reduced-motion: reduce)") ? "auto" : "smooth",
    });
  }, [step]);

  // Last step: point at the build summary in the bottom bar
  const [reviewFlash, setReviewFlash] = useState(0);

  // A colour change that drops options needing another colour says so
  const [panelNotice, setPanelNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!panelNotice) return;
    const t = setTimeout(() => setPanelNotice(null), 4000);
    return () => clearTimeout(t);
  }, [panelNotice]);
  const onToggle = (section: rules.SectionView, o: rules.OptionView) => {
    if (config && section.key === "base_color") {
      const next = rules.toggleLayer(config, visibleLayers, o.layer.id, section.exclusive, section.peers);
      const notice = rules.colourRemovalNotice(config, visibleLayers, next);
      if (notice) setPanelNotice(notice);
    }
    toggleLayer(o.layer.id, section.exclusive, section.peers);
  };

  const [notFound, setNotFound] = useState(buildNotFound);

  // Phones: compact preview under the header once the stage is out of view
  const [stripShown, setStripShown] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.(`(max-width: ${PHONE_MAX}px)`);
    if (!mq) return;
    const update = () => {
      const render = renderRef.current, panel = panelRef.current;
      if (!mq.matches || !render || !panel) { setStripShown(false); return; }
      const top = headerOffset();
      setStripShown(render.getBoundingClientRect().bottom < top && panel.getBoundingClientRect().bottom > top + PREVIEW_STRIP_H * 2);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // The bike's region of the preview; until it's measured (or if it can't
  // be), the whole image, treated as solid so it still keeps clear of the title
  const canvas = config?.canvas;
  const box = useMemo<BikeBox | null>(
    () => bikeBox ?? (canvas ? { x0: 0, y0: 0, x1: 1, y1: 1, sky: new Array(120).fill(0), aspect: canvas.width / canvas.height } : null),
    [bikeBox, canvas],
  );
  const region = box ? paddedRegion(box) : null;

  // Desktop: size the bike to the space between the model bar and the spec
  // strip, centred and nudged right, shrinking it (never the title) if its
  // outline would run into the title
  const titleRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<ReturnType<typeof fitBike> | null>(null);
  // Every caption the title can show for this model ("Colour · Version"),
  // so the space kept clear for it doesn't change with the colour picked
  const captionNames = useMemo(() => {
    const colours = sections.find((s) => s.key === "base_color")?.options.map((o) => o.title) ?? [];
    return { colours, versions: hasRsOption ? ["RS", "Standard"] : [] };
  }, [sections, hasRsOption]);
  const captionKey = `${captionNames.colours.join("|")}/${captionNames.versions.join("|")}`;
  useEffect(() => {
    const area = renderRef.current, title = titleRef.current;
    if (!area || !title || !box || typeof ResizeObserver === "undefined" || !window.matchMedia) return;
    const desktop = window.matchMedia(`(min-width: ${SIZE.stackBelow}px)`);
    const update = () => {
      if (!desktop.matches) { setFit(null); return; }
      const a = area.getBoundingClientRect(), t = title.getBoundingClientRect();
      const avoid: Rect = { left: t.left - a.left, top: t.top - a.top, right: t.right - a.left, bottom: t.bottom - a.top };
      // Widest possible caption, measured in the caption's own fonts
      const caption = title.querySelector<HTMLElement>("[data-stage-caption]");
      const [colourEl, , versionEl] = caption ? Array.from(caption.children) as HTMLElement[] : [];
      const ctx = document.createElement("canvas").getContext("2d");
      if (caption && colourEl && ctx) {
        const width = (el: HTMLElement, text: string) => { ctx.font = getComputedStyle(el).font; return ctx.measureText(text).width; };
        const colourW = Math.max(0, ...captionNames.colours.map((n) => width(colourEl, n)));
        const versionW = versionEl ? Math.max(0, ...captionNames.versions.map((v) => width(versionEl, v))) + 4 + 2 * 12 : 0;
        avoid.right = Math.max(avoid.right, caption.getBoundingClientRect().left - a.left + colourW + versionW);
      }
      setFit(fitBike(box, { width: a.width, height: a.height }, avoid, { floorPad: 8 }));
    };
    const ro = new ResizeObserver(update);
    ro.observe(area);
    ro.observe(title);
    desktop.addEventListener("change", update);
    update();
    return () => { ro.disconnect(); desktop.removeEventListener("change", update); };
  }, [box, captionKey]); // eslint-disable-line react-hooks/exhaustive-deps -- captionKey stands for captionNames
  const modalFooter: React.CSSProperties = { flex: "none", padding: "14px 24px 20px", borderTop: BORDER.idle, background: COLOR.white };

  return (
    <>
      <style>{LAYOUT_CSS}</style>

      <div ref={rootRef} className="cfg-root" style={{ fontFamily: FONT.body, color: COLOR.text, background: COLOR.paper, minHeight: "calc(100vh - var(--cfg-header, 80px))", display: "flex", flexDirection: "column" }}>
        <ModelTabs active={model} onPick={onModelChange} step={Math.min(step, Math.max(0, steps.length - 1))} steps={steps.length} />

        <main className="cfg-main">
          {/* Stage: model, live render and headline figures */}
          <section aria-label="Preview" className="cfg-stage">
            <div ref={titleRef} className="cfg-stage-title">
              {notFound && (
                <div role="status" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, padding: "8px 8px 8px 14px", border: BORDER.idle, background: COLOR.white, fontSize: 13, color: COLOR.secondary }}>
                  <span>That build link could not be found. Showing the standard {MODEL_INFO[model].name}.</span>
                  <button type="button" onClick={() => setNotFound(false)} aria-label="Dismiss" style={{ background: "none", border: "none", color: COLOR.label, fontSize: 16, lineHeight: 1, minWidth: 32, minHeight: 32, flexShrink: 0 }}>✕</button>
                </div>
              )}

              <StageHeading model={model} colour={colourName} version={version} />
            </div>

            <div ref={renderRef} className="cfg-render" style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: fit ? 0 : "20px 0" }}>
              {previewUrl && region ? (
                <div
                  className="cfg-bike"
                  style={fit
                    ? { left: fit.left, top: fit.top, width: fit.width, height: fit.height }
                    : { ["--cfg-bike-ratio" as string]: String(region.ratio) }}
                >
                  {/* Floor shadow, centred on the bike's bottom edge */}
                  <div aria-hidden style={{ position: "absolute", left: "12%", right: "12%", height: "12%", bottom: `calc(${(region.floor * 100).toFixed(2)}% - 6%)`, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(15,16,18,0.18), rgba(15,16,18,0))" }} />
                  <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- object URL from the compositor */}
                    <img
                      src={previewUrl}
                      alt={`${MODEL_INFO[model].name} configured preview`}
                      className="cfg-render-img"
                      style={{
                        position: "absolute",
                        maxWidth: "none",
                        width: `${100 / (region.x1 - region.x0)}%`,
                        height: `${100 / (region.y1 - region.y0)}%`,
                        left: `${(-region.x0 / (region.x1 - region.x0)) * 100}%`,
                        top: `${(-region.y0 / (region.y1 - region.y0)) * 100}%`,
                        mixBlendMode: "multiply",
                        opacity: updating ? 0.72 : 1,
                        transition: "opacity 120ms ease",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ ...monoLabel(11), position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
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
          <aside ref={panelRef} aria-label="Build options" className="cfg-panel">
            {/* Portal: the page-transition wrapper's filter would pin a fixed child to it */}
            {previewUrl && createPortal(
              <div className="cfg-preview-strip" data-shown={stripShown} aria-hidden>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 20, lineHeight: 1, textTransform: "uppercase", color: COLOR.text }}>{MODEL_INFO[model].name}</span>
                  <span style={{ ...monoLabel(10, 0.12), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{[colourName, version].filter(Boolean).join(" · ")}</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element -- same object URL as the stage */}
                <img src={previewUrl} alt="" style={{ height: "100%", maxWidth: "62%", objectFit: "contain", mixBlendMode: "multiply", opacity: updating ? 0.72 : 1 }} />
              </div>,
              document.body,
            )}
            {configLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                <div style={S.spinner} aria-label="Loading configuration" />
              </div>
            ) : (
              <>
                <StepTabs steps={steps} counts={counts} active={Math.min(step, Math.max(0, steps.length - 1))} onPick={setStep} />
                <div role="status" aria-live="polite" style={{ flex: "none" }}>
                  {panelNotice && (
                    <p data-testid="panel-notice" style={{ margin: 0, padding: "10px 28px", background: COLOR.paper, borderBottom: BORDER.idle, fontSize: 13, color: COLOR.text }}>{panelNotice}</p>
                  )}
                </div>
                <div ref={panelBodyRef} className="cfg-panel-body" style={{ padding: "24px 28px 8px", flexGrow: 1, display: "flex", flexDirection: "column", gap: 26 }}>
                  {stepSections.map((section) => (
                    <OptionSection
                      key={section.key}
                      section={section}
                      onToggle={(o) => onToggle(section, o)}
                    />
                  ))}
                </div>
                {/* Same content and order as the old side-panel actions: the
                    short build link once the visitor has sent their details,
                    otherwise the note about where the build goes. */}
                {(lead && shortLink) || !lead ? (
                  <div className="cfg-panel-extras" style={{ padding: "8px 28px 0", display: "flex", flexDirection: "column", gap: 12 }}>
                    {lead && shortLink && (
                      <BuildLinkBox
                        url={shortLink.url}
                        copied={copied}
                        onCopy={() => copyLink(shortLink.url)}
                        whatsappUrl={whatsappUrl(shortLink.url)}
                      />
                    )}
                    {!lead && (
                      <p style={{ margin: 0, fontFamily: FONT.body, fontSize: "12px", color: COLOR.label, lineHeight: 1.5 }}>
                        Your build goes to Energica, who will connect you with your nearest dealer.
                      </p>
                    )}
                  </div>
                ) : null}
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
                    onClick={() => (isLast ? setReviewFlash((n) => n + 1) : setStep((s) => Math.min(steps.length - 1, s + 1)))}
                    style={{ ...S.btnSecondary, flexGrow: 1, background: COLOR.dark, borderColor: COLOR.dark, color: COLOR.white }}
                  >
                    {isLast ? "REVIEW BUILD" : `NEXT: ${steps[step + 1]?.label.toUpperCase()}`}
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
          flash={reviewFlash}
          onReset={reset}
          onCopy={() => handleAction("link")}
          onPdf={() => handleAction("pdf")}
          onContact={() => openForm("contact")}
        />
      </div>

      {/* Build enquiry modal — portal so no parent clips it; cursor reset overrides body { cursor:none }.
          Header and buttons stay put; only the fields scroll. */}
      {modalOpen && createPortal(
        <div
          className="cfg-modal"
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(15,16,18,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", cursor: "auto" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cfg-modal-title"
            tabIndex={-1}
            className="cfg-dialog"
            style={{ backgroundColor: COLOR.white, color: COLOR.text, width: "480px", maxWidth: "100%", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 0, cursor: "auto", outline: "none" }}
          >
            {/* Modal header */}
            <div style={{ flex: "none", backgroundColor: COLOR.dark, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `3px solid ${COLOR.green}` }}>
              <div>
                <p id="cfg-modal-title" style={{ margin: 0, fontFamily: FONT.display, fontWeight: 600, fontSize: "22px", letterSpacing: "0.04em", textTransform: "uppercase", color: COLOR.white }}>{MODAL_COPY[modalIntent].title}</p>
                <p style={{ margin: "2px 0 0", ...monoLabel(10, 0.14, COLOR.green) }}>{MODEL_INFO[model].name}</p>
              </div>
              <button type="button" onClick={closeForm} style={{ background: "none", border: "none", color: COLOR.onDark, fontSize: "22px", lineHeight: 1, minWidth: SIZE.touch, minHeight: SIZE.touch, cursor: "pointer" }} aria-label="Close">✕</button>
            </div>

            {dealerSuccess ? (
              <>
                <div style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: "40px 24px 12px", textAlign: "center" }}>
                  <div aria-hidden style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: COLOR.green, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "26px", color: COLOR.dark }}>✓</div>
                  <p style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: "26px", textTransform: "uppercase", margin: "0 0 8px", color: COLOR.text }}>Thank You!</p>
                  <p style={{ fontFamily: FONT.body, fontSize: "14px", color: COLOR.secondary, margin: "0 0 20px", lineHeight: 1.5 }}>
                    Your build has been sent to Energica. We&apos;ll connect you with your nearest dealer within 24 hours — a copy is on its way to your inbox.
                  </p>
                  {shortLink && (
                    <div style={{ textAlign: "left" }}>
                      <BuildLinkBox
                        url={shortLink.url}
                        copied={copied}
                        onCopy={() => copyLink(shortLink.url)}
                        whatsappUrl={whatsappUrl(shortLink.url)}
                      />
                    </div>
                  )}
                </div>
                <div style={{ ...modalFooter, display: "flex", gap: "8px" }}>
                  <button type="button" onClick={() => lastPdf.current?.save()} style={{ ...S.btnSecondary, flex: 1, cursor: "pointer" }}>
                    Download PDF
                  </button>
                  <button type="button" onClick={closeForm} style={{ ...S.btnPrimary, flex: 1, cursor: "pointer" }}>
                    Done
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleDealerSubmit} noValidate style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column" }}>
                <div className="cfg-dialog-fields" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: "24px 24px 4px" }}>
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
                        aria-invalid={fieldErrors[key] ? true : undefined}
                        aria-describedby={fieldErrors[key] ? `${id}-error` : undefined}
                        onChange={(e) => {
                          setDealerForm((f) => ({ ...f, [key]: e.target.value }));
                          if (fieldErrors[key]) setFieldErrors((errs) => ({ ...errs, [key]: undefined }));
                        }}
                        style={{ ...S.field, ...(fieldErrors[key] ? { border: `1px solid ${COLOR.error}` } : null) }}
                      />
                      {fieldErrors[key] && (
                        <p id={`${id}-error`} style={{ margin: "6px 0 0", fontFamily: FONT.body, fontSize: "12px", color: COLOR.error }}>{fieldErrors[key]}</p>
                      )}
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
                </div>

                <div style={modalFooter}>
                  {dealerError && (
                    <p role="alert" style={{ fontFamily: FONT.body, fontSize: "13px", color: COLOR.error, margin: "0 0 12px" }}>{dealerError}</p>
                  )}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="button" onClick={closeForm} style={{ ...S.btnSecondary, flex: 1, cursor: "pointer" }}>Cancel</button>
                    <button type="submit" disabled={dealerSubmitting} style={{ ...S.btnPrimary, flex: 2, opacity: dealerSubmitting ? 0.7 : 1, cursor: "pointer" }}>
                      {dealerSubmitting ? "Sending…" : MODAL_COPY[modalIntent].submit}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
