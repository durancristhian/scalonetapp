import { PHOTO_UNAVAILABLE } from "@/utils/photo-policy";
export async function savePlayerPhoto(id: number, photo: Blob | null | undefined): Promise<string | null> {
  if (photo === undefined) return null;
  try {
    const response = await fetch(`/api/players/${id}/avatar`, { method: photo ? "POST" : "DELETE", signal: AbortSignal.timeout(15_000), headers: photo ? { "Content-Type": photo.type } : undefined, body: photo || undefined });
    if (response.ok) return null;
    const data = await response.json();
    return typeof data.error === "string" ? data.error : PHOTO_UNAVAILABLE;
  } catch { return PHOTO_UNAVAILABLE; }
}
