import { ARTWORK_BACKGROUND, DEFAULT_COLOR_PALETTE, getColorPalette, type ColorPaletteId } from "./color-palettes.ts";
import { IMAGE_EXPORT_BACKGROUNDS, type ImageExportOptions } from "./image-export-options.ts";

export function getImageExportBackgroundUrl(
  background: ImageExportOptions["background"],
  palette: ColorPaletteId = DEFAULT_COLOR_PALETTE,
): string {
  return `/api/export-backgrounds/v1?${new URLSearchParams({ background, palette })}`;
}

export function getImageExportBackgroundSource(background: string) {
  return IMAGE_EXPORT_BACKGROUNDS.find(({ id }) => id === background)?.src;
}

// Only called with our own SVG assets and a validated palette ID.
export function colorizeExportBackground(svg: string, palette: ColorPaletteId): string {
  const { roles } = getColorPalette(palette);
  const colors = {
    background: ARTWORK_BACKGROUND,
    primary: roles[0],
    secondary: roles[1],
    tertiary: roles[2],
  };
  for (const [role, color] of Object.entries(colors)) {
    svg = svg
      .replace(new RegExp(`--${role}:#[0-9a-f]{6}`, "gi"), `--${role}:${color}`)
      .replace(
        new RegExp(`fill="#[0-9a-f]{6}"(?=\\s+style="fill:var\\(--${role}\\)")`, "gi"),
        `fill="${color}"`,
      );
  }
  return svg;
}
