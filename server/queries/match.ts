import { MatchSchema } from "@/server/schemas/match";
import prisma from "@/utils/prisma";
import { ERROR_MESSAGES } from "@/utils/validation-messages";
import { auth } from "@clerk/nextjs/server";
import "server-only";

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
  match?.players.sort((playerA, playerB) =>
    playerA.name.localeCompare(playerB.name)
  );

  return match;
};

export const addMatch = async (data: MatchSchema) => {
  const user = auth();

  if (!user || !user.userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  const nextMatch = {
    ...data,
    userId: user.userId,
  };

  await prisma.match.create({
    data: nextMatch,
  });

  return;
};

export const deleteMatch = async (id: number) => {
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

  return;
};
