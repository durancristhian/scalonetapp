import { getMatchByIdQuery } from "@/server/queries/match";
import { type Prisma } from "@prisma/client";

export type MatchWithPlayers = NonNullable<
  Prisma.PromiseReturnType<typeof getMatchByIdQuery>
>;
