import { useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EditMatch } from "@/app/(authenticated)/(components)/edit-match";
import { AddPlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/add-player";
import { EditPlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/edit-player";
import { editMatchAction } from "@/server/actions/match";
import {
  addMultiplePlayersAction,
  addPlayerAction,
  editPlayerAction,
} from "@/server/actions/player";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { trackAnalytics } from "@/utils/analytics";
import { deferred, match, player } from "../fixtures";

vi.mock("next/navigation", () => ({ useParams: () => ({ "match-id": "1" }) }));
vi.mock("@/server/actions/match", () => ({ editMatchAction: vi.fn() }));
vi.mock("@/server/actions/player", () => ({
  addPlayerAction: vi.fn(),
  addMultiplePlayersAction: vi.fn(),
  editPlayerAction: vi.fn(),
}));
vi.mock("@/utils/analytics", () => ({ trackAnalytics: vi.fn() }));

beforeEach(() => {
  vi.mocked(editMatchAction).mockReset();
  vi.mocked(addPlayerAction).mockReset();
  vi.mocked(addMultiplePlayersAction).mockReset();
  vi.mocked(editPlayerAction).mockReset();
});

function MatchEditor() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Toaster />
      {open && <EditMatch match={match()} onClose={() => setOpen(false)} />}
    </>
  );
}

function PlayerEditor() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Toaster />
      {open && (
        <EditPlayer
          player={player(7, { avatar: "/photo.jpg" })}
          onClose={() => setOpen(false)}
          onCloseAutoFocus={() => {}}
        />
      )}
    </>
  );
}

const save = () => screen.getByRole("button", { name: "Guardar" });

describe("match edit submission", () => {
  it.each(["expected", "transport"])(
    "preserves the draft after %s errors and closes after retry",
    async (failure) => {
      const action = vi.mocked(editMatchAction);
      if (failure === "expected")
        action.mockResolvedValueOnce({
          ok: false,
          error: ERROR_MESSAGES.match_name_repeated,
        });
      else action.mockRejectedValueOnce(Error("private database detail"));
      action.mockResolvedValue({ ok: true, data: undefined });
      const user = userEvent.setup();
      render(<MatchEditor />);
      const name = screen.getByLabelText("Nombre del partido");
      await user.clear(name);
      await user.type(name, "Final nueva");
      await user.click(save());
      expect(
        await screen.findByText(
          failure === "expected"
            ? ERROR_MESSAGES.match_name_repeated
            : ERROR_MESSAGES.match_edit_error,
        ),
      ).toBeVisible();
      expect(name).toHaveValue("Final nueva");
      expect(screen.getByRole("dialog")).toBeVisible();
      expect(
        screen.queryByText("private database detail"),
      ).not.toBeInTheDocument();
      await user.click(save());
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      expect(action).toHaveBeenCalledTimes(2);
      expect(action).toHaveBeenLastCalledWith(
        1,
        { name: "Final nueva" },
        "/dashboard",
      );
    },
  );
});

describe("player creation submission", () => {
  it("preserves a single player's draft after rejection and closes after retry", async () => {
    const action = vi
      .mocked(addPlayerAction)
      .mockResolvedValueOnce({
        ok: false,
        error: ERROR_MESSAGES.match_player_repeated,
      })
      .mockResolvedValue({ ok: true, data: 7 });
    const user = userEvent.setup();
    render(
      <>
        <AddPlayer currentPlayerCount={0} />
        <Toaster />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Agregar" }));
    await user.type(screen.getByLabelText("Nombre", { exact: true }), "Ana");
    await user.click(save());
    expect(
      await screen.findByText(ERROR_MESSAGES.match_player_repeated),
    ).toBeVisible();
    expect(screen.getByLabelText("Nombre", { exact: true })).toHaveValue("Ana");
    expect(trackAnalytics).not.toHaveBeenCalledWith(
      "players_added",
      expect.anything(),
    );
    await user.click(save());
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(action).toHaveBeenCalledTimes(2);
    expect(action).toHaveBeenLastCalledWith(1, {
      name: "Ana",
      level: 5,
      position: "mid",
    });
    expect(trackAnalytics).toHaveBeenCalledExactlyOnceWith("players_added", {
      method: "single",
      count: 1,
    });
  });

  it("keeps bulk names on transport failure and reports the successful retry once", async () => {
    const action = vi
      .mocked(addMultiplePlayersAction)
      .mockRejectedValueOnce(Error("private request detail"))
      .mockResolvedValue({ ok: true, data: undefined });
    const user = userEvent.setup();
    render(
      <>
        <AddPlayer currentPlayerCount={0} />
        <Toaster />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Agregar" }));
    await user.click(screen.getByRole("tab", { name: "Agregar muchos" }));
    await user.type(screen.getByLabelText("Jugadores"), "Ana\nBeto");
    await user.click(save());
    expect(
      await screen.findByText(ERROR_MESSAGES.player_multiple_add_error),
    ).toBeVisible();
    expect(screen.getByLabelText("Jugadores")).toHaveValue("Ana\nBeto");
    expect(trackAnalytics).not.toHaveBeenCalledWith(
      "players_added",
      expect.anything(),
    );
    await user.click(save());
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(action).toHaveBeenCalledTimes(2);
    expect(action).toHaveBeenLastCalledWith(1, [
      { name: "Ana", level: 5, position: "mid" },
      { name: "Beto", level: 5, position: "mid" },
    ]);
    expect(trackAnalytics).toHaveBeenCalledExactlyOnceWith("players_added", {
      method: "bulk",
      count: 2,
    });
  });
});

it("waits for the roster write before updating a photo and keeps that save successful when the photo fails", async () => {
  const row = deferred<Awaited<ReturnType<typeof editPlayerAction>>>();
  const photo = deferred<Response>();
  vi.mocked(editPlayerAction).mockReturnValue(row.promise);
  const fetchPhoto = vi.fn(() => photo.promise);
  vi.stubGlobal("fetch", fetchPhoto);
  const user = userEvent.setup();
  render(<PlayerEditor />);
  await user.clear(screen.getByLabelText("Nombre", { exact: true }));
  await user.type(screen.getByLabelText("Nombre", { exact: true }), "Ana");
  await user.click(screen.getByRole("button", { name: "Quitar foto" }));
  await user.click(save());
  expect(fetchPhoto).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
  await act(async () => row.resolve({ ok: true, data: undefined }));
  await waitFor(() =>
    expect(fetchPhoto).toHaveBeenCalledExactlyOnceWith(
      "/api/players/7/avatar",
      expect.objectContaining({ method: "DELETE" }),
    ),
  );
  expect(screen.getByRole("dialog")).toBeVisible();
  await act(async () =>
    photo.resolve(
      new Response(
        JSON.stringify({ error: "No pudimos actualizar la foto." }),
        { status: 503 },
      ),
    ),
  );
  expect(
    await screen.findByText("No pudimos actualizar la foto."),
  ).toBeVisible();
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(editPlayerAction).toHaveBeenCalledExactlyOnceWith(7, {
    name: "Ana",
    level: 5,
    position: "mid",
  });
});
