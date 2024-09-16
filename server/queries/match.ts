import { MATCH_SCHEMA, MatchSchema } from "@/schemas/match";
import { byName } from "@/utils/by-name";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import prisma from "@/utils/prisma";
import { auth } from "@clerk/nextjs/server";
import { Match } from "@prisma/client";

export const getMatchesQuery = async () => {
  const { userId } = auth();
  if (!userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  return await prisma.match.findMany({
    where: {
      userId: {
        equals: userId,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      players: true,
    },
  });
};

export const getMatchByIdQuery = async (id: number) => {
  const { userId } = auth();
  if (!userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  const match = await prisma.match.findFirst({
    where: {
      id: {
        equals: id,
      },
      userId: {
        equals: userId,
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

export const addMatchQuery: (data: MatchSchema) => Promise<Match> = async (
  data
) => {
  const parsedData = MATCH_SCHEMA.parse(data);

  const { userId } = auth();
  if (!userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  const nextMatch = {
    ...parsedData,
    userId,
  };

  const userMatches = await prisma.match.findMany({
    where: {
      userId: {
        equals: userId,
      },
    },
  });

  if (
    userMatches.length >= Number(process.env.NEXT_PUBLIC_MAX_MATCHES_PER_USER)
  ) {
    throw new Error(ERROR_MESSAGES.matches_limit_reached);
  }

  /* TODO: validate we don't have an existing match named the same */

  return await prisma.match.create({
    data: nextMatch,
  });
};

export const editMatchQuery: (
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
      userId,
    },
    data,
  });
};

export const deleteMatchQuery: (id: number) => Promise<void> = async (id) => {
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
