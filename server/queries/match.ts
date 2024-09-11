import { MATCH_SCHEMA, MatchSchema } from "@/schemas/match";
import { byName } from "@/utils/by-name";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import prisma from "@/utils/prisma";
import { auth } from "@clerk/nextjs/server";
import { Match } from "@prisma/client";

export const getMatches = async () => {
  const { userId } = auth();
  if (!userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  return await prisma.match.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      players: true,
    },
  });
};

export const getMatchById = async (id: number) => {
  const { userId } = auth();
  if (!userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  const match = await prisma.match.findFirst({
    where: {
      id,
      userId,
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
  const { userId } = auth();
  if (!userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  const nextMatch = {
    ...data,
    userId,
  };

  MATCH_SCHEMA.parse(nextMatch);

  const userMatches = await prisma.match.findMany({
    where: {
      userId,
    },
  });

  if (
    userMatches.length >= Number(process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER)
  ) {
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
  const { userId } = auth();
  if (!userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  await prisma.match.update({
    where: {
      id,
      userId: userId,
    },
    data,
  });
};

export const deleteMatch: (id: number) => Promise<void> = async (id) => {
  const { userId } = auth();
  if (!userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  await prisma.match.delete({
    where: {
      id,
      userId,
    },
  });
};
