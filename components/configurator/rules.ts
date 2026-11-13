// The configurator's selection rules as pure functions over the backend
// config (/config/{model}): mutually exclusive sets, dependencies,
// incompatibilities and always-visible layers. No React, so it is unit tested.
import type { ConfigSchema, LayerMeta } from "@/lib/configurator-api";
import type { PdfOption } from "@/lib/build-sheet";
import { cleanLayerName, groupConfig, STEP_MAP, type Model, type StepDef } from "./config";

type Layers = Set<string>;

const deps = (cfg: ConfigSchema, id: string) => cfg.rules.dependencies[id] ?? [];
const incompat = (cfg: ConfigSchema) => Object.entries(cfg.rules.incompatibilities ?? {}) as [string, string[]][];
const exclusiveSetOf = (cfg: ConfigSchema, id: string) => cfg.rules.mutually_exclusive.find((g) => g.includes(id)) ?? null;
const isDefault = (cfg: ConfigSchema, id: string) => !!cfg.layers.find((l) => l.id === id)?.visible_by_default;
export function defaultLayers(cfg: ConfigSchema): Layers {
  const always = new Set(cfg.rules.always_visible);
  return new Set(cfg.layers.filter((l) => l.visible_by_default || always.has(l.id)).map((l) => l.id));
}

/**
 * Starting selection: a restored build (short link or legacy ?layers=) when
 * every id belongs to this model, otherwise the defaults; then repaired so
 * dependencies, incompatibilities and required groups hold.
 */
export function initialLayers(cfg: ConfigSchema, restored?: string[] | null): Layers {
  const valid = new Set(cfg.layers.map((l) => l.id));
  const set = restored?.length && restored.every((id) => valid.has(id)) ? new Set(restored) : defaultLayers(cfg);
  for (const id of [...set]) deps(cfg, id).forEach((d) => set.add(d));
  let changed = true;
  while (changed) {
    changed = false;
    for (const [id, conflicts] of incompat(cfg)) {
      if (set.has(id) && conflicts.some((c) => set.has(c))) { set.delete(id); changed = true; }
    }
  }
  for (const group of cfg.rules.mutually_exclusive ?? []) {
    if (!group.some((id) => set.has(id))) {
      const def = group.find((id) => isDefault(cfg, id));
      if (def) set.add(def);
    }
  }
  cfg.rules.always_visible.forEach((id) => set.add(id));
  return set;
}

/**
 * Next selection after clicking a layer. `exclusive` makes it a single choice
 * among `groupPeers` (the UI group's options); clicking the chosen option of
 * an optional group clears it. Removing a layer also removes what depends on it.
 */
export function toggleLayer(cfg: ConfigSchema, prev: Layers, layerId: string, exclusive: boolean, groupPeers?: string[]): Layers {
  const always = new Set(cfg.rules.always_visible);
  const next = new Set(prev);
  const dropDependents = (id: string) => {
    for (const [depId, d] of Object.entries(cfg.rules.dependencies)) {
      if (d.includes(id) && next.has(depId)) next.delete(depId);
    }
  };
  const addWithRules = (id: string) => {
    next.add(id);
    deps(cfg, id).forEach((d) => next.add(d));
    for (const [other, conflicts] of incompat(cfg)) {
      if (next.has(other) && conflicts.includes(id)) { next.delete(other); dropDependents(other); }
    }
  };

  if (!exclusive) {
    if (always.has(layerId)) return prev;
    if (next.has(layerId)) { next.delete(layerId); dropDependents(layerId); }
    else addWithRules(layerId);
    return next;
  }

  // The UI group's sibling list is always complete; the backend's exclusive
  // sets may be a subset (EsseEsse9's CNC finish), or span groups (Ego seat
  // and cover), so both are cleared.
  const peers = groupPeers ?? exclusiveSetOf(cfg, layerId) ?? [];
  const required = peers.some((id) => isDefault(cfg, id));
  const wasActive = next.has(layerId) && !always.has(layerId);

  // cascadeOwn: within the group also clear the layer's own auto-added deps
  // (seat → rider seat); across groups keep them (a cover keeps the rider seat).
  // TODO: this also clears dependencies the visitor chose themselves:
  // deselecting a bag plate removes the side bag kit (pre-redesign behaviour,
  // kept as is for this release).
  const clear = (id: string, cascadeOwn: boolean) => {
    if (always.has(id)) return;
    next.delete(id);
    dropDependents(id);
    if (cascadeOwn) deps(cfg, id).forEach((d) => { if (!always.has(d)) next.delete(d); });
  };
  peers.forEach((id) => clear(id, true));
  const crossPeers = (exclusiveSetOf(cfg, layerId) ?? []).filter((id) => !peers.includes(id));
  crossPeers.forEach((id) => clear(id, false));

  if (wasActive && !required) {
    // Deselected an optional choice: restore a cross-group default (seat) if any
    const fallback = crossPeers.find((id) => isDefault(cfg, id));
    if (fallback) next.add(fallback);
  } else {
    addWithRules(layerId);
  }
  return next;
}

// ── What the panel shows ────────────────────────────────────────────────────

export interface OptionView {
  layer: LayerMeta;
  title: string;
  description: string;
  selected: boolean;
}
export interface SectionView {
  key: string;
  title: string;
  description: string;
  exclusive: boolean;
  required: boolean;
  hint: "SELECT ONE" | "SELECT ANY" | "OPTIONAL";
  peers: string[];
  options: OptionView[];
}

/** Layers that sit in a UI group (user-selectable); others are auto-added. */
const groupLayerIds = (cfg: ConfigSchema) => new Set(Object.values(cfg.groups).flat());

/** An always-visible layer in a single-choice group (a base colour) is a real choice. */
function isSelectableBase(cfg: ConfigSchema, id: string) {
  return Object.entries(cfg.groups).some(([key, ids]) => ids.includes(id) && groupConfig(key).exclusive);
}

export function isExclusiveGroup(cfg: ConfigSchema, key: string, ids: string[]) {
  return groupConfig(key).exclusive || cfg.rules.mutually_exclusive.some((g) => g.includes(ids[0] ?? ""));
}

/** Option groups as the panel shows them for the current selection. */
export function sectionsFor(cfg: ConfigSchema, visible: Layers): SectionView[] {
  const always = new Set(cfg.rules.always_visible);
  const inGroups = groupLayerIds(cfg);
  const byId = new Map(cfg.layers.map((l) => [l.id, l]));
  const sections: SectionView[] = [];

  for (const [key, ids] of Object.entries(groupsWithOther(cfg))) {
    const layers = ids
      .map((id) => byId.get(id))
      .filter((l): l is LayerMeta => !!l)
      .filter((l) => !always.has(l.id) || isSelectableBase(cfg, l.id));
    if (!layers.length) continue;

    const exclusive = isExclusiveGroup(cfg, key, layers.map((l) => l.id));
    const required = exclusive && layers.some((l) => l.visible_by_default || always.has(l.id));
    const peers = layers.map((l) => l.id);
    const options: OptionView[] = [];
    for (const layer of layers) {
      // Hidden while it clashes with the selection, or while a selectable
      // layer it needs is not chosen (bag plates before the side bag kit,
      // a coloured bellypan before its colour). Auto-added layers outside
      // any group (rider seats) don't count as unmet.
      if (incompat(cfg).some(([id, conflicts]) => id === layer.id && conflicts.some((c) => visible.has(c)))) continue;
      if (deps(cfg, layer.id).some((d) => inGroups.has(d) && !visible.has(d))) continue;
      const selected = always.has(layer.id) && exclusive
        ? !peers.some((id) => id !== layer.id && visible.has(id))
        : visible.has(layer.id);
      options.push({ layer, ...cleanLayerName(layer, key), selected });
    }
    // A group with nothing to show is hidden
    if (!options.length) continue;
    const g = groupConfig(key);
    sections.push({
      key, title: g.label, description: g.description, exclusive, required,
      hint: !exclusive ? "SELECT ANY" : required ? "SELECT ONE" : "OPTIONAL",
      peers, options,
    });
  }
  return sections;
}

/** The backend's groups plus "other": ungrouped layers a visitor can still pick. */
function groupsWithOther(cfg: ConfigSchema): Record<string, string[]> {
  const always = new Set(cfg.rules.always_visible);
  const inGroups = groupLayerIds(cfg);
  const autoAdded = new Set(Object.values(cfg.rules.dependencies).flat());
  const other = cfg.layers.filter((l) => !inGroups.has(l.id) && !always.has(l.id) && !autoAdded.has(l.id)).map((l) => l.id);
  return other.length ? { ...cfg.groups, other } : cfg.groups;
}

// ── Steps ───────────────────────────────────────────────────────────────────

/** The model's steps with only groups that exist; unmapped groups go to "More". */
export function buildSteps(model: Model, groupKeys: string[], warn: (msg: string) => void = console.warn): StepDef[] {
  const present = new Set(groupKeys);
  const mapped = new Set<string>();
  const steps = (STEP_MAP[model] ?? [])
    .map((s) => ({ label: s.label, groups: s.groups.filter((g) => present.has(g) && (mapped.add(g), true)) }))
    .filter((s) => s.groups.length);
  const unmapped = groupKeys.filter((g) => !mapped.has(g));
  if (unmapped.length) {
    warn(`[configurator] ${model}: groups not in the step map, shown under "More": ${unmapped.join(", ")}`);
    steps.push({ label: "More", groups: unmapped });
  }
  return steps;
}

// ── The build ───────────────────────────────────────────────────────────────

/**
 * Chosen options per group, for the summary, the build sheet and the sales
 * email. An always-on base layer counts only when nothing else in its group is
 * chosen; auto-added layers outside any group are left out.
 */
export function selectedOptions(cfg: ConfigSchema, visible: Layers): PdfOption[] {
  const always = new Set(cfg.rules.always_visible);
  const byId = new Map(cfg.layers.map((l) => [l.id, l]));
  return Object.entries(cfg.groups).flatMap(([groupKey, ids]) => {
    const chosen = ids.filter((id) => visible.has(id) && byId.has(id));
    const picked = chosen.filter((id) => !always.has(id));
    return (picked.length ? picked : chosen).map((id) => {
      const l = byId.get(id)!;
      return { id, name: l.name, groupKey, filename: l.filename, offsetX: l.offset_x ?? 0, offsetY: l.offset_y ?? 0 };
    });
  });
}

/** "YOUR BUILD · N SELECTIONS" and the one-line list, in step order. */
export function summarise(options: { id: string; name: string; groupKey: string }[], steps: StepDef[]) {
  const order = steps.flatMap((s) => s.groups);
  const rank = (g: string) => (order.includes(g) ? order.indexOf(g) : order.length);
  const sorted = [...options].sort((a, b) => rank(a.groupKey) - rank(b.groupKey));
  const names = sorted.map((o) => {
    const { title } = cleanLayerName(o, o.groupKey);
    return o.groupKey === "bags_plates" ? `${title} bag plates` : title;
  });
  const count = names.length;
  return { count, countLabel: `${count} ${count === 1 ? "SELECTION" : "SELECTIONS"}`, text: names.join(" · ") };
}

/**
 * One line naming chosen options a colour change removed and the colour they
 * need ("Titanium Grey finish removed: only available on Bormio Ice."), or
 * null when nothing was removed. `prev` and `next` come from toggleLayer.
 */
export function colourRemovalNotice(cfg: ConfigSchema, prev: Layers, next: Layers): string | null {
  const colours = cfg.groups.base_color ?? [];
  const byId = new Map(cfg.layers.map((l) => [l.id, l]));
  const colourName = (id: string) => cleanLayerName(byId.get(id)!, "base_color").title;
  // The colour a dependency asks for, or the colours an incompatibility leaves
  const needs = (id: string) => {
    const required = deps(cfg, id).filter((d) => colours.includes(d));
    const clash = cfg.rules.incompatibilities?.[id] ?? [];
    return (required.length ? required : colours.filter((c) => !clash.includes(c))).filter((c) => byId.has(c)).map(colourName).join(" or ");
  };
  const removed = selectedOptions(cfg, prev).filter((o) => o.groupKey !== "base_color" && !next.has(o.id) && needs(o.id));
  if (!removed.length) return null;
  const where = needs(removed[0].id);
  const names = removed.filter((o) => needs(o.id) === where).map((o, i) => {
    const { title } = cleanLayerName(o, o.groupKey);
    if (o.groupKey === "bellypan") return i ? "bellypan" : "Bellypan";
    return o.groupKey === "cnc_options" ? `${title} finish` : title;
  });
  return `${names.join(" and ")} removed: only available on ${where}.`;
}

/** Number of chosen options per step, for the step tabs. */
export function stepCounts(options: { groupKey: string }[], steps: StepDef[]) {
  return steps.map((s) => options.filter((o) => s.groups.includes(o.groupKey)).length);
}
