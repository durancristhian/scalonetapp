import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import prisma from "@/utils/prisma";
import { isManagedPhoto, removeUnusedPhoto } from "@/server/player-photos";
import { PHOTO_INPUT_BYTES, PHOTO_OUTPUT_BYTES, PHOTO_UNAVAILABLE } from "@/utils/photo-policy";

export const runtime = "nodejs";
type Context = { params: Promise<{ playerId: string }> };
const response = (error: string, status: number) => Response.json({ error }, { status });

async function ownedPlayer(request: Request, context: Context) {
  // Cookie-authenticated mutations must originate from this application.
  if (request.headers.get("origin") !== new URL(request.url).origin) return response("Solicitud no permitida.", 403);
  const { userId } = await auth();
  if (!userId) return response("Inicia sesión para cambiar la foto.", 401);
  const { playerId } = await context.params;
  const id = Number(playerId);
  if (!/^\d+$/.test(playerId) || !Number.isSafeInteger(id) || id < 1 || id > 2147483647) return response("Jugador no encontrado.", 404);
  const player = await prisma.player.findFirst({ where: { id, match: { userId } } });
  return player ? { player, userId } : response("Jugador no encontrado.", 404);
}

export async function POST(request: Request, context: Context) {
  const owned = await ownedPlayer(request, context);
  if (owned instanceof Response) return owned;
  if (!process.env.PLAYER_PHOTO_ORIGIN || (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID)) return response(PHOTO_UNAVAILABLE, 503);
  if (!request.body || !["image/jpeg", "image/png", "image/webp"].includes(request.headers.get("content-type") || "")) return response("Selecciona una foto JPG, PNG o WebP.", 415);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > PHOTO_INPUT_BYTES) { await reader.cancel(); return response("La foto es demasiado grande.", 413); }
    chunks.push(value);
  }
  let output: Buffer | undefined;
  try {
    const input = Buffer.concat(chunks);
    const metadata = await sharp(input, { limitInputPixels: 4_000_000, animated: true }).metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format || "") || (metadata.pages || 1) !== 1) return response("Selecciona una foto estática JPG, PNG o WebP.", 415);
    for (const quality of [80, 65, 50]) {
      output = await sharp(input, { limitInputPixels: 4_000_000 }).rotate().resize(256, 256, { fit: "cover", withoutEnlargement: true }).webp({ quality }).toBuffer();
      if (output && output.length <= PHOTO_OUTPUT_BYTES) break;
    }
    if (!output || output.length > PHOTO_OUTPUT_BYTES) return response("No pudimos reducir esta foto. Prueba con otra.", 422);
  } catch { return response("No pudimos leer esta foto. Prueba con otra.", 422); }
  let uploaded: string | undefined;
  try {
    const blob = await put(`players/${owned.player.id}/${randomUUID()}.webp`, output, { access: "public", contentType: "image/webp", addRandomSuffix: false });
    uploaded = blob.url;
    if (!isManagedPhoto(uploaded)) throw new Error("Photo store mismatch");
    const updated = await prisma.player.updateMany({ where: { id: owned.player.id, avatar: owned.player.avatar, match: { userId: owned.userId } }, data: { avatar: uploaded } });
    if (!updated.count) { await removeUnusedPhoto(uploaded); return response("La ficha cambió. Vuelve a abrirla para cambiar la foto.", 409); }
    await removeUnusedPhoto(owned.player.avatar);
    revalidatePath("/partidos/[match-id]", "page");
    return Response.json({ url: uploaded });
  } catch (error) {
    if (uploaded) await removeUnusedPhoto(uploaded);
    console.error("player_photo_unavailable", error instanceof Error ? error.name : "UnknownError");
    return response(PHOTO_UNAVAILABLE, 503);
  }
}

export async function DELETE(request: Request, context: Context) {
  const owned = await ownedPlayer(request, context);
  if (owned instanceof Response) return owned;
  const updated = await prisma.player.updateMany({ where: { id: owned.player.id, avatar: owned.player.avatar, match: { userId: owned.userId } }, data: { avatar: "" } });
  if (!updated.count) return response("La ficha cambió. Vuelve a abrirla.", 409);
  await removeUnusedPhoto(owned.player.avatar);
  revalidatePath("/partidos/[match-id]", "page");
  return Response.json({ url: "" });
}
