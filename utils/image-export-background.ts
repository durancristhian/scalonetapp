import { ARTWORK_BACKGROUND, DEFAULT_COLOR_PALETTE, getColorPalette, type ColorPaletteId } from "./color-palettes.ts";
import { IMAGE_EXPORT_BACKGROUNDS, type ImageExportOptions } from "./image-export-options.ts";

type BackgroundFraming = {
  scale: number;
  x: number;
  y: number;
  rotation: number;
};

// Curated crops for each illustration. Scale multiplies cover
// sizing; x/y locate the artwork center within the available area, in percent.
export const IMAGE_EXPORT_BACKGROUND_FRAMING = {
  encuentro: { scale: 2.8, x: 6, y: 30, rotation: -32 },
  aliento: { scale: 2.3, x: 68, y: 18, rotation: -24 },
  cruce: { scale: 2.55, x: 95, y: 28, rotation: 32 },
  nexo: { scale: 2.1, x: 30, y: 67, rotation: -24 },
  enlace: { scale: 2.7, x: 78, y: 18, rotation: -42 },
  ronda: { scale: 2.05, x: 35, y: 32, rotation: 18 },
  aura: { scale: 1.75, x: 72, y: 30, rotation: 12 },
  cumbre: { scale: 1.75, x: 45, y: 72, rotation: 0 },
  ascenso: { scale: 1.75, x: 72, y: 50, rotation: -12 },
  emblema: { scale: 2.1, x: 20, y: 28, rotation: 22 },
} as const satisfies Record<ImageExportOptions["background"], BackgroundFraming>;

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
    quaternary: roles[3],
  };
  for (const [role, color] of Object.entries(colors)) {
    svg = svg
      .replace(new RegExp(`--${role}:#[0-9a-f]{6}`, "gi"), `--${role}:${color}`)
      .replace(
        new RegExp(`(fill|stroke)="#[0-9a-f]{6}"(?=\\s+style="\\1:var\\(--${role}\\)")`, "gi"),
        `$1="${color}"`,
      );
  }
  return svg;
}
