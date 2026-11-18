import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Analytics } from "@/components/analytics";

const boundary = vi.hoisted(() => ({
  pathname: "/",
  auth: { isLoaded: true, isSignedIn: false },
  track: vi.fn(),
}));

vi.mock("next/navigation", () => ({ usePathname: () => boundary.pathname }));
vi.mock("@clerk/nextjs", () => ({ useAuth: () => boundary.auth }));
vi.mock("next/script", () => ({
  default: ({ src }: { src: string }) => (
    <div data-testid="tracker" data-src={src} />
  ),
}));
vi.mock("@/utils/analytics", async (original) => ({
  ...(await original<typeof import("@/utils/analytics")>()),
  trackAnalytics: boundary.track,
}));

beforeEach(() => {
  boundary.pathname = "/";
  boundary.auth = { isLoaded: true, isSignedIn: false };
});

const tracker = () => document.querySelector("[data-testid=tracker]");

describe("analytics", () => {
  it("loads the tracker and records one page view per page visited", () => {
    const view = render(<Analytics websiteId="site" />);
    expect(tracker()).toHaveAttribute("data-src", "/stats/script.js");
    expect(boundary.track).toHaveBeenCalledTimes(1);
    view.rerender(<Analytics websiteId="site" />);
    expect(boundary.track).toHaveBeenCalledTimes(1);
    boundary.pathname = "/dashboard";
    view.rerender(<Analytics websiteId="site" />);
    expect(boundary.track).toHaveBeenCalledTimes(2);
  });

  it("stays off when the visitor opted out", () => {
    localStorage.setItem("umami.disabled", "1");
    render(<Analytics websiteId="site" />);
    expect(tracker()).toBeNull();
    expect(boundary.track).not.toHaveBeenCalled();
  });

  it("stays off for a signed-in visitor on the landing page", () => {
    boundary.auth = { isLoaded: true, isSignedIn: true };
    render(<Analytics websiteId="site" />);
    expect(tracker()).toBeNull();
    expect(boundary.track).not.toHaveBeenCalled();
  });
});
