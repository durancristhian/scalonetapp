import { useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddMatch } from "@/app/(authenticated)/(components)/add-match";
import { Feedback } from "@/components/feedback";
import { feedbackAction } from "@/server/actions/feedback";
import { EditMatch } from "@/app/(authenticated)/(components)/edit-match";
import { AddPlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/add-player";
import { EditPlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/edit-player";
import { addMatchAction, editMatchAction } from "@/server/actions/match";
import {
  addMultiplePlayersAction,
  addPlayerAction,
  editPlayerAction,
} from "@/server/actions/player";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { trackAnalytics } from "@/utils/analytics";
import { deferred, match, player } from "../fixtures";

vi.mock("next/navigation", () => ({ useParams: () => ({ "match-id": "1" }) }));
vi.mock("@/server/actions/match", () => ({
  addMatchAction: vi.fn(),
  editMatchAction: vi.fn(),
}));
vi.mock("@/server/actions/feedback", () => ({ feedbackAction: vi.fn() }));
vi.mock("@/server/actions/player", () => ({
  addPlayerAction: vi.fn(),
  addMultiplePlayersAction: vi.fn(),
  editPlayerAction: vi.fn(),
}));
vi.mock("@/utils/analytics", () => ({ trackAnalytics: vi.fn() }));

beforeEach(() => {
  vi.mocked(addMatchAction).mockReset();
  vi.mocked(feedbackAction).mockReset();
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
      expect(action).toHaveBeenLastCalledWith(1, { name: "Final nueva" });
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

it.each(["single", "bulk"])(
  "keeps the %s player draft locked and open until submission finishes",
  async (method) => {
    const single = deferred<Awaited<ReturnType<typeof addPlayerAction>>>();
    const bulk =
      deferred<Awaited<ReturnType<typeof addMultiplePlayersAction>>>();
    vi.mocked(addPlayerAction).mockReturnValue(single.promise);
    vi.mocked(addMultiplePlayersAction).mockReturnValue(bulk.promise);
    const user = userEvent.setup();
    render(<AddPlayer currentPlayerCount={0} />);
    await user.click(screen.getByRole("button", { name: "Agregar" }));
    if (method === "bulk")
      await user.click(screen.getByRole("tab", { name: "Agregar muchos" }));
    const field = screen.getByLabelText(
      method === "single" ? "Nombre" : "Jugadores",
      { exact: true },
    );
    await user.type(field, "Ana");
    await user.click(save());
    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeDisabled();
    expect(field).toBeDisabled();
    expect(screen.getByRole("tab", { name: "Agregar uno" })).toBeDisabled();
    expect(screen.getByRole("tab", { name: "Agregar muchos" })).toBeDisabled();
    await user.type(field, " nueva");
    expect(field).toHaveValue("Ana");
    expect(addPlayerAction).toHaveBeenCalledTimes(method === "single" ? 1 : 0);
    expect(addMultiplePlayersAction).toHaveBeenCalledTimes(
      method === "bulk" ? 1 : 0,
    );
    await act(async () => {
      single.resolve({ ok: true, data: 7 });
      bulk.resolve({ ok: true, data: undefined });
    });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "Agregar" }));
    await user.type(screen.getByLabelText("Nombre", { exact: true }), "Beto");
    expect(screen.getByLabelText("Nombre", { exact: true })).toHaveValue(
      "Beto",
    );
  },
);

it.each(["add match", "edit match", "edit player", "feedback"])(
  "locks the draft and dismissal during %s submission and unlocks on failure",
  async (flow) => {
    const pending = deferred<void>();
    const failure = async () => {
      await pending.promise;
      throw new Error("Request failed");
    };
    vi.mocked(addMatchAction).mockImplementation(failure);
    vi.mocked(editMatchAction).mockImplementation(failure);
    vi.mocked(editPlayerAction).mockImplementation(failure);
    vi.mocked(feedbackAction).mockImplementation(failure);
    const user = userEvent.setup();
    render(
      flow === "add match" ? (
        <AddMatch />
      ) : flow === "edit match" ? (
        <MatchEditor />
      ) : flow === "edit player" ? (
        <PlayerEditor />
      ) : (
        <Feedback />
      ),
    );
    if (flow === "add match" || flow === "feedback")
      await user.click(
        screen.getByRole("button", {
          name: flow === "feedback" ? "Feedback" : "Agregar",
        }),
      );
    const field = screen.getByLabelText(
      flow === "feedback"
        ? "Tu mensaje"
        : flow === "edit player"
          ? "Nombre"
          : "Nombre del partido",
      { exact: true },
    );
    await user.clear(field);
    await user.type(field, "Nuevo contenido");
    await user.click(
      screen.getByRole("button", {
        name: flow === "feedback" ? "Enviar" : "Guardar",
      }),
    );
    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(field).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeDisabled();
    await act(async () => pending.resolve());
    await waitFor(() => expect(field).toBeEnabled());
    expect(field).toHaveValue("Nuevo contenido");
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  },
);
