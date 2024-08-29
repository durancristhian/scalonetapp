"use server";

import { PlayerSchema } from "@/server/schemas/player";
import prisma from "@/utils/prisma";
import { ERROR_MESSAGES } from "@/utils/validation-messages";

export const addPlayer = async (data: PlayerSchema, matchId: number) => {
  /* We check that we don't have a player named the same in the match already */
  const exists = await prisma.player.findFirst({
    where: {
      name: data.name,
      matchId,
    },
  });

  if (exists) {
    const errorCause: keyof typeof ERROR_MESSAGES = "player_repeated";

    throw new Error(ERROR_MESSAGES[errorCause], {
      cause: errorCause,
    });
  }

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
