import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, expect, test, vi } from "vitest";
import {
  prepareDatabase,
  stopDatabase,
} from "../../scripts/worktree-database.mjs";
import { ERROR_MESSAGES } from "../../utils/error-messages.ts";

const userId = "user_repeated_names_fixture";
const player = { level: 5, position: "mid" };

vi.mock("@clerk/nextjs/server", () => ({ auth: async () => ({ userId }) }));

let root;
let prisma;
let match;
let other;

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "scalonet-names-"));
  const connectionString = await prepareDatabase(root);
  const migrate = spawnSync(
    process.execPath,
    [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy"],
    {
      encoding: "utf8",
      env: { ...process.env, POSTGRES_URL_NON_POOLING: connectionString },
    },
  );
  expect(migrate.status, "Cannot migrate the owned database fixture").toBe(0);
  vi.stubEnv("POSTGRES_PRISMA_URL", connectionString);
  ({ default: prisma } = await import("../../utils/prisma.ts"));
  match = await prisma.match.create({
    data: {
      name: "Fútbol Miércoles",
      userId,
      players: { create: { ...player, name: "Arquero Foto" } },
    },
    include: { players: true },
  });
  other = await prisma.match.create({ data: { name: "Otro partido", userId } });
});

afterAll(async () => {
  await prisma?.$disconnect();
  vi.unstubAllEnvs();
  if (root) {
    stopDatabase(root);
    rmSync(root, { recursive: true, force: true });
  }
});

const playerNames = async () =>
  (await prisma.player.findMany({ where: { matchId: match.id } }))
    .map(({ name }) => name)
    .toSorted();

test("player names are unique within a match regardless of case", async () => {
  const { addPlayerQuery, addMultiplePlayersQuery, editPlayerQuery } =
    await import("../../server/queries/player.ts");
  await expect(
    addPlayerQuery(match.id, { ...player, name: "arquero foto" }, userId),
  ).rejects.toThrow(ERROR_MESSAGES.match_player_repeated);
  await expect(
    addMultiplePlayersQuery(
      match.id,
      [
        { ...player, name: "Nuevo" },
        { ...player, name: "ARQUERO foto" },
        { ...player, name: "NUEVO" },
      ],
      userId,
    ),
  ).rejects.toThrow(
    'Estos nombres ya existen en este partido o se repiten en la lista: "ARQUERO foto", "NUEVO".',
  );
  const created = await addPlayerQuery(
    match.id,
    { ...player, name: "Defensor" },
    userId,
  );
  await expect(
    editPlayerQuery(created.id, userId, { ...player, name: "ARQUERO FOTO" }),
  ).rejects.toThrow(ERROR_MESSAGES.match_player_repeated);
  await editPlayerQuery(match.players[0].id, userId, {
    ...player,
    name: "arquero foto",
  });
  await addPlayerQuery(other.id, { ...player, name: "Arquero Foto" }, userId);
  expect(await playerNames()).toEqual(["Defensor", "arquero foto"]);
});

test("existing names that differ only by case stay editable", async () => {
  const { editPlayerQuery } = await import("../../server/queries/player.ts");
  const { editMatchQuery } = await import("../../server/queries/match.ts");
  const legacy = await prisma.match.create({
    data: {
      name: "otro partido",
      userId,
      players: { create: [{ name: "Juan" }, { name: "juan" }] },
    },
    include: { players: true },
  });
  const juan = legacy.players.find(({ name }) => name === "Juan");
  await expect(
    editPlayerQuery(juan.id, userId, {
      name: "Juan",
      level: 8,
      position: "def",
    }),
  ).resolves.toMatchObject({ name: "Juan", level: 8 });
  await expect(
    editMatchQuery(legacy.id, { name: "otro partido" }, userId),
  ).resolves.toMatchObject({ name: "otro partido" });
});

test("match names are unique per owner regardless of case", async () => {
  const { addMatchQuery, editMatchQuery } =
    await import("../../server/queries/match.ts");
  await expect(
    addMatchQuery({ name: "fútbol miércoles" }, userId),
  ).rejects.toThrow(ERROR_MESSAGES.match_name_repeated);
  await expect(
    editMatchQuery(other.id, { name: "FÚTBOL MIÉRCOLES" }, userId),
  ).rejects.toThrow(ERROR_MESSAGES.match_name_repeated);
  await editMatchQuery(match.id, { name: "fútbol miércoles" }, userId);
  await expect(
    addMatchQuery({ name: "Fu\u0301tbol Mie\u0301rcoles" }, userId),
  ).rejects.toThrow(ERROR_MESSAGES.match_name_repeated);
  await expect(
    addMatchQuery({ name: "Fútbol Miércoles" }, "user_other_fixture"),
  ).resolves.toMatchObject({ name: "Fútbol Miércoles" });
});
