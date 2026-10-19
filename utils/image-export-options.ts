import { DEFAULT_COLOR_PALETTE, isColorPaletteId, type ColorPaletteId } from "./color-palettes.ts";

export const IMAGE_EXPORT_FONTS = [
  { id: "work-sans", label: "Work Sans" },
  { id: "exo-2", label: "Exo 2" },
  { id: "saira", label: "Saira" },
] as const;

// Stable IDs for the approved poster collection. The editor sorts labels separately.
export const IMAGE_EXPORT_BACKGROUNDS = [
  { id: "encuentro", label: "Encuentro", src: "/images/export-backgrounds/encuentro.svg" },
  { id: "aliento", label: "Aliento", src: "/images/export-backgrounds/aliento.svg" },
  { id: "cruce", label: "Cruce", src: "/images/export-backgrounds/cruce.svg" },
  { id: "nexo", label: "Nexo", src: "/images/export-backgrounds/nexo.svg" },
  { id: "enlace", label: "Enlace", src: "/images/export-backgrounds/enlace.svg" },
  { id: "ronda", label: "Ronda", src: "/images/export-backgrounds/ronda.svg" },
  { id: "aura", label: "Aura", src: "/images/export-backgrounds/aura.svg" },
  { id: "cumbre", label: "Cumbre", src: "/images/export-backgrounds/cumbre.svg" },
  { id: "ascenso", label: "Ascenso", src: "/images/export-backgrounds/ascenso.svg" },
  { id: "emblema", label: "Emblema", src: "/images/export-backgrounds/emblema.svg" },
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
  background: "encuentro",
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

// Preserve other settings when replacing a background from the previous collection.
// Also accepts old download query strings, without adding retired designs to the picker.
function normalizeImageExportOptions(value: unknown): ImageExportOptions | null {
  if (isImageExportOptions(value)) return value;
  if (!value || typeof value !== "object") return null;
  const options = value as Record<string, unknown>;
  if (!["germany", "portugal", "croatia", "belgium"].some((id) => id === options.background)) {
    return null;
  }
  const migrated = { ...options, background: DEFAULT_IMAGE_EXPORT_OPTIONS.background };
  return isImageExportOptions(migrated) ? migrated : null;
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
  return normalizeImageExportOptions(values);
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
    const options = normalizeImageExportOptions(stored);
    if (options) return options;
  } catch {
    // Storage may be unavailable or contain invalid preferences.
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
