import { useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddMatch } from "@/app/(authenticated)/(components)/add-match";
import { DeleteMatch } from "@/app/(authenticated)/(components)/delete-match";
import { DeletePlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/delete-player";
import { EditPlayer } from "@/app/(authenticated)/partidos/[match-id]/(components)/edit-player";
import { CopyTeams } from "@/app/(authenticated)/partidos/[match-id]/(components)/copy-teams";
import { Feedback } from "@/components/feedback";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { addMatchAction, deleteMatchAction } from "@/server/actions/match";
import { editPlayerAction, deletePlayerAction } from "@/server/actions/player";
import { feedbackAction } from "@/server/actions/feedback";
import copy from "copy-to-clipboard";
import { deferred, match, player, teams } from "../fixtures";

vi.mock("@/server/actions/match", () => ({
  addMatchAction: vi.fn(),
  deleteMatchAction: vi.fn(),
}));
vi.mock("@/server/actions/player", () => ({
  editPlayerAction: vi.fn(),
  deletePlayerAction: vi.fn(),
}));
vi.mock("@/server/actions/feedback", () => ({ feedbackAction: vi.fn() }));
vi.mock("copy-to-clipboard", () => ({ default: vi.fn() }));

beforeEach(() => {
  vi.mocked(addMatchAction).mockReset();
  vi.mocked(deleteMatchAction).mockReset();
  vi.mocked(editPlayerAction).mockReset();
  vi.mocked(deletePlayerAction).mockReset();
  vi.mocked(feedbackAction).mockReset();
});

describe("create match", () => {
  it("should close the dialog and show success when the server accepts the match", async () => {
    vi.mocked(addMatchAction).mockResolvedValue({ ok: true, data: match() });
    const user = userEvent.setup();
    render(
      <>
        <AddMatch />
        <Toaster />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Agregar" }));
    await user.type(screen.getByLabelText("Nombre del partido"), "Final");
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    expect(await screen.findByText("¡Partido creado!")).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(addMatchAction).toHaveBeenCalledExactlyOnceWith({ name: "Final" });
  });
  it.each(["expected", "transport"])(
    "should preserve the draft and allow retry when creation fails with %s error",
    async (kind) => {
      const action = vi.mocked(addMatchAction);
      if (kind === "expected")
        action.mockResolvedValueOnce({
          ok: false,
          error: ERROR_MESSAGES.match_name_repeated,
        });
      else action.mockRejectedValueOnce(Error("private server detail"));
      const user = userEvent.setup();
      render(
        <>
          <AddMatch />
          <Toaster />
        </>,
      );
      await user.click(screen.getByRole("button", { name: "Agregar" }));
      await user.type(screen.getByLabelText("Nombre del partido"), "Final");
      await user.click(screen.getByRole("button", { name: "Guardar" }));
      expect(
        await screen.findByText(
          kind === "expected"
            ? ERROR_MESSAGES.match_name_repeated
            : ERROR_MESSAGES.match_add_error,
        ),
      ).toBeVisible();
      expect(
        screen.queryByText("private server detail"),
      ).not.toBeInTheDocument();
      expect(screen.getByLabelText("Nombre del partido")).toHaveValue("Final");
      expect(screen.getByRole("button", { name: "Guardar" })).toBeEnabled();
      action.mockResolvedValueOnce({ ok: true, data: match() });
      await user.click(screen.getByRole("button", { name: "Guardar" }));
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    },
  );
  it("should prevent opening creation when account capacity is exhausted", async () => {
    const user = userEvent.setup();
    render(<AddMatch disabled />);
    await user.click(screen.getByRole("button", { name: "Agregar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(addMatchAction).not.toHaveBeenCalled();
  });
});

for (const kind of ["match", "player"] as const) {
  describe(`delete ${kind}`, () => {
    const action =
      kind === "match"
        ? vi.mocked(deleteMatchAction)
        : vi.mocked(deletePlayerAction);
    function Editor() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <Toaster />
          {!open ? (
            <p>Eliminado</p>
          ) : kind === "match" ? (
            <DeleteMatch id={7} onClose={() => setOpen(false)} />
          ) : (
            <DeletePlayer
              id={7}
              onClose={() => setOpen(false)}
              onCloseAutoFocus={() => {}}
            />
          )}
        </>
      );
    }
    it("should close without requesting deletion when cancellation is clicked", async () => {
      const user = userEvent.setup();
      render(<Editor />);
      await user.click(screen.getByRole("button", { name: "Cancelar" }));
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
      expect(action).not.toHaveBeenCalled();
    });
    it("should disable repeated deletion and cancellation when deletion is pending", async () => {
      const pending = deferred<Awaited<ReturnType<typeof action>>>();
      action.mockImplementation(() => pending.promise);
      const user = userEvent.setup();
      render(<Editor />);
      await user.click(screen.getByRole("button", { name: "Sí, eliminar" }));
      expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
      await user.click(screen.getByRole("button", { name: "Eliminando..." }));
      expect(action).toHaveBeenCalledExactlyOnceWith(7);
      await act(async () => pending.resolve({ ok: true, data: undefined }));
      expect(await screen.findByText("Eliminado")).toBeVisible();
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    it("should show a safe error and allow retry when deletion rejects", async () => {
      action
        .mockRejectedValueOnce(Error("private database detail"))
        .mockResolvedValue({ ok: true, data: undefined });
      const user = userEvent.setup();
      render(<Editor />);
      await user.click(screen.getByRole("button", { name: "Sí, eliminar" }));
      expect(
        await screen.findByText(
          kind === "match"
            ? ERROR_MESSAGES.match_delete_error
            : ERROR_MESSAGES.player_delete_error,
        ),
      ).toBeVisible();
      expect(screen.getByRole("alertdialog")).toBeVisible();
      expect(
        screen.queryByText("private database detail"),
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Sí, eliminar" }));
      expect(await screen.findByText("Eliminado")).toBeVisible();
    });
  });
}

describe("edit player", () => {
  it("should preserve the edited name and show the server error when the update is rejected", async () => {
    vi.mocked(editPlayerAction).mockResolvedValue({
      ok: false,
      error: ERROR_MESSAGES.match_player_repeated,
    });
    const close = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <EditPlayer
          player={player(1)}
          onClose={close}
          onCloseAutoFocus={() => {}}
        />
        <Toaster />
      </>,
    );
    await user.clear(screen.getByLabelText("Nombre", { exact: true }));
    await user.type(screen.getByLabelText("Nombre", { exact: true }), "Ana");
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    expect(
      await screen.findByText(ERROR_MESSAGES.match_player_repeated),
    ).toBeVisible();
    expect(screen.getByLabelText("Nombre", { exact: true })).toHaveValue("Ana");
    expect(close).not.toHaveBeenCalled();
    expect(editPlayerAction).toHaveBeenCalledExactlyOnceWith(1, {
      name: "Ana",
      level: 5,
      position: "mid",
    });
  });
});

describe("clipboard", () => {
  it.each([true, false, "reject", "throw"])(
    "should wait for the clipboard outcome and allow retry after %s",
    async (outcome) => {
      const value = teams([
        player(1, { name: "Zoe" }),
        player(2, { name: "Ana" }),
      ]);
      const before = structuredClone(value);
      const pending = deferred<boolean>();
      vi.mocked(copy)
        .mockReset()
        .mockImplementation(() => {
          if (outcome === "throw") throw Error("denied");
          return pending.promise;
        });
      const user = userEvent.setup();
      render(
        <>
          <CopyTeams teams={value} />
          <Toaster />
        </>,
      );
      await user.click(screen.getByRole("button", { name: "Copiar" }));
      if (outcome !== "throw") {
        expect(
          screen.queryByText("¡Equipos copiados al portapapeles!"),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(/No pudimos copiar los equipos/),
        ).not.toBeInTheDocument();
        await act(async () => {
          if (outcome === "reject") pending.reject(Error("denied"));
          else pending.resolve(outcome === true);
        });
      }
      expect(
        await screen.findByText(
          outcome === true
            ? "¡Equipos copiados al portapapeles!"
            : /No pudimos copiar los equipos/,
        ),
      ).toBeVisible();
      if (outcome !== true)
        expect(
          screen.queryByText("¡Equipos copiados al portapapeles!"),
        ).not.toBeInTheDocument();
      expect(copy).toHaveBeenCalledExactlyOnceWith(
        "Azules:\n- Ana\n- Zoe\n\nRojos:\n",
      );
      expect(value).toEqual(before);
      if (outcome !== true) {
        vi.mocked(copy).mockResolvedValueOnce(true);
        await user.click(screen.getByRole("button", { name: "Copiar" }));
        expect(
          await screen.findByText("¡Equipos copiados al portapapeles!"),
        ).toBeVisible();
        expect(vi.mocked(copy).mock.calls[1]).toEqual([
          "Azules:\n- Ana\n- Zoe\n\nRojos:\n",
        ]);
      }
    },
  );
});

describe("feedback", () => {
  it("should show success and close when feedback is accepted", async () => {
    vi.mocked(feedbackAction).mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <>
        <Feedback />
        <Toaster />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Feedback" }));
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();
    await user.type(
      screen.getByLabelText("Tu mensaje"),
      "Me gustaría guardar mis equipos",
    );
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    expect(await screen.findByText("¡Su feedback fue enviado!")).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(feedbackAction).toHaveBeenCalledExactlyOnceWith({
      message: "Me gustaría guardar mis equipos",
    });
  });
  it("should keep the message and allow retry when sending fails", async () => {
    const pending = deferred<void>();
    vi.mocked(feedbackAction)
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <>
        <Feedback />
        <Toaster />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Feedback" }));
    await user.type(screen.getByLabelText("Tu mensaje"), "Hola Cris");
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    expect(screen.getByRole("button", { name: "Enviando..." })).toBeDisabled();
    await act(async () => pending.reject(Error("offline")));
    expect(
      await screen.findByText(ERROR_MESSAGES.feedback_submit_error),
    ).toBeVisible();
    expect(screen.getByLabelText("Tu mensaje")).toHaveValue("Hola Cris");
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    expect(await screen.findByText("¡Su feedback fue enviado!")).toBeVisible();
  });
});
