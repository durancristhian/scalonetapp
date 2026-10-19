export const IMAGE_EXPORT_FONTS = [
  { id: "work-sans", label: "Work Sans" },
  { id: "teko", label: "Teko" },
  { id: "barlow-condensed", label: "Barlow Condensed" },
] as const;

// Keep IDs stable for saved browser preferences when labels or assets change.
export const IMAGE_EXPORT_BACKGROUNDS = [
  { id: "dots", label: "Punteado", src: null },
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
  font: (typeof IMAGE_EXPORT_FONTS)[number]["id"];
  background: (typeof IMAGE_EXPORT_BACKGROUNDS)[number]["id"];
  avatarShape: "circle" | "square";
  columns: 1 | 2;
};

export const DEFAULT_IMAGE_EXPORT_OPTIONS: Readonly<ImageExportOptions> = {
  font: "work-sans",
  background: "dots",
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
    if (isImageExportOptions(stored)) return stored;
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
