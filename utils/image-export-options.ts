import { DEFAULT_COLOR_PALETTE, isColorPaletteId, type ColorPaletteId } from "./color-palettes.ts";

export const IMAGE_EXPORT_FONTS = [
  { id: "work-sans", label: "Work Sans" },
  { id: "exo-2", label: "Exo 2" },
  { id: "saira", label: "Saira" },
] as const;

// Keep IDs stable for saved browser preferences when labels or assets change.
export const IMAGE_EXPORT_BACKGROUNDS = [
  {
    id: "germany",
    label: "Impulso",
    src: "/images/export-backgrounds/impulso.svg",
  },
  {
    id: "portugal",
    label: "Mosaico",
    src: "/images/export-backgrounds/mosaico.svg",
  },
  {
    id: "croatia",
    label: "Trama",
    src: "/images/export-backgrounds/trama.svg",
  },
  {
    id: "belgium",
    label: "Bloques",
    src: "/images/export-backgrounds/bloques.svg",
  },
] as const;

export type ImageExportOptions = {
  palette: ColorPaletteId;
  font: (typeof IMAGE_EXPORT_FONTS)[number]["id"];
  background: (typeof IMAGE_EXPORT_BACKGROUNDS)[number]["id"];
  avatarShape: "circle" | "square";
  columns: 1 | 2;
};

export const DEFAULT_IMAGE_EXPORT_OPTIONS: Readonly<ImageExportOptions> = {
  palette: DEFAULT_COLOR_PALETTE,
  font: "work-sans",
  background: "germany",
  avatarShape: "circle",
  columns: 1,
};

export const IMAGE_EXPORT_WIDTH = 1280;
export const IMAGE_EXPORT_STORAGE_KEY = "scaloneta:image-export:v1";

export function isImageExportOptions(
  value: unknown,
): value is ImageExportOptions {
  if (!value || typeof value !== "object") return false;
  const options = value as Record<string, unknown>;
  return (
    isColorPaletteId(options.palette) &&
    IMAGE_EXPORT_FONTS.some(({ id }) => id === options.font) &&
    IMAGE_EXPORT_BACKGROUNDS.some(({ id }) => id === options.background) &&
    (options.avatarShape === "circle" || options.avatarShape === "square") &&
    (options.columns === 1 || options.columns === 2)
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
    values[key] = key === "columns" ? Number(params.get(key)) : params.get(key);
  }
  return isImageExportOptions(values) ? values : null;
}

export function imageExportSearchParams(
  options: ImageExportOptions,
): URLSearchParams {
  return new URLSearchParams({
    palette: options.palette,
    font: options.font,
    background: options.background,
    avatarShape: options.avatarShape,
    columns: String(options.columns),
  });
}

export function readImageExportOptions(): ImageExportOptions {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(IMAGE_EXPORT_STORAGE_KEY) ?? "null",
    );
    // Preserve existing choices while migrating retired styles and pre-palette preferences.
    if (stored && typeof stored === "object" && !Array.isArray(stored)) {
      const options = {
        ...stored,
        palette: "palette" in stored ? stored.palette : DEFAULT_COLOR_PALETTE,
        font:
          "font" in stored
            ? stored.font === "teko" ? "exo-2"
              : stored.font === "barlow-condensed" ? "saira" : stored.font
            : undefined,
        background:
          "background" in stored && stored.background === "dots"
            ? DEFAULT_IMAGE_EXPORT_OPTIONS.background
            : "background" in stored ? stored.background : undefined,
      };
      if (isImageExportOptions(options)) return options;
    }
  } catch {
    // Storage may be unavailable or contain preferences from an older version.
  }
  return { ...DEFAULT_IMAGE_EXPORT_OPTIONS };
}

export function storeImageExportOptions(options: ImageExportOptions): void {
  try {
    localStorage.setItem(IMAGE_EXPORT_STORAGE_KEY, JSON.stringify(options));
  } catch {
    // The editor still works when this browser cannot persist preferences.
  }
}
