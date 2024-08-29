"use server";

import { PlayerSchema } from "@/server/schemas/player";
import prisma from "@/utils/prisma";

export const addPlayer = async (data: PlayerSchema, matchId: number) => {
  const nextPlayer = {
    ...data,
    matchId,
  };

  return await prisma.player.create({
    data: nextPlayer,
  });
};

export const deletePlayer = async (id: number) => {
  return await prisma.player.delete({
    where: {
      id,
    },
  });
};
