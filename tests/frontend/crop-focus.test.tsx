import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, vi } from "vitest";
import { PlayerAvatarInput } from "@/components/player-avatar-input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

it("returns focus after nested crop and releases it when its parent unmounts", async () => {
  vi.stubGlobal(
    "Worker",
    class {
      onmessage?: (event: { data: { preview: Blob } }) => void;
      postMessage() {
        queueMicrotask(() =>
          this.onmessage?.({
            data: { preview: new Blob(["photo"], { type: "image/jpeg" }) },
          }),
        );
      }
      terminate() {}
    },
  );
  vi.stubGlobal(
    "URL",
    class extends URL {
      static override createObjectURL() {
        return "blob:photo";
      }
      static override revokeObjectURL() {}
    },
  );
  const user = userEvent.setup();
  const view = render(
    <Dialog open>
      <DialogContent>
        <DialogTitle>Parent</DialogTitle>
        <PlayerAvatarInput
          name="Ana"
          onChange={vi.fn()}
          onPreparingChange={vi.fn()}
        />
      </DialogContent>
    </Dialog>,
  );
  const chooser = screen.getByRole("button", { name: "Elegir foto" });
  await user.click(chooser);
  await user.upload(
    view.container.ownerDocument.querySelector<HTMLInputElement>(
      "input[type=file]",
    )!,
    new File(["heic"], "photo.heic", { type: "image/heic" }),
  );
  await screen.findByRole("dialog", { name: "Recortando la foto" });
  await user.tab();
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Recortando la foto" }),
    ).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(chooser).toHaveFocus());
  await user.upload(
    view.container.ownerDocument.querySelector<HTMLInputElement>(
      "input[type=file]",
    )!,
    new File(["heic"], "photo.heic", { type: "image/heic" }),
  );
  await screen.findByRole("dialog", { name: "Recortando la foto" });
  view.rerender(<button>Continue</button>);
  const next = screen.getByRole("button", { name: "Continue" });
  await user.click(next);
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(next).toHaveFocus();
});
