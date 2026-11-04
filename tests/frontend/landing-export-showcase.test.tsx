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
    .getByRole("img", { name: /Los once titulares/ })
    .getAttribute("aria-label");

const advance = (time = 5500) => act(() => vi.advanceTimersByTime(time));

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
    const first = currentExample();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    advance(22000);
    expect(currentExample()).toBe(first);
    act(() => {
      reducedMotion = false;
      preference.dispatchEvent(new Event("change"));
    });
    advance();
    expect(currentExample()).not.toBe(first);
    act(() => {
      reducedMotion = true;
      preference.dispatchEvent(new Event("change"));
    });
    const selected = currentExample();
    advance(22000);
    expect(currentExample()).toBe(selected);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
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
