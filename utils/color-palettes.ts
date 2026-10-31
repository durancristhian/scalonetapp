export const COLOR_PALETTES = [
  {
    id: "synthetic-forest",
    label: "Earthy Forest Hues",
    sourceUrl: "https://coolors.co/palette/dad7cd-a3b18a-588157-3a5a40-344e41",
    colors: ["#DAD7CD", "#A3B18A", "#588157", "#3A5A40", "#344E41"],
    roles: ["#3A5A40", "#344E41", "#A3B18A", "#588157", "#DAD7CD"],
  },
  {
    id: "natural-olive",
    label: "Olive Garden Feast",
    sourceUrl: "https://coolors.co/palette/606c38-283618-fefae0-dda15e-bc6c25",
    colors: ["#606C38", "#283618", "#FEFAE0", "#DDA15E", "#BC6C25"],
    roles: ["#606C38", "#283618", "#FEFAE0", "#DDA15E", "#BC6C25"],
  },
  {
    id: "potrero-harvest",
    label: "Autumn Harvest",
    sourceUrl: "https://coolors.co/palette/6f1d1b-bb9457-432818-99582a-ffe6a7",
    colors: ["#6F1D1B", "#BB9457", "#432818", "#99582A", "#FFE6A7"],
    roles: ["#99582A", "#432818", "#BB9457", "#6F1D1B", "#FFE6A7"],
  },
] as const;

export type ColorPaletteId = (typeof COLOR_PALETTES)[number]["id"];
export const DEFAULT_COLOR_PALETTE: ColorPaletteId = "synthetic-forest";
export const ARTWORK_BACKGROUND = "#FFFFFF";

export function isColorPaletteId(value: unknown): value is ColorPaletteId {
  return COLOR_PALETTES.some(({ id }) => id === value);
}

export function getColorPalette(id: ColorPaletteId = DEFAULT_COLOR_PALETTE) {
  return COLOR_PALETTES.find((palette) => palette.id === id)!;
}

export function getArtworkStyle(id: ColorPaletteId = DEFAULT_COLOR_PALETTE) {
  const { roles } = getColorPalette(id);
  return {
    backgroundColor: ARTWORK_BACKGROUND,
    "--pattern-primary": roles[0],
    "--pattern-secondary": roles[1],
  };
}

export function parseColorPalette(
  params: URLSearchParams,
): ColorPaletteId | null {
  const values = params.getAll("palette");
  if (!values.length) return DEFAULT_COLOR_PALETTE;
  return values.length === 1 && isColorPaletteId(values[0]) ? values[0] : null;
}
