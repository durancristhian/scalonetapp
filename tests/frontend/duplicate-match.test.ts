import { expect, it, vi } from "vitest";
import { player } from "../fixtures";

const transaction = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  match: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  player: { createManyAndReturn: vi.fn() },
}));
vi.mock("@/utils/prisma", () => ({
  default: {
    $transaction: (work: (value: typeof transaction) => Promise<unknown>) =>
      work(transaction),
  },
}));

import { duplicateMatch } from "@/server/duplicate-match";

it("maps seeded captain defaults to the duplicated player IDs", async () => {
  const players = [
    player(1, { name: "Lionel Messi" }),
    player(2, { name: "Diego Maradona" }),
  ];
  transaction.$queryRaw.mockResolvedValue([]);
  transaction.match.findFirst.mockResolvedValue({
    id: 1,
    name: "Seed",
    players,
    teams: JSON.stringify([
      { id: "a", name: "Celeste", players: [1], defaultCaptainId: 1 },
      { id: "b", name: "Blanca", players: [2], defaultCaptainId: 2 },
    ]),
  });
  transaction.match.findMany.mockResolvedValue([{ name: "Seed" }]);
  transaction.match.create.mockResolvedValue({ id: 2 });
  transaction.player.createManyAndReturn.mockResolvedValue([
    { ...players[1], id: 102 },
    { ...players[0], id: 101 },
  ]);
  await expect(duplicateMatch(1, "owner")).resolves.toEqual({ ok: true });
  const saved = JSON.parse(
    transaction.match.update.mock.calls[0][0].data.teams,
  );
  expect(saved[0]).toMatchObject({ players: [101], defaultCaptainId: 101 });
  expect(saved[1]).toMatchObject({ players: [102], defaultCaptainId: 102 });
});
