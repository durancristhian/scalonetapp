"use server";

import prisma from "@/db/prisma";
import { Player } from "@prisma/client";

export const getMyPlayers = async () => {
  return await prisma.player.findMany();
};

export const addPlayer = async (data: Pick<Player, "name">) => {
  return await prisma.player.create({
    data,
  });
};
