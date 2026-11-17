import { render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AssignPlayers } from "@/app/(authenticated)/partidos/[match-id]/(components)/assign-players";
import { player, teams } from "../fixtures";

it("should list free players alphabetically when the roster arrives in creation order", () => {
  const players = [
    player(375, { name: "Javi" }),
    player(376, { name: "Raúl" }),
    player(458, { name: "Alejandro" }),
    player(390, { name: "Cesar" }),
  ];
  render(
    <AssignPlayers
      assignSelectionToTeam={vi.fn()}
      canAssignSelection={false}
      players={players}
      selectedIds={[]}
      teams={teams()}
      togglePlayer={vi.fn()}
    />,
  );
  const list = screen.getByRole("toolbar", { name: "Jugadores para asignar" });
  expect(
    within(list)
      .getAllByRole("button")
      .map((button) => button.getAttribute("aria-label")),
  ).toEqual(["Alejandro", "Cesar", "Javi", "Raúl"]);
});
