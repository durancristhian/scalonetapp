import { useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ActionConfirmationDialog } from "@/components/action-confirmation-dialog";
import { deferred } from "../fixtures";

const labels = {
  title: "¿Confirmar la acción?",
  description: "Esta acción modifica el partido.",
  confirmLabel: "Confirmar",
  pendingLabel: "Procesando...",
};

describe("ActionConfirmationDialog", () => {
  it.each(["cancel", "escape"])(
    "closes without confirming when dismissed with %s",
    async (method) => {
      const onClose = vi.fn();
      const onConfirm = vi.fn();
      const user = userEvent.setup();
      render(
        <ActionConfirmationDialog
          {...labels}
          onClose={onClose}
          onConfirm={onConfirm}
        />,
      );
      if (method === "cancel")
        await user.click(screen.getByRole("button", { name: "Cancelar" }));
      else await user.keyboard("{Escape}");
      expect(onClose).toHaveBeenCalledOnce();
      expect(onConfirm).not.toHaveBeenCalled();
    },
  );

  it("locks confirmation immediately and blocks cancellation and Escape while pending", async () => {
    const pending = deferred<void>();
    const onConfirm = vi.fn(() => pending.promise);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <ActionConfirmationDialog
        {...labels}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );
    const button = screen.getByRole("button", { name: "Confirmar" });
    act(() => {
      button.click();
      button.click();
    });
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("button", { name: "Procesando..." }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeVisible();
    await act(async () => pending.resolve());
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeEnabled();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("keeps the dialog open and releases its lock when confirmation rejects", async () => {
    const onConfirm = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(Error("operation failed"))
      .mockResolvedValue(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <ActionConfirmationDialog
        {...labels}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Confirmar" })).toBeEnabled(),
    );
    expect(screen.getByRole("alertdialog")).toBeVisible();
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });

  it("lets the caller close after success and forwards close autofocus", async () => {
    const operation = deferred<void>();
    const focus = vi.fn();
    function Confirmation() {
      const [open, setOpen] = useState(true);
      return open ? (
        <ActionConfirmationDialog
          {...labels}
          onClose={() => setOpen(false)}
          onCloseAutoFocus={focus}
          onConfirm={async () => {
            await operation.promise;
            setOpen(false);
          }}
        />
      ) : (
        <p>Completado</p>
      );
    }
    const user = userEvent.setup();
    render(<Confirmation />);
    await user.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(screen.getByRole("alertdialog")).toBeVisible();
    await act(async () => operation.resolve());
    expect(await screen.findByText("Completado")).toBeVisible();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    await waitFor(() => expect(focus).toHaveBeenCalledOnce());
  });
});
