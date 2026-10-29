// @vitest-environment jsdom
// The whole configurator with the compositor API stubbed: step changes,
// the enquiry dialog and the invalid build link notice.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ConfigSchema } from "@/lib/configurator-api";
import eva from "./fixtures/eva_ribelle.json";

vi.mock("@/lib/configurator-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/configurator-api")>()),
  getModelConfig: vi.fn(async () => eva as unknown as ConfigSchema),
  renderConfiguration: vi.fn(async () => new Blob(["png"], { type: "image/png" })),
}));
vi.mock("@/lib/build-store", () => ({ loadBuild: vi.fn(async () => null) }));

import EnergiccaConfigurator from "@/components/configurator/EnergiccaConfigurator";
import ConfiguratorPage from "@/app/configurator/page";

function setViewport(width: number) {
  window.matchMedia = ((query: string) => {
    const min = query.match(/min-width:\s*(\d+)px/);
    const max = query.match(/max-width:\s*(\d+)px/);
    const matches = min ? width >= Number(min[1]) : max ? width <= Number(max[1]) : false;
    return { matches, media: query, addEventListener() {}, removeEventListener() {} } as unknown as MediaQueryList;
  }) as typeof window.matchMedia;
}

async function mount(props: Partial<React.ComponentProps<typeof EnergiccaConfigurator>> = {}) {
  render(<EnergiccaConfigurator model="eva_ribelle" apiUrl="" onModelChange={() => {}} {...props} />);
  await screen.findAllByRole("tab", { name: /Colour/ });
}

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ code: "" }), { status: 500 }));
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("step changes", () => {
  it("scroll only the options panel on desktop, never the window", async () => {
    setViewport(1440);
    await mount();
    const body = document.querySelector<HTMLElement>(".cfg-panel-body")!;
    body.scrollTop = 300;
    fireEvent.click(screen.getByRole("button", { name: /^NEXT: PERFORMANCE/ }));
    expect(within(screen.getByRole("tablist", { name: "Steps" })).getByRole("tab", { selected: true }).textContent).toContain("Performance");
    expect(body.scrollTop).toBe(0);
    fireEvent.click(screen.getByRole("tab", { name: /Wheels/ }));
    fireEvent.click(screen.getByRole("button", { name: "BACK" }));
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("bring the panel under the header on phones", async () => {
    setViewport(390);
    await mount();
    fireEvent.click(screen.getByRole("button", { name: /^NEXT:/ }));
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });

  it("end on an enabled Review build that opens nothing", async () => {
    setViewport(1440);
    await mount();
    const tabs = screen.getAllByRole("tab", { name: /^\d\d/ });
    fireEvent.click(tabs[tabs.length - 1]);
    const review = screen.getByRole("button", { name: "REVIEW BUILD" });
    expect((review as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(review);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(screen.getByTestId("build-info"));
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("enquiry dialog", () => {
  it("closes on Escape and returns focus to the button that opened it", async () => {
    setViewport(1440);
    await mount();
    const contact = screen.getByRole("button", { name: "CONTACT DEALER" });
    contact.focus();
    fireEvent.click(contact);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(document.activeElement?.id).toBe("dc-name");
    await act(async () => {
      fireEvent.keyDown(document, { key: "Escape" });
      await new Promise((r) => requestAnimationFrame(r));
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(contact);
  });

  it("keeps Tab inside the dialog", async () => {
    setViewport(1440);
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "CONTACT DEALER" }));
    const submit = screen.getByRole("button", { name: "Send Enquiry" });
    submit.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close" }));
  });

  it("marks each empty required field and focuses the first", async () => {
    setViewport(1440);
    await mount();
    fireEvent.click(screen.getByRole("button", { name: "CONTACT DEALER" }));
    fireEvent.change(screen.getByLabelText("Full Name *"), { target: { value: "Ada" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Enquiry" }));
    expect(screen.getByRole("alert").textContent).toBe("Please fill in your name, email, phone and country.");
    expect(screen.getByLabelText("Full Name *").getAttribute("aria-invalid")).toBeNull();
    for (const label of ["Email *", "Phone *", "Country / City *"]) {
      expect(screen.getByLabelText(label).getAttribute("aria-invalid")).toBe("true");
    }
    expect(document.activeElement?.id).toBe("dc-email");
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("invalid build link", () => {
  it("shows a dismissible notice over the standard bike", async () => {
    setViewport(1440);
    await mount({ buildNotFound: true });
    const notice = screen.getByText("That build link could not be found. Showing the standard Eva Ribelle.");
    expect(notice).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText(/could not be found/)).toBeNull();
  });

  it("is flagged by the page, keeping the model from the URL", async () => {
    const page = await ConfiguratorPage({ searchParams: Promise.resolve({ build: "ZZZZZZZZ", model: "ego" }) });
    expect(page.props).toMatchObject({ initialModel: "ego", buildNotFound: true });
    const plain = await ConfiguratorPage({ searchParams: Promise.resolve({ model: "ego" }) });
    expect(plain.props.buildNotFound).toBe(false);
  });
});
