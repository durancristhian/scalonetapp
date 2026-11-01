import { StrictMode, type ComponentProps } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "@/components/ui/dialog";
import ExportEditor from "@/app/(authenticated)/partidos/[match-id]/(components)/export-editor";
import { TeamExport } from "@/components/team-export/team-export";
import {
  DEFAULT_IMAGE_EXPORT_OPTIONS,
  IMAGE_EXPORT_STORAGE_KEY,
} from "@/utils/image-export-options";
import { player, teams } from "../fixtures";

vi.mock("@/utils/fonts", () => ({ workSans: { className: "test-font" } }));
const roster = [
  player(1, { name: "Ana", position: "goa" }),
  player(2, { name: "Beto" }),
];
const lineup = teams([roster[0]], [roster[1]]);

describe("export content", () => {
  it("should render user text literally and assigned players when teams are provided", () => {
    render(
      <TeamExport
        name="<b>Final</b>"
        teams={lineup}
        options={{ ...DEFAULT_IMAGE_EXPORT_OPTIONS, avatarShape: "none" }}
      />,
    );
    expect(screen.getByText("<b>Final</b>")).toBeVisible();
    expect(screen.getByText("Ana")).toBeVisible();
    expect(screen.getByText("Beto")).toBeVisible();
    expect(screen.getByRole("img", { name: "Arquero" })).toBeVisible();
  });
  it("should remove stale role badges when team membership changes", () => {
    const roles = {
      a: { playerIds: [1], assignments: { captain: 1, goalkeeper: 1 } },
      b: { playerIds: [2], assignments: { captain: null, goalkeeper: null } },
    };
    const options = {
      ...DEFAULT_IMAGE_EXPORT_OPTIONS,
      avatarShape: "none" as const,
    };
    const view = render(
      <TeamExport
        name="Final"
        teams={lineup}
        options={options}
        playerRoles={roles}
      />,
    );
    expect(screen.getByRole("img", { name: "Capitán" })).toBeVisible();
    view.rerender(
      <TeamExport
        name="Final"
        teams={teams([roster[0], roster[1]])}
        options={options}
        playerRoles={roles}
      />,
    );
    expect(
      screen.queryByRole("img", { name: "Capitán" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "Arquero" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeVisible();
    expect(screen.getByText("Beto")).toBeVisible();
  });
  it.each([
    { value: teams() },
    { value: teams(roster) },
    { value: teams([], roster) },
  ])(
    "should render both team names when assignments are empty or uneven %#",
    ({ value }) => {
      render(
        <TeamExport
          name="Final"
          teams={value}
          options={{ ...DEFAULT_IMAGE_EXPORT_OPTIONS, avatarShape: "none" }}
        />,
      );
      expect(screen.getAllByText("Azules").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Rojos").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Final")).toHaveLength(1);
    },
  );
});

describe("export editor", () => {
  it("should preserve the editor and allow retry when download fails", async () => {
    const exportTeams = vi
      .fn()
      .mockResolvedValueOnce("No se pudo descargar")
      .mockResolvedValue(null);
    const user = userEvent.setup();
    render(
      <StrictMode>
        <Dialog open>
          <ExportEditor
            matchId={1}
            name="Final"
            teams={lineup}
            disabled={false}
            processing={false}
            onExport={exportTeams}
          />
        </Dialog>
      </StrictMode>,
    );
    await user.click(screen.getByRole("button", { name: "Descargar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo descargar",
    );
    expect(screen.getByRole("dialog")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Descargar" }));
    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
    );
    expect(exportTeams).toHaveBeenCalledTimes(2);
    expect(exportTeams.mock.calls[0][0]).toEqual(DEFAULT_IMAGE_EXPORT_OPTIONS);
    expect(exportTeams.mock.calls[0][1].a.assignments.goalkeeper).toBe(1);
  });
  it("should disable download and option changes when processing", () => {
    render(
      <Dialog open>
        <ExportEditor
          matchId={1}
          name="Final"
          teams={lineup}
          disabled={false}
          processing
          onExport={vi.fn()}
        />
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: "Descargando…" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Restablecer valores" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeDisabled();
  });
  it("should restore defaults and persist changes when reset is clicked", async () => {
    localStorage.setItem(
      IMAGE_EXPORT_STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_IMAGE_EXPORT_OPTIONS, weather: "snow" }),
    );
    const user = userEvent.setup();
    render(
      <Dialog open>
        <ExportEditor
          matchId={1}
          name="Final"
          teams={lineup}
          disabled={false}
          processing={false}
          onExport={vi.fn()}
        />
      </Dialog>,
    );
    const weather = screen.getByRole("combobox", { name: "Clima" });
    expect(within(weather).getByText("Nieve")).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Restablecer valores" }),
    );
    expect(within(weather).getByText("Despejado")).toBeVisible();
    expect(JSON.parse(localStorage.getItem(IMAGE_EXPORT_STORAGE_KEY)!)).toEqual(
      DEFAULT_IMAGE_EXPORT_OPTIONS,
    );
  });
});

describe("seeded captain defaults", () => {
  const seeded = teams([player(1), player(2)], [player(3), player(4)]).map(
    (team) => ({ ...team, defaultCaptainId: team.players[0].id }),
  );

  it("uses the saved seed captains when opening export for the first time", async () => {
    const user = userEvent.setup();
    const onExport = vi
      .fn<ComponentProps<typeof ExportEditor>["onExport"]>()
      .mockResolvedValue(null);
    render(
      <Dialog open>
        <ExportEditor
          matchId={77}
          name="Argentina Celeste vs. Argentina Blanca"
          teams={seeded}
          disabled={false}
          processing={false}
          onExport={onExport}
        />
      </Dialog>,
    );
    await user.click(screen.getByRole("button", { name: "Descargar" }));
    expect(onExport.mock.calls[0][1].a.assignments.captain).toBe(1);
    expect(onExport.mock.calls[0][1].b.assignments.captain).toBe(3);
  });

  it("keeps browser choices ahead of the seed defaults", async () => {
    localStorage.setItem(
      "scaloneta:export-player-roles:v1:77",
      JSON.stringify({
        a: {
          playerIds: [1, 2],
          assignments: { captain: null, goalkeeper: null },
        },
        b: { playerIds: [3, 4], assignments: { captain: 4, goalkeeper: null } },
      }),
    );
    const user = userEvent.setup();
    const onExport = vi
      .fn<ComponentProps<typeof ExportEditor>["onExport"]>()
      .mockResolvedValue(null);
    render(
      <Dialog open>
        <ExportEditor
          matchId={77}
          name="Seed"
          teams={seeded}
          disabled={false}
          processing={false}
          onExport={onExport}
        />
      </Dialog>,
    );
    await user.click(screen.getByRole("button", { name: "Descargar" }));
    expect(onExport.mock.calls[0][1].a.assignments.captain).toBeNull();
    expect(onExport.mock.calls[0][1].b.assignments.captain).toBe(4);
  });
});
