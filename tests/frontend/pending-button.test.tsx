import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PendingButton } from "@/components/pending-button";

describe("PendingButton", () => {
  it("shows the pending label and busy state until the operation finishes", () => {
    const { rerender } = render(
      <PendingButton pending={false} pendingLabel="Guardando...">
        Guardar
      </PendingButton>,
    );
    expect(screen.getByRole("button", { name: "Guardar" })).toBeEnabled();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "false");

    rerender(
      <PendingButton pending pendingLabel="Guardando...">
        Guardar
      </PendingButton>,
    );
    const button = screen.getByRole("button", { name: "Guardando..." });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");

    rerender(
      <PendingButton pending={false} pendingLabel="Guardando...">
        Guardar
      </PendingButton>,
    );
    expect(screen.getByRole("button", { name: "Guardar" })).toBeEnabled();
  });

  it("keeps the caller's disabled condition after pending ends", () => {
    const { rerender } = render(
      <PendingButton pending disabled pendingLabel="Guardando...">
        Guardar
      </PendingButton>,
    );
    rerender(
      <PendingButton pending={false} disabled pendingLabel="Guardando...">
        Guardar
      </PendingButton>,
    );
    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
  });

  it("blocks repeated pointer and keyboard activation while pending", async () => {
    const action = vi.fn();
    function Action() {
      const [pending, setPending] = useState(false);
      return (
        <PendingButton
          type="button"
          pending={pending}
          pendingLabel="Guardando..."
          onClick={() => {
            action();
            setPending(true);
          }}
        >
          Guardar
        </PendingButton>
      );
    }
    const user = userEvent.setup();
    render(<Action />);
    await user.dblClick(screen.getByRole("button", { name: "Guardar" }));
    await user.click(screen.getByRole("button", { name: "Guardando..." }));
    await user.keyboard("{Enter} ");
    expect(action).toHaveBeenCalledOnce();
  });

  it("preserves submit behavior and forwards its button reference", async () => {
    const submit = vi.fn((event) => event.preventDefault());
    const ref = createRef<HTMLButtonElement>();
    const user = userEvent.setup();
    render(
      <form onSubmit={submit}>
        <PendingButton
          ref={ref}
          type="submit"
          pending={false}
          pendingLabel="Enviando..."
          name="action"
          value="send"
        >
          Enviar
        </PendingButton>
      </form>,
    );
    const button = screen.getByRole("button", { name: "Enviar" });
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute("name", "action");
    expect(button).toHaveAttribute("value", "send");
    await user.click(button);
    expect(submit).toHaveBeenCalledOnce();
  });
});
