import "server-only";
import { del } from "@vercel/blob";
import prisma from "@/utils/prisma";

export function isManagedPhoto(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.origin === process.env.PLAYER_PHOTO_ORIGIN &&
      /^\/players\/\d+\/[a-f0-9-]+\.webp$/.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

// Never delete legacy/external images or an object still referenced by a player.
export async function removeUnusedPhoto(url: string) {
  if (!isManagedPhoto(url)) return;
  try {
    if (await prisma.player.count({ where: { avatar: url } })) return;
    await del(url);
  } catch {
    // Keep a safe object identifier for operational reconciliation, never tokens.
    console.error("player_photo_cleanup_failed", new URL(url).pathname);
  }
}
