import { type PlayerSchema } from "@/schemas/player";
import prisma from "@/utils/prisma";
import { type Player, Prisma } from "@prisma/client";

export const addPlayerQuery: (
  matchId: number,
  data: PlayerSchema
) => Promise<Player> = async (matchId, data) => {
  return await prisma.player.create({
    data: {
      ...data,
      matchId,
    },
  });
};

export const addMultiplePlayersQuery: (
  matchId: number,
  data: PlayerSchema[]
) => Promise<Prisma.BatchPayload> = async (matchId, data) => {
  const nextPlayers = data.map((player) => ({
    ...player,
    matchId,
  }));

  return await prisma.player.createMany({
    data: nextPlayers,
  });
};

export const editPlayerQuery: (
  id: number,
  data: PlayerSchema
) => Promise<Player> = async (id, data) => {
  return await prisma.player.update({
    where: {
      id,
    },
    data,
  });
};

export const deletePlayerQuery: (id: number) => Promise<Player> = async (
  id
) => {
  return await prisma.player.delete({
    where: {
      id,
    },
  });
};
