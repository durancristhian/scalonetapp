"use server";

import prisma from "@/db/prisma";
import { Player } from "@prisma/client";

export const getPlayers = async () => {
  return await prisma.player.findMany();
};

export const addPlayer = async (data: Pick<Player, "name">) => {
  return await prisma.player.create({
    data,
  });
};

export const deletePlayer = async (id: number) => {
  return await prisma.player.delete({
    where: {
      id,
    },
  });
};
