import "server-only";
import { del } from "@vercel/blob";
import prisma from "@/utils/prisma";

function photoPathPrefix(): string {
  if (process.env.NODE_ENV !== "development") return "/players/";
  const namespace = process.env.DEVELOPMENT_PHOTO_NAMESPACE;
  if (
    !namespace ||
    !/^scalonet_[a-f0-9]{12}$/.test(namespace) ||
    !process.env.PLAYER_PHOTO_ORIGIN ||
    process.env.PLAYER_PHOTO_ORIGIN !== process.env.DEVELOPMENT_PHOTO_ORIGIN
  )
    throw new Error(
      "Run worktree setup to configure isolated Development photos.",
    );
  return `/development/${namespace}/players/`;
}

export function playerPhotoPath(playerId: number, fileId: string): string {
  return `${photoPathPrefix().slice(1)}${playerId}/${fileId}.webp`;
}

export function isManagedPhoto(url: string): boolean {
  try {
    const parsed = new URL(url);
    const prefix = photoPathPrefix();
    return (
      parsed.origin === process.env.PLAYER_PHOTO_ORIGIN &&
      parsed.pathname.startsWith(prefix) &&
      /^\d+\/[a-f0-9-]+\.webp$/.test(parsed.pathname.slice(prefix.length))
    );
  } catch {
    return false;
  }
}

export async function removeUnusedPhoto(url: string) {
  if (!isManagedPhoto(url)) return;
  try {
    if (await prisma.player.count({ where: { avatar: url } })) return;
    await del(url);
  } catch {
    console.error("player_photo_cleanup_failed", new URL(url).pathname);
  }
}
