import {
  IMAGE_EXPORT_BACKGROUNDS,
  type ImageExportBackgroundId,
} from "./image-export-backgrounds.ts";

export const IMAGE_EXPORT_AVATARS = [
  { id: "square", label: "Cuadradas" },
  { id: "circle", label: "Circulares" },
  { id: "none", label: "Sin imagen" },
] as const;

export const IMAGE_EXPORT_WEATHERS = [
  { id: "none", label: "Despejado" },
  { id: "rain", label: "Lluvia" },
  { id: "snow", label: "Nieve" },
] as const;

export type ImageExportOptions = {
  background: ImageExportBackgroundId;
  weather: (typeof IMAGE_EXPORT_WEATHERS)[number]["id"];
  avatarShape: (typeof IMAGE_EXPORT_AVATARS)[number]["id"];
  alignment: "left" | "center";
  playerOrder: "alphabetical" | "position";
};

export const DEFAULT_IMAGE_EXPORT_OPTIONS: Readonly<ImageExportOptions> = {
  background: "pasto",
  weather: "none",
  avatarShape: "square",
  alignment: "left",
  playerOrder: "alphabetical",
};

export const IMAGE_EXPORT_WIDTH = 1280;
export const IMAGE_EXPORT_STORAGE_KEY = "scaloneta:image-export:v1";

export function isImageExportOptions(
  value: unknown,
): value is ImageExportOptions {
  if (!value || typeof value !== "object") return false;
  const options = value as Record<string, unknown>;
  return (
    IMAGE_EXPORT_BACKGROUNDS.some(({ id }) => id === options.background) &&
    IMAGE_EXPORT_WEATHERS.some(({ id }) => id === options.weather) &&
    IMAGE_EXPORT_AVATARS.some(({ id }) => id === options.avatarShape) &&
    (options.alignment === "left" || options.alignment === "center") &&
    (options.playerOrder === "alphabetical" ||
      options.playerOrder === "position")
  );
}

export function parseImageExportOptions(
  params: URLSearchParams,
): ImageExportOptions | null {
  const values: Record<string, unknown> = { ...DEFAULT_IMAGE_EXPORT_OPTIONS };
  for (const key of params.keys()) {
    if (
      !Object.hasOwn(DEFAULT_IMAGE_EXPORT_OPTIONS, key) ||
      params.getAll(key).length !== 1
    )
      return null;
    values[key] = params.get(key);
  }
  return isImageExportOptions(values) ? values : null;
}

export function imageExportSearchParams(
  options: ImageExportOptions,
): URLSearchParams {
  return new URLSearchParams({
    background: options.background,
    weather: options.weather,
    avatarShape: options.avatarShape,
    alignment: options.alignment,
    playerOrder: options.playerOrder,
  });
}

export function readImageExportOptions(): ImageExportOptions {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(IMAGE_EXPORT_STORAGE_KEY) ?? "null",
    );
    if (stored && typeof stored === "object") {
      const options = { playerOrder: "alphabetical", ...stored };
      if (isImageExportOptions(options)) return options;
    }
  } catch {}
  return { ...DEFAULT_IMAGE_EXPORT_OPTIONS };
}

export function storeImageExportOptions(options: ImageExportOptions): void {
  try {
    localStorage.setItem(IMAGE_EXPORT_STORAGE_KEY, JSON.stringify(options));
  } catch {}
}
