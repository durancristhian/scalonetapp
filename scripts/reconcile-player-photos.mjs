import { list, del } from "@vercel/blob";
import prisma from "../utils/prisma.ts";
const origin = process.env.PLAYER_PHOTO_ORIGIN;
if (!origin || !process.env.BLOB_READ_WRITE_TOKEN)
  throw new Error("Explicit photo store configuration required");
const remove = process.argv.includes("--delete");
let cursor,
  candidates = 0,
  deleted = 0;
try {
  do {
    const page = await list({ prefix: "players/", cursor, limit: 100 });
    for (const blob of page.blobs) {
      const url = new URL(blob.url);
      if (url.origin !== origin)
        throw new Error("Photo store identity mismatch");
      if (
        !/^\/players\/\d+\/[a-f0-9-]+\.webp$/.test(url.pathname) ||
        Date.now() - new Date(blob.uploadedAt).getTime() < 86400000
      )
        continue;
      if (await prisma.player.count({ where: { avatar: blob.url } })) continue;
      candidates++;
      if (remove) {
        await del(blob.url);
        deleted++;
      }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  console.log({ dryRun: !remove, candidates, deleted });
} finally {
  await prisma.$disconnect();
}
