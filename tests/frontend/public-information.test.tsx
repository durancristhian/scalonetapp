import { type PropsWithChildren } from "react";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublicInformation } from "@/components/public-information";

const boundary = vi.hoisted(() => ({ signedIn: false }));

vi.mock("next/navigation", () => ({ usePathname: () => "/privacy" }));
vi.mock("@/server/actions/feedback", () => ({ feedbackAction: vi.fn() }));
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isSignedIn: boundary.signedIn }),
  Show: ({ when, children }: PropsWithChildren<{ when: string }>) =>
    (when === "signed-in") === boundary.signedIn ? children : null,
  UserButton: () => <button>Cuenta</button>,
}));

beforeEach(() => {
  boundary.signedIn = false;
});

function footerLinks() {
  return within(
    within(screen.getByRole("contentinfo")).getByRole("navigation", {
      name: "Información",
    }),
  );
}

describe("Public information page", () => {
  it("keeps the public shell for signed-out visitors", () => {
    render(<PublicInformation path="/privacy" />);
    const header = within(screen.getByRole("banner"));
    expect(header.getByRole("link", { name: "scalonet.app" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.queryByRole("link", { name: "Dashboard" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Feedback" }),
    ).not.toBeInTheDocument();
  });

  it("keeps signed-in users inside the application shell", () => {
    boundary.signedIn = true;
    render(<PublicInformation path="/privacy" />);
    expect(screen.getByRole("link", { name: "scalonet.app" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("link", { name: "Partidos" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(
      screen.getByRole("button", { name: "Abrir navegación" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Cuenta" })).toBeVisible();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      within(screen.getByRole("contentinfo")).getByRole("button", {
        name: "Feedback",
      }),
    ).toBeVisible();
  });

  it.each([false, true])(
    "marks the current information page in the footer when signed in is %s",
    (signedIn) => {
      boundary.signedIn = signedIn;
      render(<PublicInformation path="/privacy" />);
      const links = footerLinks();
      const current = links.getByRole("link", { name: "Privacidad" });
      expect(current).toHaveAttribute("href", "/privacy");
      expect(current).toHaveAttribute("aria-current", "page");
      for (const [name, href] of [
        ["Acerca de", "/about"],
        ["Contacto", "/contact"],
      ]) {
        const link = links.getByRole("link", { name });
        expect(link).toHaveAttribute("href", href);
        expect(link).not.toHaveAttribute("aria-current");
      }
    },
  );
});
