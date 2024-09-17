import { MatchSchema } from "@/schemas/match";
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

  return match;
};

export const addMatchQuery: (
  data: MatchSchema,
  userId: string
) => Promise<Match> = async (data, userId) => {
  return await prisma.match.create({
    data: {
      ...data,
      userId,
    },
  });
};

export const editMatchQuery: (
  id: number,
  data: Partial<Match>,
  userId: string
) => Promise<Match> = async (id, data, userId) => {
  return await prisma.match.update({
    where: {
      id,
      userId,
    },
    data,
  });
};

export const deleteMatchQuery: (
  id: number,
  userId: string
) => Promise<Match> = async (id, userId) => {
  return await prisma.match.delete({
    where: {
      id,
      userId,
    },
  });
};
