import { PLAYER_SCHEMA, PlayerSchema } from "@/schemas/player";
import { ERROR_MESSAGES } from "@/utils/error-messages";
import prisma from "@/utils/prisma";
import { VALIDATION_MESSAGES } from "@/utils/validation-messages";
import { auth } from "@clerk/nextjs/server";

const getMatch = async (userId: string, matchId: number) => {
  const match = await prisma.match.findFirst({
    where: {
      id: {
        equals: matchId,
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

const namesAlreadyInMatch: (
  matchId: number,
  names: string[]
) => Promise<boolean> = async (matchId, names) => {
  const coincidences = await prisma.player.findMany({
    where: {
      matchId: {
        equals: matchId,
      },
      OR: names.map((name) => ({
        name: {
          contains: name,
        },
      })),
    },
  });

  return !!coincidences.length;
};

export const addPlayer: (
  matchId: number,
  data: PlayerSchema
) => Promise<void> = async (matchId, data) => {
  const { userId } = auth();
  if (!userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  /* We check the current user owns the match we're trying to add a player to */
  const match = await getMatch(userId, matchId);
  if (!match) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  /* We check that we don't have a player named the same in the match already */
  const coincidences = await namesAlreadyInMatch(matchId, [data.name]);
  if (coincidences) {
    throw new Error(VALIDATION_MESSAGES.player_repeated);
  }

  /* We check we haven't reached the players in match limit */
  if (
    match.players.length >=
    Number(process.env.NEXT_PUBLIC_MAX_PLAYERS_PER_MATCH)
  ) {
    throw new Error(ERROR_MESSAGES.players_per_match_limit_reached);
  }

  const nextPlayer = {
    ...data,
    matchId,
  };

  PLAYER_SCHEMA.parse(nextPlayer);

  await prisma.player.create({
    data: nextPlayer,
  });
};

export const addMultiplePlayers: (
  matchId: number,
  data: PlayerSchema[]
) => Promise<void> = async (matchId, data) => {
  const { userId } = auth();
  if (!userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  /* We check the current user owns the match we're trying to add a player to */
  const match = await getMatch(userId, matchId);
  if (!match) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  const coincidences = await namesAlreadyInMatch(
    matchId,
    data.map((player) => player.name)
  );
  if (coincidences) {
    throw new Error(VALIDATION_MESSAGES.at_least_one_player_repeated);
  }

  /* We check we haven't reached the players in match limit */
  if (
    match.players.length >=
    Number(process.env.NEXT_PUBLIC_MAX_PLAYERS_PER_MATCH)
  ) {
    throw new Error(ERROR_MESSAGES.players_per_match_limit_reached);
  }

  /* TODO: Check that if we add the players, we don't pass the limit as well */

  const nextPlayers = data.map((player) => ({
    ...player,
    matchId,
  }));

  nextPlayers.map((player) => PLAYER_SCHEMA.parse(player));

  await prisma.player.createMany({
    data: nextPlayers,
  });
};

export const editPlayer: (
  id: number,
  data: Partial<PlayerSchema>
) => Promise<void> = async (id, data) => {
  const { userId } = auth();
  if (!userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  PLAYER_SCHEMA.parse(data);

  await prisma.player.update({
    where: {
      id,
    },
    data,
  });
};

export const deletePlayer: (id: number) => Promise<void> = async (id) => {
  const { userId } = auth();
  if (!userId) {
    throw new Error(ERROR_MESSAGES.unauthorized);
  }

  await prisma.player.delete({
    where: {
      id,
    },
  });
};
