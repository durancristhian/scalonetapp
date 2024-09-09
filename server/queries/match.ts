import { MATCH_SCHEMA, MatchSchema } from "@/schemas/match";
import { byName } from "@/utils/by-name";
import { MAX_MATCHES_PER_USER } from "@/utils/constants";
import prisma from "@/utils/prisma";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import { auth } from "@clerk/nextjs/server";
import { Match, Prisma } from "@prisma/client";

/* This is the object version of the Match.teams Prisma field (String in the DB) */
export type FormattedTeam = {
  id: string;
  name: string;
  players: number[];
};

export const getMatches = async () => {
  const user = auth();
  if (!user || !user.userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  return await prisma.match.findMany({
    where: {
      userId: user.userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      players: true,
    },
  });
};

/* We create this type since Prisma doesn't return relationships in the generated types */
export type MatchWithPlayers = NonNullable<
  Prisma.PromiseReturnType<typeof getMatchById>
>;

export const getMatchById = async (id: number) => {
  const user = auth();
  if (!user || !user.userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  const match = await prisma.match.findFirst({
    where: {
      id: {
        equals: id,
      },
      userId: {
        equals: user.userId,
      },
    },
    include: {
      players: true,
    },
  });

  /* We sort players by name */
  match?.players.sort(byName);

  return match;
};

export const addMatch: (data: MatchSchema) => Promise<void> = async (data) => {
  const user = auth();
  if (!user || !user.userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  const nextMatch = {
    ...data,
    userId: user.userId,
  };

  MATCH_SCHEMA.parse(nextMatch);

  const userMatches = await prisma.match.findMany({
    where: {
      userId: user.userId,
    },
  });

  if (userMatches.length >= MAX_MATCHES_PER_USER) {
    throw new Error(ERROR_MESSAGES.matches_limit_reached);
  }

  await prisma.match.create({
    data: nextMatch,
  });
};

export const editMatch: (
  id: number,
  data: Partial<Match>
) => Promise<void> = async (id, data) => {
  const user = auth();
  if (!user || !user.userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  await prisma.match.update({
    where: {
      id,
      userId: user.userId,
    },
    data,
  });
};

export const deleteMatch: (id: number) => Promise<void> = async (id) => {
  const user = auth();
  if (!user || !user.userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  await prisma.match.delete({
    where: {
      id,
      userId: user.userId,
    },
  });
};
