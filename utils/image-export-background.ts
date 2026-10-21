import { type CSSProperties } from "react";
import { IMAGE_EXPORT_BACKGROUNDS, type ImageExportBackgroundId } from "./image-export-backgrounds.ts";
import { type ImageExportOptions } from "./image-export-options.ts";

export const IMAGE_EXPORT_WEATHER_URLS = {
  rain: "/images/export-backgrounds/rain.svg",
  snow: "/images/export-backgrounds/snow.svg",
} as const;

export function getImageExportWeatherUrl(weather: ImageExportOptions["weather"]): string | null {
  return weather === "none" ? null : IMAGE_EXPORT_WEATHER_URLS[weather];
}

export function getImageExportBackground(background: string) {
  return IMAGE_EXPORT_BACKGROUNDS.find(({ id }) => id === background);
}

export function getImageExportBackgroundUrl(background: ImageExportBackgroundId): string {
  return `/api/export-backgrounds/v1?${new URLSearchParams({ background })}`;
}

export function getImageExportBackgroundUrls(
  { background, weather }: Pick<ImageExportOptions, "background" | "weather">,
): string[] {
  const overlay = getImageExportWeatherUrl(weather);
  return [getImageExportBackgroundUrl(background), ...(overlay ? [overlay] : [])];
}

export function getImageExportBackgroundStyle(background: ImageExportBackgroundId): CSSProperties {
  const { colors } = getImageExportBackground(background)!;
  return {
    "--export-frame-color": colors.frame,
    "--export-divider-color": colors.divider,
    "--export-surface-color": colors.base,
    "--export-marking-color": colors.marking,
  } as CSSProperties;
}

// External SVGs cannot inherit the page's CSS variables. Set their own variables
// and literal fallbacks from the same surface colors used by the export frame.
export function colorizeExportBackground(svg: string, background: ImageExportBackgroundId): string {
  const { colors } = getImageExportBackground(background)!;
  for (const [role, color] of Object.entries(colors)) {
    svg = svg
      .replace(new RegExp(`--surface-${role}:#[0-9a-f]{6}`, "gi"), `--surface-${role}:${color}`)
      .replace(
        new RegExp(`(fill|stroke)="#[0-9a-f]{6}"(?=\\s+style="\\1:var\\(--surface-${role}\\)")`, "gi"),
        `$1="${color}"`,
      );
  }
  return svg;
}
