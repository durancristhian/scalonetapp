import { PlayerSchema } from "@/server/schemas/player";
import prisma from "@/utils/prisma";
import {
  ERROR_MESSAGES,
  VALIDATION_MESSAGES,
} from "@/utils/validation-messages";
import { auth } from "@clerk/nextjs/server";
import "server-only";

export const addPlayer = async (data: PlayerSchema, matchId: number) => {
  const user = auth();

  if (!user || !user.userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  /* TODO: Check the user is the owner of the match */

  /* We check that we don't have a player named the same in the match already */
  const exists = await prisma.player.findFirst({
    where: {
      name: data.name,
      matchId,
    },
  });

  if (exists) {
    throw new Error(VALIDATION_MESSAGES.player_repeated);
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
  const user = auth();

  if (!user || !user.userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  return await prisma.player.delete({
    where: {
      id,
    },
  });
};
