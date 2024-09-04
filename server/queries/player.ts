import { PLAYER_SCHEMA, PlayerSchema } from "@/schemas/player";
import prisma from "@/utils/prisma";
import {
  ERROR_MESSAGES,
  VALIDATION_MESSAGES,
} from "@/utils/validation-messages";
import { auth } from "@clerk/nextjs/server";
import { Match } from "@prisma/client";

const getMatch: (
  userId: string,
  matchId: number
) => Promise<Match | null> = async (userId, matchId) => {
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      userId: userId,
    },
  });

  return match;
};

const namesAlreadyInMatch: (
  matchId: number,
  names: string[]
) => Promise<boolean> = async (matchId, names) => {
  const coincidences = await prisma.player.findMany({
    where: {
      matchId,
      OR: names.map((name) => ({
        name,
      })),
    },
  });

  return !!coincidences.length;
};

export const addPlayer: (
  matchId: number,
  data: PlayerSchema
) => Promise<void> = async (matchId, data) => {
  const user = auth();
  if (!user || !user.userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  /* We check the current user owns the match we're trying to add a player to */
  const userOwnsMatch = await getMatch(user.userId, matchId);
  if (!userOwnsMatch) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  /* We check that we don't have a player named the same in the match already */
  const hasCoincidences = await namesAlreadyInMatch(matchId, [data.name]);
  if (hasCoincidences) {
    throw new Error(VALIDATION_MESSAGES.player_repeated);
  }

  const nextPlayer = {
    ...data,
    matchId,
  };

  PLAYER_SCHEMA.parse(nextPlayer);

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

  /* We check the current user owns the match we're trying to add a player to */
  const userOwnsMatch = await getMatch(user.userId, matchId);
  if (!userOwnsMatch) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  const coincidences = await namesAlreadyInMatch(
    matchId,
    data.map((player) => player.name)
  );
  if (coincidences) {
    throw new Error(VALIDATION_MESSAGES.at_least_one_player_repeated);
  }

  const nextPlayers = data.map((player) => ({
    ...player,
    matchId,
  }));

  nextPlayers.map((player) => PLAYER_SCHEMA.parse(player));

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

  PLAYER_SCHEMA.parse(data);

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
