import { StrictMode, useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";
import { beforeEach, expect, it, vi } from "vitest";
import { useTeamActions } from "@/app/(authenticated)/partidos/[match-id]/(hooks)/use-team-actions";
import { editMatchAction } from "@/server/actions/match";
import { getTeamsToSave } from "@/utils/get-teams-to-save";
import { DEFAULT_IMAGE_EXPORT_OPTIONS } from "@/utils/image-export-options";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import type { MatchWithPlayers } from "@/types/match";
import type { Team } from "@/types/team";
import { deferred, match, player, teams } from "../fixtures";

vi.mock("@/server/actions/match", () => ({ editMatchAction: vi.fn() }));
const roster = [player(1), player(2)];
const lineup = teams([roster[0]], [roster[1]]);
const saved = getTeamsToSave(lineup);

function Actions({
  value = match(roster),
  current = lineup,
  valid = true,
}: {
  value?: MatchWithPlayers;
  current?: Team[];
  valid?: boolean;
}) {
  const actions = useTeamActions(value, current, valid, value.teams);
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <Toaster />
      <p>{actions.hasUnsavedChanges ? "Cambios pendientes" : "Sin cambios"}</p>
      <button
        disabled={
          actions.operation !== null || !valid || !actions.hasUnsavedChanges
        }
        onClick={() => void actions.save()}
      >
        Guardar equipos
      </button>
      <button
        disabled={actions.operation !== null || !valid}
        onClick={() =>
          void actions
            .exportTeams(DEFAULT_IMAGE_EXPORT_OPTIONS, {})
            .then(setError)
        }
      >
        Exportar
      </button>
      {actions.operation && <p role="status">{actions.operation}</p>}
      {error && <p role="alert">{error}</p>}
    </>
  );
}

beforeEach(() => {
  vi.mocked(editMatchAction).mockReset();
});

it("should acknowledge the saved draft without another request when saving twice", async () => {
  vi.mocked(editMatchAction).mockResolvedValue({ ok: true, data: undefined });
  const user = userEvent.setup();
  render(
    <StrictMode>
      <Actions />
    </StrictMode>,
  );
  await user.click(screen.getByRole("button", { name: "Guardar equipos" }));
  expect(
    await screen.findByText("¡Equipos guardados con éxito!"),
  ).toBeVisible();
  expect(screen.getByText("Sin cambios")).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Guardar equipos" }),
  ).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "Guardar equipos" }));
  expect(editMatchAction).toHaveBeenCalledExactlyOnceWith(
    1,
    { teams: saved, expectedTeams: "[]" },
    "/partidos/[match-id]",
  );
});
it("should block both actions when the draft is invalid", () => {
  render(<Actions valid={false} />);
  expect(
    screen.getByRole("button", { name: "Guardar equipos" }),
  ).toBeDisabled();
  expect(screen.getByRole("button", { name: "Exportar" })).toBeDisabled();
  expect(editMatchAction).not.toHaveBeenCalled();
});
it("should disable both actions when saving is pending", async () => {
  const pending = deferred<Awaited<ReturnType<typeof editMatchAction>>>();
  vi.mocked(editMatchAction).mockReturnValue(pending.promise);
  const user = userEvent.setup();
  render(<Actions />);
  await user.click(screen.getByRole("button", { name: "Guardar equipos" }));
  expect(screen.getByRole("status")).toHaveTextContent("save");
  expect(screen.getByRole("button", { name: "Exportar" })).toBeDisabled();
  await act(async () => pending.resolve({ ok: true, data: undefined }));
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
it("should keep the dirty draft and show a conflict when another tab changed teams", async () => {
  vi.mocked(editMatchAction).mockResolvedValue({
    ok: false,
    error: ERROR_MESSAGES.match_teams_changed,
  });
  const user = userEvent.setup();
  render(<Actions />);
  await user.click(screen.getByRole("button", { name: "Guardar equipos" }));
  expect(
    await screen.findByText(ERROR_MESSAGES.match_teams_changed),
  ).toBeVisible();
  expect(screen.getByText("Cambios pendientes")).toBeVisible();
  expect(screen.getByRole("button", { name: "Guardar equipos" })).toBeEnabled();
});
it("should stop export before fetching an image when the save fails", async () => {
  vi.mocked(editMatchAction).mockImplementation(async () => {
    throw new Error("offline");
  });
  const request = vi.fn();
  vi.stubGlobal("fetch", request);
  const user = userEvent.setup();
  render(<Actions />);
  await user.click(screen.getByRole("button", { name: "Exportar" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "No se pudieron guardar los equipos.",
  );
  expect(request).not.toHaveBeenCalled();
  expect(screen.getByText("Cambios pendientes")).toBeVisible();
});
it("should retry only the image and release the download URL when export initially fails", async () => {
  vi.mocked(editMatchAction).mockResolvedValue({ ok: true, data: undefined });
  const request = vi
    .fn()
    .mockResolvedValueOnce(new Response("offline", { status: 503 }))
    .mockResolvedValueOnce(
      new Response(new Uint8Array([137, 80, 78, 71]), {
        headers: { "content-type": "image/png" },
      }),
    );
  vi.stubGlobal("fetch", request);
  const createURL = vi.fn(() => "blob:test");
  const revokeURL = vi.fn();
  class DownloadURL extends URL {
    static override createObjectURL = createURL;
    static override revokeObjectURL = revokeURL;
  }
  vi.stubGlobal("URL", DownloadURL);
  const download = vi
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => {});
  const user = userEvent.setup();
  render(<Actions />);
  await user.click(screen.getByRole("button", { name: "Exportar" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Los equipos están guardados",
  );
  expect(screen.getByText("Sin cambios")).toBeVisible();
  expect(download).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Exportar" }));
  await waitFor(() => expect(download).toHaveBeenCalledOnce());
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(editMatchAction).toHaveBeenCalledOnce();
  expect(request).toHaveBeenCalledTimes(2);
  expect(request.mock.calls[0][0]).toMatch(/^\/download\/1\?/);
  expect(request.mock.calls[0][1]).toEqual({
    cache: "no-store",
    headers: {
      "X-Lineup-Fingerprint": expect.stringMatching(/^[a-f0-9]{64}$/),
    },
  });
  expect(revokeURL).toHaveBeenCalledWith("blob:test");
});
it("should show the refresh message when the export response is stale", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(null, { status: 409 })),
  );
  const user = userEvent.setup();
  render(<Actions value={match(roster, saved)} />);
  await user.click(screen.getByRole("button", { name: "Exportar" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    ERROR_MESSAGES.match_export_changed,
  );
  expect(editMatchAction).not.toHaveBeenCalled();
});
it("should stay clean without submitting when refreshed props acknowledge the draft", () => {
  const view = render(
    <StrictMode>
      <Actions />
    </StrictMode>,
  );
  view.rerender(
    <StrictMode>
      <Actions value={match(roster, saved)} />
    </StrictMode>,
  );
  expect(screen.getByText("Sin cambios")).toBeVisible();
  expect(editMatchAction).not.toHaveBeenCalled();
});
