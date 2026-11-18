import { type PropsWithChildren } from "react";
import { renderToString } from "react-dom/server";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Page from "@/app/(public)/page";

const boundary = vi.hoisted(() => ({
  signIn: vi.fn(),
  track: vi.fn(),
}));

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("@/utils/analytics", () => ({ trackAnalytics: boundary.track }));
vi.mock("@clerk/nextjs", () => ({
  Show: ({ when, children }: PropsWithChildren<{ when: string }>) =>
    when === "signed-out" ? children : null,
  SignInButton: ({ children }: PropsWithChildren) => (
    <div onClick={boundary.signIn}>{children}</div>
  ),
}));

describe("Public page", () => {
  it("serves visible essential content before hydration", () => {
    const container = document.createElement("div");
    document.body.append(container);
    try {
      container.innerHTML = renderToString(<Page />);
      const page = within(container);
      expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        page.queryByRole("heading", { name: "Preguntas frecuentes" }),
      ).toBeNull();
      expect(container.querySelectorAll("h1")).toHaveLength(1);
      expect(
        page.getByRole("banner").querySelector('a[href="/"]'),
      ).toHaveTextContent("scalonet.app");
      const publicText = ["header", "main", "footer"]
        .map((selector) => container.querySelector(selector)!.textContent)
        .join(" ");
      expect(publicText.length).toBeGreaterThanOrEqual(500);
      expect(page.getByRole("link", { name: "Contacto" })).toHaveAttribute(
        "href",
        "/contact",
      );
      expect(
        JSON.parse(
          container.querySelector('script[type="application/ld+json"]')!
            .textContent!,
        )["@type"],
      ).toBe("SoftwareApplication");
      expect(page.getByText(/elegí quién juega con quién/)).toBeVisible();
      expect(
        page.getByRole("button", { name: "Armar mi partido" }),
      ).toBeVisible();
      expect(
        page.getByRole("group", { name: /Los once titulares/ }),
      ).toBeVisible();
      expect(
        page.getByRole("heading", { name: "Armá los equipos" }),
      ).toBeVisible();
      expect(page.getByRole("button", { name: /Hecho por/ })).toBeVisible();
    } finally {
      container.remove();
    }
  });

  it("keeps sign-in and analytics", async () => {
    render(<Page />);
    await userEvent.click(
      screen.getByRole("button", { name: "Armar mi partido" }),
    );
    expect(boundary.signIn).toHaveBeenCalledOnce();
    expect(boundary.track).toHaveBeenCalledWith("sign_in_clicked");
  });

  it("publishes the developer contact in the existing author popover", async () => {
    render(<Page />);
    await userEvent.click(screen.getByRole("button", { name: /Hecho por/ }));
    expect(screen.getByText("durancristhiandev@gmail.com")).toBeVisible();
  });
});
