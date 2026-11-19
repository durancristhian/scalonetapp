import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { TeamCard } from "@/app/(authenticated)/partidos/[match-id]/(components)/team-card";
import { player, teams } from "../fixtures";

it("should list team players by position and then alphabetically when they were assigned in another order", () => {
  const [team] = teams([
    player(1, { name: "Zoe", position: "mid" }),
    player(2, { name: "Bruno", position: "mid" }),
    player(3, { name: "Mateo", position: "def" }),
    player(4, { name: "Carlos", position: "mid" }),
    player(5, { name: "Andrés", position: "def" }),
  ]);
  render(
    <TeamCard
      canBeDeleted={false}
      removePlayerFromTeam={vi.fn()}
      removeTeam={vi.fn()}
      team={team}
      updateTeamName={vi.fn()}
    />,
  );
  expect(
    screen
      .getAllByRole("button", { name: /^Sacar a / })
      .map((button) => button.getAttribute("aria-label")),
  ).toEqual([
    "Sacar a Andrés del equipo",
    "Sacar a Mateo del equipo",
    "Sacar a Bruno del equipo",
    "Sacar a Carlos del equipo",
    "Sacar a Zoe del equipo",
  ]);
});
