import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LandingExportShowcase } from "@/components/landing-export-showcase";

let reducedMotion = false;
let hidden = false;
let preference: EventTarget;

beforeEach(() => {
  vi.useFakeTimers();
  reducedMotion = false;
  hidden = false;
  preference = new EventTarget();
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  vi.spyOn(window, "matchMedia").mockImplementation((media) => ({
    get matches() {
      return reducedMotion;
    },
    media,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: preference.addEventListener.bind(preference),
    removeEventListener: preference.removeEventListener.bind(preference),
    dispatchEvent: preference.dispatchEvent.bind(preference),
  }));
});

afterEach(() => {
  vi.useRealTimers();
});

const currentExample = () =>
  screen
    .getByRole("group", { name: /Los once titulares/ })
    .getAttribute("aria-label");

const advance = (time = 5000) => act(() => vi.advanceTimersByTime(time));

describe("landing export showcase", () => {
  it("cycles through ten distinct examples and returns to the first", () => {
    render(<LandingExportShowcase />);
    const first = currentExample();
    const examples = new Set([first]);
    for (let index = 1; index < 10; index++) {
      advance();
      examples.add(currentExample());
    }
    expect(examples.size).toBe(10);
    advance();
    expect(currentExample()).toBe(first);
  });

  it("centers either side image, including distant ones, and restarts the full countdown", () => {
    render(<LandingExportShowcase />);
    for (const label of [
      "Césped con lluvia",
      "Potrero con avatares redondos",
      "Potrero con nieve y avatares cuadrados centrados",
    ]) {
      advance(4000);
      fireEvent.click(
        screen.getByRole("button", { name: `Ver ejemplo: ${label}` }),
      );
      expect(currentExample()).toContain(label);
      advance(4999);
      expect(currentExample()).toContain(label);
      advance(1);
      expect(currentExample()).not.toContain(`${label}.`);
    }
  });

  it("advances when the central image is activated and restarts its countdown", () => {
    render(<LandingExportShowcase />);
    advance(4000);
    fireEvent.click(
      screen.getByRole("button", { name: "Ver siguiente ejemplo" }),
    );
    expect(currentExample()).toContain("Potrero con avatares redondos");
    advance(4999);
    expect(currentExample()).toContain("Potrero con avatares redondos");
    advance(1);
    expect(currentExample()).toContain("Césped con lluvia");
  });

  it("keeps autoplay running while a mouse hovers over the carousel", () => {
    render(<LandingExportShowcase />);
    const first = currentExample();
    fireEvent.pointerEnter(screen.getByRole("region"), {
      pointerType: "mouse",
    });
    advance();
    expect(currentExample()).not.toBe(first);
  });

  it("resumes with the remaining time after an explicit pause", () => {
    render(<LandingExportShowcase />);
    const first = currentExample();
    advance(3000);
    fireEvent.click(screen.getByRole("button", { name: "Pausar animación" }));
    advance(20000);
    fireEvent.click(screen.getByRole("button", { name: "Reanudar animación" }));
    advance(1999);
    expect(currentExample()).toBe(first);
    advance(1);
    expect(currentExample()).not.toBe(first);
  });

  it("keeps the chosen example paused until the user resumes", () => {
    render(<LandingExportShowcase />);
    advance();
    const selected = currentExample();
    fireEvent.click(screen.getByRole("button", { name: "Pausar animación" }));
    advance(22000);
    expect(currentExample()).toBe(selected);
    fireEvent.click(screen.getByRole("button", { name: "Reanudar animación" }));
    advance();
    expect(currentExample()).not.toBe(selected);
  });

  it("stays static with reduced motion, including preference changes", () => {
    reducedMotion = true;
    render(<LandingExportShowcase />);
    expect(
      screen.queryByRole("button", { name: /animación/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Ver ejemplo: Césped con lluvia" }),
    );
    expect(currentExample()).toContain("Césped con lluvia");
    fireEvent.click(
      screen.getByRole("button", { name: "Ver siguiente ejemplo" }),
    );
    expect(currentExample()).toContain("Césped natural con nieve");
    advance(22000);
    expect(currentExample()).toContain("Césped natural con nieve");
    act(() => {
      reducedMotion = false;
      preference.dispatchEvent(new Event("change"));
    });
    advance();
    expect(currentExample()).toContain(
      "Césped con avatares cuadrados centrados",
    );
    act(() => {
      reducedMotion = true;
      preference.dispatchEvent(new Event("change"));
    });
    const selected = currentExample();
    advance(22000);
    expect(currentExample()).toBe(selected);
    expect(
      screen.queryByRole("button", { name: /animación/ }),
    ).not.toBeInTheDocument();
  });

  it("suspends automatic changes in a hidden tab and cleans up on unmount", () => {
    const { unmount } = render(<LandingExportShowcase />);
    const first = currentExample();
    act(() => {
      hidden = true;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    advance(22000);
    expect(currentExample()).toBe(first);
    act(() => {
      hidden = false;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    advance();
    expect(currentExample()).not.toBe(first);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
