import { DEFAULT_COLOR_PALETTE, getColorPalette } from "./color-palettes.ts";

// Derive surface tones while keeping the five original avatar colors intact.
function blendColors(base: string, accent: string, amount: number): string {
  return (
    "#" +
    [1, 3, 5]
      .map((offset) => {
        const from = parseInt(base.slice(offset, offset + 2), 16);
        const to = parseInt(accent.slice(offset, offset + 2), 16);
        return Math.round(from + (to - from) * amount)
          .toString(16)
          .padStart(2, "0");
      })
      .join("")
  );
}

const synthetic = getColorPalette(DEFAULT_COLOR_PALETTE).colors;
const natural = getColorPalette("natural-olive").colors;
const potrero = getColorPalette("potrero-harvest").colors;

// Each surface owns a complete theme. Edit the original palette in color-palettes
// or the role assignments here to adjust SVG, frame, dividers and name tags.
export const IMAGE_EXPORT_BACKGROUNDS = [
  {
    id: "pasto",
    label: "Césped sintético",
    src: "/images/export-backgrounds/pasto.svg",
    palette: DEFAULT_COLOR_PALETTE,
    colors: {
      base: synthetic[3],
      stripe: synthetic[2],
      patch: synthetic[1],
      grain: synthetic[4],
      texture: synthetic[0],
      frame: synthetic[4],
      divider: synthetic[1],
      marking: blendColors(synthetic[1], synthetic[0], 0.45),
    },
  },
  {
    id: "natural",
    label: "Césped natural",
    src: "/images/export-backgrounds/natural.svg",
    palette: "natural-olive",
    colors: {
      base: natural[0],
      stripe: blendColors(natural[0], natural[2], 0.2),
      patch: blendColors(natural[0], natural[1], 0.5),
      grain: natural[1],
      texture: natural[2],
      frame: natural[1],
      // A lighter olive keeps this edge green rather than sand-colored.
      divider: blendColors(natural[0], natural[2], 0.35),
      marking: blendColors(natural[0], natural[2], 0.55),
    },
  },
  {
    id: "potrero",
    label: "Potrero",
    src: "/images/export-backgrounds/potrero.svg",
    palette: "potrero-harvest",
    colors: {
      base: potrero[3],
      stripe: potrero[1],
      patch: blendColors(potrero[3], potrero[2], 0.45),
      grain: potrero[2],
      texture: potrero[4],
      frame: potrero[2],
      divider: potrero[1],
      marking: blendColors(potrero[1], potrero[4], 0.5),
    },
  },
] as const;

export type ImageExportBackgroundId =
  (typeof IMAGE_EXPORT_BACKGROUNDS)[number]["id"];
