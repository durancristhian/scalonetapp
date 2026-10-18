export const IMAGE_EXPORT_STYLES = [
  { id: "classic", label: "Clásico", preview: { src: "/images/export-styles/classic.png", width: 2560, height: 830 } },
  { id: "sporty", label: "Deportivo", preview: { src: "/images/export-styles/sporty.png", width: 2560, height: 788 } },
] as const;

export type ImageExportStyle = (typeof IMAGE_EXPORT_STYLES)[number]["id"];
export const DEFAULT_IMAGE_EXPORT_STYLE: ImageExportStyle = "classic";

export function isImageExportStyle(value: string): value is ImageExportStyle {
  return IMAGE_EXPORT_STYLES.some((style) => style.id === value);
}

export function parseImageExportStyle(params: URLSearchParams): ImageExportStyle | null {
  const values = params.getAll("style");
  if (values.length === 0) return DEFAULT_IMAGE_EXPORT_STYLE;
  return values.length === 1 && isImageExportStyle(values[0]) ? values[0] : null;
}
