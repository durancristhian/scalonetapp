"use server";

import { MatchSchema } from "@/server/schemas/match";
import prisma from "@/utils/prisma";

export const getMatches = async () => {
  return await prisma.match.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      players: true,
    },
  });
};

export const getMatchById = async (id: number) => {
  const match = await prisma.match.findFirst({
    where: {
      id: {
        equals: id,
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
  return await prisma.match.create({
    data,
  });
};

export const deleteMatch = async (id: number) => {
  return await prisma.match.delete({
    where: {
      id,
    },
  });
};
