import { DEFAULT_COLOR_PALETTE, type ColorPaletteId } from "./color-palettes.ts";

export const normalizePlayerAvatarName = (name: string): string =>
  Array.from(name.trim()).slice(0, 40).join("") || "Jugador";

// Bump the URL version when rendering options change; avatar responses are immutable.
export const getPlayerAvatarUrl = (
  name: string,
  palette: ColorPaletteId = DEFAULT_COLOR_PALETTE,
): string =>
  `/api/player-avatars/v4?${new URLSearchParams({ name: normalizePlayerAvatarName(name), palette })}`;
