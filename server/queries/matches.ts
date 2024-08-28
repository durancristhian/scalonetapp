"use server";

import prisma from "@/utils/prisma";
import { Match } from "@prisma/client";

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

export const addMatch = async (data: Omit<Match, "id">) => {
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
