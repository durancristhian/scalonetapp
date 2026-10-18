type ExportMatch = {
  name: string;
  teams: string;
  players: { id: number; name: string; avatar: string | null }[];
};

// Compare exactly the persisted content used by the image renderer.
export const getTeamExportSnapshot = (match: ExportMatch): string => JSON.stringify({
  name: match.name,
  teams: match.teams,
  players: match.players.map(({ id, name, avatar }) => ({ id, name, avatar }))
    .sort((a, b) => a.id - b.id),
});
