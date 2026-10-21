// A roster deletion is persisted independently of any unsaved builder edits.
export function removePlayerFromSavedTeams(serialized: string, playerId: number): string {
  const teams: unknown = JSON.parse(serialized);
  if (!Array.isArray(teams)) throw new Error("Invalid saved teams");
  let changed = false;
  const nextTeams = teams.map(team => {
    if (!team || typeof team !== "object" || !Array.isArray(team.players)) return team;
    const players = team.players.filter((id: unknown) => id !== playerId);
    if (players.length === team.players.length) return team;
    changed = true;
    return { ...team, players };
  });
  return changed ? JSON.stringify(nextTeams) : serialized;
}
