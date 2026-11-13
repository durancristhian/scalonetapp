import { LargeScreenNavigation } from "@/components/navigation";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/partidos/abc",
}));
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isSignedIn: true }),
}));

it("renders desktop navigation as styled anchors with the active route marked", () => {
  render(<LargeScreenNavigation />);

  const dashboard = screen.getByRole("link", { name: "Dashboard" });
  const matches = screen.getByRole("link", { name: "Partidos" });

  expect(dashboard.tagName).toBe("A");
  expect(dashboard).toHaveAttribute("href", "/dashboard");
  expect(dashboard).not.toHaveAttribute("data-active");
  expect(dashboard).not.toHaveAttribute("aria-current");
  expect(dashboard).toHaveClass("h-12", "data-[active]:bg-accent/50");
  expect(matches).toHaveAttribute("href", "/partidos");
  expect(matches).toHaveAttribute("data-active");
  expect(matches).toHaveAttribute("aria-current", "page");
  expect(screen.getAllByRole("link")).toHaveLength(2);
});

it("moves focus between desktop navigation links with arrow keys", async () => {
  const user = userEvent.setup();

  render(<LargeScreenNavigation />);

  await user.tab();
  expect(screen.getByRole("link", { name: "Dashboard" })).toHaveFocus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("link", { name: "Partidos" })).toHaveFocus();
  await user.keyboard("{ArrowLeft}");
  expect(screen.getByRole("link", { name: "Dashboard" })).toHaveFocus();
});
