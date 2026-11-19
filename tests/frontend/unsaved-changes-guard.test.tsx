import { type MouseEvent, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { UnsavedChangesGuard } from "@/app/(authenticated)/partidos/[match-id]/(components)/unsaved-changes-guard";

function Page({ active }: { active: boolean }) {
  const [visited, setVisited] = useState<string[]>([]);
  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented) return;
    event.preventDefault();
    setVisited((current) => [...current, event.currentTarget.pathname]);
  };
  return (
    <>
      <UnsavedChangesGuard active={active} />
      <a href="/destino" onClick={navigate}>
        Partidos
      </a>
      <a href="/about" target="_blank" onClick={navigate}>
        Acerca de
      </a>
      <p>Visitado: {visited.join(", ")}</p>
    </>
  );
}

const leaveWithReload = () =>
  !window.dispatchEvent(new Event("beforeunload", { cancelable: true }));

it("asks before leaving with unsaved teams and continues only when confirmed", async () => {
  const user = userEvent.setup();
  render(<Page active />);
  await user.click(screen.getByRole("link", { name: "Partidos" }));
  const dialog = screen.getByRole("alertdialog", {
    name: "¿Salir sin guardar los equipos?",
  });
  expect(screen.getByText("Visitado:")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Seguir editando" }));
  expect(dialog).not.toBeInTheDocument();
  expect(screen.getByText("Visitado:")).toBeInTheDocument();
  await user.click(screen.getByRole("link", { name: "Partidos" }));
  await user.click(screen.getByRole("button", { name: "Salir sin guardar" }));
  expect(screen.getByText("Visitado: /destino")).toBeInTheDocument();
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(leaveWithReload()).toBe(true);
});

it("lets navigation through without unsaved teams or when opening a new tab", async () => {
  const user = userEvent.setup();
  const view = render(<Page active={false} />);
  await user.click(screen.getByRole("link", { name: "Partidos" }));
  expect(screen.getByText("Visitado: /destino")).toBeInTheDocument();
  expect(leaveWithReload()).toBe(false);
  view.rerender(<Page active />);
  await user.click(screen.getByRole("link", { name: "Acerca de" }));
  expect(screen.getByText("Visitado: /destino, /about")).toBeInTheDocument();
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
});

it("drops a pending navigation when the teams get saved", async () => {
  const user = userEvent.setup();
  const view = render(<Page active />);
  await user.click(screen.getByRole("link", { name: "Partidos" }));
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  view.rerender(<Page active={false} />);
  view.rerender(<Page active />);
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(screen.getByText("Visitado:")).toBeInTheDocument();
});
