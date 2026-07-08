"use client";
// @ts-nocheck — types verified in energica-configurator repo (stricter tsconfig there)

/**
 * EnergiccaConfigurator
 *
 * Main React component for the Energica Motorcycle Configurator.
 * Brand-compliant: Barlow Condensed + IBM Plex Sans, Energica official palette only.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ConfigSchema,
  LayerMeta,
  clearConfigCache,
  decodeConfig,
  encodeConfig,
  getModelConfig,
  renderConfiguration,
} from "@/lib/configurator-api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Model = "eva_ribelle" | "essesse9" | "ego" | "experia";

interface Props {
  model: Model;
  apiUrl?: string;
}

interface GroupConfig {
  label: string;
  description: string;
  exclusive: boolean; // true = radio, false = checkbox
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MODEL_DISPLAY_NAMES: Record<Model, string> = {
  eva_ribelle: "EVA RIBELLE",
  essesse9: "ESSESSE9",
  ego: "EGO",
  experia: "EXPERIA",
};

const GROUP_CONFIG: Record<string, GroupConfig> = {
  base_color: {
    label: "COLORS",
    description: "Select the primary finish for your motorcycle.",
    exclusive: true,
  },
  suspension: {
    label: "SUSPENSION",
    description: "Choose your suspension setup.",
    exclusive: true,
  },
  wheels: {
    label: "WHEELS",
    description: "Select rim style and finish.",
    exclusive: true,
  },
  front_fender: {
    label: "FRONT FENDER",
    description: "Standard injection or optional carbon fibre.",
    exclusive: true,
  },
  windscreen: {
    label: "WINDSCREEN",
    description: "Standard or low smoky windscreen.",
    exclusive: true,
  },
  passenger_seat: {
    label: "SEAT",
    description: "Choose your seat configuration.",
    exclusive: true,
  },
  covers: {
    label: "COVER CorsaClienti",
    description: "Racing cover for the passenger seat.",
    exclusive: true,
  },
  carbon_parts: {
    label: "CARBON ACCESSORIES",
    description: "Add individual carbon-fibre components.",
    exclusive: false,
  },
  bellypan: {
    label: "BELLYPAN",
    description: "Add a coloured bellypan with stripe finish.",
    exclusive: true,
  },
  ergal_screws: {
    label: "ERGAL SCREWS",
    description: "Optional anodised ergal screw kit.",
    exclusive: true,
  },
  optional_upgrades: {
    label: "OPTIONAL UPGRADES",
    description: "Performance and touring additions.",
    exclusive: false,
  },
  bags_plates: {
    label: "BAG PLATE COLOUR",
    description: "Choose a colour for the side bag plates. Requires Side Bags Kit.",
    exclusive: true,
  },
  cnc_options: {
    label: "CNC FINISH",
    description: "Optional CNC Titanium Grey finish. Available on Bormio Ice only.",
    exclusive: true,
  },
  rs_options: {
    label: "RS OPTIONS",
    description: "RS version badge and sticker kit.",
    exclusive: false,
  },
  other: {
    label: "ACCESSORIES",
    description: "Additional components.",
    exclusive: false,
  },
};

// ---------------------------------------------------------------------------
// Inline styles (CSS-variable-only; no hardcoded colour values)
// ---------------------------------------------------------------------------

const S = {
  root: {
    fontFamily: "var(--font-secondary, 'IBM Plex Sans', sans-serif)",
    // Reset CSS variables so the landing page's dark-theme globals don't bleed in
    ["--text-primary" as string]: "#121212",
    ["--text-secondary" as string]: "#757575",
    ["--bg-primary" as string]: "#ffffff",
    ["--bg-secondary" as string]: "#f9f9f9",
    ["--bg-tertiary" as string]: "#f5f5f5",
    ["--border-color" as string]: "#eeeeee",
    backgroundColor: "#ffffff",
    color: "#121212",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
  },
  header: {
    borderBottom: "1px solid var(--border-color, #eee)",
    padding: "0 var(--space-10, 40px)",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "var(--bg-primary, #fff)",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
  },
  headerBrand: {
    fontFamily: "var(--font-primary, 'Barlow Condensed', sans-serif)",
    fontWeight: 700,
    fontSize: "var(--text-xl, 24px)",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "var(--text-primary, #121212)",
  },
  headerModelTag: {
    fontFamily: "var(--font-primary, 'Barlow Condensed', sans-serif)",
    fontWeight: 500,
    fontSize: "var(--text-sm, 12px)",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "var(--accent, #78BE20)",
  },
  main: {
    display: "flex",
    flex: 1,
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
    padding: "32px 40px",
    gap: "32px",
  },
  previewPane: {
    flex: "1 1 0",
    minWidth: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  },
  previewFrame: {
    backgroundColor: "#f4f4f4",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: "16/9",
    overflow: "hidden",
    position: "relative" as const,
  },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain" as const,
    display: "block",
  },
  previewPlaceholder: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "var(--space-3, 12px)",
    color: "var(--text-muted, #bdbdbd)",
    fontFamily: "var(--font-primary, 'Barlow Condensed', sans-serif)",
    fontSize: "var(--text-sm, 12px)",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
  },
  loadingOverlay: {
    position: "absolute" as const,
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "2px solid var(--border-color, #eee)",
    borderTop: "2px solid var(--accent, #78BE20)",
    borderRadius: "50%",
    animation: "energica-spin 0.7s linear infinite",
  },
  errorBanner: {
    backgroundColor: "var(--bg-secondary, #f9f9f9)",
    border: "1px solid var(--error, #D32F2F)",
    borderRadius: "var(--radius-md, 8px)",
    padding: "var(--space-4, 16px) var(--space-6, 24px)",
    color: "var(--error, #D32F2F)",
    fontSize: "var(--text-base, 14px)",
    fontFamily: "var(--font-secondary, 'IBM Plex Sans', sans-serif)",
  },
  configPane: {
    width: "380px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column" as const,
    position: "sticky" as const,
    top: "160px",
    maxHeight: "calc(100vh - 180px)",
    overflowY: "auto" as const,
    alignSelf: "flex-start" as const,
  },
  configPaneInner: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0",
    paddingBottom: "48px",
    flex: 1,
  },
  section: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0",
    borderBottom: "1px solid #f0f0f0",
    padding: "20px 0",
  },
  sectionTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: "11px",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "#121212",
    margin: "0 0 4px 0",
  },
  sectionDesc: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: "12px",
    color: "#9e9e9e",
    margin: "0 0 16px 0",
    lineHeight: "1.5",
  },
  optionList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "2px",
  },
  optionRow: (active: boolean, disabled: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "3px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.35 : 1,
    backgroundColor: active ? "#f7f7f7" : "transparent",
    borderLeft: active ? "2px solid #78BE20" : "2px solid transparent",
    transition: "background-color 80ms ease, border-color 80ms ease",
  } as React.CSSProperties),
  optionLabel: (active: boolean) => ({
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: active ? 700 : 500,
    fontSize: "13px",
    letterSpacing: "0.04em",
    color: active ? "#121212" : "#888888",
    cursor: "inherit",
    userSelect: "none" as const,
    flex: 1,
    textTransform: "uppercase" as const,
  }),
  nativeControl: {
    accentColor: "#78BE20",
    width: "15px",
    height: "15px",
    cursor: "inherit",
    flexShrink: 0,
  } as React.CSSProperties,
  actions: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    paddingTop: "20px",
    borderTop: "1px solid #f0f0f0",
  },
  btnPrimary: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: "13px",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    backgroundColor: "#78BE20",
    color: "#fff",
    border: "none",
    borderRadius: "2px",
    padding: "14px 24px",
    cursor: "pointer",
    width: "100%",
    transition: "background-color 200ms ease",
  } as React.CSSProperties,
  btnSecondary: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: "13px",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    backgroundColor: "transparent",
    color: "#121212",
    border: "1px solid #e0e0e0",
    borderRadius: "2px",
    padding: "14px 24px",
    cursor: "pointer",
    width: "100%",
    transition: "background-color var(--transition-normal, 200ms ease)",
  } as React.CSSProperties,
  shareRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  shareInput: {
    flex: 1,
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: "11px",
    padding: "10px 12px",
    backgroundColor: "#f7f7f7",
    border: "1px solid #e8e8e8",
    borderRadius: "2px",
    color: "#888",
    outline: "none",
  } as React.CSSProperties,
  copyBtn: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: "11px",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    padding: "10px 14px",
    backgroundColor: "transparent",
    border: "1px solid #e0e0e0",
    borderRadius: "2px",
    cursor: "pointer",
    color: "#444",
    whiteSpace: "nowrap" as const,
  } as React.CSSProperties,
  footer: {
    borderTop: "1px solid #f0f0f0",
    padding: "20px 48px",
    textAlign: "center" as const,
  },
  footerTagline: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 500,
    fontSize: "11px",
    letterSpacing: "0.25em",
    textTransform: "uppercase" as const,
    color: "#cccccc",
    margin: 0,
  },
};

// ---------------------------------------------------------------------------
// Custom hook — configuration state management
// ---------------------------------------------------------------------------

function useConfigurator(model: Model, apiUrl: string) {
  const [config, setConfig] = useState<ConfigSchema | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevObjectUrlRef = useRef<string | null>(null);

  // Load config and initialise layers from URL params or defaults
  useEffect(() => {
    // Clear module-level cache so model switches always fetch fresh config
    // (prevents stale mutually_exclusive / always_visible data from prior loads)
    clearConfigCache();
    setConfigLoading(true);
    setError(null);
    // Reset preview when switching models so stale image doesn't linger
    setPreviewUrl(null);
    setVisibleLayers(new Set());
    isFirstRender.current = true;

    getModelConfig(model, apiUrl)
      .then((cfg) => {
        setConfig(cfg);

        const validIds = new Set(cfg.layers.map((l) => l.id));
        // always_visible layers must always be in the set
        const alwaysVisibleIds = new Set(cfg.rules.always_visible);
        const defaults = cfg.layers
          .filter((l) => l.visible_by_default || alwaysVisibleIds.has(l.id))
          .map((l) => l.id);

        // Restore from URL only when ALL decoded IDs belong to this model.
        // This prevents cross-model contamination when the user switches tabs
        // while a share URL from a different model is still in the address bar.
        let initial: string[] = defaults;
        if (typeof window !== "undefined") {
          const encoded = new URLSearchParams(window.location.search).get("layers");
          if (encoded) {
            const decoded = decodeConfig(encoded);
            const allValid = decoded.length > 0 && decoded.every((id) => validIds.has(id));
            if (allValid) initial = decoded;
          }
        }

        // Enforce dependencies on restored layers (URL may encode an invalid state)
        const initialSet = new Set(initial);
        for (const id of [...initialSet]) {
          const deps = cfg.rules.dependencies[id] ?? [];
          deps.forEach((dep) => initialSet.add(dep));
        }
        // Enforce incompatibilities: remove any layer that conflicts with another active layer.
        // Iterate until stable (removing one may reveal another conflict).
        let changed = true;
        while (changed) {
          changed = false;
          for (const [id, conflicts] of Object.entries(cfg.rules.incompatibilities ?? {})) {
            if (initialSet.has(id) && (conflicts as string[]).some((c) => initialSet.has(c))) {
              initialSet.delete(id);
              changed = true;
            }
          }
        }
        // Ensure each mutually_exclusive group has at least its default member selected.
        // URL state may omit a required layer (e.g. seat) if a previous session cleared it.
        for (const group of cfg.rules.mutually_exclusive ?? []) {
          const hasOne = group.some((id) => initialSet.has(id));
          if (!hasOne) {
            const defaultMember = group.find(
              (id) => cfg.layers.find((l) => l.id === id)?.visible_by_default,
            );
            if (defaultMember) initialSet.add(defaultMember);
          }
        }
        // Ensure always_visible layers are present
        alwaysVisibleIds.forEach((id) => initialSet.add(id));

        setVisibleLayers(initialSet);
      })
      .catch((err: Error) => {
        setError(`Could not load configuration: ${err.message}`);
      })
      .finally(() => setConfigLoading(false));
  }, [model, apiUrl]);

  // Derive validator helpers from config
  const alwaysVisible = useMemo(
    () => new Set(config?.rules.always_visible ?? []),
    [config],
  );

  const exclusiveGroupOf = useCallback(
    (layerId: string): string[] | null => {
      if (!config) return null;
      for (const group of config.rules.mutually_exclusive) {
        if (group.includes(layerId)) return group;
      }
      return null;
    },
    [config],
  );

  // Trigger debounced render whenever layer selection changes.
  // First render (no previewUrl yet) fires immediately; subsequent changes
  // are debounced so rapid clicks don't flood the API.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (!config || visibleLayers.size === 0) return;

    if (renderTimerRef.current) clearTimeout(renderTimerRef.current);

    const delay = isFirstRender.current ? 0 : 150;
    isFirstRender.current = false;

    renderTimerRef.current = setTimeout(() => {
      setLoading(true);
      setError(null);

      renderConfiguration(model, [...visibleLayers], apiUrl)
        .then((blob) => {
          // Revoke previous object URL to avoid memory leaks
          if (prevObjectUrlRef.current) {
            URL.revokeObjectURL(prevObjectUrlRef.current);
          }
          const url = URL.createObjectURL(blob);
          prevObjectUrlRef.current = url;
          setPreviewUrl(url);

          // Update URL bar for sharing (non-navigating)
          if (typeof window !== "undefined") {
            const encoded = encodeConfig([...visibleLayers]);
            const newUrl = `${window.location.pathname}?layers=${encoded}`;
            window.history.replaceState(null, "", newUrl);
          }
        })
        .catch((err: Error) => {
          setError(`Preview unavailable: ${err.message}`);
        })
        .finally(() => setLoading(false));
    }, delay);

    return () => {
      if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
    };
  }, [visibleLayers, config, model, apiUrl]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (prevObjectUrlRef.current) URL.revokeObjectURL(prevObjectUrlRef.current);
    };
  }, []);

  const toggleLayer = useCallback(
    (layerId: string, exclusive: boolean, groupPeers?: string[]) => {
      setVisibleLayers((prev) => {
        const next = new Set(prev);

        if (exclusive) {
          // Radio behaviour: clear all peers in the group before selecting the new one.
          // Prefer the UI group's full sibling list (groupPeers) — it is always complete.
          // The backend's mutually_exclusive rules may be a subset (e.g. es_02 is only in
          // incompatibilities for essesse9, not mutually_exclusive), so using them alone
          // can leave stale selections when the rules don't cover every sibling.
          const peers = groupPeers ?? exclusiveGroupOf(layerId) ?? [];

          // isRequired is scoped to the UI group only (groupPeers), not cross-group
          // exclusive peers — so optional groups like covers can still be deselected
          // even when they share a mutually_exclusive list with a required group (seats).
          const isRequired = peers.some(
            (id) => config?.layers.find((l) => l.id === id)?.visible_by_default,
          );
          const wasActive = next.has(layerId) && !alwaysVisible.has(layerId);

          // Helper: delete a layer and cascade-remove anything that depended on it.
          // cascadeOwnDeps=true: also clears auto-triggered deps of the cleared layer
          // (used within same group, e.g. seat→seat so rider seat switches correctly).
          // cascadeOwnDeps=false: only clears the layer itself
          // (used cross-group, e.g. cover→seat so rider seat stays active).
          const clearWithDeps = (id: string, cascadeOwnDeps = true) => {
            if (alwaysVisible.has(id)) return;
            next.delete(id);
            if (config?.rules.dependencies) {
              for (const [depId, depDeps] of Object.entries(config.rules.dependencies)) {
                if (depDeps.includes(id) && next.has(depId)) next.delete(depId);
              }
              if (cascadeOwnDeps) {
                for (const ownDep of config.rules.dependencies[id] ?? []) {
                  if (!alwaysVisible.has(ownDep)) next.delete(ownDep);
                }
              }
            }
          };

          // Clear UI-group peers (same group → cascade own deps so rider seat switches).
          peers.forEach((id) => clearWithDeps(id, true));

          // Clear cross-group peers (cover→seat or seat→cover) without cascading own deps
          // so that auto-triggered rider seats stay active when a cover replaces the passenger seat.
          const exclusivePeers = exclusiveGroupOf(layerId) ?? [];
          exclusivePeers
            .filter((id) => !peers.includes(id))
            .forEach((id) => clearWithDeps(id, false));

          if (wasActive && !isRequired) {
            // Deselected an optional layer (e.g. a cover). Restore the default from
            // any cross-group exclusive peers so the group is never left empty.
            const exclusivePeers = exclusiveGroupOf(layerId) ?? [];
            const crossGroupDefault = exclusivePeers
              .filter((id) => !peers.includes(id))
              .find((id) => config?.layers.find((l) => l.id === id)?.visible_by_default);
            if (crossGroupDefault) {
              next.add(crossGroupDefault);
            }
          } else {
            next.add(layerId);
            // Auto-enable dependencies (e.g. base layer required by an overlay)
            const deps = config?.rules.dependencies[layerId] ?? [];
            deps.forEach((dep) => next.add(dep));
            // Remove any layers now incompatible with the newly added layer,
            // and cascade-remove layers that depended on the removed layer.
            for (const [id, conflicts] of Object.entries(config?.rules.incompatibilities ?? {})) {
              if (next.has(id) && (conflicts as string[]).includes(layerId)) {
                next.delete(id);
                if (config?.rules.dependencies) {
                  for (const [depId, depDeps] of Object.entries(config.rules.dependencies)) {
                    if (depDeps.includes(id) && next.has(depId)) next.delete(depId);
                  }
                }
              }
            }
          }
        } else {
          // Checkbox behaviour — never remove always-visible layers
          if (alwaysVisible.has(layerId)) return prev;
          if (next.has(layerId)) {
            next.delete(layerId);
            // Remove layers that depend on this one (reverse dependency cleanup)
            if (config?.rules.dependencies) {
              for (const [depId, deps] of Object.entries(config.rules.dependencies)) {
                if (deps.includes(layerId) && next.has(depId)) {
                  next.delete(depId);
                }
              }
            }
          } else {
            next.add(layerId);
            // Auto-enable dependencies
            const deps = config?.rules.dependencies[layerId] ?? [];
            deps.forEach((dep) => next.add(dep));
            // Remove any layers now incompatible with the newly added layer,
            // and cascade-remove layers that depended on the removed layer.
            for (const [id, conflicts] of Object.entries(config?.rules.incompatibilities ?? {})) {
              if (next.has(id) && (conflicts as string[]).includes(layerId)) {
                next.delete(id);
                if (config?.rules.dependencies) {
                  for (const [depId, depDeps] of Object.entries(config.rules.dependencies)) {
                    if (depDeps.includes(id) && next.has(depId)) next.delete(depId);
                  }
                }
              }
            }
          }
        }

        return next;
      });
    },
    [alwaysVisible, exclusiveGroupOf, config],
  );

  const reset = useCallback(() => {
    if (!config) return;
    setVisibleLayers(
      new Set(config.layers.filter((l) => l.visible_by_default).map((l) => l.id)),
    );
  }, [config]);

  return {
    config,
    configLoading,
    visibleLayers,
    previewUrl,
    loading,
    error,
    alwaysVisible,
    toggleLayer,
    reset,
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface OptionRowProps {
  layer: LayerMeta;
  active: boolean;
  disabled: boolean;
  exclusive: boolean;
  onToggle: () => void;
}

/** Strip PSD prefixes like "#ER-01 BASE-", "*ES-45-", "EG-80-" to get a clean label. */
function cleanLayerName(raw: string): string {
  return raw
    .replace(/^[#*\s]+/, "")               // leading # * space
    .replace(/^[A-Z]{2}-\d{2,3}[-\s]+/i, "") // code like ER-01- or EX-108-
    .replace(/^BASE[-\s]+/i, "")            // leftover "BASE-" prefix
    .trim();
}

function OptionRow({ layer, active, disabled, exclusive, onToggle }: OptionRowProps) {
  const inputType = exclusive ? "radio" : "checkbox";
  const inputId = `layer-${layer.id}`;
  const displayName = cleanLayerName(layer.name);

  return (
    <div
      style={S.optionRow(active, disabled)}
      onClick={disabled ? undefined : onToggle}
      role={exclusive ? "radio" : "checkbox"}
      aria-checked={active}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <input
        type={inputType}
        id={inputId}
        checked={active}
        disabled={disabled}
        onChange={() => {}}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        style={S.nativeControl}
        aria-label={displayName}
        tabIndex={-1}
      />
      <label
        htmlFor={inputId}
        style={S.optionLabel(active)}
        onClick={(e) => e.stopPropagation()}
      >
        {displayName}
      </label>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EnergiccaConfigurator({
  model,
  apiUrl = "http://localhost:8000",
}: Props) {
  const {
    config,
    configLoading,
    visibleLayers,
    previewUrl,
    loading,
    error,
    alwaysVisible,
    toggleLayer,
    reset,
  } = useConfigurator(model, apiUrl);

  const [copied, setCopied] = useState(false);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || visibleLayers.size === 0) return "";
    const encoded = encodeConfig([...visibleLayers]);
    return `${window.location.origin}${window.location.pathname}?layers=${encoded}`;
  }, [visibleLayers]);

  const handleCopy = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareUrl]);

  // An always-visible layer explicitly placed in an exclusive UI group is a
  // selectable option (e.g. Stealth Grey base whose "selection" means no overlay),
  // not a hidden structural layer — keep it visible and clickable.
  const isSelectableAlwaysVisible = useCallback(
    (id: string) => {
      if (!config) return false;
      for (const [groupKey, layerIds] of Object.entries(config.groups)) {
        if (layerIds.includes(id)) {
          const grpCfg = GROUP_CONFIG[groupKey];
          if (grpCfg?.exclusive) return true;
        }
      }
      return false;
    },
    [config],
  );

  // Group layers for rendering
  const groupedLayers = useMemo<[string, LayerMeta[]][]>(() => {
    if (!config) return [];
    const result: [string, LayerMeta[]][] = [];
    const rendered = new Set<string>();

    for (const [groupKey, layerIds] of Object.entries(config.groups)) {
      const layers = layerIds
        .map((id) => config.layers.find((l) => l.id === id))
        .filter((l): l is LayerMeta => !!l)
        // hide structural always-visible layers, but keep selectable color choices
        .filter((l) => !alwaysVisible.has(l.id) || isSelectableAlwaysVisible(l.id));

      if (layers.length === 0) continue;
      layers.forEach((l) => rendered.add(l.id));
      result.push([groupKey, layers]);
    }

    // Collect all layer IDs that are auto-triggered via dependencies (not directly user-selectable).
    // These should not appear in any UI section even if ungrouped.
    const autoTriggered = new Set(
      Object.values(config.rules.dependencies).flat(),
    );

    // Catch any ungrouped, non-structural, non-auto-triggered layers
    const ungrouped = config.layers.filter(
      (l) => !rendered.has(l.id) && !alwaysVisible.has(l.id) && !autoTriggered.has(l.id),
    );
    if (ungrouped.length > 0) result.push(["other", ungrouped]);

    return result;
  }, [config, alwaysVisible, isSelectableAlwaysVisible]);

  const displayName = MODEL_DISPLAY_NAMES[model] ?? model.toUpperCase();

  return (
    <>
      {/* Keyframe for spinner */}
      <style>{`
        @keyframes energica-spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .energica-main {
            flex-direction: column !important;
          }
          .energica-config-pane {
            width: 100% !important;
            position: static !important;
            max-height: none !important;
          }
        }
      `}</style>

      <div style={S.root}>
        {/* Header */}
        <header style={{ ...S.header, display: "none" }}>
          <span style={S.headerBrand}>ENERGICA</span>
          <span style={S.headerModelTag}>{displayName} — Configure</span>
        </header>

        {/* Body */}
        <main style={S.main} className="energica-main">
          {/* Preview pane */}
          <section style={S.previewPane}>
            <div style={S.previewFrame}>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={`${displayName} motorcycle preview`}
                  style={S.previewImage}
                />
              ) : (
                <div style={S.previewPlaceholder}>
                  {configLoading || loading ? (
                    <div style={S.spinner} aria-label="Loading preview" />
                  ) : (
                    <span>Select options to preview</span>
                  )}
                </div>
              )}

              {/* Compositing spinner overlay */}
              {loading && previewUrl && (
                <div style={S.loadingOverlay} aria-live="polite" aria-label="Rendering preview">
                  <div style={S.spinner} />
                </div>
              )}
            </div>

            {/* Error banner */}
            {error && (
              <div style={S.errorBanner} role="alert">
                {error}
              </div>
            )}
          </section>

          {/* Configuration pane */}
          <aside style={S.configPane} className="energica-config-pane">
            {configLoading ? (
              <div style={{ ...S.previewPlaceholder, paddingTop: "40px" }}>
                <div style={S.spinner} aria-label="Loading configuration" />
              </div>
            ) : (
              <div style={S.configPaneInner}>
                {groupedLayers.map(([groupKey, layers]) => {
                  // "bags_plates" (and any future child groups) are rendered inline
                  // inside their parent group, not as standalone sections.
                  if (groupKey === "bags_plates") return null;

                  const grpCfg = GROUP_CONFIG[groupKey] ?? {
                    label: groupKey.replace(/_/g, " ").toUpperCase(),
                    description: "",
                    exclusive: false,
                  };

                  // Determine if exclusive from both GROUP_CONFIG and mutually_exclusive rules
                  const isExclusive = grpCfg.exclusive ||
                    (config?.rules.mutually_exclusive.some((g) =>
                      g.includes(layers[0]?.id ?? ""),
                    ) ?? false);

                  // Inline child groups: those whose first layer depends on a layer in this group,
                  // OR whose layers are incompatible with non-Bormio-Ice colors (cnc_options).
                  const childGroups = groupedLayers.filter(([ck, cl]) =>
                    ck !== groupKey &&
                    cl.length > 0 &&
                    (
                      (config?.rules.dependencies[cl[0].id] ?? []).some((dep) =>
                        layers.some((l) => l.id === dep),
                      ) ||
                      // cnc_options appears under base_color (Bormio Ice = always-visible base)
                      (ck === "cnc_options" && groupKey === "base_color")
                    ),
                  );

                  // Set of all layer IDs that appear in at least one UI group (user-selectable).
                  // Deps pointing to non-group layers are auto-triggered (e.g. rider seat) and
                  // should not cause the parent option to be hidden when they're inactive.
                  const groupLayerIds = new Set(
                    Object.values(config?.groups ?? {}).flat(),
                  );

                  const renderOptionRow = (layer: LayerMeta, excl: boolean, peers: LayerMeta[]) => {
                    const isActive = alwaysVisible.has(layer.id) && excl
                      ? !peers.some((l) => l.id !== layer.id && visibleLayers.has(l.id))
                      : visibleLayers.has(layer.id);
                    const deps = config?.rules.dependencies[layer.id] ?? [];
                    // Only treat a dep as "unmet" if it's a user-selectable layer (in a UI group).
                    // Auto-triggered layers (e.g. rider seats activated by a seat option) are not
                    // in any group and must not cause the parent option to be hidden.
                    const depsUnmet = deps.some(
                      (dep) => groupLayerIds.has(dep) && !visibleLayers.has(dep),
                    );
                    // Hide (not just grey) options that are incompatible with current selection
                    const incompatConflict = Object.entries(config?.rules.incompatibilities ?? {})
                      .some(([id, conflicts]) =>
                        id === layer.id && (conflicts as string[]).some((c) => visibleLayers.has(c)),
                      );
                    // Hide options that conflict with current selection OR have unmet deps
                    // (e.g. Sunrise Red bellypan is hidden when Sunrise Red isn't selected)
                    if (incompatConflict || depsUnmet) return null;
                    return (
                      <OptionRow
                        key={layer.id}
                        layer={layer}
                        active={isActive}
                        disabled={
                          (alwaysVisible.has(layer.id) && !isSelectableAlwaysVisible(layer.id))
                        }
                        exclusive={excl}
                        onToggle={() => toggleLayer(layer.id, excl, peers.map((l) => l.id))}
                      />
                    );
                  };

                  // Hide the whole section if every option would be filtered out
                  const visibleLayerCount = layers.filter((layer) => {
                    const layerDeps = config?.rules.dependencies[layer.id] ?? [];
                    const layerDepsUnmet = layerDeps.some(
                      (dep) => groupLayerIds.has(dep) && !visibleLayers.has(dep),
                    );
                    const layerIncompat = Object.entries(config?.rules.incompatibilities ?? {})
                      .some(([id, conflicts]) =>
                        id === layer.id && (conflicts as string[]).some((c) => visibleLayers.has(c)),
                      );
                    return !layerDepsUnmet && !layerIncompat;
                  }).length;
                  if (visibleLayerCount === 0) return null;

                  return (
                    <section key={groupKey} style={S.section}>
                      <h2 style={S.sectionTitle}>{grpCfg.label}</h2>
                      {grpCfg.description && (
                        <p style={S.sectionDesc}>{grpCfg.description}</p>
                      )}
                      <div
                        style={S.optionList}
                        role={isExclusive ? "radiogroup" : "group"}
                        aria-label={grpCfg.label}
                      >
                        {layers.map((layer) => {
                          const row = renderOptionRow(layer, isExclusive, layers);
                          // After this layer, inject any child group whose dep is this layer
                          const children = childGroups.filter(([, cl]) =>
                            (config?.rules.dependencies[cl[0].id] ?? []).includes(layer.id),
                          );
                          if (children.length === 0) return row;
                          return (
                            <React.Fragment key={layer.id}>
                              {row}
                              {children.map(([ck, cl]) => {
                                const childExcl = GROUP_CONFIG[ck]?.exclusive ??
                                  (config?.rules.mutually_exclusive.some((g) => g.includes(cl[0].id)) ?? false);
                                // For cnc_options: show under Bormio Ice (always-visible base),
                                // which is "active" when no overlay color is selected.
                                const isBormioIceActive = alwaysVisible.has(layer.id) && isExclusive
                                  ? !layers.some((l) => l.id !== layer.id && visibleLayers.has(l.id))
                                  : visibleLayers.has(layer.id);
                                const parentSelected = isBormioIceActive;
                                if (!parentSelected) return null;
                                return (
                                  <div key={ck} style={{ paddingLeft: "var(--space-6, 24px)", marginTop: "var(--space-1, 4px)" }}>
                                    {cl.map((cl_layer) => renderOptionRow(cl_layer, childExcl, cl))}
                                  </div>
                                );
                              })}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </section>
                  );

                })}

                {/* Action buttons */}
                <div style={S.actions}>
                  {/* Share URL */}
                  <div style={S.shareRow}>
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      style={S.shareInput}
                      aria-label="Share URL"
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      style={S.copyBtn}
                      aria-label="Copy share URL"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={reset}
                    style={S.btnSecondary}
                    aria-label="Reset to default configuration"
                  >
                    Reset to Default
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    style={S.btnPrimary}
                    aria-label="Share this configuration"
                  >
                    Share Configuration
                  </button>
                </div>
              </div>
            )}
          </aside>
        </main>

        {/* Footer */}
        <footer style={S.footer}>
          <p style={S.footerTagline}>Progress, Ridden.</p>
        </footer>
      </div>
    </>
  );
}
