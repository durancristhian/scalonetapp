export const fetchTeamExport = async (matchId: number, snapshot: string): Promise<Blob> => {
  const response = await fetch(`/download/${matchId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ snapshot }),
    cache: "no-store",
  });

  if (!response.ok || response.headers.get("content-type")?.split(";")[0].trim() !== "image/png") {
    throw new Error("Invalid image response");
  }

  const blob = await response.blob();
  const signature = new Uint8Array(await blob.slice(0, 8).arrayBuffer());
  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (blob.size <= 8 || !pngSignature.every((byte, index) => signature[index] === byte)) {
    throw new Error("Invalid PNG");
  }

  // A signature alone is not enough: reject truncated or otherwise undecodable PNGs.
  const image = await createImageBitmap(blob);
  try {
    if (!image.width || !image.height) throw new Error("Empty image");
  } finally {
    image.close();
  }
  return blob;
};
