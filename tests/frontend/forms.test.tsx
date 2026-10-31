import { StrictMode, useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MatchForm } from "@/app/(authenticated)/(components)/match-form";
import { MultiplePlayersForm } from "@/app/(authenticated)/partidos/[match-id]/(components)/multiple-players-form";
import { TeamForm } from "@/app/(authenticated)/partidos/[match-id]/(components)/team-form";
import { PlayerForm } from "@/app/(authenticated)/partidos/[match-id]/(components)/player-form";
import { deferred } from "../fixtures";

const save = () => screen.getByRole("button", { name: "Guardar" });

describe("match form", () => {
  it("should disable saving when the name is empty", () => {
    render(<MatchForm onSubmit={vi.fn()} />);
    expect(save()).toBeDisabled();
  });
  it("should submit a trimmed name and reset when saving succeeds", async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<MatchForm onSubmit={submit} />);
    await user.type(screen.getByLabelText("Nombre del partido"), "  Final  ");
    await user.click(save());
    await waitFor(() => expect(submit).toHaveBeenCalledWith({ name: "Final" }));
    expect(screen.getByLabelText("Nombre del partido")).toHaveValue("");
    expect(save()).toBeDisabled();
  });
  it("should prevent repeated saves when a request is pending", async () => {
    const pending = deferred<void>();
    const submit = vi.fn(() => pending.promise);
    const user = userEvent.setup();
    render(<MatchForm onSubmit={submit} values={{ name: "Final" }} />);
    await user.click(save());
    const busy = screen.getByRole("button", { name: "Guardando..." });
    expect(busy).toBeDisabled();
    await user.click(busy);
    expect(submit).toHaveBeenCalledTimes(1);
    await act(async () => pending.resolve());
    await waitFor(() => expect(save()).toBeEnabled());
  });
  it("should preserve the draft and allow retry when saving rejects", async () => {
    const submit = vi
      .fn()
      .mockRejectedValueOnce(Error("offline"))
      .mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<MatchForm onSubmit={submit} />);
    await user.type(screen.getByLabelText("Nombre del partido"), "Final");
    await user.click(save());
    await waitFor(() => expect(save()).toBeEnabled());
    expect(screen.getByLabelText("Nombre del partido")).toHaveValue("Final");
    await user.click(save());
    await waitFor(() =>
      expect(screen.getByLabelText("Nombre del partido")).toHaveValue(""),
    );
    expect(submit).toHaveBeenCalledTimes(2);
  });
  it("should reject an overlong name when the input is validated", async () => {
    const submit = vi.fn();
    const user = userEvent.setup();
    render(<MatchForm onSubmit={submit} />);
    await user.type(
      screen.getByLabelText("Nombre del partido"),
      "x".repeat(41),
    );
    await user.click(screen.getByText("Nombre del partido"));
    expect(save()).toBeDisabled();
    expect(submit).not.toHaveBeenCalled();
  });
  it("should display refreshed values without submitting when props change", async () => {
    const submit = vi.fn();
    const view = render(
      <StrictMode>
        <MatchForm onSubmit={submit} values={{ name: "Antes" }} />
      </StrictMode>,
    );
    view.rerender(
      <StrictMode>
        <MatchForm onSubmit={submit} values={{ name: "Después" }} />
      </StrictMode>,
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Nombre del partido")).toHaveValue(
        "Después",
      ),
    );
    expect(submit).not.toHaveBeenCalled();
  });
});

describe("bulk player form", () => {
  it("should count and submit only trimmed nonempty names when pasted text contains blank lines", async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<MultiplePlayersForm currentPlayerCount={98} onSubmit={submit} />);
    await user.click(screen.getByLabelText("Jugadores"));
    await user.paste(" Ana\n   \nBeto \n\n");
    expect(screen.getByText("Se han detectado 2 nombres.")).toBeVisible();
    await user.click(save());
    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith([
        { name: "Ana", level: 5, position: "mid" },
        { name: "Beto", level: 5, position: "mid" },
      ]),
    );
    expect(screen.getByLabelText("Jugadores")).toHaveValue("");
  });
  it.each([
    [0, " \n  ", null],
    [99, "Ana\nBeto", "Podés agregar 1 jugador más."],
    [100, "Ana", "El partido admite hasta 100 jugadores."],
    [
      0,
      Array.from({ length: 51 }, (_, i) => `Jugador ${i}`).join("\n"),
      "Podés agregar hasta 50 jugadores por carga.",
    ],
    [0, "x".repeat(41), "Jugador 1: 40 caracteres máximo."],
  ])(
    "should block invalid import when count is %s and input is %s",
    async (count, text, error) => {
      const submit = vi.fn();
      const user = userEvent.setup();
      render(
        <MultiplePlayersForm currentPlayerCount={count} onSubmit={submit} />,
      );
      await user.click(screen.getByLabelText("Jugadores"));
      await user.paste(text);
      await waitFor(() => expect(save()).toBeDisabled());
      if (error)
        expect(await screen.findByText(error, { exact: false })).toBeVisible();
      expect(submit).not.toHaveBeenCalled();
    },
  );
  it("should accept 50 players when the remaining capacity is 50", async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<MultiplePlayersForm currentPlayerCount={50} onSubmit={submit} />);
    await user.click(screen.getByLabelText("Jugadores"));
    await user.paste(
      Array.from({ length: 50 }, (_, i) => `Jugador ${i}`).join("\n"),
    );
    await user.click(save());
    await waitFor(() => expect(submit).toHaveBeenCalledOnce());
    expect(submit.mock.calls[0][0]).toHaveLength(50);
  });
  it("should keep entered names and release loading when the request fails", async () => {
    const pending = deferred<void>();
    const user = userEvent.setup();
    render(
      <MultiplePlayersForm
        currentPlayerCount={0}
        onSubmit={() => pending.promise}
      />,
    );
    await user.type(screen.getByLabelText("Jugadores"), "Ana");
    await user.click(save());
    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
    await act(async () => pending.reject(Error("offline")));
    expect(
      await screen.findByRole("button", { name: "Guardar" }),
    ).toBeEnabled();
    expect(screen.getByLabelText("Jugadores")).toHaveValue("Ana");
  });
});

describe("team form", () => {
  it("should update parent content when the team name changes", async () => {
    function Editor() {
      const [name, setName] = useState("Azules");
      return (
        <>
          <output>{name}</output>
          <TeamForm
            values={{ name }}
            onSubmit={(value) => setName(value.name)}
          />
        </>
      );
    }
    const user = userEvent.setup();
    render(
      <StrictMode>
        <Editor />
      </StrictMode>,
    );
    await user.clear(screen.getByLabelText("Nombre del equipo"));
    await user.type(screen.getByLabelText("Nombre del equipo"), "Rojos");
    expect(screen.getByRole("status")).toHaveTextContent("Rojos");
    expect(screen.getByLabelText("Nombre del equipo")).toHaveValue("Rojos");
  });
});

describe("player form", () => {
  it("should submit the selected position and level when a player is entered", async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<PlayerForm onSubmit={submit} />);
    await user.type(screen.getByLabelText("Nombre", { exact: true }), " Ana ");
    await user.click(screen.getByRole("radio", { name: "Defensor" }));
    await user.click(screen.getByRole("radio", { name: "8" }));
    await user.click(save());
    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith(
        { name: "Ana", level: 8, position: "def" },
        undefined,
      ),
    );
    expect(screen.getByLabelText("Nombre", { exact: true })).toHaveValue("");
  });
  it("should retain selected values when the request rejects", async () => {
    const user = userEvent.setup();
    render(
      <PlayerForm
        onSubmit={vi.fn().mockRejectedValue(Error("offline"))}
        values={{ name: "Ana", level: 8, position: "def" }}
      />,
    );
    await user.click(save());
    await waitFor(() => expect(save()).toBeEnabled());
    expect(screen.getByLabelText("Nombre", { exact: true })).toHaveValue("Ana");
    expect(screen.getByRole("radio", { name: "8" })).toBeChecked();
  });
});
