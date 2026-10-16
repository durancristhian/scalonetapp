// Keep the version in the URL stable while the generator and style stay pinned.
export const normalizePlayerAvatarName = (name: string): string =>
  Array.from(name.trim()).slice(0, 40).join("") || "Jugador";

export const getPlayerAvatarUrl = (name: string): string =>
  `/api/player-avatars/v1?name=${encodeURIComponent(normalizePlayerAvatarName(name))}`;
