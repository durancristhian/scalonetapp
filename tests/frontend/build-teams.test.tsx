import { render, screen, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { Toaster } from "sonner";
import { beforeEach, expect, it, vi } from "vitest";
import { MatchDetails } from "@/app/(authenticated)/partidos/[match-id]/(components)/match-details";
import { editMatchAction } from "@/server/actions/match";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { getTeamsToSave } from "@/utils/get-teams-to-save";
import { match, player, teams } from "../fixtures";

vi.mock("@/server/actions/match", () => ({ editMatchAction: vi.fn() }));
vi.mock("@/server/actions/player", () => ({}));
vi.mock("next/navigation", () => ({
  useParams: () => ({ "match-id": "1" }),
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock("@/utils/analytics", () => ({ trackAnalytics: vi.fn() }));

const roster = [player(1), player(2), player(3)];
const savedLineup = getTeamsToSave(teams([roster[0]]));

beforeEach(() => {
  vi.mocked(editMatchAction).mockReset();
  vi.mocked(editMatchAction).mockResolvedValue({ ok: true, data: undefined });
});

function renderMatch(saved: string) {
  const user = userEvent.setup();
  render(
    <>
      <Toaster />
      <MatchDetails match={match(roster, saved)} />
    </>,
  );
  return user;
}

async function buildBalancedTeams(user: UserEvent) {
  await user.click(screen.getByRole("button", { name: "Armar equipos" }));
  await user.click(screen.getByRole("radio", { name: /Balancear/ }));
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Guardar",
    }),
  );
}

it("should save the uneven lineup in one step when confirming the build over saved teams", async () => {
  const user = renderMatch(savedLineup);
  await buildBalancedTeams(user);
  await user.click(screen.getByRole("button", { name: "Sí, confirmo" }));
  expect(
    await screen.findByText("¡Equipos guardados con éxito!"),
  ).toBeVisible();
  const [[, request]] = vi.mocked(editMatchAction).mock.calls;
  expect(request.expectedTeams).toBe(savedLineup);
  expect(
    JSON.parse(request.teams!).map(
      (team: { players: number[] }) => team.players.length,
    ),
  ).toEqual([2, 1]);
  expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
});

it("should ask before replacing a saved lineup whose players were removed without saving", async () => {
  const user = renderMatch(savedLineup);
  await user.click(
    screen.getByRole("button", { name: "Sacar a Jugador 1 del equipo" }),
  );
  await buildBalancedTeams(user);
  expect(
    screen.getByRole("alertdialog", {
      name: "¿Confirmás el cambio de alineaciones?",
    }),
  ).toBeVisible();
  expect(editMatchAction).not.toHaveBeenCalled();
});

it("should show why the built lineup was not saved when a team name is empty", async () => {
  const user = renderMatch("[]");
  await user.clear(screen.getAllByRole("textbox")[0]);
  await buildBalancedTeams(user);
  await user.click(screen.getByRole("button", { name: "Sí, confirmo" }));
  expect(
    await screen.findByText(
      "Los nombres de los equipos deben tener entre 1 y 40 caracteres.",
      { selector: "[data-title]" },
    ),
  ).toBeVisible();
  expect(editMatchAction).not.toHaveBeenCalled();
});

it("should keep the built lineup pending when another tab saved first", async () => {
  vi.mocked(editMatchAction).mockResolvedValue({
    ok: false,
    error: ERROR_MESSAGES.match_teams_changed,
  });
  const user = renderMatch("[]");
  await buildBalancedTeams(user);
  expect(
    await screen.findByText(ERROR_MESSAGES.match_teams_changed),
  ).toBeVisible();
  expect(screen.queryByText("Este equipo está vacío.")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Guardar" })).toBeEnabled();
});
