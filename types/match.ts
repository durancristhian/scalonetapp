import type { Prisma } from "@prisma/client";

export type MatchWithPlayers = Prisma.MatchGetPayload<{
  include: { players: true };
}>;
