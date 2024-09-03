import { PlayerSchema } from "@/schemas/player";
import prisma from "@/utils/prisma";
import {
  ERROR_MESSAGES,
  VALIDATION_MESSAGES,
} from "@/utils/validation-messages";
import { auth } from "@clerk/nextjs/server";

export const addPlayer: (
  matchId: number,
  data: PlayerSchema
) => Promise<void> = async (matchId, data) => {
  const user = auth();

  if (!user || !user.userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  const userOwnsMatch = await prisma.match.findFirst({
    where: {
      id: matchId,
      userId: user.userId,
    },
  });

  if (!userOwnsMatch) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

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

  await prisma.player.create({
    data: nextPlayer,
  });

  return;
};

export const addMultiplePlayers: (
  matchId: number,
  data: PlayerSchema[]
) => Promise<void> = async (matchId, data) => {
  const user = auth();

  if (!user || !user.userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  const userOwnsMatch = await prisma.match.findFirst({
    where: {
      id: matchId,
      userId: user.userId,
    },
  });

  if (!userOwnsMatch) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  const nextPlayers = data.map((player) => ({
    ...player,
    matchId,
  }));

  /* We check that we don't have any player named the same in the match already */
  const exists = await prisma.player.findMany({
    where: {
      matchId,
      OR: nextPlayers.map(({ name }) => ({
        name: {
          contains: name,
        },
      })),
    },
  });

  if (exists.length) {
    throw new Error(VALIDATION_MESSAGES.at_least_one_player_repeated);
  }

  await prisma.player.createMany({
    data: nextPlayers,
  });

  return;
};

export const editPlayer: (
  id: number,
  data: Partial<PlayerSchema>
) => Promise<void> = async (id, data) => {
  const user = auth();

  if (!user || !user.userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  await prisma.player.update({
    where: {
      id,
    },
    data,
  });

  return;
};

export const deletePlayer: (id: number) => Promise<void> = async (id) => {
  const user = auth();

  if (!user || !user.userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  await prisma.player.delete({
    where: {
      id,
    },
  });

  return;
};
