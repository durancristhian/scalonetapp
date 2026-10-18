export const fetchTeamExport = async (matchId: number): Promise<Blob> => {
  const response = await fetch(`/download/${matchId}`, { cache: "no-store" });

  if (!response.ok || response.headers.get("content-type")?.split(";")[0].trim() !== "image/png") {
    throw new Error("Invalid image response");
  }

  const blob = await response.blob();
  if (!blob.size) throw new Error("Empty image response");
  return blob;
};
