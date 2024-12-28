import { type Player } from "@prisma/client";

/* This is the object version of the Match.teams Prisma field (Which is an string in the DB) */
export type BaseTeam = {
  id: string;
  name: string;
  players: number[];
};

/* This is a custom type where we have the entire player object instead of the player id */
export type Team = Pick<BaseTeam, "id" | "name"> & {
  players: Player[];
};
