import { DEFAULT_IMAGE_EXPORT_STYLE, type ImageExportStyle } from "@/utils/image-export-style";

export const fetchTeamExport = async (matchId: number, style: ImageExportStyle = DEFAULT_IMAGE_EXPORT_STYLE): Promise<Blob> => {
  const response = await fetch(`/download/${matchId}?${new URLSearchParams({ style })}`, { cache: "no-store" });

  if (!response.ok || response.headers.get("content-type")?.split(";")[0].trim() !== "image/png") {
    throw new Error("Invalid image response");
  }

  const blob = await response.blob();
  if (!blob.size) throw new Error("Empty image response");
  return blob;
};
