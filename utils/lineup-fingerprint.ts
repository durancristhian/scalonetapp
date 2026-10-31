import type { Team } from "@/types/team";

// Both sides hash the exact lineup shown in the preview, including player edits.
export async function lineupFingerprint(
  name: string,
  teams: Team[],
): Promise<string> {
  const snapshot = JSON.stringify({
    name,
    teams: teams.map((team) => ({
      id: team.id,
      name: team.name.trim(),
      players: team.players.map((player) => ({
        id: player.id,
        name: player.name,
        level: player.level,
        position: player.position,
        avatar: player.avatar ?? "",
      })),
    })),
  });
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(snapshot),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
