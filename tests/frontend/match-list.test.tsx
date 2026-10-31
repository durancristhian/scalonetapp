import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { MatchesList } from "@/app/(authenticated)/(components)/matches-list";
import { match } from "../fixtures";

vi.mock("@/server/actions/match", () => ({ editMatchAction: vi.fn(), deleteMatchAction: vi.fn(), duplicateMatchAction: vi.fn() }));
it("should show the empty state when there are no matches", () => {
  render(<MatchesList matches={[]} atMatchLimit={false} />);
  expect(screen.getByText("Silencio atroz... hasta que crees tu primer partido.")).toBeVisible();
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});
it("should expose every supplied match when the list contains more than ten rows", () => {
  const matches = Array.from({ length: 11 }, (_, i) => ({ ...match(), id: i + 1, name: `Partido ${i + 1}` }));
  render(<MatchesList matches={matches} atMatchLimit={false} />);
  expect(screen.getAllByRole("link")).toHaveLength(11);
  expect(screen.getByRole("link", { name: /Partido 11/ })).toHaveAttribute("href", "/partidos/11");
});
it.each([true, false])("should use account capacity when duplication is opened with atLimit=%s", async atLimit => {
  const user = userEvent.setup();
  render(<MatchesList matches={[match()]} atMatchLimit={atLimit} />);
  await user.click(screen.getByRole("button", { name: "Acciones de Amistoso" }));
  const duplicate = screen.getByRole("menuitem", { name: "Duplicar" });
  if (atLimit) expect(duplicate).toHaveAttribute("aria-disabled", "true");
  else expect(duplicate).not.toHaveAttribute("aria-disabled", "true");
});
