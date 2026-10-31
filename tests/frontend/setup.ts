import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { toast } from "sonner";

// jsdom has no layout engine. These browser APIs support real Radix components.
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(globalThis, "ResizeObserver", { configurable: true, writable: true, value: ResizeObserver });
Object.defineProperty(window, "matchMedia", { writable: true, value: (media: string) => ({
  matches: false, media, onchange: null,
  addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true,
}) });
Element.prototype.scrollIntoView = () => {};
Element.prototype.hasPointerCapture = () => false;
Element.prototype.setPointerCapture = () => {};
Element.prototype.releasePointerCapture = () => {};

afterEach(() => {
  cleanup();
  toast.dismiss();
  localStorage.clear();
  sessionStorage.clear();
});
