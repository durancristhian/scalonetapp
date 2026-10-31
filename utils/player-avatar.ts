import {
  DEFAULT_COLOR_PALETTE,
  type ColorPaletteId,
} from "./color-palettes.ts";

export const normalizePlayerAvatarName = (name: string): string =>
  Array.from(name.trim()).slice(0, 40).join("") || "Jugador";

export const getPlayerAvatarUrl = (
  name: string,
  palette: ColorPaletteId = DEFAULT_COLOR_PALETTE,
): string =>
  `/api/player-avatars/v4?${new URLSearchParams({ name: normalizePlayerAvatarName(name), palette })}`;
