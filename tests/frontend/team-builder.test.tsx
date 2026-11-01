import { StrictMode, type PropsWithChildren } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTeamsBuilderState } from "@/app/(authenticated)/partidos/[match-id]/(hooks)/use-team-builder-state";
import { getTeamsToSave } from "@/utils/get-teams-to-save";
import { haveTeamsChanged } from "@/utils/have-teams-changed";
import { match, player, teams } from "../fixtures";

const strict = ({ children }: PropsWithChildren) => (
  <StrictMode>{children}</StrictMode>
);
const roster = [
  player(1, { name: "Ana" }),
  player(2, { name: "Beto", level: 8 }),
  player(3, { name: "Caro", position: "goa" }),
];
const saved = getTeamsToSave(teams([roster[0]], [roster[1]]));
const dirty = (state: ReturnType<typeof useTeamsBuilderState>) =>
  haveTeamsChanged(getTeamsToSave(state.teams), state.comparisonTeams);

describe("team builder", () => {
  it.each([0, 3, 100])(
    "should start with two clean empty teams and free players when a new roster has %s players",
    (count) => {
      const players = Array.from({ length: count }, (_, index) =>
        player(index + 1),
      );
      const value = match(players);
      const { result } = renderHook(() => useTeamsBuilderState(value), {
        wrapper: strict,
      });
      expect(result.current.teams).toHaveLength(2);
      expect(result.current.teams.flatMap((team) => team.players)).toEqual([]);
      expect(result.current.unselectedPlayers).toEqual(players);
      expect(dirty(result.current)).toBe(false);
    },
  );
  it("should move selected players without duplication when assigning between teams", () => {
    const value = match(roster, saved);
    const { result } = renderHook(() => useTeamsBuilderState(value), {
      wrapper: strict,
    });
    act(() => {
      result.current.togglePlayer(1);
      result.current.togglePlayer(3);
    });
    act(() => result.current.assignSelectionToTeam("b"));
    expect(result.current.teams[0].players).toEqual([]);
    expect(result.current.teams[1].players.map((p) => p.id)).toEqual([2, 1, 3]);
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.unselectedPlayers).toEqual([]);
    expect(dirty(result.current)).toBe(true);
    act(() => result.current.togglePlayer(1));
    act(() => result.current.assignSelectionToTeam("b"));
    expect(result.current.teams[1].players.map((p) => p.id)).toEqual([2, 1, 3]);
  });
  it("should restore a clean draft when a player is moved back", () => {
    const value = match(roster, saved);
    const { result } = renderHook(() => useTeamsBuilderState(value));
    act(() => result.current.togglePlayer(1));
    act(() => result.current.assignSelectionToTeam("b"));
    act(() => result.current.togglePlayer(1));
    act(() => result.current.assignSelectionToTeam("a"));
    expect(dirty(result.current)).toBe(false);
  });
  it("should return a removed player to the free roster when unassigned", () => {
    const value = match(roster, saved);
    const { result } = renderHook(() => useTeamsBuilderState(value));
    act(() => result.current.removePlayerFromTeam(1, "a"));
    expect(result.current.unselectedPlayers.map((p) => p.id)).toEqual([1, 3]);
    expect(result.current.teams[0].players).toEqual([]);
  });
  it("should preserve exactly two teams when adding or deleting is requested", () => {
    const value = match(roster, saved);
    const { result } = renderHook(() => useTeamsBuilderState(value));
    act(() => {
      result.current.createNewTeam();
      result.current.removeTeam("a");
    });
    expect(result.current.teams.map((team) => team.id)).toEqual(["a", "b"]);
  });
  it.each(["balanceTeams", "randomizeTeams"] as const)(
    "should include every player once when %s rebuilds an uneven roster",
    (action) => {
      const value = match(roster, saved);
      const { result } = renderHook(() => useTeamsBuilderState(value));
      act(() => result.current[action]());
      expect(
        result.current.teams.map((team) => team.players.length).sort(),
      ).toEqual([1, 2]);
      expect(
        result.current.teams
          .flatMap((team) => team.players.map((p) => p.id))
          .sort(),
      ).toEqual([1, 2, 3]);
      expect(result.current.unselectedPlayers).toEqual([]);
      expect(value.players).toEqual(roster);
    },
  );
  it("should update player details and remove deleted selections when the roster refreshes", () => {
    const value = match(roster, saved);
    const { result, rerender } = renderHook(
      ({ value }) => useTeamsBuilderState(value),
      { initialProps: { value }, wrapper: strict },
    );
    act(() => result.current.togglePlayer(2));
    rerender({
      value: match(
        [player(1, { name: "Ana nueva" }), roster[2]],
        getTeamsToSave(teams([player(1)], [])),
      ),
    });
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.teams[0].players[0].name).toBe("Ana nueva");
    expect(result.current.teams[1].players).toEqual([]);
  });
  it("should follow a remote save when the local draft is clean", () => {
    const value = match(roster, saved);
    const { result, rerender } = renderHook(
      ({ value }) => useTeamsBuilderState(value),
      { initialProps: { value } },
    );
    const remote = getTeamsToSave(teams([], [roster[0], roster[1]]));
    rerender({ value: match(roster, remote) });
    expect(result.current.baseTeams).toBe(remote);
    expect(result.current.teams[0].players).toEqual([]);
    expect(dirty(result.current)).toBe(false);
  });
  it("should preserve a local draft and its old baseline when another tab saves", () => {
    const value = match(roster, saved);
    const { result, rerender } = renderHook(
      ({ value }) => useTeamsBuilderState(value),
      { initialProps: { value } },
    );
    act(() => result.current.updateTeamName("a", "Mi borrador"));
    rerender({
      value: match(roster, getTeamsToSave(teams([], [roster[0], roster[1]]))),
    });
    expect(result.current.teams[0].name).toBe("Mi borrador");
    expect(result.current.baseTeams).toBe(saved);
    expect(dirty(result.current)).toBe(true);
  });
  it("should discard the previous draft when a different match opens", () => {
    const value = match(roster, saved);
    const { result, rerender } = renderHook(
      ({ value }) => useTeamsBuilderState(value),
      { initialProps: { value } },
    );
    act(() => result.current.updateTeamName("a", "Borrador"));
    rerender({ value: { ...match([], "[]"), id: 2 } });
    expect(result.current.teams.map((team) => team.name)).toEqual([
      "Equipo 1",
      "Equipo 2",
    ]);
    expect(dirty(result.current)).toBe(false);
  });
  it.each(["invalid", "null", '[{"id":"a"}]'])(
    "should recover editable teams when saved assignments are %s",
    (invalid) => {
      const value = match(roster, invalid);
      const { result } = renderHook(() => useTeamsBuilderState(value), {
        wrapper: strict,
      });
      expect(result.current.teams).toHaveLength(2);
      expect(result.current.unselectedPlayers).toHaveLength(3);
      expect(dirty(result.current)).toBe(true);
    },
  );
});
