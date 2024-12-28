import { getMatchByIdQuery } from "@/server/queries/match";
import { type Prisma } from "@prisma/client";

/* We create this type since Prisma doesn't return relationships in the generated types */
export type MatchWithPlayers = NonNullable<
  Prisma.PromiseReturnType<typeof getMatchByIdQuery>
>;
