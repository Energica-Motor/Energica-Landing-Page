// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ConfigSchema } from "@/lib/configurator-api";
import { performanceFor } from "@/lib/build-sheet/specs";
import * as rules from "@/components/configurator/rules";
import { ActionBar, OptionSection, SpecStrip, StageHeading, StepTabs } from "@/components/configurator/ui";
import eva from "./fixtures/eva_ribelle.json";

const EVA = eva as unknown as ConfigSchema;
afterEach(cleanup);

const section = (set: Set<string>, key: string) => rules.sectionsFor(EVA, set).find((s) => s.key === key)!;

describe("option sections", () => {
  it("renders options as pressed buttons and leaves out unmet dependencies", () => {
    const s = rules.initialLayers(EVA);
    render(<OptionSection section={section(s, "rs_options")} onToggle={() => {}} />);
    expect(screen.getByRole("heading", { name: "RS OPTIONS" })).toBeTruthy();
    expect(screen.getByText("SELECT ANY")).toBeTruthy();
    const rs = screen.getByRole("button", { name: /^RS version/ });
    expect(rs.getAttribute("aria-pressed")).toBe("false");
    expect(within(rs).getByText("RS version badge and sticker kit.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^RS Sport sticker kit/ })).toBeNull();
  });

  it("calls back with the clicked option", () => {
    const onToggle = vi.fn();
    render(<OptionSection section={section(rules.initialLayers(EVA), "wheels")} onToggle={onToggle} />);
    expect(screen.getByRole("button", { name: /^Cast aluminium wheels/ }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: /^Forged aluminium wheels/ }));
    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ layer: expect.objectContaining({ id: "eg_66_forged_aluminium_wheels" }) }));
  });

  it("draws colours as swatch cards with Tricolore as three stripes", () => {
    const { container } = render(<OptionSection section={section(rules.initialLayers(EVA), "base_color")} onToggle={() => {}} />);
    const tricolore = screen.getByRole("button", { name: "Tricolore" });
    expect(tricolore.querySelectorAll("span[aria-hidden] > span")).toHaveLength(3);
    expect(container.querySelector(".cfg-swatches")).toBeTruthy();
  });
});

describe("step tabs", () => {
  it("shows numbers, labels and selection counts as tabs", () => {
    render(<StepTabs steps={[{ label: "Colour" }, { label: "Wheels" }]} counts={[1, 0]} active={0} onPick={() => {}} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
    expect(within(tabs[0]).getByText("1 SELECTED")).toBeTruthy();
    expect(within(tabs[1]).getByText("OPTIONAL")).toBeTruthy();
  });

  it("fades only the sides with tabs hidden past them", () => {
    render(<StepTabs steps={["Colour", "Performance", "Wheels", "Carbon", "Seat", "Upgrades"].map((label) => ({ label }))} counts={[1, 1, 1, 0, 1, 0]} active={0} onPick={() => {}} />);
    const row = screen.getByRole("tablist");
    const fade = (side: string) => screen.getByTestId(`tabs-fade-${side}`).style.opacity;
    const layout = (scrollWidth: number, scrollLeft: number) => {
      Object.defineProperty(row, "clientWidth", { configurable: true, value: 400 });
      Object.defineProperty(row, "scrollWidth", { configurable: true, value: scrollWidth });
      row.scrollLeft = scrollLeft;
      fireEvent.scroll(row);
    };
    layout(400, 0);
    expect([fade("left"), fade("right")]).toEqual(["0", "0"]);
    layout(500, 0);
    expect([fade("left"), fade("right")]).toEqual(["0", "1"]);
    layout(500, 50);
    expect([fade("left"), fade("right")]).toEqual(["1", "1"]);
    layout(500, 100);
    expect([fade("left"), fade("right")]).toEqual(["1", "0"]);
  });
});

describe("action bar", () => {
  it("shows the selection count and summary and wires the buttons", () => {
    const steps = rules.buildSteps("eva_ribelle", Object.keys(EVA.groups));
    const summary = rules.summarise(rules.selectedOptions(EVA, rules.initialLayers(EVA)), steps);
    const handlers = { onReset: vi.fn(), onCopy: vi.fn(), onPdf: vi.fn(), onContact: vi.fn() };
    render(<ActionBar countLabel={summary.countLabel} summary={summary.text} copyLabel="COPY LINK" copyIdle pdfLabel="DOWNLOAD PDF" pdfDisabled={false} linkDisabled={false} {...handlers} />);
    expect(screen.getByTestId("selection-count").textContent).toBe("3 SELECTIONS");
    expect(screen.getByTestId("build-summary").textContent).toBe("Stealth Grey · Standard suspension · Cast aluminium wheels");
    for (const [name, fn] of [["RESET", handlers.onReset], ["COPY LINK", handlers.onCopy], ["DOWNLOAD PDF", handlers.onPdf], ["CONTACT DEALER", handlers.onContact]] as const) {
      fireEvent.click(screen.getByRole("button", { name }));
      expect(fn).toHaveBeenCalledTimes(1);
    }
  });
});

describe("stage", () => {
  it("shows the locked figures, unchanged by the RS selection", () => {
    const stats = performanceFor("eva_ribelle", "Eva Ribelle").grid;
    const { rerender } = render(<><StageHeading model="eva_ribelle" colour="Stealth Grey" version="Standard" /><SpecStrip stats={stats} /></>);
    const read = () => screen.getAllByRole("definition").map((d) => d.textContent);
    const standard = read();
    expect(standard).toEqual(["147HP", "2.6sec", "420km", "201km/h"]);
    rerender(<><StageHeading model="eva_ribelle" colour="Stealth Grey" version="RS" /><SpecStrip stats={stats} /></>);
    expect(read()).toEqual(standard);
    expect(screen.getByText("RS")).toBeTruthy();
  });
});
