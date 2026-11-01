import { afterEach, beforeEach, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@vercel/blob", () => ({ del: vi.fn() }));
vi.mock("@/utils/prisma", () => ({ default: { player: { count: vi.fn() } } }));

import { del } from "@vercel/blob";
import prisma from "@/utils/prisma";
import {
  isManagedPhoto,
  playerPhotoPath,
  removeUnusedPhoto,
} from "@/server/player-photos";

const origin = "https://fixture.public.blob.vercel-storage.com";
const namespace = "scalonet_0123456789ab";
const fileId = "a3fb19de-3057-43e5-8f07-e08217bf5bd8";

afterEach(() => vi.unstubAllEnvs());

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("PLAYER_PHOTO_ORIGIN", origin);
  vi.stubEnv("DEVELOPMENT_PHOTO_ORIGIN", origin);
  vi.stubEnv("DEVELOPMENT_PHOTO_NAMESPACE", namespace);
});

it("uploads and removes only photos in this worktree's namespace", async () => {
  const path = playerPhotoPath(1, fileId);
  expect(path).toBe(`development/${namespace}/players/1/${fileId}.webp`);
  const url = `${origin}/${path}`;
  expect(isManagedPhoto(url)).toBe(true);
  vi.mocked(prisma.player.count).mockResolvedValue(0);
  await removeUnusedPhoto(url);
  expect(del).toHaveBeenCalledWith(url);
});

it.each([
  `${origin}/players/1/${fileId}.webp`,
  `${origin}/development/scalonet_fedcba987654/players/1/${fileId}.webp`,
  `https://another.public.blob.vercel-storage.com/development/${namespace}/players/1/${fileId}.webp`,
])(
  "does not remove a photo owned by Preview or another worktree: %s",
  async (url) => {
    expect(isManagedPhoto(url)).toBe(false);
    await removeUnusedPhoto(url);
    expect(prisma.player.count).not.toHaveBeenCalled();
    expect(del).not.toHaveBeenCalled();
  },
);

it("preserves photos still referenced by another local player", async () => {
  vi.mocked(prisma.player.count).mockResolvedValue(1);
  await removeUnusedPhoto(`${origin}/${playerPhotoPath(1, fileId)}`);
  expect(del).not.toHaveBeenCalled();
});

it("fails closed when Development photo isolation is not configured", () => {
  vi.stubEnv("DEVELOPMENT_PHOTO_NAMESPACE", "");
  expect(() => playerPhotoPath(1, fileId)).toThrow(/worktree setup/);
  expect(isManagedPhoto(`${origin}/players/1/${fileId}.webp`)).toBe(false);
});

it("preserves the existing Preview and Production photo paths", () => {
  vi.stubEnv("NODE_ENV", "production");
  expect(playerPhotoPath(1, fileId)).toBe(`players/1/${fileId}.webp`);
  expect(isManagedPhoto(`${origin}/players/1/${fileId}.webp`)).toBe(true);
  expect(
    isManagedPhoto(
      `${origin}/development/${namespace}/players/1/${fileId}.webp`,
    ),
  ).toBe(false);
});

it("rejects a Development origin that was not explicitly approved", () => {
  vi.stubEnv(
    "DEVELOPMENT_PHOTO_ORIGIN",
    "https://different.public.blob.vercel-storage.com",
  );
  expect(() => playerPhotoPath(1, fileId)).toThrow(/worktree setup/);
});
